import { defineDataProvider } from "@com-pot/infotainment-app/panels/dataProviders";
import { Activity } from "@com-pot/schedule/model/Activity";
import { OccurrenceLocation } from "@com-pot/schedule/model/OccurrenceLocation";
import { ActivityOccurrence } from "libs/com-pot/schedule/src/model/ActivityOccurrence";

import { FromSchema } from "json-schema-to-ts";
import { createOccurrencesHydrator } from "./program-schedule-overview";

const argsSchema = {
    type: 'object',
    properties: {
        from: {type: 'string', format: 'date'},
        to: {type: 'string', format: 'date'},
        meet: {type: "string"},
    },
    required: ['from', 'to', 'meet'],
} as const
type Args = FromSchema<typeof argsSchema>

export default defineDataProvider<any, Args>({
    async load(args) {
        const [
            activities,
            locations,
            occurrencesRaw,
        ] = await Promise.all([
            this.api.req<{items: Activity['app'][]}>('GET', 'backstage/typeful/collection/_compot_schedule__Activities/items?_perPage=100&meet=fhp'),
            this.api.req<{items: OccurrenceLocation['app'][]}>('GET', 'backstage/typeful/collection/_compot_locations__Places/items?_perPage=100&meet=fhp'),
            this.api.req<{items: ActivityOccurrence["api"][]}>('GET', 'backstage/typeful/collection/_compot_schedule__ActivityOccurrences/items?_perPage=150&meet=fhp'),
        ])

        const hydrator = createOccurrencesHydrator(new Date(args.from))
        const groups = hydrator.hydrateOccurrences(occurrencesRaw.items, activities.items, locations.items)

        return groups
    },
})
