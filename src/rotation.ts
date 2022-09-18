import { PropType } from "vue"

import * as contentRotation from "./rotation/contentRotation"
export * from "./rotation/contentRotation"

import { RotationStatus } from "./rotation/rotationConsumer"
export {defineRotationConsumer} from "./rotation/rotationConsumer"

export const rotationUi = {
    props: {
        rotationConfig: {
            type: Object as PropType<contentRotation.RotationConfig>,
        },
    },
    emits: {
        'update:rotationState': (newState: RotationStatus) => true,
    },
}
