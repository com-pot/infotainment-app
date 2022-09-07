import { GameHouse, HouseScore, HouseStanding } from "./model"

export type HouseStandingsWithIndex = HouseStanding[] & {itemIndex: Record<string, HouseStanding>}

export function createStandings(houses: GameHouse[]): HouseStandingsWithIndex {
    const standings: HouseStanding[] = houses.map((house) => ({
        house,
        scores: [],
    }))

    return Object.assign(standings, {itemIndex: createIndex(standings, standingToId)})
}

export function assignScores(standings: HouseStandingsWithIndex | HouseStanding[], scores: HouseScore[], mode: 'append'|'replace' = 'append') {
    const index = 'itemIndex' in standings ? standings.itemIndex : createIndex(standings, standingToId)

    mode === 'replace' && standings.forEach((standing) => standing.scores.splice(0))

    scores.forEach((score) => {
        const standing = index[score.house]
        if (!standing) {
            return console.warn("Invalid score entry", score);
        }
        standing.scores.push(score)
    })
}

const standingToId = (standing: HouseStanding) => standing.house.id
function createIndex<T>(items: T[], key: (item: T) => string) {
    return Object.fromEntries(items.map((item) => [key(item), item]))
}
