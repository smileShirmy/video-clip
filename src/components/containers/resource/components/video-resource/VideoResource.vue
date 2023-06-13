<script setup lang="ts">
import VideoItem from '../base/video-item/VideoItem.vue'
import { ResourceComponentName } from '../../types'

defineOptions({
  name: ResourceComponentName.VIDEO_RESOURCE
})
</script>

<template>
  <div>Search Input</div>

  <div>Type List</div>

  <ul class="s-resource-list">
    <li class="s-resource-item">
      <VideoItem name="视频名称" />
    </li>
  </ul>
</template>

<style scoped lang="scss">
@use '../../assets/scss/shared.scss';
</style>
