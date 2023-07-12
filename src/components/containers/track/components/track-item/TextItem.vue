<script setup lang="ts">
import { TrackItemComponentName } from '@/types'
import TrackHandler from './TrackHandler.vue'
import type { VideoTrackItem } from '@/services/track-item/video-item'

defineOptions({
  name: TrackItemComponentName.TRACK_ITEM_TEXT
})

const props = defineProps<{
  data: VideoTrackItem
}>()
</script>

<template>
  <TrackHandler :data="props.data"> 文本资源 </TrackHandler>
</template>
