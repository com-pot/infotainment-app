import { ProgramEntriesGroup } from "./program-schedule-overview"

let roughDataPromise: Promise<ProgramEntriesGroup[]> | null = null

export default {
    async load(type: string, args: any) {
        if (type === 'detail') {
            const group = (await roughDataPromise)
                ?.find((group) => group.date.getDate() === args.day.getDate())

            return group?.items || []
        }
        if (type === 'overview') {
            const groups = mockGroups(new Date(args.from), new Date(args.to))
            return roughDataPromise = Promise.resolve(groups)
        }

        throw new Error(`no load for ${type}`)
    },
}

async function mockGroups(from: Date, to: Date) {
    const mock = await import("../utils/mock");
    const groups = []
    for (let day = new Date(from); day <= to; day.setDate(day.getDate() + 1)) {            
        const group: ProgramEntriesGroup = {
            date: new Date(day),
            items: [],
        }

        const count = Math.floor(2 + Math.random() * 4)
        for (let i = 0; i < count; i++) {
            group.items.push(mock.mockProgramEntry())
        }
        group.items.sort((a, b) => a.time.start.getTime() - b.time.start.getTime())
        groups.push(group)
    }
    return groups
}