import { defineDataProvider } from "@com-pot/infotainment-app/panels/dataProviders"
import { FromSchema } from "json-schema-to-ts"
import { ProgramEntriesGroup } from "./program-schedule-overview"

const argsSchema = {
    type: 'object',
    properties: {
        day: {type: 'string', format: 'date'},
    },
    required: ['page'],
} as const
type Args = FromSchema<typeof argsSchema>

export default defineDataProvider<any, Args>({
    async load(args) {
        const day = args.day as unknown as Date
        // FIXME: unless cached, this will trigger complete reload of groups
        const overviewGroups = await this.load('@com-pot/schedule.program-schedule-overview', {}) as ProgramEntriesGroup[]
        const group = overviewGroups.find((group) => group.date.getDate() === day.getDate())
        if (!group) {
            console.warn("No group found for", day);
            return []
        }
        
        return group.items
    },
})
