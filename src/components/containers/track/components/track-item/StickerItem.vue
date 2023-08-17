<script setup lang="ts">
import { TrackItemName } from '@/types'
import TrackHandler from './TrackHandler.vue'
import type { StickerTrackItem } from '@/services/track-item/sticker-track-item'
import { onMounted } from 'vue'
import { FFDir, ffManager } from '@/services/ffmpeg/manager'

defineOptions({
  name: TrackItemName.TRACK_ITEM_STICKER
})

const props = defineProps<{
  data: StickerTrackItem
}>()

async function initSticker() {
  const { name, format, source, width, height } = props.data.resource
  const filename = `${name}.${format}`
  await ffManager.writeFile(FFDir.RESOURCE, filename, source)
  await ffManager.generateFrames(filename, {
    width,
    height,
    format
  })
}

onMounted(() => {
  initSticker()
})
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
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
