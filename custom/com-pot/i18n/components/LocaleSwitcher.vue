<script lang="ts" setup>
import { Icon } from '@iconify/vue';

import { computed, PropType } from "@vue/runtime-core";
import {getFlagEmoji} from "../flags"
import { LocaleObject } from '../i18n.plugin';

const props = defineProps({
    availableLocales: {type: Array as PropType<LocaleObject[]>, required: true},
    activeLocale: {type: String},
    appearance: {type: String, default: 'round'},
})
const emit = defineEmits({
    'clickActive': () => true,
    'update:activeLocale': (locale: string) => true,
})
const iActive = computed(() => props.availableLocales.findIndex((locale) => locale.value === props.activeLocale))
function setLocale(locale: LocaleObject, i: number) {
    if (i === iActive.value) {
        emit('clickActive')
    } else {
        emit('update:activeLocale', locale.value)
    }
}

</script>

<template>
    <div class="locale-switcher" :class="['-' + appearance]" :style="`--locales-count: ${availableLocales.length}; --i-active: ${iActive}`">
        <template v-for="(locale, i) in availableLocales" :key="locale">
            <div class="locale" :class="locale.value === activeLocale && 'active'" :style="`--i-locale: ${i};`"
                 :data-locale="locale"
                 @click="setLocale(locale, i)"
            >
                <!-- <span class="flag">{{ getFlagEmoji(locale) }}</span> -->
                <Icon :icon="locale.icon" class="flag"/>
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
        --flip-duration: 0.5s;
        --flag-size: 2rem;

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
                width: var(--flag-size);
                height: var(--flag-size);
                transform: rotate(calc(-1 * var(--i-rotate))) scale(var(--scale, 1));
                transition: all var(--flip-duration) cubic-bezier(0.19, 1, 0.22, 1);
                
                filter: contrast(var(--flag-contrast, 100%)) #{'saturate(var(--flag-saturate, 100%))'} drop-shadow(2px 2px 2px dimgray);
            }

            &.active {
                --scale: 1.5;
                z-index: 2;
            }
            &:not(.active) {
                z-index: 1;
                --flag-contrast: 40%;
                --flag-saturate: 50%;
            }
        }
    }
}
</style>