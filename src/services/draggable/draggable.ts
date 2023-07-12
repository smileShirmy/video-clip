import { useTimelineStore } from '@/stores/timeline'
import { useTrackStore } from '@/stores/track'
import { getElementPosition } from '@/services/helpers/dom'
import { computed, reactive, ref, type ComputedRef, type CSSProperties } from 'vue'
import { trackList } from '../track-list/track-list'
import { TRACK_LINE_INTERVAL, TRACK_STICK_WIDTH } from '@/config'
import { isIntersectionOfTwoIntervals, isNumber, isString } from '../helpers/general'
import {
  LinePosition,
  type DragPosition,
  type TrackPosition,
  type BaseTrackPosition,
  type DragOffset,
  type DragStartStore
} from './types'
import { TrackPlaceholder } from './track-placeholder'
import { warn } from '../helpers/warn'
import type { TrackItem } from '../track-item'
import { VideoTrackItem } from '../track-item/video-item'
import type { Track } from '../track'
import { TrackType } from '../track/base-track'
import { VideoTrack } from '../track/video-track'
import { MainTrack } from '../track/main-track'

const isOver = (y: number, top: number) => y < top

const isUnder = (y: number, top: number) => y > top

class Draggable {
  private draggingTarget: HTMLElement | null = null

  // 缓存需要拖动目标的数据，正式拖动的时候才使用
  private dragStartStore: DragStartStore = {
    dragTarget: null,
    dragging: null,
    movingId: null
  }

  trackListRef = ref<HTMLDivElement[]>()
  trackContentRef = ref<HTMLDivElement>()
  trackPlaceholderRef = ref<HTMLDivElement>()
  timelineResourceRef = ref<HTMLDivElement>()

  verticalLineFrame = ref(0)
  horizontalLineTop = ref(0)

  // 正在移动的 trackItem id（只有移动时才不为 null）
  movingId = ref<string | null>(null)

  // 正在拖拽的 trackItem（可能是移动的，也可能是新创建的）
  dragging: TrackItem | null = null

  // 是否正在调整 trackItem 的大小
  resizing = false

  dragOffset: DragOffset = { offsetX: 0, offsetY: 0 }

  timelineResourceRefTop = 0
  timelineResourceRefLeft = 0

  holderProperty = reactive({
    top: 0,
    startFrame: 0,
    frameCount: 0,
    height: 60
  })

  get moving(): boolean {
    return isString(this.movingId.value)
  }

  setup() {
    const timelineStore = useTimelineStore()

    const horizontalLineStyle: ComputedRef<CSSProperties> = computed(() => ({
      top: `${this.horizontalLineTop.value}px`
    }))

    const verticalLineStyle: ComputedRef<CSSProperties> = computed(() => ({
      left: timelineStore.frameToPercentWithUnit(this.verticalLineFrame.value)
    }))

    const trackPlaceholderStyle: ComputedRef<CSSProperties> = computed(() => {
      return {
        top: `${this.holderProperty.top}px`,
        left: timelineStore.frameToPercentWithUnit(this.holderProperty.startFrame),
        width: timelineStore.frameToPixelWidthWithUnit(this.holderProperty.frameCount),
        height: `${this.holderProperty.height}px`
      }
    })

    return {
      horizontalLineStyle,
      verticalLineStyle,
      trackPlaceholderStyle,
      trackContentRef: this.trackContentRef,
      timelineResourceRef: this.timelineResourceRef,
      trackListRef: this.trackListRef,
      trackPlaceholderRef: this.trackPlaceholderRef
    }
  }

  setTargetPosition({ x, y }: { x: number; y: number }) {
    if (this.draggingTarget) {
      const { offsetX, offsetY } = this.dragOffset
      let left = x - offsetX
      if (this.moving && left < this.timelineResourceRefLeft) {
        left = this.timelineResourceRefLeft
      }
      this.draggingTarget.style.left = `${left}px`
      this.draggingTarget.style.top = `${y - offsetY}px`
    }
  }

  /**
   * 初始化拖拽，当第一次移动的时才进行初始化
   */
  initDraggable(e: PointerEvent) {
    const { dragTarget, movingId, dragging } = this.dragStartStore

    if (!dragTarget) return

    const { top, left } = this.timelineResourceRef.value!.getBoundingClientRect()
    this.timelineResourceRefLeft = left
    this.timelineResourceRefTop = top

    this.movingId.value = movingId
    this.dragging = dragging

    const cloneNode = dragTarget.cloneNode(true)
    if (cloneNode instanceof HTMLElement) {
      const { width, height } = dragTarget.getBoundingClientRect()
      cloneNode.style.position = 'fixed'
      cloneNode.style.pointerEvents = 'none'
      cloneNode.style.width = `${width}px`
      cloneNode.style.height = `${height}px`
      cloneNode.style.zIndex = '1'
      this.draggingTarget = cloneNode

      this.setTargetPosition({ x: e.pageX, y: e.pageY })
      this.appendToBody(this.draggingTarget)
    }
  }

  updateVerticalLine(frame: number) {
    this.verticalLineFrame.value = frame
  }

  updateHorizontalLine(top: number) {
    this.horizontalLineTop.value = top
  }

  /**
   * 获取当前拖拽点相对于 track-content 元素的位置
   */
  getDragPosition(event: PointerEvent): DragPosition {
    const { top, left } = getElementPosition(
      event.target as HTMLElement,
      this.trackContentRef.value!
    )
    const y = top + event.offsetY
    const x = left + event.offsetX

    return {
      targetTop: top,
      targetLeft: left,
      y,
      x
    }
  }

  getCurrentTrack(trackRef: HTMLDivElement, position: DragPosition) {
    const { y } = position
    const index = Number(trackRef.dataset.index)
    const track = trackList.list[index]
    const { top } = getElementPosition(trackRef, this.trackContentRef.value!)
    const bottomTop = top + track.height
    const isOnTrack = y >= top && y <= bottomTop
    const isUnderTrack = y >= bottomTop && y <= bottomTop + TRACK_LINE_INTERVAL

    return {
      index,
      trackRef,
      track,
      top,
      bottomTop,
      isOnTrack,
      isUnderTrack
    }
  }

  isInTrackContent(e: PointerEvent) {
    return e.pageX >= this.timelineResourceRefLeft && e.pageY >= this.timelineResourceRefTop
  }

  /**
   * 获取当前拖拽点在轨道中相应的数据
   */
  positionHandler(e: PointerEvent, trackListRef: HTMLDivElement[]): TrackPosition | null {
    const trackStore = useTrackStore()
    const timelineStore = useTimelineStore()

    // 如果不是移动状态并且不在可拖放区域
    if (!this.isInTrackContent(e)) {
      return null
    }

    const dragPosition = this.getDragPosition(e)
    const trackPlaceholder = TrackPlaceholder.create(dragPosition, this.dragging!, this.dragOffset)

    const length = trackListRef.length
    let closestPixel: number | null = null
    let stickyFrame: number | null = null

    let onTrack: Track | null = null
    let onTrackTop: number | null = null
    let onTrackIndex: number | null = null

    let intervalIndex: number | null = null
    let overIntervalTrack: Track | null = null
    let intervalTop: number | null = null
    let overTrackTop: number | null = null

    let isIntersection = false

    let mainTrackTop = 0
    let mainTrackIndex = 0

    let blankTopBottomTop = 0
    let blankBottomTop = 0

    let linePositionStatus: LinePosition = LinePosition.OVER_LIST_TOP

    // 遍历所有轨道
    for (let i = 0; i < length; i += 1) {
      const { index, isOnTrack, top, bottomTop, isUnderTrack, track } = this.getCurrentTrack(
        trackListRef[i],
        dragPosition
      )
      const { trackList } = track

      if (track.type === TrackType.MAIN) {
        mainTrackTop = top
        mainTrackIndex = index
      }

      // 在所有轨道上方
      if (index === 0) {
        blankTopBottomTop = top

        if (isOver(dragPosition.y, top)) {
          linePositionStatus = LinePosition.OVER_LIST_TOP
        }
      }

      // 在某条轨道
      if (isOnTrack) {
        trackPlaceholder.parentTrack = track
        trackPlaceholder.height = track.height
        linePositionStatus = LinePosition.ON_TRACK_LINE
        onTrack = track
        onTrackTop = top
        onTrackIndex = index
      }

      // 在某条轨道下方
      if (isUnderTrack) {
        linePositionStatus = LinePosition.ON_TRACK_LINE_INTERVAL
        overIntervalTrack = track
        intervalIndex = index + 1
        overTrackTop = top
        intervalTop = bottomTop
        trackPlaceholder.height = track.height
      }

      // 在所有轨道下方
      if (index === length - 1) {
        blankBottomTop = bottomTop

        if (isUnder(dragPosition.y, bottomTop)) {
          linePositionStatus = LinePosition.UNDER_LIST_BOTTOM
        }
      }

      for (let j = 0; j < trackList.length; j += 1) {
        const trackItem = trackList[j]

        if (trackItem.id === this.dragging!.id) continue

        if (isOnTrack || isUnderTrack) {
          isIntersection = isIntersectionOfTwoIntervals(
            [trackPlaceholder.startFrame, trackPlaceholder.endFrame],
            [trackItem.startFrame, trackItem.endFrame]
          )
        }

        if (trackStore.enableSticky) {
          const startFramePixel = timelineStore.frameToPixel(trackItem.startFrame)
          const endFramePixel = timelineStore.frameToPixel(trackItem.endFrame)
          const holderStartFramePixel = timelineStore.frameToPixel(trackPlaceholder.startFrame)
          const holderEndFramePixel = timelineStore.frameToPixel(trackPlaceholder.endFrame)

          // trackItem 开始帧和 trackPlaceholder 开始帧产生黏性
          const startToStartDiff = Math.abs(startFramePixel - holderStartFramePixel)
          if (startToStartDiff < TRACK_STICK_WIDTH) {
            if (closestPixel === null || startToStartDiff < closestPixel) {
              closestPixel = startToStartDiff
              trackPlaceholder.startFrame = trackItem.startFrame
              stickyFrame = trackItem.startFrame
            }
          }
          // trackItem 结束帧和 trackPlaceholder 开始帧产生黏性
          const endToStartDiff = Math.abs(endFramePixel - holderStartFramePixel)
          if (endToStartDiff < TRACK_STICK_WIDTH) {
            if (closestPixel === null || endToStartDiff < closestPixel) {
              closestPixel = endToStartDiff
              trackPlaceholder.startFrame = trackItem.endFrame
              stickyFrame = trackItem.endFrame
            }
          }
          // trackItem 开始帧和 trackPlaceholder 结束帧产生黏性
          const startToEndDiff = Math.abs(startFramePixel - holderEndFramePixel)
          if (startToEndDiff < TRACK_STICK_WIDTH) {
            if (closestPixel === null || startToStartDiff < closestPixel) {
              closestPixel = startToStartDiff
              trackPlaceholder.startFrame = trackItem.startFrame - trackPlaceholder.frameCount
              stickyFrame = trackItem.startFrame
            }
          }
          // trackItem 结束帧和 trackPlaceholder 结束帧产生黏性
          const endToEndDiff = Math.abs(endFramePixel - holderEndFramePixel)
          if (endToEndDiff < TRACK_STICK_WIDTH) {
            if (closestPixel === null || endToStartDiff < closestPixel) {
              closestPixel = endToStartDiff
              trackPlaceholder.startFrame = trackItem.endFrame - trackPlaceholder.frameCount
              stickyFrame = trackItem.endFrame
            }
          }
        }
      }
    }

    const base: BaseTrackPosition = {
      blankTopBottomTop,
      blankBottomTop,
      mainTrackTop,
      trackPlaceholder,
      stickyFrame,
      mainTrackIndex
    }

    let position: TrackPosition | null = null

    if (linePositionStatus === LinePosition.OVER_LIST_TOP) {
      position = {
        linePosition: LinePosition.OVER_LIST_TOP,
        ...base
      }
    } else if (linePositionStatus === LinePosition.ON_TRACK_LINE) {
      position = {
        linePosition: LinePosition.ON_TRACK_LINE,
        ...base,
        trackIndex: onTrackIndex!,
        track: onTrack!,
        isIntersection,
        trackTop: onTrackTop!
      }
    } else if (linePositionStatus === LinePosition.ON_TRACK_LINE_INTERVAL) {
      position = {
        linePosition: LinePosition.ON_TRACK_LINE_INTERVAL,
        ...base,
        overIntervalTrack: overIntervalTrack!,
        isIntersection,
        intervalIndex: intervalIndex!,
        intervalTop: intervalTop!,
        overTrackTop: overTrackTop!
      }
    } else {
      position = {
        linePosition: LinePosition.UNDER_LIST_BOTTOM,
        ...base
      }
    }

    return position
  }

  /**
   * 根据当前拖拽点所在位置数据更新轨道拖拽过程中的状态
   */
  updateTrackStatus(position: TrackPosition) {
    const dragging = this.dragging
    const trackStore = useTrackStore()
    let showVerticalLine = false
    let showHorizontalLine = false
    let showTrackPlaceholder = false
    let insertTrackIndex: number | null = null

    const trackPlaceholder = position.trackPlaceholder

    const visibleHorizontalLine = () => {
      showHorizontalLine = true
      showTrackPlaceholder = false
    }

    const visibleTrackPlaceholder = () => {
      showHorizontalLine = false
      showTrackPlaceholder = true
    }

    // 如果 stickyFrame 不为空则是产生了自动吸附
    if (isNumber(position.stickyFrame)) {
      this.updateVerticalLine(position.stickyFrame)
      showVerticalLine = true
    }

    // 插入到顶部
    const addToBlankTop = () => {
      insertTrackIndex = 0
      this.updateHorizontalLine(position.blankTopBottomTop - TRACK_LINE_INTERVAL / 2)
      visibleHorizontalLine()
    }

    // 轨道中没有任何资源
    if (trackList.isEmpty) {
      if (this.dragging instanceof VideoTrackItem) {
        // 如果在顶部空白区域则添加到顶部
        if (position.linePosition === LinePosition.OVER_LIST_TOP) {
          addToBlankTop()
        } else {
          trackPlaceholder.top = position.mainTrackTop
          if (trackStore.enableMagnetic) {
            trackPlaceholder.startFrame = 0
          }
          position.trackPlaceholder.setParentTrack(trackList.mainTrack)
          visibleTrackPlaceholder()
        }
      } else {
        addToBlankTop()
      }
    }
    // 当前位置在顶部空白区域
    else if (position.linePosition === LinePosition.OVER_LIST_TOP) {
      insertTrackIndex = 0
      this.updateHorizontalLine(position.blankTopBottomTop - TRACK_LINE_INTERVAL / 2)
      visibleHorizontalLine()
    }
    // 当前位置在某条 track 上
    else if (position.linePosition === LinePosition.ON_TRACK_LINE) {
      // 在主轨道上
      if (position.track.type === TrackType.MAIN) {
        if (dragging instanceof VideoTrackItem) {
          // 开启了自动磁吸
          if (trackStore.enableMagnetic) {
            trackPlaceholder.startFrame = position.track.getLastFrame(dragging!)
            trackPlaceholder.top = position.trackTop
            visibleTrackPlaceholder()
          } else {
            addToBlankTop()
          }
        }
        // 其他类型资源则添加到主轨道上方
        else {
          insertTrackIndex = position.trackIndex - 1
          this.updateHorizontalLine(position.trackTop - TRACK_LINE_INTERVAL / 2)
          visibleHorizontalLine()
        }
      }
      // 不在主轨道上
      else {
        if (position.isIntersection) {
          insertTrackIndex = 0
          this.updateHorizontalLine(position.blankTopBottomTop - TRACK_LINE_INTERVAL / 2)
          visibleHorizontalLine()
        } else {
          trackPlaceholder.top = position.trackTop
          visibleTrackPlaceholder()
        }
      }
    }
    // 当前位置在 track 的 “间隔” 上
    else if (position.linePosition === LinePosition.ON_TRACK_LINE_INTERVAL) {
      // 如果是移动 trackItem 状态
      if (this.moving) {
        insertTrackIndex = position.intervalIndex
        this.updateHorizontalLine(position.intervalTop + TRACK_LINE_INTERVAL / 2)
        visibleHorizontalLine()
      }
      // 新插入 trackItem 状态则是插入到上方 track 中，如果有冲突则插入到顶部
      else {
        if (position.isIntersection) {
          insertTrackIndex = position.intervalIndex - 2
          this.updateHorizontalLine(position.blankTopBottomTop - TRACK_LINE_INTERVAL / 2)
          visibleHorizontalLine()
        } else {
          insertTrackIndex = position.intervalIndex - 1
          trackPlaceholder.top = position.overTrackTop
          visibleTrackPlaceholder()
        }
      }
    }
    // 当前位置在 track list 下
    else {
      if (dragging instanceof VideoTrackItem) {
        if (trackStore.enableMagnetic) {
          trackPlaceholder.startFrame = 0
        }
        insertTrackIndex = trackList.list.length
        this.updateHorizontalLine(position.blankBottomTop + TRACK_LINE_INTERVAL / 2)
        visibleHorizontalLine()
      }
      // 如果是其他资源则插入到主轨道上方
      else {
        insertTrackIndex = position.mainTrackIndex
        this.updateHorizontalLine(position.mainTrackTop - TRACK_LINE_INTERVAL / 2)
        visibleHorizontalLine()
      }
    }

    // 把数据更新到响应式对象上，触发更新
    this.holderProperty.startFrame = trackPlaceholder.startFrame
    this.holderProperty.height = trackPlaceholder.height
    this.holderProperty.top = trackPlaceholder.top
    this.holderProperty.frameCount = trackPlaceholder.frameCount

    return {
      insertTrackIndex,
      showVerticalLine,
      showHorizontalLine,
      showTrackPlaceholder
    }
  }

  onDragging = (e: PointerEvent) => {
    e.preventDefault()

    // 第一次拖动时初始化
    if (!this.draggingTarget) {
      this.initDraggable(e)
    }

    const trackStore = useTrackStore()
    this.setTargetPosition({ x: e.pageX, y: e.pageY })

    const position = this.positionHandler(e, this.trackListRef.value!)

    if (position === null) {
      trackStore.showVerticalLine = false
      trackStore.showHorizontalLine = false
      trackStore.showTrackPlaceholder = false
      return
    }

    const { showVerticalLine, showHorizontalLine, showTrackPlaceholder } =
      this.updateTrackStatus(position)

    trackStore.showVerticalLine = showVerticalLine
    trackStore.showHorizontalLine = showHorizontalLine
    trackStore.showTrackPlaceholder = showTrackPlaceholder
  }

  onDragEnd = (e: PointerEvent) => {
    e.preventDefault()

    const trackStore = useTrackStore()
    const dragging = this.dragging!

    if (dragging) {
      const position = this.positionHandler(e, this.trackListRef.value!)

      if (position !== null) {
        const trackPlaceholder = position.trackPlaceholder

        /**
         * 显示占位符则表示在某条 track 插入当前拖拽的 trackItem
         * 显示水平线则表示在这个位置插入一个新的 track，水平线和插入占位不会同时存在
         * insertTrackIndex 不为 null 时，表示插入新的 track
         */
        const { insertTrackIndex, showTrackPlaceholder } = this.updateTrackStatus(position)

        dragging.setStartFrame(trackPlaceholder.startFrame)
        dragging.setEndFrame(trackPlaceholder.endFrame)

        if (showTrackPlaceholder) {
          const { parentTrack } = trackPlaceholder
          if (parentTrack) {
            if (parentTrack instanceof MainTrack) {
              // 只有 videoTrackItem 才能放进主轨道
              if (dragging instanceof VideoTrackItem) {
                parentTrack.addTrackItem(dragging)
              }
            } else {
              parentTrack.addTrackItem(dragging)
            }
          } else {
            warn('没有设置 parentTrack ?')
          }
        }

        if (insertTrackIndex !== null) {
          // 插入到底部时，需要把所有的 track 往上移动
          if (dragging instanceof VideoTrackItem && insertTrackIndex === trackList.list.length) {
            // 在主轨道上面插入一条新的 videoTrack，并把主轨道的 trackItem 复制进去
            const lastTrack = trackList.list[trackList.list.length - 1]
            const lastTrackList = lastTrack.trackList
            const track = VideoTrack.create({ height: lastTrack.height })
            trackList.insert(track, insertTrackIndex - 1)
            track.addTrackItem(lastTrackList)

            trackList.mainTrack.clearTrackList()
            trackList.mainTrack.addTrackItem(dragging)
          }
          // 直接插入
          else {
            const track = VideoTrack.create({
              height: dragging instanceof VideoTrackItem ? 60 : 24
            })
            trackList.insert(track, insertTrackIndex)
            track.addTrackItem(dragging)
          }
        }
      }

      trackStore.disableScroll = false
      trackStore.showVerticalLine = false
      trackStore.showHorizontalLine = false
      trackStore.showTrackPlaceholder = false
    }

    // 恢复成未拖拽状态
    this.dragging = null
    this.movingId.value = null
    this.dragStartStore.dragTarget = null
    this.dragStartStore.dragging = null
    this.dragStartStore.movingId = null
    this.dragOffset = { offsetX: 0, offsetY: 0 }
    if (trackStore.enablePreviewLine) {
      trackStore.showPreviewLine = true
    }
    this.removeDraggingTarget()
    this.removeListener()
  }

  onDragStart(
    e: PointerEvent | MouseEvent,
    dragTarget: HTMLElement,
    dragging: TrackItem,
    movingId: string | null = null,
    dragOffset: DragOffset = { offsetX: 0, offsetY: 0 }
  ) {
    e.preventDefault()

    const trackStore = useTrackStore()

    this.dragOffset = dragOffset

    this.dragStartStore.dragTarget = dragTarget
    this.dragStartStore.dragging = dragging
    this.dragStartStore.movingId = movingId

    trackStore.disableScroll = true
    trackStore.showPreviewLine = false

    this.addListener()
  }

  appendToBody(target: HTMLElement) {
    document.body.appendChild(target)
  }

  removeDraggingTarget() {
    if (this.draggingTarget) {
      this.draggingTarget.remove()
      this.draggingTarget = null
    }
  }

  addListener() {
    window.addEventListener('pointermove', this.onDragging)
    window.addEventListener('pointerup', this.onDragEnd)
  }

  removeListener() {
    window.removeEventListener('pointermove', this.onDragging)
    window.removeEventListener('pointerup', this.onDragEnd)
  }
}

export const draggable = new Draggable()
