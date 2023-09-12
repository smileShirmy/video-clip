<script setup lang="ts">
import { frameToTime } from '@/services/helpers/time'
import { trackList } from '@/services/track-list/track-list'
import { usePlayerStore } from '@/stores/player'
import { useTimelineStore } from '@/stores/timeline'
import IconSkipPrevious from '@/components/icons/IconSkipPrevious.vue'
import IconSkipNext from '@/components/icons/IconSkipNext.vue'
import IconPlayArrow from '@/components/icons/IconPlayArrow.vue'
import IconPause from '@/components/icons/IconPause.vue'
import IconFullscreen from '@/components/icons/IconFullscreen.vue'
import { computed } from 'vue'
import { ffManager } from '@/services/ffmpeg/manager'
import { watch } from 'vue'

const playerStore = usePlayerStore()
const timelineStore = useTimelineStore()

const currentTime = computed(() => {
  return frameToTime(playerStore.currentFrame)
})

const running = computed(() => ffManager.running.value)

watch(running, (is) => {
  if (is && playerStore.playing) {
    playerStore.pause()
  }
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

function togglePlay() {
  if (playerStore.playing) {
    playerStore.pause()
    return
  }
  if (running.value) {
    return
  }
  playerStore.play()
}
</script>

<template>
  <div class="player-controls">
    <div class="time-wrapper">
      <AppPopper content="当前时间点" hover>
        <time class="current-time"
          >{{ currentTime.time }}<span class="second-frame">.{{ currentTime.frame }}</span></time
        >
      </AppPopper>

      <div class="split-line"></div>

      <AppPopper content="轨道总时长" hover>
        <time class="total-time"
          >{{ totalTime.time }}<span class="second-frame">.{{ totalTime.frame }}</span></time
        >
      </AppPopper>
    </div>

    <div class="controls">
      <div
        class="controls-btn"
        :class="{
          disabled: running
        }"
        @click="prevFrame"
      >
        <IconSkipPrevious class="controls-icon" />
      </div>
      <div
        class="controls-btn"
        :class="{
          disabled: running
        }"
        @click="togglePlay"
      >
        <IconPause class="controls-icon" v-show="playerStore.playing" />
        <IconPlayArrow class="controls-icon" v-show="!playerStore.playing" />
      </div>
      <div
        class="controls-btn"
        :class="{
          disabled: running
        }"
        @click="nextFrame"
      >
        <IconSkipNext class="controls-icon" />
      </div>
    </div>

    <div class="handler-wrapper">
      <!-- TODO: 画面比例切换 -->
      <div class="handler-item aspect-ratio" title="TODO: 画面切幅">16:9</div>
      <!-- TODO: 全屏播放 -->
      <div class="handler-item" title="TODO: 全屏播放">
        <IconFullscreen class="handler-icon" />
      </div>
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

    > .controls-btn {
      cursor: pointer;

      + .controls-btn {
        margin-left: 20px;
      }

      &.disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    .controls-icon {
      width: 20px;
      height: 20px;
      fill: var(--app-text-color-primary);

      &:hover {
        fill: var(--app-text-color-regular);
      }
    }
  }

  .handler-wrapper {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    .handler-item {
      cursor: pointer;

      .handler-icon {
        width: 20px;
        height: 20px;
        fill: var(--app-text-color-primary);

        &:hover {
          fill: var(--app-color-white);
        }
      }

      &.aspect-ratio {
        border: 1px solid var(--app-text-color-primary);
        padding: 0 7px;
        height: 14px;
        line-height: 14px;
        border-radius: 2px;
        font-size: var(--app-font-size-minimum);
        color: var(--app-text-color-primary);
        text-align: center;

        &:hover {
          border-color: var(--app-color-white);
        }
      }

      &:hover {
        color: var(--app-color-white);
      }

      + .handler-item {
        margin-left: 16px;
      }
    }
  }
}
</style>
