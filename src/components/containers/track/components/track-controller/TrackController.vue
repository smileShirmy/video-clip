<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import type { ComputedRef, CSSProperties } from 'vue'
import { useTrackStore } from '@/stores/track'
import { useTimelineStore } from '@/stores/timeline'
import TimelineRuler from './TimelineRuler.vue'
import VideoItem from '../track-item/VideoItem.vue'
import { TrackItemName } from '@/types'
import { isNumber } from '@/services/helpers/general'

defineOptions({
  components: {
    [TrackItemName.TRACK_VIDEO]: VideoItem
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
  left: 0,
  width: 100,
  height: 60
})

const trackPlaceholderStyle: ComputedRef<CSSProperties> = computed(() => ({
  top: `${trackPlaceholder.top}px`,
  left: `${trackPlaceholder.left}px`,
  width: `${trackPlaceholder.width}px`,
  height: `${trackPlaceholder.height}px`
}))

// 当前是否存在资源
const isEmpty = computed(() => {
  return true
})

enum TrackLineType {
  Main = 'Main'
}

interface TrackItem {
  id: string
  component: TrackItemName
}

interface TrackLine {
  type: TrackLineType
  id: string
  trackList: TrackItem[]
}

const trackLineList: TrackLine[] = reactive([
  {
    type: TrackLineType.Main,
    id: '',
    trackList: []
  }
])

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
  x: number
} {
  const { top, left } = getElementPosition(e.target as HTMLElement)

  return {
    top,
    left,
    y: top + e.offsetY,
    x: left + e.offsetX
  }
}

function setPlaceholder(options: { top?: number; left?: number; width?: number; height?: number }) {
  trackStore.showTrackPlaceholder = true

  if (isNumber(options.top)) {
    trackPlaceholder.top = options.top
  }
  if (isNumber(options.left)) {
    trackPlaceholder.left = options.left
  }
  if (isNumber(options.width)) {
    trackPlaceholder.width = options.width
  }
  if (isNumber(options.height)) {
    trackPlaceholder.height = options.height
  }
}

/**
 * 判断是否处于 trackLine 上
 *
 * 1. 如果是 trackLine 外则找到需要插入新的 trackLine 的 index 位置并插入 trackLine 同时插入 trackItem
 * 2. 如果是 trackLine 上则找到需要插入 trackItem 的 index 位置并插入
 */
function onDragover(e: DragEvent) {
  e.preventDefault()

  if (!trackLineListRef.value) return

  trackStore.showTrackPlaceholder = false

  const { top, x, y } = getDragoverPosition(e)

  let mainLineTop = 0

  const len = trackLineListRef.value.length
  for (let i = 0; i < len; i += 1) {
    const trackLine = trackLineListRef.value[i]

    // dragover 处于某条 trackLine 上
    if (trackLine === e.target || e.target === trackPlaceholderRef.value) {
      setPlaceholder({ top, left: x })
      return
    }

    if (trackLine.dataset.type === TrackLineType.Main) {
      const { top } = getElementPosition(trackLine)
      mainLineTop = top
    }
  }

  // 如果目前没有插入任何资源，并且 y 大于主轨道顶部，则把占位符显示在主轨道上
  if (isEmpty.value && y > mainLineTop) {
    setPlaceholder({ top: mainLineTop, left: x })
    return
  }
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  console.log('drop')
}
</script>

<template>
  <div class="track-controller" :style="wrapperStyle" ref="trackContainerRef">
    <div class="track-menu"></div>
    <div class="track-content" ref="trackContentRef" :style="trackContentWidthStyle">
      <TimelineRuler />
      <div
        class="timeline-resource"
        ref="timelineResourceRef"
        @dragover="onDragover"
        @drop="onDrop"
      >
        <div
          v-show="trackStore.showTrackPlaceholder"
          class="track-placeholder"
          ref="trackPlaceholderRef"
          :style="trackPlaceholderStyle"
        ></div>

        <ul class="track-list">
          <li
            v-for="trackLine in trackLineList"
            ref="trackLineListRef"
            :key="trackLine.id"
            class="track-line"
            :data-type="trackLine.type"
            :class="{ 'is-main': trackLine.type === TrackLineType.Main }"
          >
            <!-- <VideoItem /> -->
            <template v-for="track in trackLine.trackList" :key="track.id">
              <component :is="track.component"></component>
            </template>
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

  .track-placeholder {
    position: absolute;
    background-color: #7086e9;
  }

  .track-list {
    width: 100%;
    .track-line {
      width: 100%;
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
