<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, PropType, ref } from 'vue'
import useTime from "@com-pot/infotainment-app/components/useTime"
import { useLoader } from '@com-pot/infotainment-app/panels/panelData';
import { QuickMessage } from '@com-pot/infotainment-app/dataProviders/quickMessages';
import { useRender } from '@typeful/data/rendering';
import AsyncContent from '@com-pot/infotainment-app/components/AsyncContent.vue';
import { createLinearRotation } from '@com-pot/infotainment-app/rotation/linearRotationConsumer';
import { createRotationController, rotationUi } from '@com-pot/infotainment-app/rotation';
import { stateHubUi } from '@com-pot/infotainment-app/components/stateHub';

type OverviewTrayConfig = {
    messagePollFrequency: string,
}
const props = defineProps({
    config: {type: Object as PropType<OverviewTrayConfig>},
    ... rotationUi.props,
})
const emit = defineEmits({
    ...rotationUi.emits,
    ...stateHubUi.emits,
})

const loader = useLoader()
const messages = loader.watch<QuickMessage[]>(() => ({
    name: 'common.quickMessages',
    args: {
        now: {$get: 'date:now'},
    },
    poll: props.config?.messagePollFrequency,
}))
const messagesContents = computed(() => messages.ready ? messages.value.map((message) => renderMessageContent(message)) : [])

const time = useTime({
    syncWithSystemTime: true,
})

const render = useRender()
function renderMessageContent(message: QuickMessage) {
    if (message.content.type === 'plain') {
        return message.content.text
    }
    
    let content = render.localized(message.content)
    if (typeof content === 'string') {
        return content
    }

    return content
}

const panelEl = ref<HTMLElement>()
const rotate = createLinearRotation(props.rotationConfig, () => messages.ready ? messages.value.length : 0)
    .bindScroll(panelEl)
    .onStep((step) => emit('update:panelState', ['highlightEvent'], step))
const rotateEngine = createRotationController(props.rotationConfig, (e) => rotate.tick(e), emit)
    .bindReady(messages, (ready) => ready && rotate.restart?.())
    .bindComponent('ignore')

</script>


<template>
    <div class="overview-tray" ref="panelEl">
        <div class="time-box panel">
            <span class="date">{{ time.format({year: 'numeric', month: '2-digit', day: '2-digit'}) }}</span>
            <span class="time">{{ time.format({hour: '2-digit', minute: '2-digit', second: '2-digit'}) }}</span>
        </div>

        <div class="panel messages custom-scroll">
            <AsyncContent :ctrl="messages">
            <template v-if="messages.ready">
                <template v-for="(message, i) of messages.value" :key="message.id">
                    <div class="message" :class="i === rotate.step && 'active'">
                        <p class="content" v-if="typeof messagesContents[i] === 'string'">{{ messagesContents[i] }}</p>
                        <p class="content" v-else-if="messagesContents[i]" v-html="(messagesContents[i] as any).html"></p>
                        <span class="author" v-if="message.author">- {{ render.localized(message.author) }}</span>
                    </div>
                </template>
            </template>
            </AsyncContent>
        </div>
    </div>
</template>

<style lang="scss">
.overview-tray {
    display: grid;
    align-items: stretch;
    grid-template-columns: auto 1fr;
    
    gap: var(--spacing);

    > .time-box, .message {
        padding: var(--spacing);
    }

    .time-box {
        display: grid;
        place-content: center;
        place-items: center;
        
    }

    .messages {
        max-block-size: 4em;
        overflow-y: auto;
    }

    .message {
        display: grid;
        place-content: stretch center;

        height: 100%;

        &:not(:first-child) {
            margin-block-start: 1rem;
        }

        > * {
            grid-column: 1; grid-row: 1;
        }
        .content {
            margin: 0;
        }
        .author {
            place-self: end;
        }
    }
}
</style>
