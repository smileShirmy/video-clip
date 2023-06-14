<script setup lang="ts">
import { ref } from 'vue'
import ScaleSlider from './ScaleSlider.vue'

const scale = ref(0)
</script>

<template>
  <div class="control-bar"><ScaleSlider v-model="scale" /></div>
</template>

<style scoped lang="scss">
.control-bar {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  height: 30px;
  background-color: var(--app-bg-color-light);
  border-bottom: 1px solid var(--app-bg-color-blank);
}
</style>
