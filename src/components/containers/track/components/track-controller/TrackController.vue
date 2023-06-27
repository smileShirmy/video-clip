<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import type { ComputedRef, CSSProperties } from 'vue'
import { useTrackStore } from '@/stores/track'
import { useTimelineStore } from '@/stores/timeline'
import TimelineRuler from './TimelineRuler.vue'
import VideoItem from '../track-item/VideoItem.vue'
import { TrackComponentName, TrackLineType, ResourceType } from '@/types'
import { isNumber, uuid } from '@/services/helpers/general'

defineOptions({
  components: {
    [TrackComponentName.TRACK_VIDEO]: VideoItem
  }
})

const trackStore = useTrackStore()
const timelineStore = useTimelineStore()

const timelineResourceRef = ref<HTMLDivElement>()

const trackPlaceholderRef = ref<HTMLDivElement>()

const trackLineListRef = ref<HTMLDivElement[]>()

const trackContentRef = ref<HTMLDivElement>()

const wrapperStyle: ComputedRef<CSSProperties> = computed(() => ({
  width: `${trackStore.trackControllerWidth}px`
}))

const trackContentWidthStyle: ComputedRef<CSSProperties> = computed(() => ({
  width: `${timelineStore.timelineWidth}px`
}))

const trackPlaceholder = reactive({
  top: 0,
  startFrame: 0,
  frameCount: 0,
  height: 60
})

const trackPlaceholderStyle: ComputedRef<CSSProperties> = computed(() => {
  return {
    top: `${trackPlaceholder.top}px`,
    left: `${((trackPlaceholder.startFrame - MIN) / (timelineStore.maxFrameCount - MIN)) * 100}%`,
    width: `${trackPlaceholder.frameCount * timelineStore.frameWidth}px`,
    height: `${trackPlaceholder.height}px`
  }
})

const MIN = 0
const STEP = 1

// 当前是否存在资源
const isEmpty = computed(() => {
  return trackStore.trackLineList.length === 1 && trackStore.trackLineList[0].trackList.length === 0
})

function getElementPosition(el: HTMLElement): { top: number; left: number } {
  if (el === trackContentRef.value!) return { top: 0, left: 0 }

  let top = el.offsetTop
  let left = el.offsetLeft
  if (el.offsetParent) {
    const p = getElementPosition(el.offsetParent as HTMLElement)
    top += p.top
    left += p.left
  }
  return {
    top,
    left
  }
}

function getDragoverPosition(e: DragEvent): {
  top: number
  left: number
  y: number
  startFrame: number
} {
  const { top, left } = getElementPosition(e.target as HTMLElement)
  const y = top + e.offsetY
  const x = left + e.offsetX

  let newPosition = (x / timelineStore.timelineWidth) * 100
  if (newPosition < 0) {
    newPosition = 0
  } else if (newPosition > 100) {
    newPosition = 100
  }
  const max = timelineStore.maxFrameCount
  const lengthPerStep = 100 / (timelineStore.maxFrameCount - MIN) / STEP
  const steps = Math.round(newPosition / lengthPerStep)
  let startFrame = steps * lengthPerStep * (max - MIN) * 0.01 + MIN
  startFrame = parseFloat(startFrame.toFixed(0))

  return {
    top,
    left,
    y,
    startFrame
  }
}

function setPlaceholder(options: {
  top?: number
  startFrame?: number
  frameCount?: number
  height?: number
}) {
  trackStore.showTrackPlaceholder = true

  if (isNumber(options.top)) {
    trackPlaceholder.top = options.top
  }
  if (isNumber(options.startFrame)) {
    trackPlaceholder.startFrame = options.startFrame
  }
  if (isNumber(options.frameCount)) {
    trackPlaceholder.frameCount = options.frameCount
  }
  if (isNumber(options.height)) {
    trackPlaceholder.height = options.height
  }
}

let trackLineInsertIndex = -1

/**
 * 判断是否处于 trackLine 上
 *
 * 1. 如果是 trackLine 外则找到需要插入新的 trackLine 的 index 位置并插入 trackLine 同时插入 trackItem
 * 2. 如果是 trackLine 上则找到需要插入 trackItem 的 index 位置并插入
 */
function onDragover(e: DragEvent) {
  e.preventDefault()

  if (!trackLineListRef.value || !trackStore.draggingData) return

  trackStore.showTrackPlaceholder = false

  const { top, y, startFrame } = getDragoverPosition(e)

  let mainLineTop = 0
  let firstLineTop = 0

  const len = trackLineListRef.value.length
  for (let i = 0; i < len; i += 1) {
    const trackLine = trackLineListRef.value[i]
    if (trackLine.dataset.index === '0') {
      const { top } = getElementPosition(trackLine)
      firstLineTop = top
    }

    // dragover 处于某条 trackLine 上
    if (trackLine === e.target || e.target === trackPlaceholderRef.value) {
      trackLineInsertIndex = Number(trackLine.dataset.index)
      setPlaceholder({ top, startFrame, frameCount: trackStore.draggingData.frameCount })
      return
    }

    if (trackLine.dataset.type === TrackLineType.MAIN) {
      const { top } = getElementPosition(trackLine)
      mainLineTop = top
    }
  }

  // 如果目前没有插入任何资源，并且 y 大于主轨道顶部，则把占位符显示在主轨道上
  if (isEmpty.value && y > mainLineTop) {
    trackLineInsertIndex = len - 1

    setPlaceholder({ top: mainLineTop, startFrame, frameCount: trackStore.draggingData.frameCount })
    return
  }

  // 如果是在最顶部则在最顶部新插入一个 trackLine
  if (y < firstLineTop) {
    trackLineInsertIndex = -1
  }
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  const draggingData = trackStore.draggingData
  if (!draggingData) return

  const { startFrame } = getDragoverPosition(e)

  const trackItem = {
    id: uuid(),
    resourceType: ResourceType.VIDEO,
    component: TrackComponentName.TRACK_VIDEO,
    frameCount: draggingData.frameCount,
    startFrame: 0,
    endFrame: draggingData.frameCount
  }

  if (trackLineInsertIndex === -1) {
    trackItem.startFrame = startFrame
    trackItem.endFrame = startFrame + draggingData.frameCount
    trackStore.trackLineList.unshift({
      type: TrackLineType.VIDEO,
      id: uuid(),
      trackList: [trackItem]
    })
  } else if (trackLineInsertIndex > -1) {
    if (!isEmpty.value) {
      trackItem.startFrame = startFrame
      trackItem.endFrame = startFrame + draggingData.frameCount
    }
    const line = trackStore.trackLineList[trackLineInsertIndex]
    if (draggingData.type === ResourceType.VIDEO) {
      line.trackList.push(trackItem)
    }
  }
}
</script>

<template>
  <div
    class="track-controller"
    :class="{
      'overflow-hidden': trackStore.showTrackPlaceholder
    }"
    :style="wrapperStyle"
    ref="trackContainerRef"
  >
    <div class="track-menu"></div>
    <div class="track-content" ref="trackContentRef" :style="trackContentWidthStyle">
      <TimelineRuler />
      <div
        class="timeline-resource"
        ref="timelineResourceRef"
        @dragover="onDragover"
        @drop="onDrop"
      >
        <ul class="track-list">
          <li
            v-for="(trackLine, lineIndex) in trackStore.trackLineList"
            ref="trackLineListRef"
            :key="trackLine.id"
            class="track-line"
            :data-index="lineIndex"
            :data-type="trackLine.type"
            :class="{ 'is-main': trackLine.type === TrackLineType.MAIN }"
          >
            <template v-for="item in trackLine.trackList" :key="item.id">
              <component :is="item.component" :data="item"></component>
            </template>
          </li>
        </ul>

        <div
          v-show="trackStore.showTrackPlaceholder"
          class="track-placeholder"
          ref="trackPlaceholderRef"
          :style="trackPlaceholderStyle"
        ></div>
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

  &.overflow-hidden {
    overflow: hidden;
  }

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

  .track-placeholder {
    position: absolute;
    background-color: #7086e9;
  }

  .track-list {
    width: 100%;
    .track-line {
      position: relative;
      width: 100%;
      height: 60px;
      border-radius: 4px;

      &.is-main {
        background-color: var(--app-color-black);
        height: 60px;
      }

      &.top-line {
        border-top: 1px solid #7086e9;
      }

      + .track-line {
        margin-top: 8px;
      }
    }
  }
}
</style>
