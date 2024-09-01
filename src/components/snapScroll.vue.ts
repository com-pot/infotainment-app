import { isNil } from "lodash";
import { nextTick, onMounted, Ref, watch } from "vue";
import { scrollContentTo, ScrollContentToOptions } from "./snapScroll";

export function bindScroll(el: Ref<HTMLElement|undefined>, stepCb: () => number | undefined | null, opts: ScrollContentToOptions) {
    onMounted(() => {
        let prevEl = el.value
        watch(() => stepCb(), (step) => {
            if (isNil(step)) return
            nextTick(() => {
                if (prevEl !== el.value) {
                    console.warn("Scroll on different el", prevEl)
                    prevEl = el.value
                }
                el.value && scrollContentTo(el.value, opts)
            })
        })
    })
}
