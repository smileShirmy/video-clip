<script setup lang="ts">
import { TrackComponentName, type TrackItem } from '@/types'
import TrackHandler from './TrackHandler.vue'

defineOptions({
  name: TrackComponentName.TRACK_VIDEO
})

const props = defineProps<{
  data: TrackItem
}>()
</script>

<template>
  <TrackHandler :data="props.data"> 视频资源 </TrackHandler>
</template>
