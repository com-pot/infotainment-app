<script lang="ts" setup>
import { PropType, ref } from "vue";
import { AsyncRef } from "@typeful/vue-utils/reactivity";
import AsyncContent from "@typeful/vue-utils/components/AsyncContent.vue";

import ProgramEntryDetail from "../components/ProgramEntryDetail.vue"
import { useRender } from "@typeful/data/rendering";
import { bindScroll } from "@com-pot/infotainment-app/components/snapScroll.vue";
import { ProgramEntriesGroup } from "../dataProviders/program-schedule-overview";

const props = defineProps({
    groups: {type: Object as PropType<AsyncRef<ProgramEntriesGroup[]>>, required: true},
    iGroup: { type: Number, required: true },
    iActiveOccurrence: {type: Number},
})

const emit = defineEmits({})

const render = useRender()
const headerLocalized = {
    cs: "Denní přehled",
    en: "Daily overview",
}

const panelEl = ref<HTMLElement>()
bindScroll(panelEl, () => props.iActiveOccurrence, { sel: { container: '.content', target: '.active'} })

console.log('detailed', props.groups, props.iGroup, props.iActiveOccurrence)

</script>

<template>
    <div class="panel -stretch-content program-schedule-detailed" :class="iActiveOccurrence !== undefined && '-has-active'"
         ref="panelEl"
    >
        <div class="caption separator -lines">{{ render.localized(headerLocalized) }}</div>
        <!-- <AsyncContent :state="group ? 'ready' : 'pending'">
            <template v-if="group">
            <div class="content custom-scroll">
                <div class="entries auto-flow">
                    <ProgramEntryDetail v-for="(entry, i) in group.items" :key="i"
                                        :entry="entry"
                                        :class="i === iActiveOccurrence && 'active'"

                                        show-description
                    />
                </div>
            </div>
            </template>
        </AsyncContent> -->
    </div>
</template>

<style lang="scss">
.program-schedule-detailed {
    .program-entry {
        transition: var(--entry-transition);

        .title {
            font-size: 1.6rem;
            font-weight: bold;
        }
        .title + p {
            margin-block-start: unset;
        }
    }

    &.-has-active {
        .program-entry:not(.active) {
            filter: #{'opacity(var(--inactive-opacity))'};
        }
    }
}
</style>
