import { nextTick, onMounted, reactive, Ref, watch } from "vue";
import { scrollContentTo, ScrollContentToOptions } from "../components/snapScroll";
import { RotationConsumer } from "./rotationConsumer";

export type LinearRotationConsumer = RotationConsumer & {
    step: number | undefined,

    bindScroll(parent: Ref<HTMLElement|undefined>): LinearRotationConsumer, 
}

type LinearRotationConfig = {
    whenDone?: 'loop' | 'stop',

    scroll?: ScrollContentToOptions,
}
export function createLinearRotation(rotationConfig: LinearRotationConfig, totalStepsRef: Ref<number>): LinearRotationConsumer {
    const consumer: LinearRotationConsumer = reactive({
        step: 0,
        tick() {
            const totalSteps = totalStepsRef.value
            if (typeof totalSteps !== 'number' || totalSteps <= 0) {
                return {status: 'n/a'}
            }
            if (consumer.step === undefined) {
                return {status: 'stopped'}
            }
            
            
            let step: LinearRotationConsumer['step'] = this.step + 1
            if (step >= totalSteps) {
                step = rotationConfig.whenDone === 'stop' ? undefined : 0
            }
            consumer.step = step

            return {
                status: step !== undefined ? 'running' : 'done',
                step,
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
    })

    return consumer
}