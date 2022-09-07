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
                />
            </template>
        </template>
    </div>
</template>

<script lang="ts">
import { reactive } from '@vue/reactivity';
import { computed, defineComponent, PropType, watch } from '@vue/runtime-core';

import ItPanel from '@com-pot/infotainment-app/it-panels/ItPanel.vue';
import delayedValue from "@com-pot/infotainment-app/components/delayedValue";
import ScoreGauge from '../components/ScoreGauge.vue';
import { useLoader } from '@com-pot/infotainment-app/panels/panelData';
import { GameHouse, HouseScore } from '@custom/com-pot/con-game/model';
import { asyncComputed } from '@com-pot/infotainment-app/components/asyncReactive';

import { assignScores, createStandings } from "@custom/com-pot/con-game/houseStandings"

type HousePointsConfig = {
    contentPanel: {},
    scorePollFrequency: string,
}
export default defineComponent({
    components: {
    ItPanel,
    ScoreGauge
},
    props: {
        config: {type: Object as PropType<HousePointsConfig>, required: true},
    },

    setup(props) {
        const loader = useLoader()
        const houses = loader.watch<GameHouse[]>(() => {
            return { name: '@com-pot/con-game.houses', args: {} }
        })
        const scores = loader.watch<HouseScore[]>(() => {
            return { name: '@com-pot/con-game.scores', args: {}, poll: props.config.scorePollFrequency }
        })

        // TODO: This could be optimized to only create standings once and only update points
        const standings = asyncComputed((houses, scores) => {
            const standings = createStandings(houses)
            assignScores(standings, scores)
            return standings
        }, houses, scores)
        
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
            rows: computed(() => standings.ready ? Math.ceil(standings.value.length / 2) : 1),
        })

        const gaugesVisible = delayedValue(() => standings.ready, {
            delay: 50,
            filter: (val) => val,
        })

        return {
            standings,
            housePoints,
            overview,
            gaugesVisible,
            pointsCap,
        }
    },
})
</script>

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