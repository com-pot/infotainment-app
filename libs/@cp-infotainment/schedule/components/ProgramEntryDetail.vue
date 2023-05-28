<script lang="ts" setup>
import { computed, PropType } from 'vue';
import { useRender } from '@typeful/data/rendering';
import { ProgramItemOccurence } from '@com-pot/schedule/model/ProgramItemOccurrence';

const render = useRender()

const props = defineProps({
    entry: {type: Object as PropType<ProgramItemOccurence['app']>, required: true},

    showDescription: {type: Boolean},
})

const descriptionComponent = computed(() => {
    const desc = props.showDescription && props.entry.description || props.entry.item.description
    return desc && render.localizedComponent('p', {class: 'description'}, desc)
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
        <component :is="descriptionComponent"/>
    </div>
</template>
