<script setup lang="ts">
import { frameToTime } from '@/services/helpers/time'
import { trackList } from '@/services/track-list/track-list'
import { usePlayerStore } from '@/stores/player'
import { useTimelineStore } from '@/stores/timeline'
import { computed } from 'vue'

const playerStore = usePlayerStore()
const timelineStore = useTimelineStore()

const currentTime = computed(() => {
  return frameToTime(playerStore.currentFrame)
})

const totalTime = computed(() => {
  return frameToTime(trackList.maxFrame)
})

function prevFrame() {
  if (playerStore.currentFrame > 0) {
    playerStore.currentFrame -= 1
  }
}

function nextFrame() {
  if (playerStore.currentFrame < timelineStore.maxFrameCount) {
    playerStore.currentFrame += 1
  }
}
</script>

<template>
  <div class="player-controls">
    <div class="time-wrapper">
      <time class="current-time"
        >{{ currentTime.time }}<span class="second-frame">.{{ currentTime.frame }}</span></time
      >
      <div class="split-line"></div>
      <time class="total-time"
        >{{ totalTime.time }}<span class="second-frame">.{{ totalTime.frame }}</span></time
      >
    </div>

    <div class="controls">
      <div @click="prevFrame">上一帧</div>
      <div>播放</div>
      <div @click="nextFrame">下一帧</div>
    </div>

    <div class="handler-wrapper">
      <div>画面比例 TODO</div>
      <div>全屏播放 TODO</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.player-controls {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  flex-shrink: 0;
  box-sizing: border-box;
  padding: 0 12px;
  width: 100%;
  height: 32px;
  background-color: var(--app-bg-color);
  user-select: none;

  .time-wrapper {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font-size: var(--app-font-size-minimum);

    .split-line {
      margin: 0 10px;
      width: 1px;
      height: 10px;
      background-color: var(--app-bg-color-lighter);
    }

    .current-time {
      color: var(--app-color-theme);
    }

    .total-time {
      color: var(--app-color-white);
    }

    .second-frame {
      opacity: 0.6;
    }
  }

  .controls {
    flex-shrink: 0;
    display: flex;
    justify-content: flex-start;
    align-items: center;

    > div {
      cursor: pointer;

      + div {
        margin-left: 20px;
      }
    }
  }

  .handler-wrapper {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    > div {
      cursor: pointer;

      + div {
        margin-left: 16px;
      }
    }
  }
}
</style>
