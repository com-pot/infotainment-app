<script lang="ts" setup>
import { computed, PropType } from 'vue';
import { useRender } from '@typeful/data/rendering';
import { ActivityOccurrence } from '@com-pot/schedule/model/ActivityOccurrence';

const render = useRender()

const props = defineProps({
    entry: {type: Object as PropType<ActivityOccurrence['app']>, required: true},

    showDescription: {type: Boolean},
})

const descriptionComponent = computed(() => {
    if (!props.showDescription) return null
    const desc = props.entry.description || props.entry.activity.description
    return desc && render.localizedComponent('p', {class: 'description'}, desc)
})
</script>

<template>
    <div class="program-entry">
        <div class="title">{{ render.insertParams(render.localized(entry.activity.title), entry.params) }}</div>
        <div class="time">
            <span class="start">{{ render.time(entry.start) }}</span>
            <template v-if="entry.end">
                - <span class="end">{{ render.time(entry.end) }}</span>
            </template>

        </div>
        <div class="location">{{ entry.location && render.localized(entry.location.title) || '' }}</div>
        <component :is="descriptionComponent"/>
    </div>
</template>
