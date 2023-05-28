<script lang="ts" setup>
import { computed, PropType, reactive } from 'vue';

import ItPanel from '@com-pot/infotainment-app/it-panels/ItPanel.vue';
import { PanelSpecification } from '@com-pot/infotainment-app/panels';
import { asyncComputed, AsyncRef, delayedValue } from '@typeful/vue-utils/reactivity';
import ScoreGauge from '../components/ScoreGauge.vue';

import { GameHouse, HouseScore } from '../model';
import { assignScores, createStandings } from "../houseStandings"

type HousePointsConfig = {
    contentPanel: PanelSpecification,
    showPoints?: boolean,
}

const props = defineProps({
    config: {type: Object as PropType<HousePointsConfig>, required: true},
    houses: {type: Object as PropType<AsyncRef<GameHouse[]>>, required: true},
    scores: {type: Object as PropType<AsyncRef<HouseScore[]>>, required: true},
})

// TODO: This could be optimized to only create standings once and only update points
const standings = asyncComputed((houses, scores) => {
    const standings = createStandings(houses)
    assignScores(standings, scores)
    return standings
}, props.houses, props.scores)

const housePoints = computed(() => {
    if (!standings.ready) {
        return []
    }
    return standings.value.map((standing) => {
        return standing.scores.reduce((sum, score) => sum + score.points, 0)
    })
})

const pointsCap = computed(() => Math.max(100, ...housePoints.value) + 10)
const overview = reactive({
    rows: computed(() => Math.max(standings.ready ? Math.ceil(standings.value.length / 2) : 1, 1)),
})

const gaugesVisible = delayedValue(() => standings.ready && standings.value.length > 0, {
    delay: 500,

    filter: (val) => val,
})
</script>

<template>
    <div class="panel house-points" :style="`--score-rows: ${overview.rows};`"
         :class="[
            '-houses-status-' + standings.status,
            gaugesVisible && '-gauges-visible',
        ]">
        <ItPanel v-bind="config.contentPanel"/>

        <template v-if="standings.ready">
            <template v-for="(standing, i) in standings.value" :key="standing.house.name">
                <ScoreGauge :house="standing.house"
                            :points="housePoints[i]" :max-points="pointsCap"
                            :show-points="config.showPoints"
                />
            </template>
        </template>
    </div>
</template>

<style lang="scss">
.house-points {
    --gauge-width: 4rem;
    --gauge-gap: var(--spacing);

    display: grid;
    grid-template-columns: var(--gauge-width) 1fr var(--gauge-width);
    grid-template-rows: repeat(var(--score-rows), minmax(auto, 1fr));
    padding: 2rem;
    gap: var(--gauge-gap);

    > .panel {
        grid-column: 2;
        grid-row: 1 / span var(--score-rows);
        overflow: hidden;
    }

    :is(&, .score-gauge) {
        transition: all 0.3s;
    }


    &:not(.-gauges-visible) {
        margin-inline-start: calc(-1 * (var(--gauge-width) + var(--gauge-gap)));
        margin-inline-end: calc(-1 * (var(--gauge-width) + var(--gauge-gap)));
    }
    &.-gauges-visible {
        .score-gauge {
            opacity: 1;
        }
    }
}
</style>
