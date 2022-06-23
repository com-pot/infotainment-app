<script lang="ts" setup>
import { defineProps } from 'vue';
const props = defineProps({
    order: {type: Number, default: 6},
})

</script>

<template>
    <div class="busy-spinner" :style="`--order: ${order};`">
        <div class="frame">
            <div class="peg" v-for="n in order" :key="n"
                 :style="`--n: ${n}`"
            ></div>
        </div>
        <p class="caption" v-if="$slots.default"><slot></slot></p>
    </div>
</template>

<style lang="scss">
.busy-spinner {
    --size: 1em;
    --duration: 2s;
    --1nth: calc(1 / var(--order));

    display: flex;
    align-items: center;
    justify-content: center;

    .frame {
        width: calc(2 * var(--size));
        height: calc(2 * var(--size));

        display: grid;
        grid-template-areas: 'center';
        place-items: center;

        animation: calc(var(--duration) * 1.5) infinite reverse spinnerSpin linear;

        .peg {
            grid-area: center;

            display: inline-block;
            width: calc(0.25 * var(--size));
            height: var(--size);

            background: var(--primary);
            border-radius: var(--size);

            transform-origin: 50% 100%;
            transform: translate(0, -50%) rotate(calc(var(--n) / var(--order) * 1turn));
        }

        & + .caption {
            margin-inline-start: var(--size);
        }
    }

    .peg {
        animation: bounceHeight var(--duration) infinite;
        animation-delay: calc(var(--n) * var(--1nth) * var(--1nth) * var(--duration));
    }
}

@keyframes spinnerSpin {
    0% {
        transform: rotate(0);
    }
    100% {
        transform: rotate(1turn);
    }
}

@keyframes bounceHeight {
    0%, 100% {
        height: var(--size);
    }
    15%, 75% {
        height: calc(0.4 * var(--size));
    }
    66% {
        height: calc(1.1 * var(--size));
    }
}
</style>