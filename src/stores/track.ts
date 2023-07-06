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

  // 是否开启自动吸附
  const enableSticky = ref(true)

  // 是否开启自动磁吸
  const enableMagneticAttraction = ref(true)

  // 外层宽度（可以伸缩）
  const trackControllerWidth = ref(0)

  // 初始化时 timeline 的宽度
  const initTimelineWidth = ref(0)

  // 当前编辑视频的总帧数 TODO: 这个数据需要统一到视频控制
  const frameCount = 5000

  // 当前的帧数 TODO: 这个数据需要统一到视频控制
  const currentFrame = ref(0)

  // 放大等级
  const scale = ref(0)

  // 当下面三个值发生改变时都要重新绘制
  watchThrottled(
    [initTimelineWidth, scale, frameCount],
    () => {
      timelineStore.updateTimeline(initTimelineWidth.value, frameCount, scale.value)
    },
    { throttle: 100 }
  )

  function setTrackControllerWidth(trackContainerRef: HTMLDivElement) {
    const { width } = trackContainerRef.getBoundingClientRect()
    trackControllerWidth.value = width

    // TODO: 暂时随着外层变化而变化，后面优化，只有在 frameCount 变大时才改变这个值，否则不会因为拖动导致宽度变化而更新
    initTimelineWidth.value = width - 80
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
    trackControllerWidth,
    showTrackPlaceholder,
    showHorizontalLine,
    showVerticalLine,
    initTimeline,
    setTrackControllerWidth,
    onDragend
  }
})
