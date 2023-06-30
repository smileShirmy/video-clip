<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ComputedRef, CSSProperties } from 'vue'
import { useTrackStore } from '@/stores/track'
import { useTimelineStore } from '@/stores/timeline'
import TimelineRuler from './TimelineRuler.vue'
import VideoItem from '../track-item/VideoItem.vue'
import { TrackComponentName, TrackLineType, ResourceType } from '@/types'
import { isBoolean, isIntersectionOfTwoIntervals, uuid } from '@/services/helpers/general'
import { getElementPosition } from '@/services/helpers/dom'
import { usePlaceholder } from './use-placeholder'
import { useStickyLine } from './use-sticky-line'
import { TRACK_STICK_WIDTH } from '@/config'
import { isNumber } from '@/services/helpers/general'

defineOptions({
  components: {
    [TrackComponentName.TRACK_VIDEO]: VideoItem
  }
})

const trackStore = useTrackStore()
const timelineStore = useTimelineStore()

const { placeholderProperty, trackPlaceholderRef, trackPlaceholderStyle, updatePlaceholder } =
  usePlaceholder()
const { updateHorizontalLine, updateVerticalLine, horizontalLineStyle, verticalLineStyle } =
  useStickyLine()

const timelineResourceRef = ref<HTMLDivElement>()

const trackLineListRef = ref<HTMLDivElement[]>([])

const trackContentRef = ref<HTMLDivElement>()

const wrapperStyle: ComputedRef<CSSProperties> = computed(() => ({
  width: `${trackStore.trackControllerWidth}px`
}))

const trackContentWidthStyle: ComputedRef<CSSProperties> = computed(() => ({
  width: `${timelineStore.timelineWidth}px`
}))

/**
 * 获取当前拖拽点相对于 track-content 元素的位置
 */
function getDragoverPosition(event: DragEvent): {
  elementTop: number
  elementLeft: number
  y: number
  curFrame: number
} {
  const { top, left } = getElementPosition(event.target as HTMLElement, trackContentRef.value!)
  const y = top + event.offsetY
  const x = left + event.offsetX

  return {
    elementTop: top,
    elementLeft: left,
    y,
    curFrame: timelineStore.pixelToFrame(x)
  }
}

let trackLineInsertIndex = -1

const isOver = (y: number, top: number) => y < top

const isUnder = (y: number, top: number) => y > top

function onDragover(e: DragEvent) {
  e.preventDefault()

  if (!trackStore.draggingData) return
  const { y, curFrame } = getDragoverPosition(e)
  const { frameCount } = trackStore.draggingData

  let closestPixel = null
  let stickyFrame = null
  let isStartStickyFrame = null

  let showTrackPlaceholder = false
  let showHorizontalLine = false
  let showVerticalLine = false

  let mainLineTop = 0
  let firstLineTop = 0

  let isIntersectionHolder = false
  placeholderProperty.frameCount = frameCount
  placeholderProperty.startFrame = curFrame
  const holderEndFrame = curFrame + frameCount

  let verticalLineFrame = 0
  let horizontalTop = 0

  // 遍历 trackLine
  const len = trackLineListRef.value.length
  for (let i = 0; i < len; i += 1) {
    const trackLineRef = trackLineListRef.value[i]
    const index = Number(trackLineRef.dataset.index)
    const trackLine = trackStore.trackLineList[index]
    const trackList = trackLine.trackList
    const { top: trackLineTop } = getElementPosition(trackLineRef, trackContentRef.value!)

    // 是否在当前某条 trackLine 上
    let isOnTrackLine = y >= trackLineTop && y <= trackLineTop + trackLine.height

    for (let j = 0; j < trackList.length; j += 1) {
      const item = trackList[j]

      // 获取产生黏性最近的帧
      const startFramePixel = timelineStore.frameToPixel(item.startFrame)
      const endFramePixel = timelineStore.frameToPixel(item.endFrame)
      const holderEndFramePixel = timelineStore.frameToPixel(holderEndFrame)
      const holderStartFramePixel = timelineStore.frameToPixel(curFrame)

      // trackItem 开始帧和 trackPlaceholder 开始帧产生黏性
      const startToStartDiff = Math.abs(startFramePixel - holderStartFramePixel)
      if (startToStartDiff < TRACK_STICK_WIDTH) {
        if (closestPixel === null || startToStartDiff < closestPixel) {
          closestPixel = startToStartDiff
          isStartStickyFrame = true
          stickyFrame = item.startFrame
        }
      }
      // trackItem 结束帧和 trackPlaceholder 开始帧产生黏性
      const endToStartDiff = Math.abs(endFramePixel - holderStartFramePixel)
      if (endToStartDiff < TRACK_STICK_WIDTH) {
        if (closestPixel === null || endToStartDiff < closestPixel) {
          closestPixel = endToStartDiff
          isStartStickyFrame = true
          stickyFrame = item.endFrame
        }
      }

      // trackItem 开始帧和 trackPlaceholder 结束帧产生黏性
      const startToEndDiff = Math.abs(startFramePixel - holderEndFramePixel)
      if (startToEndDiff < TRACK_STICK_WIDTH) {
        if (closestPixel === null || startToStartDiff < closestPixel) {
          closestPixel = startToStartDiff
          isStartStickyFrame = false
          stickyFrame = item.startFrame
        }
      }
      // trackItem 结束帧和 trackPlaceholder 结束帧产生黏性
      const endToEndDiff = Math.abs(endFramePixel - holderEndFramePixel)
      if (endToEndDiff < TRACK_STICK_WIDTH) {
        if (closestPixel === null || endToStartDiff < closestPixel) {
          closestPixel = endToStartDiff
          isStartStickyFrame = false
          stickyFrame = item.endFrame
        }
      }

      // 如果在某条 trackLine 上，但处于 trackItem 上，则不算在这条 trackLine 上
      if (isOnTrackLine && curFrame >= item.startFrame && curFrame <= item.endFrame) {
        isOnTrackLine = false
      }

      // 判断 tackPlaceholder 和当前的 trackItem 是否有重合
      if (isOnTrackLine) {
        isIntersectionHolder = isIntersectionOfTwoIntervals(
          [curFrame, holderEndFrame],
          [item.startFrame, item.endFrame]
        )
      }
    }

    if (isOnTrackLine) {
      showTrackPlaceholder = true
      trackLineInsertIndex = Number(index)
      placeholderProperty.top = trackLineTop
    }

    if (index === 0) {
      firstLineTop = trackLineTop
    }

    if (trackLineRef.dataset.type === TrackLineType.MAIN) {
      mainLineTop = trackLineTop
    }
  }

  if (isNumber(stickyFrame) && isBoolean(isStartStickyFrame)) {
    showVerticalLine = true
    verticalLineFrame = stickyFrame
    placeholderProperty.startFrame = isStartStickyFrame ? stickyFrame : stickyFrame - frameCount
  }

  if (trackStore.isEmptyResource && isUnder(y, mainLineTop)) {
    // 如果目前没有插入任何资源，并且在主轨道顶部之下，则把 trackPlaceholder 显示到主轨道上
    showTrackPlaceholder = true
    trackLineInsertIndex = len - 1
    placeholderProperty.startFrame = 0
    placeholderProperty.top = mainLineTop
  }

  // 如果当前在最顶部的 trackLine 之上
  if (isOver(y, firstLineTop)) {
    showHorizontalLine = true
    horizontalTop = firstLineTop - 4
    trackLineInsertIndex = -1
  }

  if (isIntersectionHolder) {
    showTrackPlaceholder = false
  }

  // 根据结果设置相应的值
  if (showTrackPlaceholder) {
    updatePlaceholder(placeholderProperty)
  }
  if (showHorizontalLine) {
    updateHorizontalLine(horizontalTop)
  }
  if (showVerticalLine) {
    updateVerticalLine(verticalLineFrame)
  }

  trackStore.showHorizontalLine = showHorizontalLine
  trackStore.showVerticalLine = showVerticalLine
  trackStore.showTrackPlaceholder = showTrackPlaceholder
}

function onDragleave(e: DragEvent) {
  e.preventDefault()

  trackStore.showVerticalLine = false
  trackStore.showHorizontalLine = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  const draggingData = trackStore.draggingData
  if (!draggingData) return

  const { curFrame } = getDragoverPosition(e)

  const trackItem = {
    id: uuid(),
    resourceType: ResourceType.VIDEO,
    component: TrackComponentName.TRACK_VIDEO,
    frameCount: draggingData.frameCount,
    startFrame: 0,
    endFrame: draggingData.frameCount
  }

  if (trackStore.isEmptyResource) {
    trackStore.trackLineList[0].trackList.push(trackItem)
  }
  // 默认情况从上面插入一个新的 trackLine 和 trackItem
  else if (trackLineInsertIndex === -1) {
    let startFrame = curFrame
    if (trackStore.showVerticalLine) {
      startFrame = placeholderProperty.startFrame
    }

    trackItem.startFrame = startFrame
    trackItem.endFrame = startFrame + draggingData.frameCount

    trackStore.trackLineList.unshift({
      type: TrackLineType.VIDEO,
      height: 60,
      id: uuid(),
      trackList: [trackItem]
    })
  }
  // 如果找到目标 trackLine 则追加一个 trackItem
  else if (trackLineInsertIndex > -1) {
    let startFrame = curFrame
    if (trackStore.showVerticalLine) {
      startFrame = placeholderProperty.startFrame
    }

    trackItem.startFrame = startFrame
    trackItem.endFrame = startFrame + draggingData.frameCount

    const line = trackStore.trackLineList[trackLineInsertIndex]
    line.trackList.push(trackItem)
  }

  trackStore.showVerticalLine = false
  trackStore.showHorizontalLine = false
}
</script>

<template>
  <div
    class="track-controller"
    :class="{
      'overflow-hidden': trackStore.disableScroll
    }"
    :style="wrapperStyle"
  >
    <div class="track-menu"></div>
    <!-- position: relative -->
    <div class="track-content" ref="trackContentRef" :style="trackContentWidthStyle">
      <TimelineRuler />
      <div
        class="timeline-resource"
        ref="timelineResourceRef"
        @dragover="onDragover"
        @drop="onDrop"
        @dragleave="onDragleave"
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

        <div
          v-show="trackStore.showHorizontalLine"
          class="horizontal-line"
          :style="horizontalLineStyle"
        ></div>
        <div
          v-show="trackStore.showVerticalLine"
          class="vertical-line"
          :style="verticalLineStyle"
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
    box-sizing: border-box;
    position: absolute;
    background-color: rgba(#7086e9, 0.2);
    border: 2px dashed rgba(#7086e9, 0.5);
    border-radius: 4px;
    pointer-events: none;
  }

  .horizontal-line {
    position: absolute;
    top: 0;
    width: 100%;
    height: 1px;
    background-color: #7086e9;
    pointer-events: none;
  }

  .vertical-line {
    position: absolute;
    left: 0;
    width: 1px;
    height: calc(100% - 30px);
    background-color: #7086e9;
    pointer-events: none;
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

      + .track-line {
        margin-top: 8px;
      }
    }
  }
}
</style>
