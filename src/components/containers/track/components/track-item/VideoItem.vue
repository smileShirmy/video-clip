<script setup lang="ts">
import { TrackItemName } from '@/components/containers/resource/types'
import TrackHandler from './TrackHandler.vue'

defineOptions({
  name: TrackItemName.TRACK_VIDEO
})
</script>

<template>
  <TrackHandler> 视频资源 </TrackHandler>
</template>
