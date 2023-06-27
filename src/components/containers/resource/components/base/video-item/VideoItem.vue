<script setup lang="ts">
import { useTrackStore } from '@/stores/track'
import type { VideoResource } from '@/types'

const props = defineProps<{
  data: VideoResource
}>()

const trackStore = useTrackStore()

function onDragStart() {
  trackStore.draggingData = props.data
}

function onDragend() {
  trackStore.draggingData = null
  trackStore.showTrackPlaceholder = false
  trackStore.showVerticalLine = false
  trackStore.showHorizontalLine = false
}
</script>

<template>
  <div class="video-item-container" draggable="true" @dragstart="onDragStart" @dragend="onDragend">
    <div class="video-cover-wrapper">
      <img src="" />
    </div>
    <h5 class="video-name">{{ props.data.name }}</h5>
  </div>
</template>

<style scoped lang="scss">
.video-item-container {
  position: relative;
  z-index: 1;

  .video-cover-wrapper {
    width: 116px;
    height: 78px;
    background-color: var(--app-color-black);
    border-radius: 4px;
    overflow: hidden;
  }

  .video-name {
    margin-top: 8px;
    color: var(--app-text-color-regular);
    font-size: var(--app-font-size-extra-small);
  }
}
</style>
