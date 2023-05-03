export type Contestant = {
    id: string,
    nick: string,
}

export type ScoreEntry<T = number> = {
    round: number,
    contestant: string,
    value: T,
}

export type ContestRoundConfig = {
    cols?: number,
    maxQualifying?: number,
    caption?: string,
}

export function contestantIndexFromEntries(entries: readonly [string, string][]): Record<string, Contestant> {
    return Object.fromEntries(entries.map(([id, nick]) => ([id, {id, nick}])))
}

export function createScores<T = number>(entries: readonly [number, string, T][]): ScoreEntry<T>[] {
    return entries.map(([round, contestant, value]) => ({round, contestant, value}))
}

export function composeBestsByRound<T>(scores: ScoreEntry<T>[], sorter: ScoreSorter<T>): Record<number, Record<string, ScoreEntry>> {
    const rounds = new Set<number>(scores.map((score) => score.round))
    const bests = Array.from(rounds.values())
        .map((round) => {
            const roundScores = scores.filter((score) => score.round === round)
            return [round, composeContestantsBests(roundScores, sorter)]
        })
    return Object.fromEntries(bests)
}

function composeContestantsBests<T>(scores: ScoreEntry<T>[], sorter: ScoreSorter<T>) {
    const contestantsBests: Record<string, ScoreEntry<T>> = {}
    scores.forEach((score) => {
        const existingScore = contestantsBests[score.contestant]
        if (!existingScore || sorter(existingScore.value, score.value) < 0) {
            contestantsBests[score.contestant] = score
        }
    })

    return contestantsBests
}

export type ScoreSorter<T = number> = (a: T, b: T) => 1 | 0 | -1 | number
