<script setup lang="ts">
import { DEFAULT_TEXT_FRAME_COUNT } from '@/config'
import TextItem from '../base/text-item/TextItem.vue'
import { ResourceComponentName, ResourceType, type TextResource } from '@/types'
import { ref } from 'vue'

defineOptions({
  name: ResourceComponentName.TEXT_RESOURCE
})

const defaultTextResource: TextResource = {
  type: ResourceType.TEXT,
  name: '默认文本',
  frameCount: DEFAULT_TEXT_FRAME_COUNT
}

const list = ref<TextResource[]>([defaultTextResource])
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
