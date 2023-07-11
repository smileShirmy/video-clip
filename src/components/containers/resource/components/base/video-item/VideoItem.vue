<script setup lang="ts">
import { VideoTrackItem } from '@/services/track-item/track-item'
import { draggable } from '@/services/draggable/draggable'
import { type VideoResource } from '@/types'
import { ref } from 'vue'

const props = defineProps<{
  data: VideoResource
}>()

const resourceItemRef = ref<HTMLDivElement | null>(null)

function onDragStart(e: PointerEvent) {
  if (!resourceItemRef.value) return

  draggable.onDragStart(e, resourceItemRef.value, VideoTrackItem.create(props.data))
}
</script>

<template>
  <div ref="resourceItemRef" class="video-item-container" @pointerdown="onDragStart">
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
