<script setup lang="ts">
import { ResourceComponentName, type AudioResource } from '@/types'
import { onMounted, ref } from 'vue'
import AudioItem from '../base/audio-item/AudioItem.vue'
import { getAudios } from '@/services/models/resource'

defineOptions({
  name: ResourceComponentName.AUDIO_RESOURCE
})

const list = ref<AudioResource[]>([])

async function getList() {
  list.value = await getAudios()
}

onMounted(() => {
  getList()
})
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
