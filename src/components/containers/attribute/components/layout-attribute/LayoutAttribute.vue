<script setup lang="ts">
import { ref } from 'vue'
import AttributeSlider from '../base/AttributeSlider.vue'
import InputNumber from '../base/InputNumber.vue'

defineOptions({
  name: 'LayoutAttribute'
})

const opacity = ref(0)
</script>

<template>
  <div class="attribute-item">
    <div class="attribute-label">不透明度</div>
    <div class="attribute-handler">
      <AttributeSlider v-model="opacity" />
    </div>
    <div class="attribute-other-handler">
      <InputNumber v-model="opacity" unit="%" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.attribute-item {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-right: 80px;

  .attribute-label {
    flex-shrink: 0;
    width: 4em;
    margin-right: 14px;
  }

  .attribute-handler {
    flex: 1;
    margin: 0 10px;
  }

  .attribute-other-handler {
    flex-shrink: 0;
  }
}
</style>
