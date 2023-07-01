import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { useTimelineStore } from './timeline'
import { watchThrottled } from '@vueuse/core'
import {
  TrackLineType,
  type TrackLine,
  type TrackItem,
  type VideoResource,
  type VideoTrackItem,
  TrackComponentName,
  type VideoTrackLine
} from '@/types'
import { isArray, uuid } from '@/services/helpers/general'

export const useTrackStore = defineStore('track', () => {
  const timelineStore = useTimelineStore()

  const draggingTrackItem = ref<TrackItem | null>(null)

  const disableScroll = ref(false)

  const showTrackPlaceholder = ref(false)

  const showHorizontalLine = ref(false)

  const showVerticalLine = ref(false)

  const dragstartOffsetX = ref(0)

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

  // 轨道资源数据
  const trackLineList: TrackLine[] = reactive([
    {
      type: TrackLineType.MAIN,
      id: uuid(),
      height: 60,
      trackList: []
    }
  ])

  // 轨道中不存在任何资源
  const isEmptyResource = computed(
    () => trackLineList.length === 1 && trackLineList[0].trackList.length === 0
  )

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

  /**
   * 移除目标 trackItem
   */
  function removeTrackItem(trackItem: TrackItem) {
    trackLineList.forEach((line) => {
      line.trackList.forEach((item, i) => {
        if (item.id === trackItem.id) {
          line.trackList.splice(i, 1)
        }
      })
    })
  }

  function removeEmptyTrackLine() {
    trackLineList.forEach((line, i) => {
      if (line.type !== TrackLineType.MAIN && line.trackList.length === 0) {
        trackLineList.splice(i, 1)
      }
    })
  }

  function createVideoTrackLine(trackItem: VideoTrackItem | VideoTrackItem[]): VideoTrackLine {
    return {
      type: TrackLineType.VIDEO,
      id: uuid(),
      height: 60,
      trackList: isArray(trackItem) ? trackItem : [trackItem]
    }
  }

  function createVideoTrackItem(resource: VideoResource): VideoTrackItem {
    const copy = Object.assign({}, resource)
    return {
      id: uuid(),
      component: TrackComponentName.TRACK_VIDEO,
      startFrame: 0,
      endFrame: copy.frameCount,
      resource: copy
    }
  }

  function initTimeline(wrapper: HTMLElement) {
    timelineStore.init(wrapper)
  }

  function updateTrackItemStartFrame(trackItem: TrackItem, startFrame: number) {
    trackItem.startFrame = startFrame
  }

  function updateTrackItemEndFrame(trackItem: TrackItem, endFrame: number) {
    trackItem.endFrame = endFrame
  }

  function onDragend(e: DragEvent) {
    e.preventDefault()

    draggingTrackItem.value = null
    disableScroll.value = false
    showTrackPlaceholder.value = false
  }

  return {
    dragstartOffsetX,
    disableScroll,
    isEmptyResource,
    trackLineList,
    draggingTrackItem,
    currentFrame,
    scale,
    trackControllerWidth,
    showTrackPlaceholder,
    showHorizontalLine,
    showVerticalLine,
    initTimeline,
    removeTrackItem,
    removeEmptyTrackLine,
    createVideoTrackLine,
    createVideoTrackItem,
    setTrackControllerWidth,
    updateTrackItemStartFrame,
    updateTrackItemEndFrame,
    onDragend
  }
})
