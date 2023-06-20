<script setup lang="ts">
import { computed } from 'vue'
import type { ComputedRef, CSSProperties } from 'vue'
import { useTrackStore } from '@/stores/track'
import { useTimelineStore } from '@/stores/timeline'
import TimelineRuler from './TimelineRuler.vue'
import VideoItem from '../track-item/VideoItem.vue'

const trackStore = useTrackStore()
const timelineStore = useTimelineStore()

const wrapperStyle: ComputedRef<CSSProperties> = computed(() => ({
  width: `${trackStore.trackControllerWidth}px`
}))

const trackContentWidthStyle: ComputedRef<CSSProperties> = computed(() => ({
  width: `${timelineStore.timelineWidth}px`
}))

function onDragover(e: DragEvent) {
  console.log(e)
}
</script>

<template>
  <div class="track-controller" :style="wrapperStyle" ref="trackContainerRef">
    <div class="track-menu"></div>
    <div class="track-content" :style="trackContentWidthStyle">
      <TimelineRuler />
      <div class="timeline-resource" @dragover="onDragover">
        <ul class="track-list">
          <li class="track-line is-main"><VideoItem /></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.track-controller {
  display: flex;
  justify-content: flex-start;
  overflow-x: auto;
  height: calc(100% - 30px);

  .track-menu {
    flex-shrink: 0;
    width: 80px;
    height: 100%;
  }

  .track-content {
    position: relative;
    height: 100%;
  }

  .timeline-resource {
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
    min-height: calc(100% - 30px);
    width: 100%;
    padding: 80px 0;
  }

  .track-list {
    width: 100%;
    .track-line {
      width: 100%;
      height: 60px;
      border-radius: 4px;

      // TODO: 先隐藏，后面再取消注释
      // &.is-main {
      //   background-color: var(--app-color-black);
      // }

      + .track-line {
        margin-top: 8px;
      }
    }
  }
}
</style>
