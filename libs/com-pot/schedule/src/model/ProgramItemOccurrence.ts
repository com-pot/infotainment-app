import { Localized, LocalizedTextContent } from "@typeful/model/types/I18n"
import { OccurrenceLocation } from "./OccurrenceLocation"
import { ProgramScheduleItem } from "./ProgramScheduleItem"

export const programItemOccurenceSchema = {
    type: 'object',
    properties: {
        time: {
            type: 'object',
            properties: {
                start: {type: 'string', format: 'date'},
                end: {type: 'string', format: 'date'},
            },
            required: ['from'],
        },
    },
} as const

export type ProgramItemOccurence = {
    app: {
        item: ProgramScheduleItem['app'],
        location?: OccurrenceLocation['app'],
        time: { start: Date, end?: Date },

        params?: Record<string, string|Localized<string>>,
        description?: LocalizedTextContent,
    },
    api: never,
}

export type OccurrenceItemRawData = {
    item: string,
    time: string[],

    location?: string,

    params?: Record<string, any>,
    description?: LocalizedTextContent,
}
