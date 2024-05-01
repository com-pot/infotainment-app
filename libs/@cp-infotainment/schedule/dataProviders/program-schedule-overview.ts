import { defineDataProvider } from "@com-pot/infotainment-app/panels/dataProviders";
import { ModelState } from "@typeful/model";
import { Activity } from "@com-pot/schedule/model/Activity";
import { OccurrenceLocation } from "@com-pot/schedule/model/OccurrenceLocation";
import { ActivityOccurrence, groupOccurrencesByDay } from "libs/com-pot/schedule/src/model/ActivityOccurrence";

import { FromSchema } from "json-schema-to-ts";
import * as tinyduration from "tinyduration"

const argsSchema = {
    type: 'object',
    properties: {
        from: {type: 'string', format: 'date'},
        to: {type: 'string', format: 'date'},
    },
    required: ['from', 'to'],
} as const
type Args = FromSchema<typeof argsSchema>

export default defineDataProvider<any, Args>({
    async load(args) {
        const [
            activities,
            locations,
            occurrencesRaw,
        ] = await Promise.all([
            this.api.req<Activity['app'][]>('GET', 'com-pot/schedule/activities'),
            this.api.req<OccurrenceLocation['app'][]>('GET', 'com-pot/schedule/locations'),
            this.api.req<ActivityOccurrence["api"][]>('GET', 'com-pot/schedule/occurrences-raw'),
        ])

        const hydrator = createOccurrencesHydrator(new Date(args.from))
        const groups = hydrator.hydrateOccurrences(occurrencesRaw, activities, locations)

        return groups
    },
})

export type ProgramEntriesGroup<TState extends ModelState = 'app'> = {
    date: Date,
    items: ActivityOccurrence[TState][],
}

export function createOccurrencesHydrator(startDate: Date) {
    const makeDate = (day: number, time?: string) => {
        if (!time) {
            return undefined
        }

        const date = new Date()
        const timeObj = tinyduration.parse('PT' + time.split(':').join('H') + 'M') // 🐷

        date.setFullYear(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + day)
        date.setHours(timeObj.hours || 0, timeObj.minutes)

        return date
    }

    const makeOccurenceTime = (occurrence: ActivityOccurrence["api"]): Pick<ActivityOccurrence['app'], "start" | "end"> => {
        return {start: makeDate(occurrence.day, occurrence.start)!, end: makeDate(occurrence.day, occurrence.end)}
    }

    const createOccurrencesApp = (
        group: ActivityOccurrence["api"][],
        activities: Activity['app'][],
        locations: OccurrenceLocation['app'][],
    ): ProgramEntriesGroup['items'] => {
        const itemsOrInvalid = group
            .map((occurrence): ProgramEntriesGroup['items'][number]|null => {
                const activity = activities.find((activity) => activity.id === occurrence.activity || activity.slug === occurrence.activity)!
                const time = makeOccurenceTime(occurrence)
                
                if (!activity || !time?.start) {
                    console.error(`Invalid occurrence spec '[${occurrence.day}]${occurrence.activity}'`, occurrence)
                    return null
                }
                const location = occurrence.location ? locations.find((location) => location.id === occurrence.location || location.slug === occurrence.location) : undefined
                if (occurrence.location && !location) {
                    console.warn(`Occurrence location '${occurrence.location}' not found in '[${occurrence.day}]${occurrence.activity}'`);
                }

                return {
                    activity,
                    day: occurrence.day,
                    ...time,
                    location,

                    

                    params: occurrence.params as any,
                }
            })
            
        return itemsOrInvalid
            .filter(Boolean) as NonNullable<typeof itemsOrInvalid[number]>[]
    }
    const createOccurrencesGroup = (items: ProgramEntriesGroup['items']): ProgramEntriesGroup => {
        const date = new Date(items[0].start)
        date.setHours(24, 0, 0, -1)

        return { date, items }
    }

    const hydrateOccurrences = (activityOccurrences: ActivityOccurrence["api"][], activities: Activity['app'][], locations: OccurrenceLocation['app'][]): ProgramEntriesGroup[] => {
        const occurrencesApp = createOccurrencesApp(activityOccurrences, activities, locations)
        const scheduleOccurencesGroupedByDay = groupOccurrencesByDay(occurrencesApp)
        return scheduleOccurencesGroupedByDay
            .map((occurrences) => createOccurrencesGroup(occurrences))
            .filter((occurrence): occurrence is NonNullable<typeof occurrence> => !!occurrence)
    }

    return {
        hydrateOccurrences,
    }
}
