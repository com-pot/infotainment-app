export const defineGaugeEffectFactory = <TOpts = void, T = GaugeEffect>(def: GaugeEffectDefinition<TOpts>) => def

export type GaugeEffect = {
    status: 'running' | 'halt',
    fillRatio: number,
    start(ctx: CanvasRenderingContext2D): void
    stop(): void
}

export type GaugeEffectFactory<TOpts> = (opts: TOpts) => GaugeEffect
export type GaugeEffectDefinition<TOpts> = {
    factory: GaugeEffectFactory<TOpts>, defaults?: Partial<TOpts>,
}

type GaugeEffectLogic = {
    init?(ctx: CanvasRenderingContext2D): void;
    update(ctx: CanvasRenderingContext2D): void;
    render(ctx: CanvasRenderingContext2D): void;
}

export type EffectControllerOptions = {
    renderThrottle?: number
}
export const createEffectController = (gaugeEffect: GaugeEffectLogic, opts?: EffectControllerOptions): GaugeEffect => {
    let canvasCtx: CanvasRenderingContext2D|null

    const renderThrottle = opts?.renderThrottle ?? 5

    let tickStandard = () => {
        if (ctrl.status === 'halt' || !canvasCtx) {
            return
        }
        
        gaugeEffect.update(canvasCtx)
        gaugeEffect.render(canvasCtx)
        clearUnfilledPortion(canvasCtx, ctrl.fillRatio)

        setTimeout(() => requestAnimationFrame(tick), renderThrottle)
    }
    let tick = tickStandard
    if (gaugeEffect.init) {
        tick = () => {
            gaugeEffect.init!(canvasCtx!)
            tick = tickStandard
            return tickStandard()
        }
    }

    const ctrl: GaugeEffect = {
        status: 'halt',
        fillRatio: 1,
        start(ctx) {
            this.status = 'running'
            canvasCtx = ctx

            tick()
        },
        stop() {
            this.status = 'halt'
            canvasCtx = null
        },
    }

    return ctrl
}

function clearUnfilledPortion(ctx: CanvasRenderingContext2D, fillRatio: number) {
    const yLevel = (1 - fillRatio) * ctx.canvas.height
    ctx.clearRect(0, 0, ctx.canvas.width, yLevel)
}
