<script setup lang="ts">
defineOptions({
  name: 'AppLoading'
})
</script>

<template>
  <div class="app-loading">
    <div class="app-loading-inner">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.app-loading-inner {
  > div {
    background-color: var(--app-color-white);
    width: 4px;
    height: 24px;
    border-radius: 2px;
    margin: 2px;
    animation-fill-mode: both;
    display: inline-block;
  }

  > div:nth-child(1) {
    animation: line-scale 1s 0.1s infinite cubic-bezier(0.2, 0.68, 0.18, 1.08);
  }

  > div:nth-child(2) {
    animation: line-scale 1s 0.2s infinite cubic-bezier(0.2, 0.68, 0.18, 1.08);
  }

  > div:nth-child(3) {
    animation: line-scale 1s 0.3s infinite cubic-bezier(0.2, 0.68, 0.18, 1.08);
  }

  > div:nth-child(4) {
    animation: line-scale 1s 0.4s infinite cubic-bezier(0.2, 0.68, 0.18, 1.08);
  }

  > div:nth-child(5) {
    animation: line-scale 1s 0.5s infinite cubic-bezier(0.2, 0.68, 0.18, 1.08);
  }
}

@keyframes line-scale {
  0% {
    transform: scaley(1);
  }

  50% {
    transform: scaley(0.4);
  }

  100% {
    transform: scaley(1);
  }
}
</style>
