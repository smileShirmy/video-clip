<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import type { ComputedRef, CSSProperties } from 'vue'
import { useTrackStore } from '@/stores/track'
import { useTimelineStore } from '@/stores/timeline'

const timelineRulerRef = ref<HTMLDivElement>()

const trackStore = useTrackStore()
const timelineStore = useTimelineStore()

const wrapperStyle: ComputedRef<CSSProperties> = computed(() => ({
  width: `${trackStore.trackControllerWidth}px`
}))

const trackContentWidthStyle: ComputedRef<CSSProperties> = computed(() => ({
  width: `${timelineStore.timelineWidth}px`
}))

function initTimelineRuler() {
  if (!timelineRulerRef.value) return
  trackStore.initTimeline(timelineRulerRef.value)
}

onMounted(() => {
  initTimelineRuler()
})
</script>

<template>
  <div class="track-controller" :style="wrapperStyle" ref="trackContainerRef">
    <div :style="trackContentWidthStyle" class="timeline-ruler" ref="timelineRulerRef"></div>
    <div :style="trackContentWidthStyle" class="timeline-resource"></div>
  </div>
</template>

<style scoped lang="scss">
.track-controller {
  overflow-x: auto;
  height: calc(100% - 30px);

  .timeline-ruler {
    display: flex;
    justify-content: flex-start;
    height: 30px;
  }

  .timeline-resource {
    width: 100px;
  }
}
</style>
