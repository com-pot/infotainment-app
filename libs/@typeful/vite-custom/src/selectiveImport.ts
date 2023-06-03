
type ImporterMapOpts = {
    trim?: {
        start?: RegExp,
        end?: RegExp,
    },
    replace?: {
        needle: string,
        replacement: string,
    },
}
export function mapImporters<T = unknown>(
    importers: Record<string, () => Promise<T>>,
    opts?: ImporterMapOpts,
): Record<string, () => Promise<T>> {
    const entries = Object.entries(importers)
        .map(([path, loadFn]) => [createKey(path, opts), loadFn])

    return Object.fromEntries(entries)
}

export function createKey(path: string, opts?: ImporterMapOpts): string | null {
    if (opts?.trim?.start) {
        const match = opts.trim.start.exec(path)
        if (!match) {
            console.warn("Cannot trim start from", path);
            return null
        }

        path = path.substring(match[0].length)
    }
    if (opts?.trim?.end) {
        const match = opts.trim.end.exec(path)
        if (!match) {
            console.warn("Cannot trim end from", path);
            return null
        }
        path = path.substring(0, path.length - match[0].length)
    }

    if (path.at(-1) === "/") {
        path += "default"
    }

    return path
}

export function selectImporter<T>(importers: Record<string, () => Promise<T>>, name: string): () => Promise<T> {
    const importFn = importers[name]
        || importers[name + '.js']
        || importers[name + '.ts']

    if (!importFn) {
        return () => Promise.reject(new Error(`App spec '${name}' not found`))
    }
    return importFn
}

/**
 * Executes provided import and converts its result to plain object
 *
 * This function is particularly usefull for cases when the importer directly
 * returns a node module which obscures some details in dev tools.
 */
export async function importAsObj<T extends object>(importer: () => Promise<T>) {
    const module = await importer()
    return {...module}
}
