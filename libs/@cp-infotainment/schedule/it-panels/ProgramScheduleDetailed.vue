<script lang="ts" setup>
import { PropType, ref } from "vue";
import { AsyncRef } from "@typeful/vue-utils/reactivity";
import AsyncContent from "@typeful/vue-utils/components/AsyncContent.vue";

import { ActivityOccurrence } from "@com-pot/schedule/model/ActivityOccurrence";
import ProgramEntryDetail from "../components/ProgramEntryDetail.vue"
import { useRender } from "@typeful/data/rendering";
import { bindScroll } from "@com-pot/infotainment-app/components/snapScroll.vue";

const props = defineProps({
    panelData: {type: Object as PropType<AsyncRef<ActivityOccurrence['app'][]>>, required: true},
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

</script>

<template>
    <div class="panel -stretch-content program-schedule-detailed" :class="iActiveOccurrence !== undefined && '-has-active'"
         ref="panelEl"
    >
        <div class="caption separator -lines">{{ render.localized(headerLocalized) }}</div>
        <AsyncContent :ctrl="panelData" v-if="panelData">
            <template v-if="panelData.status === 'ready'">
            <div class="content custom-scroll">
                <div class="entries auto-flow">
                    <ProgramEntryDetail v-for="(entry, i) in panelData.value" :key="i"
                                        :entry="entry"
                                        :class="i === iActiveOccurrence && 'active'"

                                        show-description
                    />
                </div>
            </div>
            </template>
        </AsyncContent>
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
