<script setup lang="ts">
import asyncReactive from './components/asyncReactive';
import ItPanel from './it-panels/ItPanel.vue';
import { useRootPanelSpecification } from './panels';
import BusySpinner from './components/BusySpinner.vue';

const resolveAfter = (t: number) => new Promise((res) => setTimeout(res, t));
const resolveWith = <T=any>(arg: T, t: number = 0): Promise<T> => {
  if (t <= 0) {
    return Promise.resolve(arg)
  }
  return resolveAfter(t).then(() => arg)
}

const rootPanel = useRootPanelSpecification()

</script>

<template>
  <BusySpinner v-if="!rootPanel.ready" :order="6">Preparing holy crusade critical information</BusySpinner>
  <ItPanel v-else v-bind="rootPanel.value" class="root"/>
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
