import { Localized, LocalizedTextContent } from "@typeful/model/types/I18n"
import { OccurrenceLocation } from "./OccurrenceLocation"
import { Activity } from "./ProgramScheduleItem"
import { FromSchema } from "json-schema-to-ts"

export const programItemOccurenceSchema = {
    type: 'object',
    properties: {
        activity: {type: "string"},
        location: {type: "string"},
        
        day: {type: "number"},
        start: {type: 'string', format: 'date'},
        end: {type: 'string', format: 'date'},

        params: {type: "object", additionalProperties: true},
    },
    required: ['activity', 'day', 'start'],
    additionalProperties: false,
} as const

export type ActivityOccurrence = {
    app: {
        activity: Activity['app'],
        location?: OccurrenceLocation['app'],

        day: number,
        start: Date,
        end?: Date,

        params?: Record<string, string|Localized<string>>,
        description?: LocalizedTextContent,
    },
    api: FromSchema<typeof programItemOccurenceSchema>,
}

export function groupOccurrencesByDay<T extends Pick<ActivityOccurrence["app"], "day" | "start" | "end">>(occurrences: T[]): T[][] {
    const groups: Record<string, T[]> = {}

    occurrences.forEach((occurrence) => {
        if (!groups[occurrence.day]) groups[occurrence.day] = []
        groups[occurrence.day].push(occurrence)
    })

    return Object.entries(groups)
        .map(([day, group]) => [Number(day), group] as const)
        .sort(([a], [b]) => a - b)
        .map(([day, group]) => group.sort((a, b) => {
            if (!a.start || !b.start) return 0
            return a.start.getTime() - b.start.getTime()
        }))
}
