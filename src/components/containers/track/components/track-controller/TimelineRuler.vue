<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import type { CSSProperties, ComputedRef } from 'vue'
import { useTrackStore } from '@/stores/track'
import { useTimelineStore } from '@/stores/timeline'
import { Slider } from '@/services/slider/slider'
import type { SliderDownOptions } from '@/services/slider/slider'

const trackStore = useTrackStore()
const timelineStore = useTimelineStore()

let position = ref<string>('0%')

const timelineRulerRef = ref<HTMLDivElement>()

const slider = new Slider({
  change(v: number, p: string) {
    trackStore.currentFrame = v
    position.value = p
  }
})

const sliderOptions = computed<SliderDownOptions>(() => ({
  min: 0,
  max: timelineStore.maxFrameCount,
  sliderSize: timelineStore.timelineWidth,
  value: trackStore.currentFrame
}))

const seekLineStyle: ComputedRef<CSSProperties> = computed(() => ({
  left: position.value
}))

function onTimelineClick(event: MouseEvent) {
  slider.onSliderClick(event, sliderOptions.value, timelineRulerRef.value)
}

function onSeekLineDown(event: MouseEvent | TouchEvent) {
  slider.onDown(event, sliderOptions.value)
}

function initTimelineRuler() {
  if (!timelineRulerRef.value) return
  trackStore.initTimeline(timelineRulerRef.value)
}

onMounted(() => {
  initTimelineRuler()
})
</script>

<template>
  <div class="timeline-ruler" ref="timelineRulerRef" @click="onTimelineClick"></div>
  <div
    class="seek-line"
    :style="seekLineStyle"
    ref="seekLineRef"
    @mousedown="onSeekLineDown"
    @touchstart="onSeekLineDown"
  >
    <div class="top"></div>
    <div class="line"></div>
  </div>
</template>

<style scoped lang="scss">
.timeline-ruler {
  display: flex;
  justify-content: flex-start;
  height: 30px;
}

.seek-line {
  position: absolute;
  top: 0;
  right: 0;
  left: -5.5px;
  width: 11px;
  height: 100%;
  pointer-events: none;
  transform: translate(-50%);

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
      border-top: 6px solid var(--app-color-white);
      border-left: 6px solid transparent;
    }

    &::after {
      position: absolute;
      top: 10px;
      right: 0;
      display: block;
      width: 0;
      height: 0;
      content: '';
      border-top: 6px solid var(--app-color-white);
      border-right: 6px solid transparent;
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
