import { Localized, LocalizedTextContent } from "@typeful/model/types/I18n"
import { OccurrenceLocation } from "./OccurrenceLocation"
import { ProgramScheduleItem } from "./ProgramScheduleItem"
import { FromSchema } from "json-schema-to-ts"

export const programItemOccurenceSchema = {
    type: 'object',
    properties: {
        item: {type: "string"},
        time: {
            type: 'object',
            properties: {
                start: {type: 'string', format: 'date'},
                end: {type: 'string', format: 'date'},
            },
            additionalProperties: false,
            required: ['start'],
        },
    },
    required: ['item', 'time'],
} as const

export type ProgramItemOccurence = {
    app: {
        item: ProgramScheduleItem['app'],
        location?: OccurrenceLocation['app'],
        time: { start: Date, end?: Date },

        params?: Record<string, string|Localized<string>>,
        description?: LocalizedTextContent,
    },
    api: FromSchema<typeof programItemOccurenceSchema>,
}

export type OccurrenceItemRawData = {
    item: string,
    time: string[],

    location?: string,

    params?: Record<string, any>,
    description?: LocalizedTextContent,
}
