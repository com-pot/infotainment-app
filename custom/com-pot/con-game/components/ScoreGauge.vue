<script lang="ts" setup>
import { useTransition, TransitionPresets } from "@vueuse/core"
import { GameHouse } from "@custom/com-pot/con-game/model";
import { computed, onBeforeUnmount, onMounted, PropType, ref, watch } from "@vue/runtime-core";
import { createEffect } from "@custom/com-pot/con-game/gauge/effect";

const props = defineProps({
    house: {type: Object as PropType<GameHouse>, required: true},
    points: {type: Number},
    maxPoints: {type: Number},
})
const fillRatioAbs = computed(() => Math.max(0.05, 1 / (props.maxPoints ?? 100) * (props.points ?? 0)))
const fillRatio = useTransition(fillRatioAbs, {
    transition: TransitionPresets.easeOutBack,
    duration: 250,
})
const elCanvas = ref<HTMLCanvasElement>()

const effect = props.house.effect ? createEffect(props.house.effect) : null

watch(fillRatio, (ratio) => {
    if (effect) effect.fillRatio = ratio
}, {immediate: true})

onMounted(() => {
    const canvas = elCanvas.value
    if (!canvas || !effect) {
        return
    }
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight    
    
    const ctx = canvas.getContext("2d")
    if (!ctx) {
        return console.warn("Could not acquire canvas context");
    }
    effect.start(ctx)
})
onBeforeUnmount(() => {
    effect?.stop()
})

function toggleEffect() {
    if (effect) {
        effect.status === 'running'
            ? effect.stop()
            : effect.start(elCanvas.value!.getContext('2d')!)
    }   
}

</script>

<template>
    <div class="score-gauge"
         :style="`--score-color: ${house.color}; --fill-ratio: ${fillRatio}`"
         @click="toggleEffect"
    >
        <div class="bar"></div>
        <div class="name">{{house.name}}</div>
        <span class="points" v-if="typeof points === 'number'">{{ points }}</span>
        <canvas class="effect" ref="elCanvas"></canvas>
    </div>
</template>

<style lang="scss">
.score-gauge {
    --border-width: 2px;
    display: grid;
    grid-template-areas: 'gauge';

    width: var(--gauge-width);
    background: hsla(0deg, 20%, 80%, 0.4);
    border-radius: 2rem;
    border: var(--border-width) groove var(--score-color);
    overflow: hidden;
    opacity: 0;
    
    writing-mode: vertical-lr;

    > * {
        grid-area: gauge;
    }
    .name {
        z-index: 3;
        place-self: center end;
        margin-inline-end: 3.75rem;
        font-weight: bold;
        font-size: 3em;
        transform: rotate(0.5turn);
    }

    .points {
        place-self: center end;
        margin-inline-end: 0.5rem;
        font-size: 2rem;
        font-weight: bold;
        z-index: 6;
        transform: rotate(-0.25turn);
        background: rgba(255, 255, 255, 0.75);
        border-radius: 20rem;
        padding: 4px;
        border: 2px groove var(--score-color);
    }

    .bar {
        z-index: 2;
        place-self: stretch end;
        height: calc(var(--fill-ratio) * 100%);
        background: var(--score-color);
    }
    .effect {
        z-index: 2;
        width: calc(var(--gauge-width) - 2 * var(--border-width)); // For some reason 
        background: transparent;
        place-self: stretch;
    }

    position: relative;
    &::after {
        content: ''; display: block;
        position: absolute;
        inset: 0;
        
        background: var(--score-color);
        opacity: 0.1;
        z-index: -1;
    }
}
</style>