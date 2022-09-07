import { faker } from "@faker-js/faker"
import { ProgramItemOccurence } from "@com-pot/schedule/model/ProgramItemOccurrence"
import { OccurrenceLocation } from "@com-pot/schedule/model/OccurrenceLocation"
import { ProgramScheduleItem } from "@com-pot/schedule/model/ProgramScheduleItem"

const programEntryParams = {
    adjs: ['Heinous', 'Frivolous', 'Wealthy', 'Ground-shattering', 'Fruitless', 'Gruesome', 'Humble', 'Throne'],
    nouns: ['Act', 'Feast', 'Cavern', 'Roar', 'Flipper', 'Sig', 'Dungeon', 'Seaside'],
    spots: ['Spot', 'Dungeon', 'Room', 'Forest'],
}

function randomPick<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)]
}
export const mockItemOccurence = (locales: string[], day?: Date): ProgramItemOccurence['app'] => {

    const start = day ? new Date(day) : new Date()
    start.setHours(Math.random() * 24, Math.random() * 60)
    const end = new Date(start)
    end.setMinutes(end.getMinutes() + Math.floor(2 + Math.random() * 4) * 15)
    
    return {
        item: mockProgramItem(locales),
        location: mockOccurrenceLocation(locales),
        time: { start, end },
    }
}

export const mockProgramItem = (locales: string[]): ProgramScheduleItem['app'] => {
    const adj = randomPick(programEntryParams.adjs)
    const noun = randomPick(programEntryParams.nouns)

    return {
        title: mockLocalized(`${adj} ${noun}`, locales),
        description: Math.random() < 0.8 ? mockLocalized(() => faker.lorem.sentences(Math.floor(6 + Math.random() * 10)), locales) : undefined,
    }
}

export const mockOccurrenceLocation = (locales: string[]): OccurrenceLocation['app'] => {
    const title = `The ${randomPick(programEntryParams.adjs)} ${randomPick(programEntryParams.spots)}`
    return {
        id: faker.random.alphaNumeric(6),
        title: mockLocalized(title, locales),
    }
}

export const mockLocalized = (str: string | (() => string), locales: string[]) => {
    const getStr = () => typeof str === 'function' ? str() : str
    const entries = locales.map((locale) => [locale, `${getStr()} (${locale})`])
    return Object.fromEntries(entries)
}