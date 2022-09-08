import { nextTick, onMounted, reactive, Ref, watch, WatchOptions } from "vue";
import { scrollContentTo, ScrollContentToOptions } from "../components/snapScroll";
import { RotationConsumer } from "./rotationConsumer";

export type LinearRotationConsumer = RotationConsumer & {
    step: number | undefined,

    bindScroll(parent: Ref<HTMLElement|undefined>): LinearRotationConsumer,
    onStep(cb: (step: number | undefined) => void, options?: WatchOptions): LinearRotationConsumer,
}

type LinearRotationConfig = {
    whenDone?: 'loop' | 'stop',

    scroll?: ScrollContentToOptions,
}
export function createLinearRotation(rotationConfig: LinearRotationConfig, totalStepsRef: Ref<number> | (() => number)): LinearRotationConsumer {
    const consumer: LinearRotationConsumer = reactive({
        step: undefined,
        restart() {
            consumer.step = 0
        },
        
        tick() {
            const totalSteps = typeof totalStepsRef === 'function' ? totalStepsRef() : totalStepsRef.value
            if (typeof totalSteps !== 'number' || totalSteps <= 0) {
                return {status: 'n/a'}
            }
            if (consumer.step === undefined) {
                return {status: 'stopped'}
            }
            
            
            const prevStep = consumer.step
            let step: LinearRotationConsumer['step'] = prevStep + 1
            if (step >= totalSteps) {
                step = rotationConfig.whenDone === 'stop' ? undefined : 0
            }
            consumer.step = step

            return {
                status: step !== undefined ? 'running' : 'done',
                step, prevStep,
                totalSteps,
            }
        },

        bindScroll(el) {
            onMounted(() => {
                watch(() => consumer.step, () => nextTick(() => {
                    el.value && rotationConfig.scroll && scrollContentTo(el.value, rotationConfig.scroll)
                }))
            })
            return this
        },

        onStep(cb, options) {
            watch(() => consumer.step, cb, options)
            return this
        },
    })

    consumer.restart?.()

    return consumer
}