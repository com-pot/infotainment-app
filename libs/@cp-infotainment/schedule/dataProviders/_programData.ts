import * as tinyduration from "tinyduration"

import { ProgramEntriesGroup } from "./program-schedule-overview"
import { ActivityOccurrence, groupOccurrencesByDay } from "@com-pot/schedule/model/ActivityOccurrence";
import { Activity } from "@com-pot/schedule/model/Activity";
import { OccurrenceLocation } from "@com-pot/schedule/model/OccurrenceLocation";

async function mockGroups(days: number, firstDay: Date): Promise<ProgramEntriesGroup[]> {
    const mock = await import("../utils/mock");
    
    const groups: ProgramEntriesGroup[] = []
    for (let day = 0; day <= days; day++) {
        const group: ProgramEntriesGroup = {
            date: new Date(firstDay),
            items: [],
        }
        group.date.setDate(group.date.getDate() + day)

        const count = Math.floor(2 + Math.random() * 4)
        const locales = ['cs', 'en']
        for (let i = 0; i < count; i++) {
            group.items.push(mock.mockItemOccurence(locales, day, group.date))
        }
        group.items.sort((a, b) => a.start.getTime() - b.start.getTime())
        groups.push(group)
    }

    return groups
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

    function createOccurrencesApp(
        occurrences: ActivityOccurrence["api"][],
        activities: Activity['app'][],
        locations: OccurrenceLocation['app'][],
    ): ProgramEntriesGroup['items'] {
        const itemsOrInvalid = occurrences
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
                    location,

                    day: occurrence.day,
                    ...time,

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

    const hydrateOccurrences = (scheduleOccurences: ActivityOccurrence["api"][], activities: Activity['app'][], locations: OccurrenceLocation['app'][]): ProgramEntriesGroup[] => {
        const occurrencesApp = createOccurrencesApp(scheduleOccurences, activities, locations)
        const scheduleOccurencesGroupedByDay = groupOccurrencesByDay(occurrencesApp)
        return scheduleOccurencesGroupedByDay
            .map((occurrences) => createOccurrencesGroup(occurrences))
            .filter((occurrence): occurrence is NonNullable<typeof occurrence> => !!occurrence)
    }

    return {
        hydrateOccurrences,
    }
}
