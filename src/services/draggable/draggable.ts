import { useTimelineStore } from '@/stores/timeline'
import { useTrackStore } from '@/stores/track'
import { computed, reactive, ref, type ComputedRef, type CSSProperties } from 'vue'
import { type DragOffset } from './types'
import type { TrackItem } from '../track-item'
import { TrackItemName } from '@/types'
import { DragCommon } from './drag-common'
import {
  DraggingState,
  type AddToCurrentTrackState,
  type DraggingStateData,
  type AddToNewTrackState
} from './types'
import { DragAudio } from './drag-audio'
import { DragText } from './drag-text'
import { isNumber } from '../helpers/general'
import { trackList } from '../track-list/track-list'

class Draggable {
  trackListRef: HTMLDivElement[] | null = null
  trackContentRef: HTMLDivElement | null = null
  trackPlaceholderRef: HTMLDivElement | null = null
  timelineResourceRef: HTMLDivElement | null = null

  stickyFrame = ref<number | null>(0)
  horizontalLineTop = ref(0)

  resizing = false

  draggingState = ref<DraggingState | null>(null)

  movingId = ref<string | null>(null)

  trackPlaceholderRect = reactive({
    top: 0,
    startFrame: 0,
    widthFrame: 0,
    height: 60
  })

  initElementRef(options: {
    trackListRef: HTMLDivElement[]
    trackContentRef: HTMLDivElement
    trackPlaceholderRef: HTMLDivElement
    timelineResourceRef: HTMLDivElement
  }) {
    this.trackListRef = options.trackListRef
    this.trackContentRef = options.trackContentRef
    this.trackPlaceholderRef = options.trackPlaceholderRef
    this.timelineResourceRef = options.timelineResourceRef
  }

  setup() {
    const timelineStore = useTimelineStore()

    const horizontalLineStyle: ComputedRef<CSSProperties> = computed(() => ({
      top: `${this.horizontalLineTop.value}px`
    }))

    const stickyLineStyle: ComputedRef<CSSProperties> = computed(() => ({
      left: isNumber(this.stickyFrame.value)
        ? timelineStore.frameToPercentWithUnit(this.stickyFrame.value)
        : 0
    }))

    const trackPlaceholderStyle: ComputedRef<CSSProperties> = computed(() => {
      return {
        top: `${this.trackPlaceholderRect.top}px`,
        left: timelineStore.frameToPercentWithUnit(this.trackPlaceholderRect.startFrame),
        width: timelineStore.frameToPixelWidthWithUnit(this.trackPlaceholderRect.widthFrame),
        height: `${this.trackPlaceholderRect.height}px`
      }
    })

    return {
      horizontalLineStyle,
      stickyLineStyle,
      trackPlaceholderStyle
    }
  }

  /**
   * 拖拽方法(新增资源到轨道/移动轨道资源)
   * 如果是移动资源才需要传 movingId 和 dragOffset
   */
  onDragStart(
    e: PointerEvent | MouseEvent,
    dragTarget: HTMLElement,
    dragTrackItem: TrackItem,
    movingId: string | null = null,
    dragOffset: DragOffset = { offsetX: 0, offsetY: 0 }
  ) {
    e.preventDefault()

    const trackStore = useTrackStore()
    const timelineStore = useTimelineStore()

    trackStore.disableScroll = true
    trackStore.showPreviewLine = false

    const options = {
      dragTarget,
      movingId,
      dragOffset,
      timelineResourceRef: this.timelineResourceRef!,
      trackListRef: this.trackListRef!,
      trackContentRef: this.trackContentRef!,
      timelineStore,
      trackStore,
      onStateChange: this.onStateChange(movingId),
      onDragEnd: this.onDragEnd
    }

    if (dragTrackItem.component === TrackItemName.TRACK_ITEM_AUDIO) {
      new DragAudio({ ...options, dragTrackItem })
    } else if (dragTrackItem.component === TrackItemName.TRACK_ITEM_TEXT) {
      new DragText({ ...options, dragTrackItem })
    } else {
      new DragCommon({ ...options, dragTrackItem })
    }
  }

  /**
   * 更新添加到当前轨道占位符的属性
   */
  setAddToCurrentTrackState(stateData: AddToCurrentTrackState) {
    this.trackPlaceholderRect.top = stateData.top
    this.trackPlaceholderRect.startFrame = stateData.startFrame
    this.trackPlaceholderRect.widthFrame = stateData.widthFrame
    this.trackPlaceholderRect.height = stateData.addToTrack.height

    if (stateData.stickyInfo) {
      this.stickyFrame.value = stateData.stickyInfo.stickyFrame
    } else {
      this.stickyFrame.value = null
    }
  }

  /**
   * 更新插入到新轨道指示线的高度
   */
  setAddToNewTrackState(stateData: AddToNewTrackState) {
    this.horizontalLineTop.value = stateData.top

    if (stateData.isSticky) {
      this.stickyFrame.value = stateData.startFrame
    } else {
      this.stickyFrame.value = null
    }
  }

  /**
   * @NOTICE 当拖拽发生时才触发
   *
   * 更新拖拽状态(添加资源到新轨道/添加资源到当前轨道)
   */
  onStateChange = (movingId: string | null) => {
    return (stateData: DraggingStateData | null) => {
      if (stateData === null) {
        this.movingId.value = null
        this.draggingState.value = null
        this.stickyFrame.value = null
        return
      }

      const { state } = stateData
      this.draggingState.value = state
      this.movingId.value = movingId

      switch (state) {
        case DraggingState.ADD_TO_CURRENT_TRACK_STATE:
          this.setAddToCurrentTrackState(stateData)
          break
        case DraggingState.ADD_TO_NEW_TRACK_STATE:
          this.setAddToNewTrackState(stateData)
          break
        default:
          break
      }
    }
  }

  onDragEnd = () => {
    const trackStore = useTrackStore()

    trackStore.disableScroll = false
    trackStore.showPreviewLine = trackStore.enablePreviewLine
    trackList.updatePlayerMaxFrame()
  }
}

export const draggable = new Draggable()
