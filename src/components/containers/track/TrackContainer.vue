<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ControlBar from './components/control-bar/ControlBar.vue'
import TrackController from './components/track-controller/TrackController.vue'
import { useTrackStore } from '@/stores/track'

const trackContainerRef = ref<HTMLDivElement>()

const trackStore = useTrackStore()

function setTrackWidth() {
  if (!trackContainerRef.value) return
  trackStore.setTrackContainerRef(trackContainerRef.value)
  trackStore.initTimelineWidth()
}

onMounted(() => {
  setTrackWidth()
})

defineExpose({
  trackContainerRef
})
</script>

<template>
  <div class="track-container" ref="trackContainerRef">
    <ControlBar />
    <TrackController />
  </div>
</template>

<style scoped lang="scss">
.track-container {
  height: calc(55% - 1px);
  background-color: var(--app-bg-color);
}
</style>
