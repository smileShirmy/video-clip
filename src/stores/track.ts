import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useTimelineStore } from './timeline'

export const useTrackStore = defineStore('track', () => {
  // 外层宽度（可以伸缩）
  const trackControllerWidth = ref(0)

  // 初始化时 timeline 的宽度
  const initTimelineWidth = ref(0)

  // 当前编辑视频的总帧数
  const frameCount = 1000

  // 放大等级
  const scale = ref(0)

  const timelineStore = useTimelineStore()

  // 当下面三个值发生改变时都要重新绘制
  watch([initTimelineWidth, scale, frameCount], () => {
    timelineStore.updateTimeline(initTimelineWidth.value, frameCount, scale.value)
  })

  function setTrackControllerWidth(trackContainerRef: HTMLDivElement) {
    const { width } = trackContainerRef.getBoundingClientRect()
    trackControllerWidth.value = width

    // TODO: 暂时随着外层变化而变化，后面优化，只有在 frameCount 变大时才改变这个值，否则不会因为拖动导致宽度变化而更新
    initTimelineWidth.value = width
  }

  function initTimeline(wrapper: HTMLElement) {
    timelineStore.init(wrapper)
  }

  return {
    scale,
    trackControllerWidth,
    initTimeline,
    setTrackControllerWidth
  }
})
