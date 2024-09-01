import { defineDataProvider, PanelDataLoader } from "@com-pot/infotainment-app/panels/dataProviders";
import { ModelState } from "@typeful/model";
import { Activity } from "@com-pot/schedule/model/Activity";
import { OccurrenceLocation } from "@com-pot/schedule/model/OccurrenceLocation";
import { ActivityOccurrence } from "libs/com-pot/schedule/src/model/ActivityOccurrence";

import { FromSchema } from "json-schema-to-ts";
import { createOccurrencesHydrator } from "./_programData";


const argsSchema = {
    type: 'object',
    properties: {
        meet: {type: "string"},
        from: {type: 'string', format: 'date'},
        to: {type: 'string', format: 'date'},
    },
    required: ['meet', 'from', 'to'],
} as const
type Args = FromSchema<typeof argsSchema> & {now: Date}

export default defineDataProvider<unknown, Args>({
    async load(loader, args) {
        const { meet } = args
        const [
            activities,
            locations,
            occurrencesRaw,
        ] = await Promise.all([
            loader.api.req<{items: Activity['app'][]}>('GET', 'backstage/typeful/collection/_compot_schedule__Activities/items?_perPage=100&meet=' + meet),
            loader.api.req<{items: OccurrenceLocation['app'][]}>('GET', 'backstage/typeful/collection/_compot_locations__Places/items?_perPage=100&meet=' + meet),
            loader.api.req<{items: ActivityOccurrence["api"][]}>('GET', 'backstage/typeful/collection/_compot_schedule__ActivityOccurrences/items?_perPage=150&meet=' + meet),
        ])

        const hydrator = createOccurrencesHydrator(new Date(args.from))

        const groups = hydrator.hydrateOccurrences(occurrencesRaw.items, activities.items, locations.items)
        return groups
    },
})
