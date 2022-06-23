<template>
    <div class="panel house-points" :style="`--score-rows: ${overview.rows};`"
         :class="[
            '-houses-status-' + scores.status,
            gaugesVisible && '-gauges-visible',
            ]">
        <ItPanel v-bind="config.contentPanel"/>
        <template v-if="scores.ready">
            <div class="score-tab" v-for="(score, i) in scores.value" :key="score.house.name"
             :style="`--score-color: ${score.house.color}; --fill-ratio: ${overview.fillRatios[i]}`"
            >
                <div class="gauge">
                    <div class="bar"></div>
                    <div class="name">{{score.house.name}}</div>
                </div>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import { reactive } from '@vue/reactivity';
import { computed, PropType } from '@vue/runtime-core';

import ItPanel from '../../../src/it-panels/ItPanel.vue';
import asyncReactive from '@com-pot/infotainment-app/components/asyncReactive';
import { useConGameApi } from '@custom/com-pot/con-game/conGameApi';
import delayedValue from "../../../src/components/delayedValue";

type HousePointsConfig = {
    contentPanel: {}
}
export default {
    components: {
        ItPanel
    },
    props: {
        config: {type: Object as PropType<HousePointsConfig>, required: true},
    },
    setup() {
        const conGameApi = useConGameApi()
        const scores = asyncReactive(conGameApi.fetchHousesOverview())

        const maxScore = computed(() => scores.ready ? Math.max(100, ...scores.value.map((score) => score.points + 10)) : -1)
        const overview = reactive({
            fillRatios: computed(() => scores.ready ? scores.value.map((score) => 1 / maxScore.value * score.points) : []),
            rows: computed(() => scores.ready ? Math.ceil(scores.value.length / 2) : 1),
        })

        const gaugesVisible = delayedValue(() => scores.status === 'ready', {
            delay: 50,
            filter: (val) => val,
        })

        return {
            scores,
            overview,
            gaugesVisible,
        }
    },
}
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

    .score-tab {
        display: grid;
        place-items: stretch;
    }

    .gauge {
        display: grid;
        grid-template-areas: 'gauge';

        width: var(--gauge-width);
        background: lightgray;
        border-radius: 2rem;
        overflow: hidden;
        opacity: 0;
        
        writing-mode: vertical-lr;

        > * {
            grid-area: gauge;
        }
        .name {
            place-self: center;
            font-weight: bold;
            font-size: 3em;
            transform: rotate(0.5turn);
        }

        .bar {
            place-self: end;
            width: 100%;
            height: calc(var(--fill-ratio) * 100%);
            background: var(--score-color);
        }

        &::after {
            content: ""; display: block; grid-area: gauge;
            border-radius: inherit;
            box-shadow: inset -2px -2px 8px lightgray;
        }
    }

    :is(&, .gauge) {
        transition: all 0.3s;
    }
    

    &:not(.-gauges-visible) {
        margin-inline-start: calc(-1 * (var(--gauge-width) + var(--gauge-gap)));
        margin-inline-end: calc(-1 * (var(--gauge-width) + var(--gauge-gap)));
    }
    &.-gauges-visible {
        .gauge {
            opacity: 1;
        }
    }
}
</style>