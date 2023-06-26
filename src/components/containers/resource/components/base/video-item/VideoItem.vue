<script setup lang="ts">
import { useTrackStore } from '@/stores/track'

const props = defineProps({
  name: {
    required: true,
    type: String
  }
})

const trackStore = useTrackStore()

function onDragStart() {
  console.log('drag')
}

function onDragend() {
  trackStore.showTrackPlaceholder = false
}
</script>

<template>
  <div class="video-item-container" draggable="true" @dragstart="onDragStart" @dragend="onDragend">
    <div class="video-cover-wrapper">
      <img src="" />
    </div>
    <h5 class="video-name">{{ props.name }}</h5>
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
