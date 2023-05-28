export function createSubstitutions(factories: SubstitutionsFactories) {

    function replace(sub: SubstitutionRecipe) {
        const factory = factories[sub.$get]
        if (!factory) {
            console.warn("Unknown variable arg", sub);
            return null
        }
        return factory(sub)
    }

    function replaceMultiple(args: unknown, mode: 'async'): Promise<unknown>
    function replaceMultiple(args: unknown, mode?: 'sync'): unknown
    function replaceMultiple(args: unknown, mode: 'sync' | 'async' = 'sync'): unknown|Promise<unknown> {
        if (!args || typeof args !== 'object') {
            return args
        }

        const entries = Object.entries(args)
            .map(([name, valSpec]) => {
                const val = isSubstitution(valSpec)
                    ? replace(valSpec)
                    : valSpec

                if (val instanceof Promise && mode === 'sync') {
                    console.warn("Substitution in mode=sync contains async result in key", name);
                }

                return [name, val]
            })

        if (mode === 'async') {
            const entriesAsync = entries.map(async ([name, val]) => [name, await val])
            return Promise.all(entriesAsync)
                .then((entries) => Object.fromEntries(entries))
        }

        return Object.fromEntries(entries)
    }

    return {
        replace,
        replaceMultiple,
    }
}

export const isSubstitution = (arg: unknown): arg is SubstitutionRecipe => {
    if (!arg || typeof arg !== "object") return false

    return "$get" in arg
}

type SubstitutionRecipe<T extends object = object> = {$get: "string"} & T
export type SubstitutionsFactories<T extends object = object> = Record<string, (s: SubstitutionRecipe<T>) => any>
export type Substitutions = ReturnType<typeof createSubstitutions>
