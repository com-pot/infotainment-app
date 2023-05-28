import { O } from "ts-toolbelt";
import { createEffectController, defineGaugeEffectFactory } from "./gaugeEffect";
import { G } from "./graphics"


type WaterEffectOpts = {
    maxBubbles: number
}

export default defineGaugeEffectFactory<WaterEffectOpts>({
    defaults: {
        maxBubbles: 37,
    },
    factory: (opts) => {
        const bubbles: Bubble[] = []
    
        return createEffectController({
            init: (ctx) => createBubbles(bubbles, opts.maxBubbles / 2, ctx.canvas),
            update: (ctx: CanvasRenderingContext2D) => {
                for (let bubble of bubbles) {
                    bubble.v.x += Math.random() * 0.2 - 0.1
        
                    bubble.p.x += bubble.v.x
                    bubble.p.y += bubble.v.y
        
                    if (
                        bubble.p.x < bubble.d.r * -2 || bubble.p.x > ctx.canvas.width + bubble.d.r * 2
                         || bubble.p.y < -bubble.d.r
                    ) {
                        initBubble(ctx.canvas, bubble)
                    }
                }
            },
            render: (ctx: CanvasRenderingContext2D) => {
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
                    for (let b of bubbles) {
                        drawBubble(ctx, b)
                    }
            },
        })
    },
})

function drawBubble(ctx: CanvasRenderingContext2D, b: Bubble) {
    ctx.strokeStyle = b.r.color;
    
    ctx.moveTo(b.p.x, b.p.y)
    ctx.beginPath()
    ctx.arc(b.p.x, b.p.y, b.d.r, 0, Math.PI * 2)
    ctx.closePath()
    ctx.stroke()
}

function initBubble(canvas: HTMLCanvasElement, bubble?: O.Partial<Bubble, 'deep'>): Bubble {
    const revive = !!bubble
    if (!bubble) {
        bubble = {
            p: {},
            v: {},
            d: {},
            r: {},
        }
    }

    bubble.d!.r = 7 + Math.random() * 11

    bubble.p!.x = (0.5 + (Math.random() * 0.4 - 0.2)) * canvas.width
    bubble.p!.y = revive ? canvas.height + bubble.d!.r : Math.random() * canvas.height

    bubble.v!.x = Math.random() * 1 - 0.5
    bubble.v!.y = -0.5

    bubble.r!.color = `hsla(0deg 0% 90% / ${0.6 + Math.random() * 0.3})`

    return bubble as Bubble
}
function createBubbles(bubbles: Bubble[], n: number, canvas: HTMLCanvasElement) {
    for (let i = 0; i < n; i++) {
        bubbles.push(initBubble(canvas))
    }
}

type Bubble = {
    p: G.Vector2D, v: G.Vector2D,
    d: {r: number},
    r: {
        color: string,
    },
}
