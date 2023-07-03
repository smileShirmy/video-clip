<script setup lang="ts">
import { TrackComponentName } from '@/types'
import TrackHandler from './TrackHandler.vue'
import { VideoTrackItem } from '@/services/track-item/track-item'

defineOptions({
  name: TrackComponentName.TRACK_VIDEO
})

const props = defineProps<{
  data: VideoTrackItem
}>()
</script>

<template>
  <TrackHandler :data="props.data"> 视频资源 </TrackHandler>
</template>
