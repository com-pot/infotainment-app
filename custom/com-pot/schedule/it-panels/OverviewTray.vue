<script lang="ts" setup>
import { onBeforeUnmount, onMounted, PropType, ref } from 'vue'
import useTime from "@com-pot/infotainment-app/components/useTime"
import useAutoScroll from "@com-pot/infotainment-app/components/useAutoScroll"

type OverviewTrayConfig = {
    durationPer1Em?: number,
}
const props = defineProps({
    config: {type: Object as PropType<OverviewTrayConfig>},
})

const time = useTime({
    syncWithSystemTime: true,
})
const elMessages = ref<HTMLDivElement>()

onMounted(() => {
    const destroyAutoscroll = useAutoScroll(elMessages.value!, {
        durationPer1Em: props.config?.durationPer1Em,
    })
    onBeforeUnmount(() => destroyAutoscroll())
})

</script>


<template>
    <div class="panel overview-tray">
        <div class="time-box">
            <span class="date">{{ time.format({year: 'numeric', month: '2-digit', day: '2-digit'}) }}</span>
            <span class="time">{{ time.format({hour: '2-digit', minute: '2-digit', second: '2-digit'}) }}</span>
        </div>
        <div class="messages custom-scroll -outline" ref="elMessages">
            <div class="message">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita animi magni excepturi, mollitia dolores explicabo, molestiae fuga culpa recusandae, totam obcaecati consequuntur corporis iure labore nesciunt sequi. Voluptates, ducimus aspernatur.
                Voluptas harum eaque expedita odit! Reiciendis debitis labore nemo. Soluta, aspernatur a asperiores vero incidunt magnam cumque nobis sunt consequatur magni deleniti, expedita sit. Illo est commodi ducimus quis delectus.
                Dolorem aperiam autem laborum cum provident? Pariatur molestiae voluptas architecto optio sint veniam dolores adipisci deleniti eos vero qui, facere dolor explicabo dicta nemo accusantium corrupti assumenda quae totam laboriosam.
                Illum labore eligendi architecto alias praesentium fugit, dignissimos non minus ducimus, reiciendis recusandae mollitia natus dolor! Aliquid architecto veritatis dicta voluptas voluptatibus labore voluptatum quibusdam doloremque odio, voluptate culpa repudiandae!
            </div>
        </div>
    </div>
</template>

<style lang="scss">
.overview-tray {
    padding: var(--spacing);

    display: flex;
    align-items: center;
    gap: var(--spacing);

    .time-box {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .messages {
        flex: 1;

        max-block-size: 4em;
        overflow-y: auto;
    }
}
</style>
