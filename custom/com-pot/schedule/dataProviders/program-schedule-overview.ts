import { defineDataProvider } from "@com-pot/infotainment-app/panels/dataProviders";
import { mockProgramEntry } from "../utils/mock";
import { ProgramEntry } from "./program-schedule";

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
        const from = new Date(args.from)
        const to = new Date(args.to)

        const groups = []
        for (let day = new Date(from); day <= to; day.setDate(day.getDate() + 1)) {            
            const group: ProgramEntriesGroup = {
                date: new Date(day),
                items: [],
            }

            const count = Math.floor(4 + Math.random() * 6)
            for (let i = 0; i < count; i++) {
                group.items.push(mockProgramEntry())
            }
            group.items.sort((a, b) => a.time.start.getTime() - b.time.start.getTime())
            groups.push(group)
        }
        return groups
    },
})

export type ProgramEntriesGroup = {
    date: Date,
    items: ProgramEntry['app'][],
}