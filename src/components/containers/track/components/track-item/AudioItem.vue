<script setup lang="ts">
import { TrackItemName } from '@/types'
import TrackHandler from './TrackHandler.vue'
import type { AudioTrackItem } from '@/services/track-item/audio-track-item'

defineOptions({
  name: TrackItemName.TRACK_ITEM_AUDIO
})

const props = defineProps<{
  data: AudioTrackItem
}>()
</script>

<template>
  <TrackHandler :data="props.data">
    <div class="audio-track-item">
      {{ props.data.resource.name }}
    </div>
  </TrackHandler>
</template>

<style scoped lang="scss">
.audio-track-item {
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background-color: var(--app-color-black);
  height: 100%;
  color: var(--app-color-white);
  font-size: var(--app-font-size-small);
  padding: 0 10px;
  user-select: none;
}
</style>
