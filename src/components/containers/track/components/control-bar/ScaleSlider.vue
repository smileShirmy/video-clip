<script setup lang="ts">
function onSliderDown() {
  //
}
</script>

<template>
  <div class="scale-slider">
    <div class="slider-runway" @mousedown="onSliderDown" @touchstart="onSliderDown">
      <div class="slider-bar"></div>
      <div class="slider-button"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.scale-slider {
  display: flex;
  align-items: center;
  width: 100px;
  height: 12px;

  .slider-runway {
    position: relative;
    flex: 1;
    cursor: pointer;
    height: 2px;
    background-color: var(--app-bg-color-lighter);

    .slider-bar {
      width: 7%;
      height: 100%;
      left: 0%;
      background-color: var(--app-color-white);
    }

    .slider-button {
      position: absolute;
      top: -5px;
      left: 7%;
      cursor: grab;
      height: 12px;
      width: 6px;
      border-radius: 3px;
      background-color: var(--app-color-white);
      transform: translate(-50%);
      user-select: none;
    }
  }
}
</style>
