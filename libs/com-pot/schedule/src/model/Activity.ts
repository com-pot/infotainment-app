import { FromSchema } from "json-schema-to-ts"
import { O } from "ts-toolbelt"
import { LocalizedTextContent, localizedType } from "@typeful/model/types/I18n"

export const activitySchema = {
    type: 'object',
    properties: {
        id: { type: "string" },
        title: localizedType({type: 'string'} as const),
        description: localizedType({type: 'string'} as const),
    },
    required: ['id', 'title'],
} as const

type AsApi = FromSchema<typeof activitySchema>
export type Activity = {
    api: AsApi,
    app: O.Overwrite<AsApi, {
        description?: LocalizedTextContent,
    }>,
}
