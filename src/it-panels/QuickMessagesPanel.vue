<script lang="ts" setup>
import { computed, ref, PropType } from 'vue';
import { useRender } from '@typeful/data/rendering';
import AsyncContent from "@typeful/vue-utils/components/AsyncContent.vue";
import { stateHubUi } from "@typeful/vue-utils/reactivity/stateHub"

import { QuickMessage } from '../dataProviders/quickMessages';
import { createRotationController, rotationUi } from '../rotation';

import { createLinearRotation } from '../rotation/linearRotationConsumer';
import { AsyncRef } from '@typeful/vue-utils/reactivity';
import { isValid } from '@typeful/model/types/time';
import useTime from '../components/useTime';
import { bindScroll } from '../components/snapScroll.vue';
import { consumers } from 'stream';


const props = defineProps({
    ...rotationUi.props,
    messages: {type: Object as PropType<AsyncRef<QuickMessage[]>>, required: true},
})
const emit = defineEmits({
    ...rotationUi.emits,
    ...stateHubUi.emits,
})

const render = useRender()
const time = useTime()

const visibleMessages = computed(() => {
    if (!props.messages.ready) return []
    return props.messages.value
        .filter((message) => isValid(time.date, message.valid))
        .map((message) => ({
            message,
            components: {
                content: render.localizedComponent('p', {class: 'content'}, message.content),
                author: message.author && render.localizedComponent('span', {class: 'author'}, message.author),
            },
        }))
})

const panelEl = ref<HTMLElement>()
const rotate = createLinearRotation(props.rotationConfig, () => visibleMessages.value.length)
    .onStep((step) => emit('update:panelState', ['highlightEvent'], step))

bindScroll(panelEl, () => rotate.step, { sel: { target: '.active'}, offset: 0 })

const rotateEngine = createRotationController(props.rotationConfig, (e) => rotate.tick(e), emit)
    .bindReady(() => props.messages, (ready) => ready && rotate.restart?.())
    .bindComponent('ignore')

</script>

<template>
    <div class="panel messages custom-scroll" ref="panelEl">
        <AsyncContent :ctrl="messages">
        <template v-if="messages.ready">
            <template v-for="(message, i) of visibleMessages" :key="message.id">
                <div class="message" :class="i === rotate.step && 'active'">
                    <component :is="message.components.content"/>
                    <component :is="message.components.author"/>
                </div>
            </template>
        </template>
        </AsyncContent>
    </div>
</template>

<style lang="scss">
.messages.panel {
    .author {
        &::before {
            content: '- ';
        }
    }
}
</style>
