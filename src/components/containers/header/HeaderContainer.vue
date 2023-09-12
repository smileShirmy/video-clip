<script setup lang="ts">
import IconUpgrade from '@/components/icons/IconUpgrade.vue'
import { ffManager } from '@/services/ffmpeg/manager'
import { computed } from 'vue'

const running = computed(() => ffManager.running.value)

function exportVideo() {
  if (running.value) return

  //
}
</script>

<template>
  <header class="header-container">
    <button
      :class="{
        disabled: running
      }"
      title="TODO:"
      class="export-btn"
      @click="exportVideo"
    >
      <IconUpgrade class="export-icon" />
      导出
    </button>
  </header>
</template>

<style lang="scss" scoped>
.header-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  height: 48px;
  background-color: var(--app-bg-color-darker);

  .export-btn {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: 24px;
    line-height: 24px;
    padding: 0 12px 0 8px;
    margin-right: 12px;
    border-radius: 4px;
    outline: none;
    border: none;
    color: var(--app-color-white);
    background-color: var(--app-color-theme);
    cursor: pointer;

    .export-icon {
      width: 20px;
      height: 20px;
      margin-right: 4px;
      fill: var(--app-color-white);
    }

    &.disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
}
</style>
