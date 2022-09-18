import { TextContent } from "./text"

export type LocaleCode = string
export type Localized<T> = Record<LocaleCode, T>

export type LocalizedTextContent = Localized<TextContent>

export const localizedType = <T>(innerTypeSchema: T) => ({
    type: "object",
    additionalProperties: innerTypeSchema,
} as const)
