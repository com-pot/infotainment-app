<script lang="ts">
import { computed, defineComponent, h, PropType, watch } from 'vue'
import { AsyncRef } from "@typeful/vue-utils/reactivity"
import { getMissingParams, watchPolling } from "@typeful/vue-utils/components/declarations"
import BusySpinner from '@typeful/vue-utils/components/BusySpinner.vue'
import { useStateHub } from "@typeful/vue-utils/reactivity/stateHub"

import { prepareProviderConfig, useLoader } from '../panels/panelData'
import { usePanelRegistry } from "../panels/panelRegistry"

export default defineComponent({
    props: {
        name: {type: String},
        type: {type: String, required: true},
        config: {type: Object as PropType<Record<string, any>>},
    },
    setup(props) {
        const panelRegistry = usePanelRegistry()
        const panelEntry = computed(() => panelRegistry[props.type])

        const stateHub = useStateHub()
        const loader = useLoader()

        const panelProps = computed((): [string, any][] => {
            const entry = panelEntry.value
            if (!entry?.component?.props) {
                return []
            }
            return Object.entries(entry.component.props)
        })
        const hydratedPanelParams = computed(() => {
            const providerParams = panelProps.value
                .map(([name]) => [name, props.config?.[name]])

            const paramEntries: [string, AsyncRef|null|any][] = providerParams
                .map(([name, param]) => {
                    const config = param?.eval === 'provider' && prepareProviderConfig(param, stateHub)
                    if (!config) {
                        return [name, param]
                    }

                    return [name, loader.initialize(config)]
                })
            paramEntries.push(['config', props.config])

            return paramEntries
        })
        watchPolling(hydratedPanelParams)


        return () => {
            const entry = panelEntry.value
            if (!entry) {
                return h('div', {
                    class: 'panel error-panel',
                }, [
                    h('p', `No panel of [type="${props.type}"]`)
                ])
            }

            const missingParams = getMissingParams(entry.component, hydratedPanelParams.value)
            if (missingParams?.length) {
                return h('div', {
                    class: 'panel error-panel',
                }, [
                    h('p', `Misconfigured panel, missing props [${missingParams.map((entry) => entry[0]).join(', ')}]`)
                ])
            }

            const unavailableProviders = hydratedPanelParams.value.filter(([name, param]) => {
                if (param && typeof param === "object" && param.status) {
                    return param.status === 'n/a'
                }
            })
            if (unavailableProviders?.length) {
                return h(BusySpinner, {
                    class: 'panel',
                }, ["Providers not available: " + unavailableProviders.join(', ')])
            }

            const applicableProps: Record<string, any> = Object.fromEntries(hydratedPanelParams.value);
            return h(entry.component, applicableProps)
        }
    },
})
</script>
