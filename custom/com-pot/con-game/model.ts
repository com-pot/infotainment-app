export type GameHouse = {
    id: string,
    name: string,
    color: string,
    effect?: string,
}

export type HouseScore = {
    house: string,
    reason?: string,
    points: number,
}

export type HouseStanding = {
    house: GameHouse,
    scores: HouseScore[],
}
