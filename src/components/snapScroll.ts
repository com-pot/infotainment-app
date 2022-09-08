export type ScrollContentToOptions = {
    sel: {
        container: string,
        target: string,
    },
    offset?: number,
}
export function scrollContentTo(el: HTMLElement, opts: ScrollContentToOptions) {
    const container = el.querySelector(opts.sel.container) as HTMLDivElement
    const activeEl = container?.querySelector(opts.sel.target) as HTMLDivElement
    if (!container || !activeEl) {
        console.warn("Can't scroll", opts.sel, container, activeEl);
        return
    }

    const offset = (opts.offset ?? 5)
    container.scrollTo({
        top: activeEl.offsetTop - container.offsetTop - offset,
        behavior: 'smooth',
    })
}