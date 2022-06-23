<script lang="ts" setup>
import { providerConfigProp, useLoader } from "@com-pot/infotainment-app/panels/panelData"
import AsyncContent from "@com-pot/infotainment-app/components/AsyncContent.vue";

const props = defineProps({
    providerConfig: providerConfigProp,
})

const loader = useLoader()
const panelData = loader.watch<{title: string, location: string, description: string}[]>(() => props.providerConfig)
</script>

<template>
    <div class="panel -stretch-content program-entry-detail">
        <div class="caption">Program entry detail</div>
        <AsyncContent :ctrl="panelData">
            <template v-if="panelData.status === 'ready'">
            <div class="body auto-flow">
                <div class="program-entry" v-for="(entry, i) in panelData.value" :key="i">
                    <span class="title">{{ entry.title }}</span>
                    <p>{{ entry.description }}</p>
                </div>
            </div>
            </template>
        </AsyncContent>
    </div>
</template>

<style lang="scss">
.program-entry-detail {
    .program-entry {
        .title {
            font-size: 1.6rem;
            font-weight: bold;
        }
        .title + p {
            margin-block-start: unset;
        }
    }
}
</style>