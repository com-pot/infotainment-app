import { defineDataProvider } from "@com-pot/infotainment-app/panels/dataProviders";
import { ModelState } from "@typeful/model";
import { Activity } from "@com-pot/schedule/model/Activity";
import { OccurrenceLocation } from "@com-pot/schedule/model/OccurrenceLocation";
import { ActivityOccurrenceRawSpec, ActivityOccurrence } from "libs/com-pot/schedule/src/model/ActivityOccurrence";

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
            this.api.req<Activity['app'][]>('GET', 'com-pot/schedule/items'),
            this.api.req<OccurrenceLocation['app'][]>('GET', 'com-pot/schedule/locations'),
            this.api.req<ActivityOccurrenceRawSpec[]>('GET', 'com-pot/schedule/occurrences-raw'),
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

function createOccurrencesHydrator(startDate: Date) {
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

    const makeOccurenceTime = (range: string[], iDay: number): Pick<ActivityOccurrence['app'], "start" | "end"> => {
        return {start: makeDate(iDay, range[0])!, end: makeDate(iDay, range[1])}
    }

    const createOccurrencesGroup = (
        group: ActivityOccurrenceRawSpec[], iDay: number,
        activities: Activity['app'][],
        locations: OccurrenceLocation['app'][],
    ): ProgramEntriesGroup => {
        const itemsOrInvalid = group
            .map((occurrence: ActivityOccurrenceRawSpec, iOcc): ProgramEntriesGroup['items'][number]|null => {
                const activity = activities.find((activity) => activity.id === occurrence.activity)!
                const time = makeOccurenceTime(occurrence.time, iDay)
                if (!activity || !time) {
                    console.error(`Invalid occurrence spec '${iDay}:${iOcc}'`, occurrence)
                    return null
                }
                const location = occurrence.location ? locations.find((location) => location.id === occurrence.location) : undefined
                if (occurrence.location && !location) {
                    console.warn(`Occurrence location '${occurrence.location}' not found in '${iDay}:${iOcc}'`);
                }

                return {
                    activity: activity,
                    day: iDay,
                    ...time,
                    location,

                    params: occurrence.params,
                }
            })
        const items = itemsOrInvalid
            .filter(Boolean) as NonNullable<typeof itemsOrInvalid[number]>[]

        const date = new Date(items[0].start)
        date.setHours(0, 0, 0, 0)

        return { date, items }
    }

    const hydrateOccurrences = (activityOccurrences: ActivityOccurrenceRawSpec[], activities: Activity['app'][], locations: OccurrenceLocation['app'][]): ProgramEntriesGroup[] => {
        const occurrencesByDay = {} as Record<string, ActivityOccurrenceRawSpec[]>
        activityOccurrences.forEach((occurrence) => {
            if (!occurrencesByDay[occurrence.day]) occurrencesByDay[occurrence.day] = []

            occurrencesByDay[occurrence.day].push(occurrence)
        })


        return Object.entries(occurrencesByDay)
            .map(([iDay, group]) => createOccurrencesGroup(group, Number(iDay), activities, locations))
    }

    return {
        hydrateOccurrences,
    }
}
