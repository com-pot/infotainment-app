<script lang="ts" setup>
import { useRender } from '@typeful/data/rendering';
import { computed, PropType } from '@vue/runtime-core';
import { ProgramItemOccurence } from '@com-pot/schedule/model/ProgramItemOccurrence';

const render = useRender()

const props = defineProps({
    entry: {type: Object as PropType<ProgramItemOccurence['app']>, required: true},

    showDescription: {type: Boolean},
})

const description = computed(() => {
    const desc = props.showDescription && (props.entry.description || props.entry.item.description)
    return desc && render.localized(desc)
})

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
        <template v-if="description">
            <p class="description" v-if="typeof description === 'string'">{{ render.insertParams((description)) }}</p>
            <p class="description" v-else v-html="render.insertParams((description.html))"></p>
        </template>
    </div>
</template>
