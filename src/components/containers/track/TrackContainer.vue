<script setup lang="ts">
import ControlBar from './components/control-bar/ControlBar.vue'
import TrackController from './components/track-controller/TrackController.vue'

</script>

<template>
  <div class="track-container" style="height: 500px">
    <ControlBar />
    <TrackController />
  </div>
</template>

<style scoped lang="scss">
.track-container {
  box-sizing: border-box;
  min-height: 220px;
  border-top: 1px solid var(--app-bg-color-blank);
  background-color: var(--app-bg-color);
}
</style>

