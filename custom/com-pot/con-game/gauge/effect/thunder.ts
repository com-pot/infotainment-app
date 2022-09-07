import { clamp } from "lodash";
import { createEffectController, defineGaugeEffectFactory } from "./gaugeEffect";
import { G } from "./graphics";

type ThunderEffectOpts = {
    joints: number,
    auxes: number,
}

export default defineGaugeEffectFactory<ThunderEffectOpts>({
    defaults: {
        joints: 7,
        auxes: 4,
    },
    factory: (opts) => {
        const joints: Joint[] = []
        let updateAux = 0
        
        return createEffectController({
            init(ctx) {
                createJoints(joints, opts.joints, opts.auxes, ctx.canvas)
            },
            update(ctx) {
                for (let i = 0; i < joints.length; i++) {
                    const j = joints[i]
                    const dX = Math.random() * 6 - 3
                    const padding = i === 0 || i === joints.length - 1
                        ? ctx.canvas.width * 0.4
                        : ctx.canvas.width * 0.1
                    
                    j.p.x = clamp(j.p.x + dX, padding, ctx.canvas.width - padding)
                    let aux = updateAux
                    // for (let aux = 0; aux < opts.auxes; aux++) {
                    j.dAux[aux].x = Math.random() * 20 - 10
                    j.dAux[aux].y = Math.random() * 20 - 10
                    // }
                    
                    updateAux = (updateAux + 1) % opts.auxes
                }
            },
            render(ctx) {
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
                
                ctx.lineJoin = 'round';
                ctx.lineCap = 'butt';
                ctx.strokeStyle = 'hsla(0deg 0% 90% / 0.75)';
                
                ctx.lineWidth = 3;
                ctx.stroke(makePath(joints))
                
                for (let aux = 0; aux < opts.auxes; aux++) {
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = 'hsla(0deg 0% 90% / 0.75)';
                    ctx.stroke(makePath(joints, aux))
                }
            },
        }, {
            renderThrottle: 50,
        })
    },
})

function createJoints(joints: Joint[], n: number, auxes: number, canvas: HTMLCanvasElement) {
    const dY = canvas.height / (n - 1)
    for (let i = 0; i < n; i++) {
        joints.push({
            p: {x: Math.random() * canvas.width, y: canvas.height - i * dY},
            dAux: Array.from({length: auxes}).map(() => ({x: 0, y: 0})),
        })
    }
}
function makePath(joints: Joint[], aux: number = -1): Path2D {
    const path = new Path2D()
    let j = joints[0]
    let a = j.dAux[aux] || G.vector2DZero
    
    path.moveTo(j.p.x + a.x, j.p.y +a.y)
    for (let i = 1; i < joints.length; i++) {
        j = joints[i]
        a = j.dAux[aux] || G.vector2DZero
        
        path.lineTo(j.p.x + a.x, j.p.y + a.y)
    }
    
    return path
}

type Joint = {
    p: G.Vector2D,
    dAux: G.Vector2D[],
}