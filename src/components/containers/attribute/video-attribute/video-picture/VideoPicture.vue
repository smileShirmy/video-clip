<script setup lang="ts">
import { ref } from 'vue'
import AttributeSlider from '../../components/base/AttributeSlider.vue'
import InputNumber from '../../components/base/InputNumber.vue'
import AttributeItem from '../../components/layout/AttributeItem.vue'

defineOptions({
  name: 'VideoPicture'
})

const opacity = ref(0)
</script>

<template>
  <AttributeItem label="不透明度">
    <AttributeSlider v-model="opacity" />
    <template #other>
      <InputNumber v-model="opacity" unit="%" />
    </template>
  </AttributeItem>
</template>
