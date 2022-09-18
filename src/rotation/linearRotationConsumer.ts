import { isNil } from "lodash";
import { nextTick, onMounted, reactive, Ref, watch, WatchOptions } from "vue";
import { scrollContentTo, ScrollContentToOptions } from "../components/snapScroll";
import { RotationConsumer } from "./rotationConsumer";

export type LinearRotationConsumer = RotationConsumer & {
    step: number | undefined,

    bindScroll(parent: Ref<HTMLElement|undefined>, opts: ScrollContentToOptions): LinearRotationConsumer,
    onStep(cb: (step: number | undefined) => void, options?: WatchOptions): LinearRotationConsumer,
}

type LinearRotationConfig = {
    whenDone?: 'loop' | 'stop',
}
export function createLinearRotation(rotationConfig: LinearRotationConfig, totalStepsRef?: (() => number | false)): LinearRotationConsumer {
    const consumer: LinearRotationConsumer = reactive({
        step: undefined,
        restart() {
            consumer.step = 0
        },

        tick() {
            if (consumer.step === undefined) {
                return {status: 'stopped'}
            }

            const totalSteps = totalStepsRef?.() ?? false
            if (typeof totalSteps !== 'number' || totalSteps <= 0) {
                return {status: 'n/a'}
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

        bindScroll(el, opts) {
            onMounted(() => {
                watch(() => consumer.step, (step) => nextTick(() => {
                    !isNil(step) && el.value && scrollContentTo(el.value, opts)
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
