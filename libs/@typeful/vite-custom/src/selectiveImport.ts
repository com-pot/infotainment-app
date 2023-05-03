
export function mapImporters<T = unknown>(
    importers: Record<string, () => Promise<T>>,
    searchValue: string = '../custom',
    replaceValue: string = '@custom',
): Record<string, () => Promise<T>> {
    const entries = Object.entries(importers)
        .map(([path, loadFn]) => [path.replace(searchValue, replaceValue), loadFn])

    return Object.fromEntries(entries)
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

export async function importAsObj<T extends object>(importer: () => Promise<T>) {
    const module = await importer()
    return {...module}
}
