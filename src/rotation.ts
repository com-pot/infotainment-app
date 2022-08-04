import { PropType } from "vue"

import * as contentRotation from "./rotation/contentRotation"
import { RotationStatus } from "./rotation/rotationConsumer"
export * from "./rotation/contentRotation"
export {defineRotationConsumer} from "./rotation/rotationConsumer"

export const rotationConfigProp = {
    type: Object as PropType<contentRotation.RotationConfig>,
}

export const rotationEmits = {
    'update:rotationState': (newState: RotationStatus) => true,
}

export const rotationUi = {
    prop: rotationConfigProp,
    emits: rotationEmits,
}
