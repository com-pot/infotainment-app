<script lang="ts" setup>
import { onBeforeUnmount, PropType, watch } from 'vue'
import ItPanel from '../it-panels/ItPanel.vue'
import type { PanelSpecification } from "../panels"
import { createHub } from "../components/stateHub"
import { createRotationFollowController } from '../rotation/engines/follow'

type GridLayoutPanelConfig = {
    panels: PanelSpecification[],
}

const props = defineProps({
    config: {type: Object as PropType<GridLayoutPanelConfig>, required: true}
})

const stateHub = createHub()

const followController = createRotationFollowController()
onBeforeUnmount(() => followController.destroy())

</script>

<template>
    <div class="panel panel-layout grid-layout-panel">
        <template v-for="(childPanel, i) in props.config?.panels" :key="i">
            <ItPanel v-bind="childPanel"
                @update:panelState="(path, value) => stateHub.set([childPanel.name || '-', ...path], value)"
                @update:rotationState="followController.dispatch(childPanel, $event)"
            />
        </template>
    </div>
</template>

<style lang="scss">
.grid-layout-panel {
    display: grid;
    gap: var(--spacing);
}
</style>
