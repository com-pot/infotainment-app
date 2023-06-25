<script lang="ts" setup>
import { PropType } from "vue";
import { AsyncRef } from "@typeful/vue-utils/reactivity";
import BusySpinner from "./BusySpinner.vue";

const props = defineProps({
    ctrl: {type: Object as PropType<AsyncRef<any>>, required: true},
})

</script>

<template>
    <template v-if="!ctrl.ready">
        <slot name="busy" v-if="ctrl.status === 'busy'">
            <BusySpinner/>
        </slot>
    </template>
    <slot v-else name="default" :data="ctrl.value"></slot>
</template>
