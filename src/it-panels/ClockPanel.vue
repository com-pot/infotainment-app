<script lang="ts" setup>
import useTime from '../components/useTime';

const time = useTime({
    syncWithSystemTime: true,
})

</script>

<template>
    <div class="time-box panel">
        <span class="date">{{ time.format({year: 'numeric', month: '2-digit', day: '2-digit'}) }}</span>
        <span class="time">{{ time.format({hour: '2-digit', minute: '2-digit', second: '2-digit'}) }}</span>
    </div>
</template>
