import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useTimelineStore } from './timeline'
import { watchThrottled } from '@vueuse/core'
import { trackList } from '@/services/track-list/track-list'
import { ADAPTIVE_RATIO, INIT_MAX_FRAME_COUNT } from '@/config'
import { usePlayerStore } from './player'

export type TrackStore = Omit<
  ReturnType<typeof useTrackStore>,
  keyof ReturnType<typeof defineStore>
>

export const useTrackStore = defineStore('track', () => {
  const timelineStore = useTimelineStore()
  const playerStore = usePlayerStore()

  const disableScroll = ref(false)

  const showTrackPlaceholder = ref(false)

  const showHorizontalLine = ref(false)

  const showVerticalLine = ref(false)

  const showPreviewLine = ref(false)

  let trackContainerRef: HTMLDivElement | null = null

  // 是否打开自动磁吸
  const enableMagnetic = ref(true)

  // 是否打开自动吸附
  const enableSticky = ref(true)

  // 是否打开预览线
  const enablePreviewLine = ref(true)

  // 放大等级
  const scale = ref(0)

  // 当下面三个值发生改变时都要重新绘制
  watchThrottled(
    [scale],
    () => {
      timelineStore.updateTimeline(scale.value)
    },
    { throttle: 100, trailing: true }
  )

  function setTrackContainerRef(trackContainer: HTMLDivElement) {
    trackContainerRef = trackContainer
  }

  function getTimelineWidth() {
    if (!trackContainerRef) return 0
    const { width } = trackContainerRef.getBoundingClientRect()
    return width - 80
  }

  function initTimelineWidth() {
    const width = getTimelineWidth()
    timelineStore.initTimelineWidth = width
    timelineStore.timelineWrapperWidth = width
    timelineStore.maxFrameCount = INIT_MAX_FRAME_COUNT
    timelineStore.updateMinFrameWidth()
    timelineStore.updateTimeline(scale.value)
  }

  function resizeTimelineWidth(width: number) {
    timelineStore.timelineWrapperWidth = width
    timelineStore.updateTimeline(scale.value)
  }

  /**
   * @param {number} updateLessThanCount 当少于多少个时直接更新
   */
  function updateMaxFrameCount(updateLessThanCount = -1) {
    const maxFrame = trackList.maxFrame
    if (maxFrame === 0) {
      initTimelineWidth()
      return
    }
    if (trackList.trackItemCount <= updateLessThanCount) {
      timelineStore.maxFrameCount = Math.round(maxFrame * ADAPTIVE_RATIO)
      timelineStore.updateMinFrameWidth()
    }
    // 超出容量
    else if (maxFrame > timelineStore.maxFrameCount) {
      timelineStore.maxFrameCount = Math.round(maxFrame * ADAPTIVE_RATIO)
      timelineStore.updateMinFrameWidth()
    }
    // 占比太小
    else if (maxFrame < timelineStore.maxFrameCount * 0.2) {
      timelineStore.maxFrameCount = Math.round(maxFrame * ADAPTIVE_RATIO)
      timelineStore.updateMinFrameWidth()
    }
    timelineStore.updateTimeline(scale.value)
  }

  // 自适应轨道
  function adaptiveTrack() {
    const maxFrame = trackList.maxFrame
    const width = getTimelineWidth()
    timelineStore.initTimelineWidth = width
    timelineStore.timelineWrapperWidth = width
    timelineStore.maxFrameCount = Math.round(maxFrame * ADAPTIVE_RATIO)
    timelineStore.updateMinFrameWidth()
    timelineStore.updateTimeline(scale.value)
  }

  function switchPreviewLine() {
    enablePreviewLine.value = !enablePreviewLine.value
  }

  function switchSticky() {
    enableSticky.value = !enableSticky.value
  }

  function switchMagnetic() {
    enableMagnetic.value = !enableMagnetic.value
  }

  function initTimeline(wrapper: HTMLElement) {
    timelineStore.init(wrapper)
  }

  function onDragend(e: DragEvent) {
    e.preventDefault()

    disableScroll.value = false
    showHorizontalLine.value = false
    showVerticalLine.value = false
    showTrackPlaceholder.value = false
  }

  function split() {
    trackList.split(playerStore.currentFrame)
  }

  return {
    disableScroll,
    scale,
    enableMagnetic,
    enableSticky,
    enablePreviewLine,
    showTrackPlaceholder,
    showHorizontalLine,
    showVerticalLine,
    showPreviewLine,
    setTrackContainerRef,
    initTimeline,
    updateMaxFrameCount,
    resizeTimelineWidth,
    initTimelineWidth,
    onDragend,
    adaptiveTrack,
    switchPreviewLine,
    switchSticky,
    switchMagnetic,
    split
  }
})
