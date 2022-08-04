<script lang="ts" setup>
import { useRender } from '@typeful/data/rendering';
import { PropType } from '@vue/runtime-core';
import { ProgramEntry } from '../dataProviders/program-schedule';

const render = useRender()

const props = defineProps({
    entry: {type: Object as PropType<ProgramEntry['app']>, required: true},

    showDescription: {type: Boolean},
})

</script>
<template>
    <div class="program-entry">
        <div class="title">{{ entry.title }}</div>
        <div class="time">
            <span class="start">{{ render.time(entry.time.start) }}</span>
            <template v-if="entry.time.end">
                - <span class="end">{{ render.time(entry.time.end) }}</span>
            </template>
            
        </div>
        <div class="location">{{ entry.location }}</div>
        <p v-if="showDescription">{{ entry.description }}</p>
    </div>
</template>