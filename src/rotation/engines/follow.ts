import { inject, provide } from "vue";
import { PanelSpecification } from "@com-pot/infotainment-app/panels";
import { defineRotationEngineFactory } from "./base";
import { RotationStatus } from "../rotationConsumer";

export const createFollowEngine = defineRotationEngineFactory<FollowEngineConfig>((rotate, config) =>{
    const ctrl = useFollowController()
    const channelListener: any = (e: UpdateEvent) => {
        if (e.detail.panel.name !== config.target) {
            return
        }
        if (config.filter?.length && !config.filter.includes(e.detail.rotationState.status)) {
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

export type FollowEngineConfig = { type: 'follow', target: string, filter?: string[]}

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