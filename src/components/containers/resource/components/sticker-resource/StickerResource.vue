<script setup lang="ts">
import StickerItem from '../base/sticker-item/StickerItem.vue'
import { ResourceComponentName, ResourceType, type StickerResource } from '@/types'
import { ref } from 'vue'

defineOptions({
  name: ResourceComponentName.STICKER_RESOURCE
})

const list = ref<StickerResource[]>([
  {
    type: ResourceType.STICKER,
    frameCount: 300,
    name: '就这?'
  }
])
</script>

<template>
  <ul class="s-resource-list">
    <li class="s-resource-item" v-for="(item, i) in list" :key="i">
      <StickerItem :data="item" />
    </li>
  </ul>
</template>

<style scoped lang="scss">
@use '../../assets/scss/shared.scss';
</style>
