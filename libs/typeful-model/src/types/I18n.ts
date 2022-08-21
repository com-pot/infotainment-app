export type LocaleCode = string
export type Localized<T> = Record<LocaleCode, T>

export const localizedType = <T>(innerTypeSchema: T) => ({
    type: "object",
    additionalProperties: innerTypeSchema,
} as const)
