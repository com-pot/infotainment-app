export function createSubstitutions(factories: SubstitutionsFactories) {

    function replace(subject: string) {
        const factory = factories[subject]
        if (!factory) {
            console.warn("Unknown variable arg", subject);
            return null
        }
        return factory()
    }

    function replaceMultiple(args: unknown, mode: 'async'): Promise<unknown>
    function replaceMultiple(args: unknown, mode?: 'sync'): unknown
    function replaceMultiple(args: unknown, mode: 'sync' | 'async' = 'sync'): unknown|Promise<unknown> {
        if (!args || typeof args !== 'object') {
            return args
        }

        const entries = Object.entries(args)
            .map(([name, valSpec]) => {
                const val = valSpec && typeof valSpec === 'object' && valSpec.$get
                    ? replace(valSpec.$get)
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

export type SubstitutionsFactories = Record<string, () => any>
export type Substitutions = ReturnType<typeof createSubstitutions>
