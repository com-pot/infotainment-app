<script lang="ts" setup>
import { useRender } from '@typeful/data/rendering';
import { computed, PropType } from '@vue/runtime-core';
import { ProgramItemOccurence } from '@com-pot/schedule/model/ProgramItemOccurrence';

const render = useRender()

const props = defineProps({
    entry: {type: Object as PropType<ProgramItemOccurence['app']>, required: true},

    showDescription: {type: Boolean},
})

const description = computed(() => props.showDescription && (props.entry.description || props.entry.item.description))

</script>
<template>
    <div class="program-entry">
        <div class="title">{{ render.insertParams(render.localized(entry.item.title), entry.params) }}</div>
        <div class="time">
            <span class="start">{{ render.time(entry.time.start) }}</span>
            <template v-if="entry.time.end">
                - <span class="end">{{ render.time(entry.time.end) }}</span>
            </template>
            
        </div>
        <div class="location">{{ entry.location && render.localized(entry.location.title) || '' }}</div>
        <p class="description" v-if="description">{{ render.insertParams(render.localized(description)) }}</p>
    </div>
</template>