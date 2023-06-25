<script lang="ts" setup>
import { computed, ref, PropType } from 'vue';
import { useRender } from '@typeful/data/rendering';
import AsyncContent from "@typeful/vue-utils/components/AsyncContent.vue";
import { stateHubUi } from "@typeful/vue-utils/reactivity/stateHub"

import { QuickMessage } from '../dataProviders/quickMessages';
import { createRotationController, rotationUi } from '../rotation';

import { createLinearRotation } from '../rotation/linearRotationConsumer';
import { AsyncRef } from '@typeful/vue-utils/reactivity';


const props = defineProps({
    ...rotationUi.props,
    messages: {type: Object as PropType<AsyncRef<QuickMessage[]>>, required: true},
})
const emit = defineEmits({
    ...rotationUi.emits,
    ...stateHubUi.emits,
})

const render = useRender()

const messagesComponents = computed(() => !props.messages.ready ? [] : props.messages.value.map((message) => ({
    content: render.localizedComponent('p', {class: 'content'}, message.content),
    author: message.author && render.localizedComponent('span', {class: 'author'}, message.author),
})))

const panelEl = ref<HTMLElement>()
const rotate = createLinearRotation(props.rotationConfig, () => props.messages.ready && props.messages.value.length)
    .bindScroll(panelEl, {
        sel: { target: '.active'},
        offset: 0,
    })
    .onStep((step) => emit('update:panelState', ['highlightEvent'], step))
const rotateEngine = createRotationController(props.rotationConfig, (e) => rotate.tick(e), emit)
    .bindReady(() => props.messages, (ready) => ready && rotate.restart?.())
    .bindComponent('ignore')

</script>

<template>
    <div class="panel messages custom-scroll" ref="panelEl">
        <AsyncContent :ctrl="messages">
        <template v-if="messages.ready">
            <template v-for="(message, i) of messages.value" :key="message.id">
                <div class="message" :class="i === rotate.step && 'active'">
                    <component :is="messagesComponents[i].content"/>
                    <component :is="messagesComponents[i].author"/>
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
