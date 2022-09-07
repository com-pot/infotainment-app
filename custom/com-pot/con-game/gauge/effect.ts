import { defaults } from "lodash"
import { GaugeEffect, GaugeEffectDefinition } from "./effect/gaugeEffect"

import thunder from "./effect/thunder"
import water from "./effect/water"

const effects: Record<string, GaugeEffectDefinition<any>> = {
    water: water,
    thunder: thunder,
}

export const createEffect = (type: string, opts?: any): GaugeEffect => {
    const effect = effects[type]
    if (!effect) {
        throw new Error(`Effect '${type}' does not exist`)
    }

    return effect.factory(defaults({}, opts, effect.defaults))
}
