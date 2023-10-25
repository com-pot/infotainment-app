<script lang="ts" setup>
import { PropType, ref } from "vue";
import { AsyncRef } from "@typeful/vue-utils/reactivity";
import AsyncContent from "@typeful/vue-utils/components/AsyncContent.vue";
import { stateHubUi } from "@typeful/vue-utils/reactivity/stateHub";

import { createRotationController, rotationUi } from "@com-pot/infotainment-app/rotation";
import { createLinearRotation } from "@com-pot/infotainment-app/rotation/linearRotationConsumer"
import { ActivityOccurrence } from "@com-pot/schedule/model/ProgramItemOccurrence";
import ProgramEntryDetail from "../components/ProgramEntryDetail.vue"
import { useRender } from "@typeful/data/rendering";

const props = defineProps({
    panelData: {type: Object as PropType<AsyncRef<ActivityOccurrence['app'][]>>, required: true},
    ...rotationUi.props,
})

const emit = defineEmits({
    ...rotationUi.emits,
    ...stateHubUi.emits,
})

const render = useRender()
const headerLocalized = {
    cs: "Denní přehled",
    en: "Daily overview",
}

const panelEl = ref<HTMLElement>()
const rotate = createLinearRotation(props.rotationConfig, () => props.panelData?.ready && props.panelData.value.length)
    .bindScroll(panelEl, { sel: { container: '.content', target: '.active'} })
    .onStep((step) => emit('update:panelState', ['highlightEvent'], step))
const rotateEngine = createRotationController(props.rotationConfig, (e) => rotate.tick(e), emit)
    .bindReady(() => props.panelData, (ready) => ready && rotate.restart?.())
    .bindComponent('ignore')

</script>

<template>
    <div class="panel -stretch-content program-schedule-detailed" :class="rotate.step !== undefined && '-has-active'"
         ref="panelEl"
    >
        <div class="caption separator -lines"
             @click.raw="rotateEngine.tick($event)"
        >{{ render.localized(headerLocalized) }}</div>
        <AsyncContent :ctrl="panelData" v-if="panelData">
            <template v-if="panelData.status === 'ready'">
            <div class="content custom-scroll">
                <div class="entries auto-flow">
                    <ProgramEntryDetail v-for="(entry, i) in panelData.value" :key="i"
                                        :entry="entry"
                                        :class="i === rotate.step && 'active'"

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
