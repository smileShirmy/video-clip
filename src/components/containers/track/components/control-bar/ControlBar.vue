<script setup lang="ts">
import ScaleSlider from './ScaleSlider.vue'
</script>

<template>
  <div class="control-bar"><ScaleSlider /></div>
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
