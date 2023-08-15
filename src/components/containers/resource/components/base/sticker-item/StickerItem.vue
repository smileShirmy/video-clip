<script setup lang="ts">
import { draggable } from '@/services/draggable/draggable'
import { StickerTrackItem } from '@/services/track-item/sticker-track-item'
import { usePlayerStore } from '@/stores/player'
import { type StickerResource } from '@/types'
import { ref } from 'vue'

const props = defineProps<{
  data: StickerResource
}>()

const playerStore = usePlayerStore()
const resourceItemRef = ref<HTMLDivElement | null>(null)

function onDragStart(e: PointerEvent) {
  if (!resourceItemRef.value) return

  const { width, height } = props.data
  const { aspectRatio } = playerStore

  const resourceAspectRatio = width / height
  let topRatio = 0
  let leftRatio = 0
  let widthRatio = 1
  let heightRatio = 1

  if (resourceAspectRatio > aspectRatio) {
    widthRatio = 1
    heightRatio = 1 / aspectRatio
    topRatio = (1 - heightRatio) / 2
    leftRatio = 0
  } else if (resourceAspectRatio < aspectRatio) {
    heightRatio = 1
    widthRatio = 1 / aspectRatio
    topRatio = 0
    leftRatio = (1 - widthRatio) / 2
  }

  draggable.onDragStart(
    e,
    resourceItemRef.value,
    StickerTrackItem.create(props.data, {
      topRatio,
      leftRatio,
      widthRatio,
      heightRatio
    })
  )
}
</script>

<template>
  <div ref="resourceItemRef" class="sticker-item-container" @pointerdown="onDragStart">
    <div class="sticker-cover-wrapper">
      <img class="sticker-cover" :src="props.data.source" />
    </div>
    <h5 class="sticker-name">{{ props.data.name }}</h5>
  </div>
</template>

<style scoped lang="scss">
.sticker-item-container {
  width: 70px;
  height: 70px;
  background-color: var(--app-color-black);
  border-radius: 4px;

  .sticker-cover-wrapper {
    width: 116px;
    height: 78px;
    background-color: var(--app-color-black);
    border-radius: 4px;
    overflow: hidden;

    .sticker-cover {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .sticker-name {
    margin-top: 8px;
    color: var(--app-text-color-regular);
    font-size: var(--app-font-size-extra-small);
  }
}
</style>
