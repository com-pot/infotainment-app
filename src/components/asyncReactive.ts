import { computed, reactive, ref } from "vue";

type AsyncStatus = 'n/a' | 'busy' | 'ready' | 'error'
type AsyncWrapper<T> = 
    {status: Readonly<'ready'>, ready: Readonly<true>, value: T}
    | {status: Readonly<'n/a' | 'busy' | 'error'>, ready: Readonly<false>}

export default function asyncReactive<T>(promise?: Promise<T>) {
    const status = ref<AsyncStatus>('n/a')

    const awaitValue = (promise: Promise<T>) => {
        status.value = 'busy'
        ar.value = null

        return promise
            .then((value) => {
                ar.value = value as typeof ar['value']
                status.value = 'ready'
            })
            .catch((err) => {
                ar.status = 'error'

                throw err
            })
    }

    const ar = reactive({
        status: computed(() => status.value),
        ready: computed(() => status.value === 'ready'),

        value: null as null | T,

        _await: awaitValue,
        _clear: () => {
            ar.status = 'n/a'
            ar.value = null
        },
    })

    if (promise) {
        awaitValue(promise)
    }

    return ar as AsyncWrapper<T>
}