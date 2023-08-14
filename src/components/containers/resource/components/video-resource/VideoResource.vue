<script setup lang="ts">
import VideoItem from '../base/video-item/VideoItem.vue'
import { ResourceComponentName, type VideoResource } from '@/types'
import { onMounted, ref } from 'vue'
import { getVideos } from '@/services/models/resource'

defineOptions({
  name: ResourceComponentName.VIDEO_RESOURCE
})

const list = ref<VideoResource[]>([])

async function getList() {
  list.value = await getVideos()
}

onMounted(() => {
  getList()
})
</script>

<template>
  <!-- <div>Search Input</div> -->

  <!-- <div>Type List</div> -->

  <ul class="s-resource-list">
    <li class="s-resource-item" v-for="(item, i) in list" :key="i">
      <VideoItem :data="item" />
    </li>
  </ul>
</template>

<style scoped lang="scss">
@use '../../assets/scss/shared.scss';
</style>
