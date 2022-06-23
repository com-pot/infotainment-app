<script lang="ts">
import { computed, defineComponent, h } from 'vue'
import { usePanelRegistry } from "../panels/panelRegistry"

export default defineComponent({
    props: {
        type: {type: String, required: true},
        config: {type: Object},
    },
    setup(props, {attrs}) {
        const panelRegistry = usePanelRegistry()

        const panelEntry = computed(() => panelRegistry[props.type])

        return () => {
            if (!panelEntry.value) {
                return h('div', {
                    class: 'panel error-panel',
                }, [
                    h('p', `No panel of [type="${props.type}"]`)
                ])
            }
            
            return h(panelEntry.value.component, {
                config: props.config,
            })
        }
    },
})
</script>
