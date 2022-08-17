import { O } from "ts-toolbelt"
import { defineDataProvider } from "@com-pot/infotainment-app/panels/dataProviders"
import { FromSchema } from "json-schema-to-ts"
import { mockProgramEntry } from "../utils/mock"


export default defineDataProvider.withSchema({
    argsSchema: {
        type: 'object',
        properties: {
            page: {type: 'number'},
            perPage: {type: 'number', default: 10},
        },
        required: ['page'],
    } as const,

    async load(args) {
        const perPage = args.perPage ?? 2

        const items = []

        for (let i = 0; i < perPage; i++) {
            items.push(mockProgramEntry() )
        }
        items.sort((a, b) => a.time.start.getTime() - b.time.start.getTime())

        return items
    },
})

export const programEntrySchema = {
    type: 'object',
    properties: {
        title: {type: 'string'},
        location: {type: 'string'},
        description: {type: 'string'},
        time: {
            type: 'object',
            properties: {
                start: {type: 'string', format: 'date'},
                end: {type: 'string', format: 'date'},
            },
            required: ['from'],
        },
    },
    required: ['title', 'location', 'description', 'time'],
} as const

type AsApi = FromSchema<typeof programEntrySchema>
export type ProgramEntry = {
    api: AsApi,
    app: O.Overwrite<AsApi, {
        time: {
            start: Date,
            end?: Date,
        },
    }>,
}
