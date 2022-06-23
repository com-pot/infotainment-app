<script lang="ts" setup>
import { PropType } from 'vue';

type BrandPanelConfig = {
    logo?: string,
    title?: string,
}
const props = defineProps({
    config: {type: Object as PropType<BrandPanelConfig>},
})

</script>

<template>
    <div class="panel brand-panel">
        <img class="logo" v-if="props.config?.logo"
             :src="props.config.logo"
        />
        <span class="title" v-if="props.config?.title">{{ props.config.title }}</span>
    </div>
</template>