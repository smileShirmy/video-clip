<script setup lang="ts">
import { ResourceComponentName, type AudioResource, ResourceType } from '@/types'
import { ref } from 'vue'
import AudioItem from '../base/audio-item/AudioItem.vue'

defineOptions({
  name: ResourceComponentName.AUDIO_RESOURCE
})

const list = ref<AudioResource[]>([
  {
    type: ResourceType.AUDIO,
    name: '你干嘛',
    source: '',
    format: 'mp3',
    frameCount: 300
  }
])
</script>

<template>
  <ul class="s-resource-list">
    <li class="s-resource-item" v-for="(item, i) in list" :key="i">
      <AudioItem :data="item" />
    </li>
  </ul>
</template>

<style scoped lang="scss">
@use '../../assets/scss/shared.scss';
</style>
