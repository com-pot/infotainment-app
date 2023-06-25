<script setup lang="ts">
import { computed, watch } from 'vue';
import BusySpinner from '@typeful/vue-utils/components/BusySpinner.vue';
import ItPanel from './it-panels/ItPanel.vue';
import { useScreenSpec } from './panels';
import { useGlobalArgs } from './panels/globalArgs';

const url = new URL(window.location.toString())
const screenSpecName = computed(() => url.searchParams.get("screen") || undefined)

const globalArgs = useGlobalArgs()
const screenSpec = useScreenSpec(screenSpecName)

watch(() => screenSpec.ready && screenSpec.value, (spec) => {
  globalArgs.spliceSource('screenSpec')
  const args = spec && spec.globalArgs
  args && globalArgs.addSource('screenSpec', args)
}, {immediate: true})


watch(() => globalArgs.get('con.title'), (title) => {
  const titleEl = document.head.querySelector('title') as HTMLTitleElement
  titleEl.innerText =  (title ? title + ' | ' : '')+ 'Infotainment'
}, {immediate: true})
</script>

<template>
  <div v-if="screenSpec.status === 'error'">
    <p>Screen not ready</p>
    <p v-if="screenSpecName">
      Requested screen: <code>{{ screenSpecName }}</code>
    </p>
    <code>{{ screenSpec.error }}</code>
  </div>
  <BusySpinner v-else-if="!screenSpec.ready" :order="6">Preparing holy crusade critical information</BusySpinner>
  <ItPanel v-else v-bind="screenSpec.value.rootPanel" class="root"/>
</template>

<style lang="scss">
#app {
  display: grid;

  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  overflow-x: hidden;

  min-height: 100vh;

  > .busy-spinner {
    place-self: center;
  }
}
</style>
