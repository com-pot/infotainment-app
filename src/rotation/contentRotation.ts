import { onBeforeUnmount, onMounted, watch } from "vue"
import { AsyncRef } from "../components/asyncReactive"
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

        bindComponent(onMount = 'ignore', beforeUnmount = 'stop') {
            onMount === 'start' && onMounted(() => engineCtrl.start())
            beforeUnmount === 'stop' && onBeforeUnmount(() => engineCtrl.stop())

            return this
        },
        bindReady(ref, onReadyChange) {
            watch(() => ref.ready, (ready) => {
                onReadyChange?.(ready)
                ready ? engineCtrl.start() : engineCtrl.stop()
            })
            return this
        },
    }
    const engine = rotationEngineFactories[rotationConfig.type](ctrlConsumer, rotationConfig)

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
    bindReady(ref: AsyncRef<any>, onReadyChange?: (ready: boolean) => void): this;
    bindComponent(onMount?: 'start' | 'ignore', beforeUnmount?: 'stop' | 'ignore'): this;
}
