import { defineDataProvider } from "@com-pot/infotainment-app/panels/dataProviders";
import { ModelState } from "@typeful/model";
import { Activity } from "@com-pot/schedule/model/Activity";
import { OccurrenceLocation } from "@com-pot/schedule/model/OccurrenceLocation";
import { ActivityOccurrence } from "libs/com-pot/schedule/src/model/ActivityOccurrence";

import { FromSchema } from "json-schema-to-ts";
import { createOccurrencesHydrator } from "./_programData";


const argsSchema = {
    type: 'object',
    properties: {
        from: {type: 'string', format: 'date'},
    },
    required: ['from'],
} as const
type Args = FromSchema<typeof argsSchema>

export default defineDataProvider<unknown, Args>({
    async load(loader, args) {
        const [
            activities,
            locations,
            occurrencesRaw,
        ] = await Promise.all([
            loader.api.req<Activity['app'][]>('GET', 'com-pot/schedule/activities'),
            loader.api.req<OccurrenceLocation['app'][]>('GET', 'com-pot/schedule/locations'),
            loader.api.req<(ActivityOccurrence["api"] & {time?: string[]})[]>('GET', 'com-pot/schedule/occurrences-raw'),
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
