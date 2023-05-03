<script lang="ts" setup>
import { computed, ref } from 'vue';
import {
    contestantIndexFromEntries,
    createScores,
    ScoreEntry,
    composeBestsByRound,
    ScoreSorter,
    ContestRoundConfig,
 } from "../model/ContestModel"


const contestants = computed(() => contestantIndexFromEntries([
    // Add contestants here
    ["adam", "Adam"],
    ["brita", "Brita"],
]))
const scores = ref(createScores([
    // Individual round scores go here
    [1, 'adam', 17.70],
    [1, 'brita', 18.86],
    [1, 'brita', 22.22],
    [1, 'adam', 15.86],
    [1, 'brita', 15.51],
    [1, 'adam', 21.36],
    [1, 'charlie', 7.77],
    [1, 'duran', 6.66],

    [2, 'brita', 20.79],
    [2, 'adam', 22.74],
    [2, 'duran', 21.43],

    [3, 'adam', 20.11],
    [3, 'duran', 20.99],
]))

const roundConfigs: Record<number, ContestRoundConfig> = {
    1: {cols: 3, maxQualifying: 10, caption: "Round 1 - qualifiers"},
    2: {cols: 1, maxQualifying: 2},
    3: {cols: 1, caption: "Round 3 - finals"},
}

const sorter: ScoreSorter<number> = (a, b) => a - b
const bestsByRound = computed(() => composeBestsByRound(scores.value, sorter))

const currentRoundNum = ref(1)
const scoresOrdered = computed(() => {
    const contestantsBests = bestsByRound.value[currentRoundNum.value]
    if (!contestantsBests) return []

    return Object.values(contestantsBests)
        .sort((a, b) => -(a.value - b.value))
})

const currentRound = computed(() => roundConfigs[currentRoundNum.value])
const prevRoundNumbers = computed(() => Array.from({length: Math.max(0, currentRoundNum.value - 1)}).map((_, i) => i + 1))

function formatValue(scoreEntry?: ScoreEntry<number>) {
    if (!scoreEntry?.value) return '---'
    return scoreEntry.value.toFixed(2) + 's'
}

</script>

<template>
    <div class="caption -round"> {{ currentRound?.caption || `Round ${currentRoundNum}` }}</div>
    <div class="scores" :style="`--cols: ${currentRound?.cols || 1};`">
        <template v-for="(score, i) of scoresOrdered">
            <div class="placement" :class="currentRound?.maxQualifying && i + 1 <= currentRound.maxQualifying ? 'qualifying' : ''">
                <div class="order">
                    <div class="letter">{{ i + 1 }}</div>
                </div>
                <div class="contestant">{{ contestants[score.contestant]?.nick || "Kdože??" }}</div>
                <div class="value">{{ formatValue(score) }}</div>
                <div class="prev">
                    <template v-for="prev of prevRoundNumbers">
                        <div class="score" v-if="bestsByRound[prev]?.[score.contestant]">{{ prev }}: {{ formatValue(bestsByRound[prev][score.contestant]) }}</div>
                    </template>
                </div>
            </div>
        </template>
    </div>
</template>

<style lang="scss">
#app:has(> .scores) {
    padding: 2rem;
    > .caption.-round {
        font-size: 6rem;
    }
}

.scores {
    display: grid;
    grid-template-columns: repeat(var(--cols, 2), minmax(0, 1fr));

    gap: 1rem;
}

.placement {
    font-size: 2rem;
    display: grid;
    gap: 0.1em;
    grid-template-areas: 'contestant prev order' 'time prev order';
    grid-template-columns: 1fr auto auto;

    background: #eee;
    padding: 0.25rem;
    border: 0.1rem solid transparent;

    overflow: hidden;

    position: relative;

    .order {
        font-size: 2em;
        grid-area: order;

        width: 0;

        .letter {
            position: absolute;
            top: -1.1rem;
            inset-inline-end: 0px;
            font-size: 2em;
            line-height: 1;
            opacity: 0.25;

            pointer-events: none;
            user-select: none;
        }
    }
    .contestant {
        font-size: 1.2em;
        font-weight: bold;
    }

    .prev {
        grid-area: prev;
        font-size: 0.6em;

        display: flex;
        flex-direction: column;
        gap: 0.25em;
    }

    &.qualifying {
        border-color: green;
    }
    // &:not(.qualifying) {
    //     opacity: 0.5;
    // }
}
</style>
