<script setup lang="ts">
import { TrackItemComponentName } from '@/types'
import TrackHandler from './TrackHandler.vue'
import type { TextTrackItem } from '@/services/track-item/text-track-item'

defineOptions({
  name: TrackItemComponentName.TRACK_ITEM_TEXT
})

const props = defineProps<{
  data: TextTrackItem
}>()
</script>

<template>
  <TrackHandler :data="props.data">
    <div class="text-track-item">
      {{ props.data.text }}
    </div>
  </TrackHandler>
</template>

<style scoped lang="scss">
.text-track-item {
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background-color: #dda26b;
  height: 100%;
  color: var(--app-color-white);
  font-size: var(--app-font-size-small);
  padding: 0 10px;
  user-select: none;
}
</style>
