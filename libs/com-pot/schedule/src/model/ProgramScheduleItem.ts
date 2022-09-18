import { FromSchema } from "json-schema-to-ts"
import { O } from "ts-toolbelt"
import { LocalizedTextContent, localizedType } from "@typeful/model/types/I18n"

export const programEntrySchema = {
    type: 'object',
    properties: {
        title: localizedType({type: 'string'} as const),
        description: localizedType({type: 'string'} as const),
    },
    required: ['title'],
} as const

type AsApi = FromSchema<typeof programEntrySchema>
export type ProgramScheduleItem = {
    api: AsApi,
    app: O.Overwrite<AsApi, {
        description?: LocalizedTextContent,
    }>,
}
