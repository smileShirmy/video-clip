<script setup lang="ts">
import { useTrackStore } from '@/stores/track'
import { onMounted, ref } from 'vue'

const trackStore = useTrackStore()
const timelineRulerRef = ref()

onMounted(() => {
  trackStore.initTimelineRender(timelineRulerRef.value)
})
</script>

<template>
  <div class="timeline-ruler" ref="timelineRulerRef"></div>
</template>

<style scoped lang="scss">
.timeline-ruler {
  display: flex;
  justify-content: flex-start;
  height: 30px;
}
</style>
