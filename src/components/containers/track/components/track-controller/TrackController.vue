<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import type { ComputedRef, CSSProperties } from 'vue'
import { useTrackStore } from '@/stores/track'
import { useTimelineStore } from '@/stores/timeline'

const timelineRulerRef = ref<HTMLDivElement>()
const seekLineRef = ref<HTMLDivElement>()

const trackStore = useTrackStore()
const timelineStore = useTimelineStore()

const wrapperStyle: ComputedRef<CSSProperties> = computed(() => ({
  width: `${trackStore.trackControllerWidth}px`
}))

const trackContentWidthStyle: ComputedRef<CSSProperties> = computed(() => ({
  width: `${timelineStore.timelineWidth}px`
}))

const seekLineStyle: ComputedRef<CSSProperties> = computed(() => {
  const x = timelineStore.frameWidth * trackStore.currentFrame
  return {
    transform: `translateX(${x}px)`
  }
})

function initTimelineRuler() {
  if (!timelineRulerRef.value) return
  trackStore.initTimeline(timelineRulerRef.value)
}

onMounted(() => {
  initTimelineRuler()
})
</script>

<template>
  <div class="track-controller" :style="wrapperStyle" ref="trackContainerRef">
    <div class="track-menu"></div>
    <div class="track-content" :style="trackContentWidthStyle">
      <div class="seek-line" :style="seekLineStyle" ref="seekLineRef">
        <div class="top"></div>
        <div class="line"></div>
      </div>
      <div class="timeline-ruler" ref="timelineRulerRef"></div>
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

  .timeline-ruler {
    display: flex;
    justify-content: flex-start;
    height: 30px;
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

.seek-line {
  position: absolute;
  right: 0;
  left: -5.5px;
  width: 11px;
  height: 100%;
  pointer-events: none;

  .top {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 10px;
    pointer-events: auto;
    cursor: move;
    background-color: var(--app-color-white);

    &::before {
      position: absolute;
      top: 10px;
      left: 0;
      display: block;
      width: 0;
      height: 0;
      content: '';
      border-top: 5px solid var(--app-color-white);
      border-left: 5px solid transparent;
    }

    &::after {
      position: absolute;
      top: 10px;
      right: 0;
      display: block;
      width: 0;
      height: 0;
      content: '';
      border-top: 5px solid var(--app-color-white);
      border-right: 5px solid transparent;
    }
  }

  .line {
    position: absolute;
    top: 0;
    left: 5px;
    width: 0;
    height: 100%;
    border-left: 1px solid var(--app-color-white);
  }
}
</style>
