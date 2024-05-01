<script lang="ts" setup>
import { PropType, ref, watch } from "vue";
import { stateHubUi } from "@typeful/vue-utils/reactivity/stateHub";

import { createRotationController, rotationUi } from "@com-pot/infotainment-app/rotation";
import { createLinearRotation } from "@com-pot/infotainment-app/rotation/linearRotationConsumer"

import ProgramEntryDetail from "../components/ProgramEntryDetail.vue"
import { useRender } from "@typeful/data/rendering";
import { ProgramEntriesGroup } from "../dataProviders/program-schedule-overview";

const props = defineProps({
    group: {type: Object as PropType<ProgramEntriesGroup>, required: true},
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
const rotate = createLinearRotation(props.rotationConfig, () => props.group.items.length)
    .bindScroll(panelEl, { sel: { container: '.content', target: '.active'} })
    .onStep((step) => emit('update:panelState', ['highlightEvent'], step))
const rotateEngine = createRotationController(props.rotationConfig, (e) => rotate.tick(e), emit)
    .bindComponent('start')

watch(() => props.group, () => {
    rotate.restart?.()
    rotateEngine.start()
})

</script>

<template>
    <div class="panel -stretch-content program-schedule-detailed" :class="rotate.step !== undefined && '-has-active'"
         ref="panelEl"
    >
        <div class="caption separator -lines"
             @click.raw="rotateEngine.tick($event)"
        >{{ render.localized(headerLocalized) }}</div>
        
        <div class="content custom-scroll">
            <div class="entries auto-flow">
                <ProgramEntryDetail v-for="(entry, i) in group.items" :key="i"
                                    :entry="entry"
                                    :class="i === rotate.step && 'active'"

                                    show-description
                />
            </div>
        </div>
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
