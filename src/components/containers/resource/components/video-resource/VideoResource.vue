<script lang="ts">
import { ResourceComponentName } from '../../types'

export default { name: ResourceComponentName.VIDEO_RESOURCE };
</script>

<script setup lang="ts">
import VideoItem from '../base/video-item/VideoItem.vue'

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
@use '../../assets/scss/shared.scss'
</style>