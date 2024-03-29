import { computed, reactive, ref } from "vue";
import { usePoll } from "../time"

type AsyncStatus = 'n/a' | 'busy' | 'ready' | 'error'
type AsyncWrapper<T, E extends Error = Error> =
    {status: Readonly<'ready'>, ready: Readonly<true>, value: T}
    | {readonly status: "error", readonly ready: false, error: E}
    | {status: Readonly<'n/a' | 'busy'>, ready: Readonly<false>}
type AsyncWrapperControls<T> = {
    poll: ReturnType<typeof usePoll>|null,

    _await: (source: Promise<T>) => Promise<T>,
    _clear: () => void,
    _set: (value: T) => void,
}
export type AsyncRef<T=unknown, E extends Error = Error> = AsyncWrapper<T, E> & AsyncWrapperControls<T>

export default function asyncReactive<T, E extends Error = Error>(promise?: Promise<T>): AsyncRef<T> {
    const status = ref<AsyncStatus>('n/a')

    const awaitValue = (promise: Promise<T>) => {
        if (!promise) {
            promise = Promise.reject(new Error("Await value not provided"))
        }
        if (typeof promise.then !== "function") {
            debugger
            promise = Promise.reject(new Error("Cannot await what is not a primise"))
        }

        status.value = 'busy'
        ar.value = null
        ar.error = null

        return promise
            .then((value) => {
                ar.value = value as typeof ar['value']
                status.value = 'ready'
                return value
            })
            .catch((err) => {
                ar.error = err
                status.value = 'error'

                throw err
            })
    }

    const ar = reactive({
        status: computed(() => status.value),
        ready: computed(() => status.value === 'ready'),

        value: null as null | T,
        error: null as null | E,

        poll: null,

        _await: awaitValue,
        _set: (value: T) => {
            ar.value = value as typeof ar['value']
            status.value = 'ready'
        },
        _clear: () => {
            status.value = 'n/a'
            ar.value = null
        },
    })

    if (promise) {
        awaitValue(promise)
    }

    return ar as AsyncRef<T, E>
}
export function asyncComputed<TRes, T1>(cb: (v1: T1) => TRes, aRef1: AsyncWrapper<T1>): AsyncWrapper<TRes>;
export function asyncComputed<TRes, T1, T2>(cb: (v1: T1, v2: T2) => TRes, aRef1: AsyncWrapper<T1>, aRef2: AsyncWrapper<T2>): AsyncWrapper<TRes>;
export function asyncComputed<TRes>(cb: (...values: any[]) => TRes, ...refs: AsyncWrapper<any>[]): AsyncWrapper<TRes> {
    const ready = computed(() => refs.every((ref) => ref.ready))
    const error = computed(() => !ready.value && refs.some((ref) => ref.status === 'error'))
    const status = computed<AsyncWrapper<any>['status']>(() => {
        if (ready.value) return 'ready'
        if (error.value) return 'error'
        return 'busy'
    })

    const value = computed<TRes>(() => {
        if (!ready.value) return null as unknown as TRes
        return cb(...refs.map((ref) => (ref as typeof ref & {status: 'ready'}).value))
    })

    return reactive({
        ready,
        status,
        value,
    }) as AsyncWrapper<TRes>
}
