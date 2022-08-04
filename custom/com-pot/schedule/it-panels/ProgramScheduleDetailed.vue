<script lang="ts" setup>
import { computed, ref } from "@vue/runtime-core";
import { providerConfigProp, useLoader } from "@com-pot/infotainment-app/panels/panelData"
import AsyncContent from "@com-pot/infotainment-app/components/AsyncContent.vue";
import { createRotationController, rotationUi } from "@com-pot/infotainment-app/rotation";
import { ProgramEntry } from "../dataProviders/program-schedule";
import { createLinearRotation } from "@com-pot/infotainment-app/rotation/linearRotationConsumer"
import ProgramEntryDetail from "../components/ProgramEntryDetail.vue"


const props = defineProps({
    providerConfig: providerConfigProp,
    rotationConfig: rotationUi.prop,
})

const emit = defineEmits({
    ...rotationUi.emits,
})

const loader = useLoader()
const panelData = loader.watch<ProgramEntry['app'][]>(() => props.providerConfig)

const totalSteps = computed(() => panelData.ready ? panelData.value.length : -1)
const panelEl = ref<HTMLElement>()
const rotate = createLinearRotation(props.rotationConfig, totalSteps)
    .bindScroll(panelEl)
const rotateEngine = createRotationController(props.rotationConfig, (e) => rotate.tick(e), emit)
    .bindReady(panelData)
    .bindComponent('ignore')


</script>

<template>
    <div class="panel -stretch-content program-schedule-detailed" :class="rotate.step !== undefined && '-has-active'"
         ref="panelEl"
    >
        <div class="caption separator -lines">Program entry detail</div>
        <AsyncContent :ctrl="panelData">
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