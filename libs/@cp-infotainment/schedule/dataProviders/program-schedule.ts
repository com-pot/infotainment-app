import { defineDataProvider } from "@com-pot/infotainment-app/panels/dataProviders"
import { FromSchema } from "json-schema-to-ts"
import { ProgramEntriesGroup } from "./program-schedule-overview"

const argsSchema = {
    type: 'object',
    properties: {
        day: {type: 'string', format: 'date'},
        groups: {type: 'object'},
    },
} as const
type Args = FromSchema<typeof argsSchema>

export default defineDataProvider<any, Args>({
    async load(args) {
        const day = args.day as unknown as Date
        const overviewGroups = await this.load(args.groups as any) as ProgramEntriesGroup[]

        const group = overviewGroups.find((group) => group.date.getDate() === day.getDate())
        if (!group) {
            console.warn("No group found for", day, ' in ', overviewGroups);
            return []
        }

        return group.items
    },
})
