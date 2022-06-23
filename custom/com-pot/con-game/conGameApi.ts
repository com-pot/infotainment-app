import { App, inject } from "vue";

const houses: GameHouse[] = [
    {
        name: 'Skrzkrk',
        color: 'olive',
    },
    {
        name: 'Juliolej',
        color: 'blueviolet',
    },
    {
        name: 'Řízdřív',
        color: 'burlywood',
    },
    {
        name: 'Prokopro',
        color: 'firebrick'
    },
    {
        name: 'Svištipiš',
        color: 'crimson',
    },
    {
        name: 'Tytrych',
        color: 'gold',
    },
]

const api = {
    async fetchHousesOverview() {
        await new Promise((res) => setTimeout(res, 1000))
        return houses.map((house) => ({
            house,
            points: getPointVal(),
        }))
    },
}
const getPointVal = () => 45 + Math.floor(Math.random() * 80)

export const useConGameApi = () => inject<typeof api>('com-pot/con-game:api')!
export const provideConGameApi = (vue: App) => vue.provide('com-pot/con-game:api', api)


export type GameHouse = {
    name: string,
    color: string,
}
