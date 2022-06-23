<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import ItPanel from '../it-panels/ItPanel.vue'
import type { PanelSpecification } from "../panels"

type GridLayoutPanelConfig = {
    panels: PanelSpecification[],
}

export default defineComponent({
    components: {
        ItPanel,
    },
    props: {
        config: {type: Object as PropType<GridLayoutPanelConfig>, required: true}
    },
    setup(props) {
        const panels = computed(() => props.config?.panels)
        
        return {
            panels,
        }
    },
})
</script>


<template>
    <div class="panel panel-layout grid-layout-panel">
        <template v-for="(childPanel, i) in panels" :key="i">
            <ItPanel v-bind="childPanel" />
        </template>
    </div>
</template>

<style lang="scss">
.grid-layout-panel {
    display: grid;
    gap: var(--spacing);
}
</style>
