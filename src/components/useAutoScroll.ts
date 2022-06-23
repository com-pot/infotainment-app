import { computed, reactive, Ref, watch } from "vue";

type AutoScrollOpts = {
    durationPer1Em: number,
}
export default function useAutoScroll(el: Ref<HTMLDivElement|undefined>, opts?: Partial<AutoScrollOpts>) {
    const _opts: AutoScrollOpts = {
        durationPer1Em: opts?.durationPer1Em ?? 2000
    }

    const resp = reactive({
        duration: 0
    })

    const scroll: any = reactive({
        containerHeight: 0,
        contentHeight: 0,

        tStart: 0,
        tEnd: 0,
        tCurrent: 0,

        direction: 1 as 1 | -1,
        scrollHeight: computed(() => scroll.contentHeight - scroll.containerHeight),
        tRange: computed(() => scroll.tEnd - scroll.tStart),
        pctCurrent: computed(() => Math.min((scroll.tCurrent - scroll.tStart) / (scroll.tRange), 1)),

        start(duration: number, direction: 1 | -1 = 1) {
            scroll.tStart = Date.now()
            scroll.tEnd = scroll.tStart + duration
            scroll.direction = direction

            requestAnimationFrame(scroll.tick)
        },
        tick() {
            if (scroll.scrollHeight < 0 || !el.value) {
                return
            }
            
            scroll.tCurrent = Date.now()
            const scrollPx = Math.round(scroll.pctCurrent * scroll.scrollHeight)
            el.value.scrollTop = scroll.direction === 1 ? scrollPx : scroll.scrollHeight - scrollPx

            if (scroll.pctCurrent < 1) {
                requestAnimationFrame(scroll.tick)
            } else {
                setTimeout(() => {
                    console.log('reverse');
                    if (scroll.direction === 1) {
                        scroll.start(resp.duration * 0.33, -1)
                    } else {
                        scroll.start(resp.duration, 1)
                    }
                }, 1000)
            }
        },
    })
    
    watch(() => scroll.scrollHeight, (height) => {
        if (height <= 0 || !el.value) {
            return
        }
        
        const fontSize = parseFloat(getComputedStyle(el.value).fontSize)
        const lines = scroll.contentHeight / fontSize // Does not account for line spacing
        resp.duration = lines * _opts.durationPer1Em

        scroll.start(resp.duration)
    })

    watch(el, (el) => {
        if (!el) {
            scroll.containerHeight = scroll.contentHeight = 0
            return
        }
        
        scroll.containerHeight = el.clientHeight
        scroll.contentHeight = el.scrollHeight
    }, {immediate: true})
}