<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import type { ComputedRef, CSSProperties } from 'vue'
import TimelineRuler from '../timeline-ruler/TimelineRuler.vue'
import { useTrackStore } from '@/stores/track'

const trackContainerRef = ref<HTMLDivElement | null>(null)
// const timelineRulerRef = ref<InstanceType<typeof TimelineRuler> | null>(null)

const trackStore = useTrackStore()

const wrapperStyle: ComputedRef<CSSProperties> = computed(() => ({
  width: `${trackStore.trackControllerWidth}px`
}))

function setTrackWidth() {
  if (!trackContainerRef.value) return
  const { width } = trackContainerRef.value.getBoundingClientRect()
  trackStore.setTrackControllerWidth(width)
}

onMounted(() => {
  setTrackWidth()
})
</script>

<template>
  <div class="track-controller" :style="wrapperStyle" ref="trackContainerRef">
    <TimelineRuler />
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
