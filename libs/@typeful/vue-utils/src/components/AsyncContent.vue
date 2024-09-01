<script lang="ts" setup>
import { PropType, computed } from "vue";
import { AsyncRef } from "@typeful/vue-utils/reactivity";
import BusySpinner from "./BusySpinner.vue";

const props = defineProps({
    ctrl: {type: Object as PropType<AsyncRef<any>>},
    state: { type: String as PropType<'ready' | 'pending'> },
})

const actualState = computed(() => {
    if (props.state) return props.state
    if (!props.ctrl) return "n/a"
    return props.ctrl.ready ? "ready" : "pending"
})

</script>

<template>
    <slot v-if="actualState === 'ready'" name="default" :data="ctrl?.ready && ctrl?.value"></slot>
    <template v-else>
        <slot name="busy" v-if="!ctrl || ctrl.status === 'busy'">
            <BusySpinner/>
        </slot>
    </template>
    
</template>
