<script setup lang="ts">
import { trackLineList } from '@/services/track-line-list/track-line-list'
import ScaleSlider from './ScaleSlider.vue'
import { useTrackStore } from '@/stores/track'

const trackStore = useTrackStore()
</script>

<template>
  <div class="control-bar">
    <section class="control-bar-child">
      <div class="control-item">撤销 TODO</div>
      <div class="control-item">重做 TODO</div>
      <div class="control-item" @click="trackLineList.removeSelected">删除</div>
      <div class="control-item">分割</div>
    </section>

    <section class="control-bar-child">
      <div class="control-item" @click="trackStore.switchMagnetic">
        {{ trackStore.enableMagnetic ? '关闭' : '打开' }}自动磁吸
      </div>
      <div class="control-item" @click="trackStore.switchSticky">
        {{ trackStore.enableSticky ? '关闭' : '打开' }}自动吸附
      </div>
      <div class="control-item" @click="trackStore.switchPreviewLine">
        {{ trackStore.enablePreviewLine ? '关闭' : '打开' }}预览线
      </div>
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
