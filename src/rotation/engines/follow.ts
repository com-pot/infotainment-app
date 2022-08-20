import { inject, provide } from "vue";
import { PanelSpecification } from "@com-pot/infotainment-app/panels";
import { defineRotationEngineFactory } from "./base";
import { RotationStatus } from "../rotationConsumer";

export const createFollowEngine = defineRotationEngineFactory<FollowEngineConfig>((rotate, config) =>{
    const ctrl = useFollowController()
    const channelListener: any = (e: UpdateEvent) => {
        if (e.detail.panel.name !== config.target || !filterMet(config, e)) {
            return
        }

        rotate.tick(e)
    }

    return {
        start() {
            ctrl.channel.addEventListener('updateRotationStatus', channelListener)
        },
        stop() {
            ctrl.channel.removeEventListener('updateRotationStatus', channelListener)
        },
    }
})

function filterMet(config: FollowEngineConfig, e: UpdateEvent): boolean {
    if (!config.filter?.length) {
        return true
    }
    return config.filter.some((rule) => {
        if (typeof rule === 'string') return e.detail.rotationState.status === rule
        if (rule.type === 'loop') {
            return e.detail.rotationState.step === 0 && e.detail.rotationState.prevStep === (e.detail.rotationState.totalSteps ?? 0) - 1
        }
        console.warn("Unknown filter rule", rule);
    })
}

type FilterRule = string | {type: 'loop'}
export type FollowEngineConfig = { type: 'follow', target: string, filter?: FilterRule[]}

export const followBusInjectionKey = Symbol('follow bus')
export const useFollowController = () => inject(followBusInjectionKey) as FollowController
export const createRotationFollowController = (): FollowController => {
    const ctrl: FollowController = {
        channel: new BroadcastChannel('rotation-follow'),

        dispatch(panel, rotationState) {
            const event = new CustomEvent('updateRotationStatus', {
                detail: {
                    panel, rotationState,
                },
            })
            
            ctrl.channel.dispatchEvent(event)
        },
        destroy() {
            ctrl.channel.close()
        },
    }
    provide(followBusInjectionKey, ctrl)

    return ctrl
}
type FollowController = {
    channel: BroadcastChannel,
    dispatch(panel: PanelSpecification, rotationState: RotationStatus): void;

    destroy(): void;
}
export type UpdateEvent = CustomEvent<{panel: PanelSpecification, rotationState: RotationStatus}>
export const isUpdateEvent = (e: Event): e is UpdateEvent => {
    if (e instanceof CustomEvent) {
        return !!(e.detail.panel && e.detail.rotationState)
    }
    return false
}