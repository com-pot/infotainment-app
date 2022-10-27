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
type Args = FromSchema<typeof argsSchema> & {now: Date}

export default defineDataProvider<any, Args>({
    async load(args) {
        const now = args.now || new Date()

        let start = args.from
        if (!start) {
            console.warn("No args.from set, using hardcoded FHP date");
            start = '2022-10-27'
        }

        const results = await Promise.all([
            this.api.req('GET', 'com-pot/schedule/items.json'),
            this.api.req('GET', 'com-pot/schedule/locations.json'),
            this.api.req('GET', 'com-pot/schedule/occurrences-raw.json'),
        ])
        const items = results[0] as ProgramScheduleItem['app'][]
        const locations = results[1] as OccurrenceLocation['app'][]
        const occurrencesRaw = results[2] as OccurrenceItemRawData[][]
        
        return hydrateOccurrences(new Date(start), occurrencesRaw, items, locations)
            .filter((group) => group.date.getDate() >= now.getDate())
    },
})

export type ProgramEntriesGroup<TState extends ModelState = 'app'> = {
    date: Date,
    items: ProgramItemOccurence[TState][],
}

function createDateFactory(startDate: Date) {
    function makeDate(day: number, time: string) {
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

    return makeOccurenceTime
}

export const hydrateOccurrences = (startDate: Date, scheduleOccurencesGroupedByDay: OccurrenceItemRawData[][], scheduleItems: ProgramScheduleItem['app'][], locations: OccurrenceLocation['app'][]): ProgramEntriesGroup[] => {
    const makeOccurenceTime = createDateFactory(startDate)

    return scheduleOccurencesGroupedByDay.map((group, iDay) => {
        const items: ProgramEntriesGroup['items'] = group.map((occurrence: OccurrenceItemRawData) => ({
            item: scheduleItems.find((item) => item.id === occurrence.item)!,
            location: locations.find((location) => location.id === occurrence.location),
            time: makeOccurenceTime(occurrence.time, iDay),
            params: occurrence.params,
        }))
    
        const date = new Date(items[0].time.start)
        date.setHours(0, 0, 0, 0)
    
        return { date, items }
    })
}