<script setup lang="ts">
import { ref } from 'vue'
import AttributeItem from '../../components/layout/AttributeItem.vue'
import AttributeSlider from '../../components/base/AttributeSlider.vue'
import InputNumber from '../../components/base/InputNumber.vue'

defineOptions({
  name: 'SoundControls'
})

const volume = ref(0)
</script>

<template>
  <AttributeItem label="音量">
    <AttributeSlider v-model="volume" />
    <template #other>
      <InputNumber v-model="volume" unit="dB" />
    </template>
  </AttributeItem>
</template>
