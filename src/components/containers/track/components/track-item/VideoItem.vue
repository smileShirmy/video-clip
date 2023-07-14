<script setup lang="ts">
import { TrackItemName } from '@/types'
import TrackHandler from './TrackHandler.vue'
import type { VideoTrackItem } from '@/services/track-item/video-track-item'

defineOptions({
  name: TrackItemName.TRACK_ITEM_VIDEO
})

const props = defineProps<{
  data: VideoTrackItem
}>()
</script>

<template>
  <TrackHandler :data="props.data"> 视频资源 </TrackHandler>
</template>
@/services/track-item/video-track-item
