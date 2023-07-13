<script setup lang="ts">
import { draggable } from '@/services/draggable/draggable'
import { StickerTrackItem } from '@/services/track-item/sticker-item'
import { type StickerResource } from '@/types'
import { ref } from 'vue'

const props = defineProps<{
  data: StickerResource
}>()

const resourceItemRef = ref<HTMLDivElement | null>(null)

function onDragStart(e: PointerEvent) {
  if (!resourceItemRef.value) return

  draggable.onDragStart(e, resourceItemRef.value, StickerTrackItem.create(props.data))
}
</script>

<template>
  <div ref="resourceItemRef" class="sticker-item-container" @pointerdown="onDragStart"></div>
</template>

<style scoped lang="scss">
.sticker-item-container {
  width: 70px;
  height: 70px;
  background-color: var(--app-color-black);
  border-radius: 4px;
}
</style>
