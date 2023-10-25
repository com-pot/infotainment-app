import { isNil } from "lodash";
import { nextTick, onMounted, Ref, watch } from "vue";
import { scrollContentTo, ScrollContentToOptions } from "./snapScroll";

export function bindScroll(el: Ref<HTMLElement|undefined>, stepCb: () => number | undefined | null, opts: ScrollContentToOptions) {
    onMounted(() => {
        watch(() => stepCb(), (step) => nextTick(() => {
            !isNil(step) && el.value && scrollContentTo(el.value, opts)
        }))
    })
}
