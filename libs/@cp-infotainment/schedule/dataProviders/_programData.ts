import { ProgramEntriesGroup } from "./program-schedule-overview"

async function mockGroups(days: number, firstDay: Date): Promise<ProgramEntriesGroup[]> {
    const mock = await import("../utils/mock");
    
    const groups: ProgramEntriesGroup[] = []
    for (let day = 0; day <= days; day++) {
        const group: ProgramEntriesGroup = {
            date: new Date(firstDay),
            items: [],
        }
        group.date.setDate(group.date.getDate() + day)

        const count = Math.floor(2 + Math.random() * 4)
        const locales = ['cs', 'en']
        for (let i = 0; i < count; i++) {
            group.items.push(mock.mockItemOccurence(locales, day, group.date))
        }
        group.items.sort((a, b) => a.start.getTime() - b.start.getTime())
        groups.push(group)
    }

    return groups
}
