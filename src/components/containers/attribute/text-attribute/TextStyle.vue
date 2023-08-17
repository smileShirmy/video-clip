<script setup lang="ts">
import { useTrackStore } from '@/stores/track'
import AttributeSlider from '../components/base/AttributeSlider.vue'
import InputNumber from '../components/base/InputNumber.vue'
import AttributeItem from '../components/layout/AttributeItem.vue'
import type { TextTrackItem } from '@/services/track-item/text-track-item'
import { computed } from 'vue'

defineOptions({
  name: 'TextStyle'
})

const trackStore = useTrackStore()
const trackItem: TextTrackItem = trackStore.selectedTrackItem as TextTrackItem

const scale = computed({
  get() {
    return trackItem.attribute.scale * 100
  },
  set(scale) {
    trackItem.attribute.scale = scale / 100
  }
})
</script>

<template>
  <AttributeItem label="缩放">
    <AttributeSlider :max="500" v-model="scale" />
    <template #other>
      <InputNumber :max="500" v-model="scale" unit="%" />
    </template>
  </AttributeItem>
</template>
