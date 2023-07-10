import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useTimelineStore } from './timeline'
import { watchThrottled } from '@vueuse/core'
import { trackLineList } from '@/services/track-line-list/track-line-list'
import { ADAPTIVE_RATIO } from '@/config'

export const useTrackStore = defineStore('track', () => {
  const timelineStore = useTimelineStore()

  const disableScroll = ref(false)

  const showTrackPlaceholder = ref(false)

  const showHorizontalLine = ref(false)

  const showVerticalLine = ref(false)

  let trackContainerRef: HTMLDivElement | null = null

  // 是否开启自动吸附
  const enableSticky = ref(true)

  // 是否开启自动磁吸
  const enableMagneticAttraction = ref(true)

  // 当前的帧数 TODO: 这个数据需要统一到视频控制
  const currentFrame = ref(0)

  // 放大等级
  const scale = ref(0)

  // 当下面三个值发生改变时都要重新绘制
  watchThrottled(
    [scale],
    () => {
      timelineStore.updateTimeline(scale.value)
    },
    { throttle: 100 }
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
    timelineStore.updateMinFrameWidth()
    timelineStore.updateTimeline(scale.value)
  }

  function resizeTimelineWidth() {
    const width = getTimelineWidth()
    if (timelineStore.timelineWrapperWidth !== width) {
      timelineStore.timelineWrapperWidth = width
      timelineStore.updateTimeline(scale.value)
    }
  }

  function updateMaxFrameCount(isAdd = false) {
    const maxFrame = trackLineList.getMaxFrame()
    // 如果是添加，并且少于等于两个的时候，总宽度为总帧数的 1.5 倍
    if (isAdd && trackLineList.trackItemCount <= 2) {
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
    const maxFrame = trackLineList.getMaxFrame()
    const width = getTimelineWidth()
    timelineStore.initTimelineWidth = width
    timelineStore.timelineWrapperWidth = width
    timelineStore.maxFrameCount = Math.round(maxFrame * ADAPTIVE_RATIO)
    timelineStore.updateMinFrameWidth()
    timelineStore.updateTimeline(scale.value)
  }

  function initTimeline(wrapper: HTMLElement) {
    timelineStore.init(wrapper)
  }

  function onDragend(e: DragEvent) {
    e.preventDefault()

    trackLineList.removeMove()
    disableScroll.value = false
    showHorizontalLine.value = false
    showVerticalLine.value = false
    showTrackPlaceholder.value = false
  }

  return {
    disableScroll,
    currentFrame,
    scale,
    enableSticky,
    enableMagneticAttraction,
    showTrackPlaceholder,
    showHorizontalLine,
    showVerticalLine,
    setTrackContainerRef,
    initTimeline,
    updateMaxFrameCount,
    resizeTimelineWidth,
    initTimelineWidth,
    onDragend,
    adaptiveTrack
  }
})
