<script setup lang="ts">
import { watch } from 'vue';
import ItPanel from './it-panels/ItPanel.vue';
import { usePanelAppRootSpec } from './panels';
import BusySpinner from './components/BusySpinner.vue';
import { useGlobalArgs } from './panels/globalArgs';


const globalArgs = useGlobalArgs()
const appRootSpec = usePanelAppRootSpec()

watch(() => appRootSpec.ready && appRootSpec.value, (spec) => {
  globalArgs.spliceSource('rootSpec')
  const args = spec && spec.globalArgs
  args && globalArgs.addSource('rootSpec', args)
}, {immediate: true})


watch(() => globalArgs.get('con.title'), (title) => {
  const titleEl = document.head.querySelector('title') as HTMLTitleElement
  titleEl.innerText =  (title ? title + ' | ' : '')+ 'Infotainment'
}, {immediate: true})
</script>

<template>
  <BusySpinner v-if="!appRootSpec.ready" :order="6">Preparing holy crusade critical information</BusySpinner>
  <ItPanel v-else v-bind="appRootSpec.value.rootPanel" class="root"/>
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
