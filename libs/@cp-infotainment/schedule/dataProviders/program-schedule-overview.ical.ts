import { parseICS, CalendarResponse } from "node-ical"
import { defineDataProvider } from "@com-pot/infotainment-app/panels/dataProviders";
import { ModelState } from "@typeful/model";
import { ActivityOccurrence } from "libs/com-pot/schedule/src/model/ActivityOccurrence";

import { FromSchema } from "json-schema-to-ts";
import { createOccurrencesHydrator } from "./_programData";


const argsSchema = {
    type: 'object',
    properties: {
        from: {type: 'string', format: 'date'},
        template: { type: "string"},
        locales: {
            type: "array",
            items: {type: "string"},
        },
    },
    required: ['from', 'template', 'locales'],
} as const
type Args = FromSchema<typeof argsSchema>

const fetchIcalText = (src: string) => fetch(src)
    .then((res) => res.text())
    .then((icalStr) => parseICS(icalStr))

export default defineDataProvider<ProgramEntriesGroup[], Args>({
    async load(loader, args) {
        const perLocaleEntriesResult = await Promise.allSettled(
            args.locales.map(async (locale): Promise<[string, CalendarResponse]> => [
                locale, await fetchIcalText(args.template.replace("{locale}", locale))
            ])
        )
        const perLocaleEntries = perLocaleEntriesResult
            .filter((result) => result.status === "fulfilled")
            .map((result) => result.value)


        const from = new Date(args.from)
        const [occurrencesRaw, activities, locations] = _parseIcalEntries(from, perLocaleEntries)

        const hydrator = createOccurrencesHydrator(from)
        const groups = hydrator.hydrateOccurrences(occurrencesRaw, activities, locations)

        return groups
    },
})

const dateToHours = (date: Date) => `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`

type IcalEntriesParsed = Parameters<ReturnType<typeof createOccurrencesHydrator>["hydrateOccurrences"]>
function _parseIcalEntries(from: Date, entries: [string, CalendarResponse][]): IcalEntriesParsed {
    const activities: IcalEntriesParsed[1] = []
    const locations: IcalEntriesParsed[2] = []

    const idToEntries: Record<string, IcalEntriesParsed[0][number]> = {}

    const msInDay = 1 * 24 * 60 * 60 * 1_000
    const getDay = (date: Date) => {
        const diff = date.getTime() - from.getTime()
        return Math.floor(diff / msInDay)
    }

    entries.forEach(([locale, response], i) => {
        Object.entries(response).forEach(([id, component]) => {
            if (component.type !== "VEVENT") {
                console.warn("Unknown ical component type", component)
                return
            }

            const locationId = 'byEvt-' + component.uid
            let location = locations.find((location) => {
                return location.id === locationId || location.title[locale] === component.location
            })

            if (!location) {
                location = {
                    id: locationId,
                    title: {},
                }
                locations.push(location)
            }
            location.title[locale] = component.location

            const activityId = 'byEvt-' + component.uid
            let activity = activities.find((activity) => {
                return activity.id === activityId || activity.title[locale] === component.summary
            })
            if (!activity) {
                activity = {
                    id: activityId,
                    title: {},
                    description: {},
                }
                activities.push(activity)
            }
            activity.title[locale] = component.summary
            activity.description![locale] = component.summary

            if (!idToEntries[id]) {
                idToEntries[id] = {
                    location: location.id,
                    day: getDay(component.start),
                    activity: activity.id,
                    start: dateToHours(component.start),
                    end: component.end.getTime() === component.start.getTime() ? undefined : dateToHours(component.end),
                }
            }
        })
    })
    const scheduleOccurrences: IcalEntriesParsed[0] = Object.values(idToEntries)

    return [scheduleOccurrences, activities, locations]
}

export type ProgramEntriesGroup<TState extends ModelState = 'app'> = {
    date: Date,
    items: ActivityOccurrence[TState][],
}
