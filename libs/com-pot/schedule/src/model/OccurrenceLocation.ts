import { localizedType } from "@typeful/model/types/I18n"
import { FromSchema } from "json-schema-to-ts"

export const occurrenceLocationSchema = {
    type: "object",
    properties: {
        id: {type: "string"},
        title: localizedType({type: "string"} as const),

        center: {
            type: "object",
            properties: {
                latitude: {type: "number", minimum: -90, maximum: 90},
                longitude: {type: "number", minimum: -180, maximum: 180},
            },
            required: ["latitude", "longitude"],
        },
    },
    required: ["id", "title"],
} as const

type OccurrenceLocationApiForm = FromSchema<typeof occurrenceLocationSchema>

export type OccurrenceLocation = {
    app: OccurrenceLocationApiForm,
    api: OccurrenceLocationApiForm,
}
