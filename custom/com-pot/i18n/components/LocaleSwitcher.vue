<script lang="ts" setup>
import { computed, PropType } from "@vue/runtime-core";
import {getFlagEmoji} from "../flags"

const props = defineProps({
    availableLocales: {type: Array as PropType<string[]>, required: true},
    activeLocale: {type: String},
    appearance: {type: String, default: 'round'},
})
const emit = defineEmits({
    'update:activeLocale': (locale: string) => true,
})
const iActive = computed(() => props.availableLocales.indexOf(props.activeLocale!))


</script>

<template>
    <div class="locale-switcher" :class="['-' + appearance]" :style="`--locales-count: ${availableLocales.length}; --i-active: ${iActive}`">
        <template v-for="(locale, i) in availableLocales" :key="locale">
            <div class="locale" :class="i === iActive && 'active'" :style="`--i-locale: ${i};`"
                 :data-locale="locale"
                 @click="emit('update:activeLocale', locale)"
            >
                <span class="flag">{{ getFlagEmoji(locale) }}</span>
            </div>
        </template>
        
    </div>
</template>

<style lang="scss">
.locale-switcher {

    &.-round {
        display: grid;
        --c-offset: calc(1turn / var(--locales-count));
        --static-offset: 0.37turn;
        --flip-duration: 1s;

        > * {
            grid-row: 1; grid-column: 1;
        }

        .locale {
            --i-rotate: calc((var(--i-locale) - var(--i-active, 0)) * var(--c-offset) + var(--static-offset));
            width: 2ch;
            display: flex;
            flex-direction: row-reverse;

            transform-origin: 0% 50%;
            transform: rotate(var(--i-rotate));
            transition: all var(--flip-duration) cubic-bezier(0.075, 0.82, 0.165, 1);

            .flag {
                transform: rotate(calc(-1 * var(--i-rotate))) scale(var(--scale, 1));
                transition: all var(--flip-duration) cubic-bezier(0.19, 1, 0.22, 1);
            }

            &.active {
                --scale: 1.2;
            }
            &:not(.active) {
                --scale: 0.8;
            }
        }
    }
}
</style>