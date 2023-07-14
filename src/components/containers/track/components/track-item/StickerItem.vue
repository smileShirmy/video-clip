<script setup lang="ts">
import { TrackItemName } from '@/types'
import TrackHandler from './TrackHandler.vue'
import type { StickerTrackItem } from '@/services/track-item/sticker-track-item'

defineOptions({
  name: TrackItemName.TRACK_ITEM_STICKER
})

const props = defineProps<{
  data: StickerTrackItem
}>()
</script>

<template>
  <TrackHandler :data="props.data">
    <div class="text-track-item">
      {{ props.data.resource.name }}
    </div>
  </TrackHandler>
</template>

<style scoped lang="scss">
.text-track-item {
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background-color: #d87064;
  height: 100%;
  color: var(--app-color-white);
  font-size: var(--app-font-size-small);
  padding: 0 10px;
  user-select: none;
}
</style>
