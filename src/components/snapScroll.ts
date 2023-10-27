export type ScrollContentToOptions = {
    sel: {
        container?: string,
        target: string,
    },
    offset?: number,
}
export function scrollContentTo(el: HTMLElement, opts: ScrollContentToOptions) {
    let container = el as HTMLDivElement
    if (opts.sel.container) {
        container = el?.querySelector(opts.sel.container) as HTMLDivElement
        if (!container) {
            console.warn("No container found", {el, sel: opts.sel.container})
            return
        }
    }
    const activeEl = container.querySelector(opts.sel.target) as HTMLDivElement
    if (!container || !activeEl) {
        console.warn("Can't scroll", opts.sel, {container, activeEl});
        return
    }

    const offset = (opts.offset ?? 5)
    container.scrollTo({
        top: activeEl.offsetTop - container.offsetTop - offset,
        behavior: 'smooth',
    })
}
