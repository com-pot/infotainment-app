import { Localized, LocalizedTextContent } from "@typeful/model/types/I18n"
import { OccurrenceLocation } from "./OccurrenceLocation"
import { Activity } from "./Activity"
import { FromSchema } from "json-schema-to-ts"

export const activityOccurenceSchema = {
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
    api: FromSchema<typeof activityOccurenceSchema>,
}

export function groupOccurrencesByDay<T extends Pick<ActivityOccurrence["app"], "day" | "start" | "end">>(occurrences: T[]): T[][] {
    const groups: Record<string, T[]> = {}

    occurrences.forEach((occurrence) => {
        if (!groups[occurrence.day]) groups[occurrence.day] = []
        groups[occurrence.day].push(occurrence)
    })

    const dayMs = 1 * 24 * 60 * 60 * 1_000
    function timeSortValue(time: Date): number {
        const compensation = time.getHours() < 5 ? dayMs : 0
        return time.getTime() + compensation
    }

    return Object.entries(groups)
        .map(([day, group]) => [Number(day), group] as const)
        .sort(([a], [b]) => a - b)
        .map(([day, group]) => group.sort((a, b) => {
            if (!a.start || !b.start) return 0
            return timeSortValue(a.start) - timeSortValue(b.start)
        }))
}
