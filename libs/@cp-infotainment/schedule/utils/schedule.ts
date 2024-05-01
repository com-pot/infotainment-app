import { ProgramEntriesGroup } from "../dataProviders/program-schedule-overview";

export function groupOnlyVisible(group: ProgramEntriesGroup, now: number): ProgramEntriesGroup {
    return {
        ...group,
        items: group.items.filter((item) => {
            if (item.end && item.end.getTime() >= now) return true
            return item.start.getTime() >= now
        }),
    }
}