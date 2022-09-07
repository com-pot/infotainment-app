import { ProgramEntriesGroup } from "./program-schedule-overview"

async function mockGroups(from: Date, to: Date): Promise<ProgramEntriesGroup[]> {
    const mock = await import("../utils/mock");
    
    const groups: ProgramEntriesGroup[] = []
    for (let day = new Date(from); day <= to; day.setDate(day.getDate() + 1)) {            
        const group: ProgramEntriesGroup = {
            date: new Date(day),
            items: [],
        }

        const count = Math.floor(2 + Math.random() * 4)
        const locales = ['cs', 'en']
        for (let i = 0; i < count; i++) {
            group.items.push(mock.mockItemOccurence(locales))
        }
        group.items.sort((a, b) => a.time.start.getTime() - b.time.start.getTime())
        groups.push(group)
    }

    return groups
}
