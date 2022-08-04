import { faker } from "@faker-js/faker"
import { ProgramEntry } from "../dataProviders/program-schedule"

const programEntryParams = {
    adjs: ['Heinous', 'Frivolous', 'Wealthy', 'Ground-shattering', 'Fruitless', 'Gruesome', 'Humble', 'Throne'],
    nouns: ['Act', 'Feast', 'Cavern', 'Roar', 'Flipper', 'Sig', 'Dungeon', 'Seaside'],
    spots: ['Spot', 'Dungeon', 'Room', 'Forest'],
}

function randomPick<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)]
}
export const mockProgramEntry = (day?: Date): ProgramEntry['app'] => {
    const adj = randomPick(programEntryParams.adjs)
    const noun = randomPick(programEntryParams.nouns)

    const locAdj = randomPick(programEntryParams.adjs)
    const spot = randomPick(programEntryParams.spots)

    const start = day ? new Date(day) : new Date()
    start.setHours(Math.random() * 24, Math.random() * 60)
    const end = new Date(start)
    end.setMinutes(end.getMinutes() + Math.floor(2 + Math.random() * 4) * 15)
    
    return {
        title: `${adj} ${noun}`,
        location: `The ${locAdj} ${spot}`,
        description: faker.lorem.sentences(Math.floor(6 + Math.random() * 10)),
        time: { start, end },
    }
}
