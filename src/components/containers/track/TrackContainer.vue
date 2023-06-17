<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ControlBar from './components/control-bar/ControlBar.vue'
import TrackController from './components/track-controller/TrackController.vue'
import { useTrackStore } from '@/stores/track'

const trackContainerRef = ref<HTMLDivElement>()

const trackStore = useTrackStore()

function setTrackWidth() {
  if (!trackContainerRef.value) return
  trackStore.setTrackControllerWidth(trackContainerRef.value)
}

onMounted(() => {
  setTrackWidth()
})
</script>

<template>
  <div class="track-container" ref="trackContainerRef" style="height: 500px">
    <ControlBar />
    <TrackController />
  </div>
</template>

<style scoped lang="scss">
.track-container {
  min-height: 220px;
  border-top: 1px solid var(--app-bg-color-blank);
  background-color: var(--app-bg-color);
}
</style>
