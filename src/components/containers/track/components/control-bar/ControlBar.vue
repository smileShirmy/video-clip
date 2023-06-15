<script setup lang="ts">
import ScaleSlider from './ScaleSlider.vue'
import { useTrackStore } from '@/stores/track'

const trackStore = useTrackStore()
</script>

<template>
  <div class="control-bar"><ScaleSlider v-model="trackStore.scale" /></div>
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
