<script lang="ts" setup>
import { PropType } from 'vue';
import { useLocaleController } from '@cp-infotainment/i18n/localeController';
import LocaleSwitcher from '@cp-infotainment/i18n/components/LocaleSwitcher.vue';
import { rotationUi } from '../rotation';
import { createRotationController } from '../rotation/contentRotation';

type BrandPanelConfig = {
    logo?: string | {raw: string},
    logo2?: string | {raw: string},
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
        <div class="logo" v-if="props.config?.logo && typeof props.config.logo === 'object'"
             v-html="props.config.logo.raw"/>
        <img class="logo" v-else-if="typeof props.config?.logo === 'string'"
             :src="props.config.logo"
        />
        <div class="logo -second" v-if="props.config?.logo2 && typeof props.config.logo2 === 'object'"
             v-html="props.config.logo2.raw"/>
        <img class="logo -second" v-else-if="typeof props.config?.logo2 === 'string'"
             :src="props.config.logo2"
        />
        <div class="logo -title" v-else-if="props.config?.title">
            <span class="title" >{{ props.config.title }}</span>
        </div>

        <LocaleSwitcher v-if="localeController"
                        :available-locales="localeController.opts.availableLocales"
                        v-model:active-locale="localeController.activeLocale"
                        @clickActive="() => localeController!.cycleLocale()"
        ></LocaleSwitcher>
    </div>
</template>
