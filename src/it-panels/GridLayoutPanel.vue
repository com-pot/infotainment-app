<script lang="ts" setup>
import { computed, defineComponent, onBeforeUnmount, PropType, ref } from 'vue'
import ItPanel from '../it-panels/ItPanel.vue'
import type { PanelSpecification } from "../panels"
import { RotationStatus } from '../rotation/rotationConsumer'
import { createRotationFollowController } from '../rotation/engines/follow'

type GridLayoutPanelConfig = {
    panels: PanelSpecification[],
}

const props = defineProps({
    config: {type: Object as PropType<GridLayoutPanelConfig>, required: true}
})

const followController = createRotationFollowController()
onBeforeUnmount(() => followController.destroy())
</script>


<template>
    <div class="panel panel-layout grid-layout-panel">
        <template v-for="(childPanel, i) in props.config?.panels" :key="i">
            <ItPanel v-bind="childPanel"
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
