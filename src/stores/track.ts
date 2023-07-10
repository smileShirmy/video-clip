import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useTimelineStore } from './timeline'
import { watchThrottled } from '@vueuse/core'
import { trackLineList } from '@/services/track-line-list/track-line-list'

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
    console.log(1)
    const width = getTimelineWidth()
    if (timelineStore.timelineWidth !== width) {
      timelineStore.timelineWrapperWidth = width
      timelineStore.updateTimeline(scale.value)
    }
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
    resizeTimelineWidth,
    initTimelineWidth,
    onDragend
  }
})
