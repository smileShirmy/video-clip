<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import type { CSSProperties, ComputedRef } from 'vue'
import { useTrackStore } from '@/stores/track'
import { useTimelineStore } from '@/stores/timeline'

const trackStore = useTrackStore()
const timelineStore = useTimelineStore()

const min = 0 // 最小帧数
const max = computed(() => timelineStore.maxFrameCount) // 最大帧数
const step = 1 // step 为 1 帧

const timelineRulerRef = ref<HTMLDivElement>()
let startPosition = 0
let newPosition = 0
let startX = 0
let currentX = 0
let timelineSize = 1
let dragging = false
let isClick = false

const currentPosition = computed(() => {
  return `${((trackStore.currentFrame - min) / (max.value - min)) * 100}%`
})

const seekLineStyle: ComputedRef<CSSProperties> = computed(() => ({
  left: currentPosition.value
}))

// TODO: emit change
const emitChange = async () => {
  // await nextTick()
  // emit model value
}

function resetSize() {
  if (timelineRulerRef.value) {
    timelineSize = timelineRulerRef.value.clientWidth
  }
}

function getClientX(event: MouseEvent | TouchEvent) {
  if (event instanceof TouchEvent) {
    return event.touches[0].clientX
  }
  return event.clientX
}

function onDragStart(event: MouseEvent | TouchEvent) {
  dragging = true
  isClick = true
  const clientX = getClientX(event)
  startX = clientX
  startPosition = parseFloat(currentPosition.value)
  newPosition = startPosition
}

function onDragging(event: MouseEvent | TouchEvent) {
  if (dragging) {
    isClick = false
    resetSize()
    let diff = 0
    const clientX = getClientX(event)
    currentX = clientX
    diff = ((currentX - startX) / timelineSize) * 100
    newPosition = startPosition + diff
    setPosition(newPosition)
  }
}

function onDragEnd() {
  /*
   * 防止在 mouseup 后立即触发 click，导致滑块有几率产生一小段位移
   * 不使用 preventDefault 是因为 mouseup 和 click 没有注册在同一个 DOM 上
   */
  setTimeout(async () => {
    dragging = false
    if (!isClick) {
      setPosition(newPosition)
    }
    emitChange()
  }, 0)
  window.removeEventListener('mousemove', onDragging)
  window.removeEventListener('touchmove', onDragging)
  window.removeEventListener('mouseup', onDragEnd)
  window.removeEventListener('touchend', onDragEnd)
  window.removeEventListener('contextmenu', onDragEnd)
}

function setPosition(newPosition: number) {
  if (newPosition === null || isNaN(newPosition)) return
  if (newPosition < 0) {
    newPosition = 0
  } else if (newPosition > 100) {
    newPosition = 100
  }
  let lengthPerStep = 100 / ((max.value - min) / step)
  const steps = Math.round(newPosition / lengthPerStep)
  let value = steps * lengthPerStep * (max.value - min) * 0.01 + min
  value = parseFloat(value.toFixed(0))
  if (value !== trackStore.currentFrame) {
    trackStore.currentFrame = value
  }
}

function onSeekLineDown(event: MouseEvent | TouchEvent) {
  event.preventDefault()
  onDragStart(event)
  window.addEventListener('mousemove', onDragging)
  window.addEventListener('touchmove', onDragging)
  window.addEventListener('mouseup', onDragEnd)
  window.addEventListener('touchend', onDragEnd)
  window.addEventListener('contextmenu', onDragEnd)
}

function onTimelineClick(event: MouseEvent) {
  if (!timelineRulerRef.value || dragging) return
  resetSize()
  const sliderOffsetLeft = timelineRulerRef.value.getBoundingClientRect().left
  setPosition(((event.clientX - sliderOffsetLeft) / timelineSize) * 100)
  emitChange()
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
