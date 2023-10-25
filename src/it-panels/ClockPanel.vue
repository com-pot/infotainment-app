<script lang="ts" setup>
import { useRender } from '@typeful/data/rendering';
import useTime from '../components/useTime';

const time = useTime()
const r = useRender()

</script>

<template>
    <div class="time-box panel">
        <span class="date">{{ r.date(time.date) }}</span>
        <span class="time">{{ r.timeHms(time.date) }}</span>
    </div>
</template>
