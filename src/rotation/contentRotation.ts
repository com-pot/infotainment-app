import { onBeforeUnmount, onMounted, watch } from "vue"
import { AsyncRef } from "@typeful/vue-utils/reactivity"
import { RotationEngine, RotationEngineFactory } from "./engines/base"
import { createFollowEngine } from "./engines/follow"
import { createIntervalEngine } from "./engines/interval"

import { RotationConsumer, RotationStatus } from "./rotationConsumer"

type RotationEmitsFn = (event: 'update:rotationState', state: RotationStatus) => void

export function createRotationController(rotationConfig: RotationConfig, tick: (e: Event) => RotationStatus, emit?: RotationEmitsFn) {
    const ctrlConsumer: RotationConsumer = {
        tick(e) {
            const result = tick(e) ?? {status: 'n/a'}
            if (result.status === 'stopped' || result.status === 'done') {
                // we don't want to use engineCtrl because we're forwarding the result event
                engine.stop()
                engineRunning = false
            }
            emit?.('update:rotationState', result)

            return result
        },
    }

    let engineRunning = false
    const engineCtrl: RotationEngineCtrl = {
        start: () => {
            if (engineRunning) return
            engineRunning = true

            engine.start()
            emit?.('update:rotationState', {
                status: 'running',
            })
        },
        stop: () => {
            if (!engineRunning) return
            engineRunning = false

            engine.stop()
            emit?.('update:rotationState', {
                status: 'stopped',
            })
        },


        tick(e) {
            ctrlConsumer.tick(e || new Event('tick:manual'))
        },
        bindComponent(onMount = 'ignore', beforeUnmount = 'stop') {
            onMounted(() => engineCtrl.start())
            onBeforeUnmount(() => engineCtrl.stop())

            return this
        },
        bindReady(ref, onReadyChange) {
            if (!ref) {
                console.warn("Nothing to bindReady to");
                return this
            }

            watch(() => (typeof ref === "function" ? ref() : ref).ready, (ready) => {
                onReadyChange?.(ready)
                ready ? engineCtrl.start() : engineCtrl.stop()
            })
            return this
        },
    }
    let engine = rotationEngineFactories[rotationConfig?.type]?.(ctrlConsumer, rotationConfig)
    if (!engine) {
        console.warn("Failed to get rotation engine for config", rotationConfig);

        engine = {
            start() {
                console.warn("Cannot start rotation engine")
            },
            stop() {
                console.warn("Cannot stop rotation engine")
            },
        }
    }

    return engineCtrl
}

// export function injectRotationController(): ContentRotationController | undefined;
// export function injectRotationController(prio?: 'need'): ContentRotationController;
// export function injectRotationController(prio?: string) {
//     const ctrl = inject(injectionKey)
//     if (!ctrl && prio === 'need') {
//         throw new Error('No contentRotation.ctrl available')
//     }

//     return ctrl
// }



export type RotationConfig = {type: 'string'} & any

const rotationEngineFactories: Record<string, RotationEngineFactory<any>> = {
    interval: createIntervalEngine,
    follow: createFollowEngine,
}


export interface RotationEngineCtrl extends RotationEngine {
    bindReady(ref: AsyncRef<any> | (() => AsyncRef<any>), onReadyChange?: (ready: boolean) => void): this;
    bindComponent(onMount?: 'start' | 'ignore', beforeUnmount?: 'stop' | 'ignore'): this;

    tick(event?: Event): void,
}
