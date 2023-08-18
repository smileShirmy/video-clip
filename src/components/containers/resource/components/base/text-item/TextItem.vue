<script setup lang="ts">
import { TEXT_HEIGHT_RATIO } from '@/config'
import { draggable } from '@/services/draggable/draggable'
import { TextTrackItem } from '@/services/track-item/text-track-item'
import { usePlayerStore } from '@/stores/player'
import { type TextResource } from '@/types'
import { ref } from 'vue'

const props = defineProps<{
  data: TextResource
}>()

const playerStore = usePlayerStore()

const resourceItemRef = ref<HTMLDivElement | null>(null)

function onDragStart(e: PointerEvent) {
  if (!resourceItemRef.value) return
  const { aspectRatio } = playerStore
  const heightRatio = TEXT_HEIGHT_RATIO

  const widthRatio = (heightRatio / aspectRatio) * 4

  draggable.onDragStart(
    e,
    resourceItemRef.value,
    // 居中
    TextTrackItem.create(props.data, {
      topRatio: (1 - heightRatio) / 2,
      leftRatio: (1 - widthRatio) / 2,
      widthRatio,
      heightRatio
    })
  )
}
</script>

<template>
  <div ref="resourceItemRef" class="text-item-container" @pointerdown="onDragStart">
    {{ props.data.name }}
  </div>
</template>

<style scoped lang="scss">
.text-item-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 70px;
  height: 70px;
  background-color: var(--app-color-black);
  border-radius: 4px;
  font-size: var(--app-font-size-extra-small);
}
</style>
