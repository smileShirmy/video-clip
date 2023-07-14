<script setup lang="ts">
import { draggable } from '@/services/draggable/draggable'
import { TextTrackItem } from '@/services/track-item/text-track-item'
import { type TextResource } from '@/types'
import { ref } from 'vue'

const props = defineProps<{
  data: TextResource
}>()

const resourceItemRef = ref<HTMLDivElement | null>(null)

function onDragStart(e: PointerEvent) {
  if (!resourceItemRef.value) return

  draggable.onDragStart(e, resourceItemRef.value, TextTrackItem.create(props.data))
}
</script>

<template>
  <div ref="resourceItemRef" class="text-item-container" @pointerdown="onDragStart"></div>
</template>

<style scoped lang="scss">
.text-item-container {
  width: 70px;
  height: 70px;
  background-color: var(--app-color-black);
  border-radius: 4px;
}
</style>
