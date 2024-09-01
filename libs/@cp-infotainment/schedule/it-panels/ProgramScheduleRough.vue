<script lang="ts" setup>
import { PropType, ref, computed } from "vue";
import AsyncContent from "@typeful/vue-utils/components/AsyncContent.vue";
import { useRender } from "@typeful/data/rendering";
import { AsyncRef } from "@typeful/vue-utils/reactivity";
import { stateHubUi } from "@typeful/vue-utils/reactivity/stateHub";

import { createLinearRotation } from "@com-pot/infotainment-app/rotation/linearRotationConsumer";
import { ProgramEntriesGroup } from "../dataProviders/program-schedule-overview";
import ProgramEntryDetail from "../components/ProgramEntryDetail.vue"
import { createRotationController, rotationUi } from "@com-pot/infotainment-app/rotation";
import { bindScroll } from "@com-pot/infotainment-app/components/snapScroll.vue";

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

type PanelEntry = {
    group: ProgramEntriesGroup,
    iGroup: number,
    occurrence: ProgramEntriesGroup["items"][0],
    iInGroup: number,
}
const panelItems = computed(() => {
    if (!props.panelData.ready) return []

    const entries: PanelEntry[] = []
    props.panelData.value.forEach((group, iGroup) => {
        group.items.forEach((occurrence, iInGroup) => {
            entries.push({
                group,
                iGroup,
                occurrence,
                iInGroup,
            })
        })
    })

    return entries
})
const activePanelItem = computed(() => panelItems.value?.[rotate.step || -1])

const panelEl = ref<HTMLElement>()

function emitPanelState(step: number) {
    const entries = panelItems.value
        const entry = entries[step!]
        if (!entry) {
            console.warn("No group for step", {entries, step});
        }
        const {group, iGroup, iInGroup} = entry || {}

        emit('update:panelState', ['currentDay'], group?.date)
        emit('update:panelState', ['groups'], props.panelData.ready && props.panelData.value || [])
        emit('update:panelState', ['iCurrentGroup'], iGroup)
        emit('update:panelState', ['iActiveOccurrence'], iInGroup)
}

const rotate = createLinearRotation(props.rotationConfig, () => panelItems.value.length)
    .onStep((step) => emitPanelState(step!))
bindScroll(panelEl, () => rotate.step, { sel: { container: '.content', target: '.active'} })

const rotateEngine = createRotationController(props.rotationConfig, (e) => rotate.tick(e), emit)
    .bindReady(() => props.panelData, () => emitPanelState(0))
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
                        <div class="group auto-flow" :class="i === activePanelItem?.iGroup && 'active'">
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
        column-gap: 0.5rem;

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
