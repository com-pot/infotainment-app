<script lang="ts" setup>
import { PropType } from 'vue';
import { useLocaleController } from '@custom/com-pot/i18n/localeController';
import LocaleSwitcher from '@custom/com-pot/i18n/components/LocaleSwitcher.vue';
import { rotationUi } from '../rotation';
import { createRotationController } from '../rotation/contentRotation';

type BrandPanelConfig = {
    logo?: string,
    title?: string,
}
const props = defineProps({
    config: {type: Object as PropType<BrandPanelConfig>},
    ...rotationUi.props,
})
const emit = defineEmits({
    ...rotationUi.emits,
})

const localeController = useLocaleController()

const rotateEngine = createRotationController(props.rotationConfig, (e) => {
    localeController?.cycleLocale()
    return {status: 'running'}
}, emit)
    .bindComponent('start')

</script>

<template>
    <div class="panel brand-panel">
        <img class="logo" v-if="props.config?.logo"
             :src="props.config.logo"
        />
        <span class="title" v-if="props.config?.title">{{ props.config.title }}</span>

        <LocaleSwitcher v-if="localeController"
                        :available-locales="localeController.opts.availableLocales"
                        v-model:active-locale="localeController.activeLocale"
                        @clickActive="() => localeController!.cycleLocale()"
        ></LocaleSwitcher>
    </div>
</template>
