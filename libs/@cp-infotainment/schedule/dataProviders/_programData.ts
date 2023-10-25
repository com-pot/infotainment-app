import { ProgramEntriesGroup } from "./program-schedule-overview"

async function mockGroups(days: number): Promise<ProgramEntriesGroup[]> {
    const mock = await import("../utils/mock");
    
    const groups: ProgramEntriesGroup[] = []
    for (let day = 0; day <= days; day++) {
        // fixme: day initialization won't work
        const group: ProgramEntriesGroup = {
            date: new Date(day),
            items: [],
        }

        const count = Math.floor(2 + Math.random() * 4)
        const locales = ['cs', 'en']
        for (let i = 0; i < count; i++) {
            group.items.push(mock.mockItemOccurence(locales, day))
        }
        group.items.sort((a, b) => a.start.getTime() - b.start.getTime())
        groups.push(group)
    }

    return groups
}
