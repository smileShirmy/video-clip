<script setup lang="ts">
import { getStickers } from '@/services/models/resource'
import StickerItem from '../base/sticker-item/StickerItem.vue'
import { ResourceComponentName, type StickerResource } from '@/types'
import { onMounted, ref } from 'vue'

defineOptions({
  name: ResourceComponentName.VIDEO_RESOURCE
})

const list = ref<StickerResource[]>([])

async function getList() {
  list.value = await getStickers()
}

onMounted(() => {
  getList()
})
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
