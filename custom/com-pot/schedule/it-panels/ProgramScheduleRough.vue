<script lang="ts" setup>
import { useLoader, providerConfigProp } from "@com-pot/infotainment-app/panels/panelData";
import AsyncContent from "@com-pot/infotainment-app/components/AsyncContent.vue";

const props = defineProps({
    providerConfig: providerConfigProp,
})

const loader = useLoader()
const panelData = loader.watch<{title: string, location: string}[]>(() => props.providerConfig)
</script>

<template>
    <div class="panel -stretch-content program-schedule-rough">
        <div class="caption">Program schedule rough</div>

        <AsyncContent :ctrl="panelData">
            <template v-if="panelData.status === 'ready'">
                <div class="body auto-flow">
                    <div class="program-entry" v-for="(entry, i) in panelData.value" :key="i">
                        <div class="title">{{ entry.title }}</div>
                        <div class="location">{{ entry.location }}</div>
                    </div>
                </div>
            </template>
        </AsyncContent>
    </div>
</template>

<style lang="scss">
.program-schedule-rough {
    .program-entry {
        display: flex;
        justify-content: space-between;
        gap: var(--spacing);

        .title {
            font-size: 1.6rem;
            font-weight: bold;
        }
    }
}
</style>