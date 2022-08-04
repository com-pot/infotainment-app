export type ScrollContentToOptions = {
    sel: {
        container: string,
        target: string,
    },
}
export function scrollContentTo(el: HTMLElement, opts: ScrollContentToOptions) {
    const container = el.querySelector(opts.sel.container) as HTMLDivElement
    const activeEl = container?.querySelector(opts.sel.target) as HTMLDivElement
    if (!container || !activeEl) {
        return
    }
    container.scrollTo({
        top: activeEl.offsetTop - container.offsetTop - 5,
        behavior: 'smooth',
    })
}