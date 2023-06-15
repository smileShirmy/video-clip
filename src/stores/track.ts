import { TimelineRender } from '@/components/containers/track/components/timeline-render'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTrackStore = defineStore('track', () => {
  // 放大等级
  const scale = ref(0)

  // 外层宽度（可以伸缩）
  const trackControllerWidth = ref(0)

  // 内层宽度（根据状态改变）

  // 时间刻度渲染器
  let timelineRender: TimelineRender

  function setTrackControllerWidth(width: number) {
    trackControllerWidth.value = width
  }

  function initTimelineRender(wrapper: HTMLElement) {
    timelineRender = new TimelineRender(wrapper)
    timelineRender.init()
  }

  return { scale, trackControllerWidth, initTimelineRender, setTrackControllerWidth }
})
