import { defineDataProvider } from "@com-pot/infotainment-app/panels/dataProviders";
import { ProgramEntry } from "./program-schedule";

import programData from "./_programData"

export default defineDataProvider.withSchema({
    argsSchema: {
        type: 'object',
        properties: {
            from: {type: 'string', format: 'date'},
            to: {type: 'string', format: 'date'},
        },
        required: ['from', 'to'],
    } as const,

    async load(args) {
        return programData.load('overview', args)
    },
})

export type ProgramEntriesGroup = {
    date: Date,
    items: ProgramEntry['app'][],
}