<script setup lang="ts">
import { draggable } from '@/services/draggable/draggable'
import { AudioTrackItem } from '@/services/track-item/audio-track-item'
import type { AudioResource } from '@/types'
import { ref } from 'vue'

const props = defineProps<{
  data: AudioResource
}>()

const resourceItemRef = ref<HTMLDivElement | null>(null)

function onDragStart(e: PointerEvent) {
  if (!resourceItemRef.value) return

  draggable.onDragStart(e, resourceItemRef.value, AudioTrackItem.create(props.data))
}
</script>

<template>
  <div ref="resourceItemRef" class="audio-item-container" @pointerdown="onDragStart"></div>
</template>

<style scoped lang="scss">
.audio-item-container {
  box-sizing: border-box;
  width: 200px;
  height: 78px;
  background-color: var(--app-bg-color);
  border-radius: 4px;
}
</style>
