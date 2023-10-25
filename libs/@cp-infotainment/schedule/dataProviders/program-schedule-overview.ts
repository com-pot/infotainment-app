import { defineDataProvider } from "@com-pot/infotainment-app/panels/dataProviders";
import { ModelState } from "@typeful/model";
import { ProgramScheduleItem } from "@com-pot/schedule/model/ProgramScheduleItem";
import { OccurrenceLocation } from "@com-pot/schedule/model/OccurrenceLocation";
import { OccurrenceItemRawData, ProgramItemOccurence } from "libs/com-pot/schedule/src/model/ProgramItemOccurrence";

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
            items,
            locations,
            occurrencesRaw,
        ] = await Promise.all([
            this.api.req<ProgramScheduleItem['app'][]>('GET', 'com-pot/schedule/items'),
            this.api.req<OccurrenceLocation['app'][]>('GET', 'com-pot/schedule/locations'),
            this.api.req<OccurrenceItemRawData[][]>('GET', 'com-pot/schedule/occurrences-raw'),
        ])

        const hydrator = createOccurrencesHydrator(new Date(args.from))
        const groups = hydrator.hydrateOccurrences(occurrencesRaw, items, locations)

        return groups
    },
})

export type ProgramEntriesGroup<TState extends ModelState = 'app'> = {
    date: Date,
    items: ProgramItemOccurence[TState][],
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

    const makeOccurenceTime = (range: string[], iDay: number): ProgramItemOccurence['app']['time'] => {
        return {start: makeDate(iDay, range[0])!, end: makeDate(iDay, range[1])}
    }

    const createOccurrencesGroup = (
        group: OccurrenceItemRawData[], iDay: number,
        scheduleItems: ProgramScheduleItem['app'][],
        locations: OccurrenceLocation['app'][],
    ): ProgramEntriesGroup => {
        const itemsOrInvalid = group
            .map((occurrence: OccurrenceItemRawData, iOcc): ProgramEntriesGroup['items'][number]|null => {
                const item = scheduleItems.find((item) => item.id === occurrence.item)!
                const time = makeOccurenceTime(occurrence.time, iDay)
                if (!item || !time) {
                    console.error(`Invalid occurrence spec '${iDay}:${iOcc}'`, occurrence)
                    return null
                }
                const location = occurrence.location ? locations.find((location) => location.id === occurrence.location) : undefined
                if (occurrence.location && !location) {
                    console.warn(`Occurrence location '${occurrence.location}' not found in '${iDay}:${iOcc}'`);
                }

                return {
                    item,
                    time,
                    location,
                    params: occurrence.params,
                }
            })
        const items = itemsOrInvalid
            .filter(Boolean) as NonNullable<typeof itemsOrInvalid[number]>[]

        const date = new Date(items[0].time.start)
        date.setHours(0, 0, 0, 0)

        return { date, items }
    }

    const hydrateOccurrences = (scheduleOccurencesGroupedByDay: OccurrenceItemRawData[][], scheduleItems: ProgramScheduleItem['app'][], locations: OccurrenceLocation['app'][]): ProgramEntriesGroup[] => {
        return scheduleOccurencesGroupedByDay.map((group, iDay) => createOccurrencesGroup(group, iDay, scheduleItems, locations))
    }

    return {
        hydrateOccurrences,
    }
}
