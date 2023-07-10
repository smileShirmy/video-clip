<script setup lang="ts">
import ScaleSlider from './ScaleSlider.vue'
import { useTrackStore } from '@/stores/track'

const trackStore = useTrackStore()
</script>

<template>
  <div class="control-bar">
    <div></div>

    <section class="control-bar-child">
      <div class="split-line"></div>
      <div class="control-item adaptive-item" @click="trackStore.adaptiveTrack">自适应轨道</div>
      <ScaleSlider v-model="trackStore.scale" />
    </section>
  </div>
</template>

<style scoped lang="scss">
.control-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  height: 30px;
  padding: 0 12px;
  background-color: var(--app-bg-color-light);
  border-bottom: 1px solid var(--app-bg-color-blank);

  .control-bar-child {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .control-item {
    margin: 0 6px;
    cursor: pointer;
  }

  .adaptive-item {
    margin-right: 12px;
  }

  .split-line {
    margin: 0 6px;
    width: 1px;
    height: 18px;
    background-color: var(--app-bg-color-lighter);
  }
}
</style>
