import { computed, reactive, ref } from "vue";

type AsyncStatus = 'n/a' | 'busy' | 'ready' | 'error'
type AsyncWrapper<T> = 
    {status: Readonly<'ready'>, ready: Readonly<true>, value: T}
    | {status: Readonly<'n/a' | 'busy' | 'error'>, ready: Readonly<false>}
type AsyncWrapperControls<T> = {
    _await: (source: Promise<T>) => Promise<T>,
    _clear: () => void,
}
export type AsyncRef<T> = AsyncWrapper<T> & AsyncWrapperControls<T>

export default function asyncReactive<T>(promise?: Promise<T>): AsyncRef<T> {
    const status = ref<AsyncStatus>('n/a')

    const awaitValue = (promise: Promise<T>) => {
        status.value = 'busy'
        ar.value = null

        return promise
            .then((value) => {
                ar.value = value as typeof ar['value']
                status.value = 'ready'
                return value
            })
            .catch((err) => {
                status.value = 'error'

                throw err
            })
    }

    const ar = reactive({
        status: computed(() => status.value),
        ready: computed(() => status.value === 'ready'),

        value: null as null | T,

        _await: awaitValue,
        _clear: () => {
            status.value = 'n/a'
            ar.value = null
        },
    })

    if (promise) {
        awaitValue(promise)
    }

    return ar as AsyncRef<T>
}

export type AsyncDataController<T = any> = ReturnType<typeof asyncReactive<T>>
