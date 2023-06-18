<script setup lang="ts">
import { computed } from 'vue'
import type { ComputedRef, CSSProperties } from 'vue'
import { useTrackStore } from '@/stores/track'
import { useTimelineStore } from '@/stores/timeline'
import TimelineRuler from './TimelineRuler.vue'

const trackStore = useTrackStore()
const timelineStore = useTimelineStore()

const wrapperStyle: ComputedRef<CSSProperties> = computed(() => ({
  width: `${trackStore.trackControllerWidth}px`
}))

const trackContentWidthStyle: ComputedRef<CSSProperties> = computed(() => ({
  width: `${timelineStore.timelineWidth}px`
}))
</script>

<template>
  <div class="track-controller" :style="wrapperStyle" ref="trackContainerRef">
    <div class="track-menu"></div>
    <div class="track-content" :style="trackContentWidthStyle">
      <TimelineRuler />
      <div class="timeline-resource">
        <ul class="track-list">
          <li class="track-item is-main">
            <!--  -->
          </li>
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
    .track-item {
      width: 100%;
      height: 60px;
      border-radius: 4px;

      &.is-main {
        background-color: var(--app-color-black);
      }

      + .track-item {
        margin-top: 8px;
      }
    }
  }
}
</style>
