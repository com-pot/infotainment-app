<script lang="ts" setup>
import { PropType } from "vue";
import { AsyncRef } from "@typeful/vue-utils/reactivity";
import BusySpinner from "./BusySpinner.vue";

const props = defineProps({
    ctrl: {type: Object as PropType<AsyncRef<any>>},
    state: { type: String as PropType<'ready' | 'pending'> },
})

</script>

<template>
    <template v-if="(ctrl && !ctrl.ready) || state === 'pending'">
        <slot name="busy" v-if="!ctrl || ctrl.status === 'busy'">
            <BusySpinner/>
        </slot>
    </template>
    <slot v-else-if="ctrl?.ready || state === 'ready'" name="default" :data="ctrl?.value"></slot>
</template>
