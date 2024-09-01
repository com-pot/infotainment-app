export type ScrollContentToOptions = {
    sel: {
        container?: string,
        target: string,
    },
    offset?: number,
}
export function scrollContentTo(el: HTMLElement, opts: ScrollContentToOptions) {
    const container = (opts.sel.container ? el.querySelector(opts.sel.container) : el) as HTMLDivElement
    if (!container) {
        return console.warn("Can't scroll: No container", opts.sel.container, "on", el);
    }
    const activeEl = container.querySelector(opts.sel.target) as HTMLDivElement
    if (!activeEl) {
        console.warn("Can't scroll: No active el", el, opts.sel.target, container);
        return
    }

    const offset = (opts.offset ?? 5)
    container.scrollTo({
        top: activeEl.offsetTop - container.offsetTop - offset,
        behavior: 'smooth',
    })
}
