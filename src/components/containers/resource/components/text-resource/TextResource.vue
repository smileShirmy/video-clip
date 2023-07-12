<script setup lang="ts">
import TextItem from '../base/text-item/TextItem.vue'
import { ResourceComponentName, ResourceType, type TextResource } from '@/types'
import { ref } from 'vue'

defineOptions({
  name: ResourceComponentName.TEXT_RESOURCE
})

const list = ref<TextResource[]>([
  {
    type: ResourceType.TEXT,
    frameCount: 300
  }
])
</script>

<template>
  <ul class="s-resource-list">
    <li class="s-resource-item" v-for="(item, i) in list" :key="i">
      <TextItem :data="item" />
    </li>
  </ul>
</template>

<style scoped lang="scss">
@use '../../assets/scss/shared.scss';
</style>
