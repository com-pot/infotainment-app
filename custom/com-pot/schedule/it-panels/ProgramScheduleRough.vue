<script lang="ts" setup>
import { computed, ref } from "@vue/runtime-core";
import { useLoader, providerConfigProp } from "@com-pot/infotainment-app/panels/panelData";
import AsyncContent from "@com-pot/infotainment-app/components/AsyncContent.vue";
import { ProgramEntriesGroup } from "../dataProviders/program-schedule-overview";
import { useRender } from "@typeful/data/rendering";

import { createLinearRotation } from "@com-pot/infotainment-app/rotation/linearRotationConsumer";
import ProgramEntryDetail from "../components/ProgramEntryDetail.vue"
import { createRotationController, rotationUi } from "@com-pot/infotainment-app/rotation";
import { isUpdateEvent } from "@com-pot/infotainment-app/rotation/engines/follow";

const props = defineProps({
    providerConfig: providerConfigProp,
    rotationConfig: rotationUi.prop,
})
const emit = defineEmits({
    ...rotationUi.emits,
})

const render = useRender()
const loader = useLoader()
const panelData = loader.watch<ProgramEntriesGroup[]>(() => props.providerConfig)

const totalSteps = computed(() => panelData.ready ? panelData.value.length : -1)
const panelEl = ref<HTMLElement>()
const rotate = createLinearRotation(props.rotationConfig, totalSteps)
    .bindScroll(panelEl)
const rotateEngine = createRotationController(props.rotationConfig, (e) => {
    if (isUpdateEvent(e)) {
        if (e.detail.rotationState.status === 'running') {
            console.log('rough tick, running', e);
            return {status: 'running'}
        }
    }
    
    return rotate.tick(e)
}, emit)
    .bindComponent('start')

</script>

<template>
    <div class="panel -stretch-content program-schedule-rough" ref="panelEl">
        <div class="caption separator -lines">Program schedule rough</div>

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

        &:not(.active) {
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
    }
}
</style>