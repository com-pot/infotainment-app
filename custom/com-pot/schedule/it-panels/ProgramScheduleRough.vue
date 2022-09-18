<script lang="ts" setup>
import { PropType, ref } from "vue";
import AsyncContent from "@com-pot/infotainment-app/components/AsyncContent.vue";
import { useRender } from "@typeful/data/rendering";
import { AsyncRef } from "@typeful/vue-utils/reactivity";

import { createLinearRotation } from "@com-pot/infotainment-app/rotation/linearRotationConsumer";
import { ProgramEntriesGroup } from "../dataProviders/program-schedule-overview";
import ProgramEntryDetail from "../components/ProgramEntryDetail.vue"
import { createRotationController, rotationUi } from "@com-pot/infotainment-app/rotation";
import { stateHubUi } from "@com-pot/infotainment-app/components/stateHub";

const props = defineProps({
    panelData: {type: Object as PropType<AsyncRef<ProgramEntriesGroup[]>>, required: true},
    ...rotationUi.props,
})
const emit = defineEmits({
    ...rotationUi.emits,
    ...stateHubUi.emits,
})

const render = useRender()

const headerLocalized = ref({
    cs: "Nadcházející program",
    en: "Upcoming program",
})

const panelEl = ref<HTMLElement>()
const rotate = createLinearRotation(props.rotationConfig, () => props.panelData.ready && props.panelData.value.length)
    .bindScroll(panelEl, { sel: { container: '.content', target: '.active'} })
    .onStep((step) => {
        const groups = props.panelData.ready && props.panelData.value || []
        const group = groups[step!]
        if (!group) {
            console.warn("No group for step", {groups, step});
        }

        emit('update:panelState', ['currentDay'], group && group.date || undefined)
    })
const rotateEngine = createRotationController(props.rotationConfig, (e) => rotate.tick(e), emit)
    .bindReady(() => props.panelData, () => {
        const date = props.panelData.ready && props.panelData.value[0]?.date || undefined
        emit('update:panelState', ['currentDay'], date)
    })
    .bindComponent('start')

</script>

<template>
    <div class="panel -stretch-content program-schedule-rough" :class="rotate.step !== undefined && '-has-active'"
         ref="panelEl">
        <div class="caption separator -lines"
             @click.raw="rotateEngine.tick($event)"
        >{{ render.localized(headerLocalized) }}</div>

        <AsyncContent :ctrl="panelData">
            <template v-if="panelData.status === 'ready'">
                <div class="content auto-flow custom-scroll">
                    <template v-for="(group, i) in panelData.value" :key="group.date.getTime()">
                        <hr class="separator -dots -spaced" v-if="i"/>
                        <div class="group auto-flow" :class="i === rotate.step && 'active'">
                            <div class="caption ">{{ render.day(group.date) }}  {{ render.date(group.date) }}</div>

                            <ProgramEntryDetail v-for="(entry, i) in group.items" :key="i"
                                          :entry="entry"
                            />
                        </div>
                    </template>
                </div>
            </template>
        </AsyncContent>
    </div>
</template>

<style lang="scss">
.program-schedule-rough {
    .group {
        .caption {
            margin-block-end: 1rem;

            text-transform: capitalize;
            font-size: 2rem;
            font-weight: 900;
        }
    }

    &.-has-active {
        .group:not(.active) {
            filter: #{'opacity(var(--inactive-opacity))'};
        }
    }

    .program-entry {
        display: grid;
        grid-template-areas:
         'title title'
         'time location';
        transition: var(--entry-transition);

        .title {
            grid-area: title;
            font-size: 1.6rem;
            font-weight: bold;
        }
        .location {
            grid-area: location;
            place-self: start end;
        }
        .time {
            grid-area: time;
        }
        .description {
            grid-column: span 2;
        }
    }
}
</style>
