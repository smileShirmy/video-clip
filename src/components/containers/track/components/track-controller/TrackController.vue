<script setup lang="ts">
import { onMounted, ref } from 'vue'
import TimelineRuler from '../timeline-ruler/TimelineRuler.vue'

const trackContainerRef = ref<HTMLDivElement | null>(null)
const timelineRulerRef = ref<InstanceType<typeof TimelineRuler> | null>(null)

function initTimeline() {
  if (!trackContainerRef.value || !timelineRulerRef.value) return
  const { width } = trackContainerRef.value.getBoundingClientRect()

  timelineRulerRef.value.initTimelineRuler(width)
}

onMounted(() => {
  initTimeline()
})
</script>

<template>
  <div class="track-controller" ref="trackContainerRef">
    <TimelineRuler ref="timelineRulerRef" />
    <div class="timeline-resource"></div>
  </div>
</template>

<style scoped lang="scss">
.track-controller {
  overflow-x: auto;
  height: calc(100% - 30px);

  .timeline-resource {
    width: 100px;
  }
}
</style>
