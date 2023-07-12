import { useTimelineStore } from '@/stores/timeline'
import { useTrackStore } from '@/stores/track'
import { getElementPosition } from '@/services/helpers/dom'
import { computed, reactive, ref, type ComputedRef, type CSSProperties } from 'vue'
import type { TrackItem } from '../track-item/track-item'
import { TrackLineType, type TrackLine, VideoTrackLine } from '../track-line/track-line'
import { trackLineList } from '../track-line-list/track-line-list'
import { TRACK_LINE_INTERVAL, TRACK_STICK_WIDTH } from '@/config'
import { isIntersectionOfTwoIntervals, isNumber, isString } from '../helpers/general'
import {
  LinePosition,
  type DragPosition,
  type TrackPosition,
  type BaseTrackLinePosition,
  type DragOffset,
  type DragStartStore
} from './types'
import { TrackPlaceholder } from './track-placeholder'
import { warn } from '../helpers/warn'

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

  trackLineListRef = ref<HTMLDivElement[]>()
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
      trackLineListRef: this.trackLineListRef,
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

  getCurrentTrackLine(trackLineRef: HTMLDivElement, position: DragPosition) {
    const { y } = position
    const index = Number(trackLineRef.dataset.index)
    const trackLine = trackLineList.list[index]
    const { top } = getElementPosition(trackLineRef, this.trackContentRef.value!)
    const bottomTop = top + trackLine.height
    const isOnTrackLine = y >= top && y <= bottomTop
    const isUnderTrackLine = y >= bottomTop && y <= bottomTop + TRACK_LINE_INTERVAL

    return {
      index,
      trackLineRef,
      trackLine,
      top,
      bottomTop,
      isOnTrackLine,
      isUnderTrackLine
    }
  }

  isInTrackContent(e: PointerEvent) {
    return e.pageX >= this.timelineResourceRefLeft && e.pageY >= this.timelineResourceRefTop
  }

  /**
   * 获取当前拖拽点在轨道中相应的数据
   */
  positionHandler(e: PointerEvent, trackLineListRef: HTMLDivElement[]): TrackPosition | null {
    const trackStore = useTrackStore()
    const timelineStore = useTimelineStore()

    // 如果不是移动状态并且不在可拖放区域
    if (!this.isInTrackContent(e)) {
      return null
    }

    const dragPosition = this.getDragPosition(e)
    const trackPlaceholder = TrackPlaceholder.create(dragPosition, this.dragging!, this.dragOffset)

    const length = trackLineListRef.length
    let closestPixel: number | null = null
    let stickyFrame: number | null = null

    let onTrackLine: TrackLine | null = null
    let onTrackLineTop: number | null = null

    let intervalIndex: number | null = null
    let overIntervalTrackLine: TrackLine | null = null
    let intervalTop: number | null = null
    let overTrackLineTop: number | null = null

    let isIntersection = false

    let mainTrackLineTop = 0

    let blankTopBottomTop = 0
    let blankBottomTop = 0

    let linePositionStatus: LinePosition = LinePosition.OVER_LIST_TOP

    // 遍历所有轨道
    for (let i = 0; i < length; i += 1) {
      const { index, isOnTrackLine, top, bottomTop, isUnderTrackLine, trackLine } =
        this.getCurrentTrackLine(trackLineListRef[i], dragPosition)
      const { trackList } = trackLine

      if (trackLine.type === TrackLineType.MAIN) {
        mainTrackLineTop = top
      }

      // 在所有轨道上方
      if (index === 0) {
        blankTopBottomTop = top

        if (isOver(dragPosition.y, top)) {
          linePositionStatus = LinePosition.OVER_LIST_TOP
        }
      }

      // 在某条轨道
      if (isOnTrackLine) {
        trackPlaceholder.parentTrackLine = trackLine
        linePositionStatus = LinePosition.ON_TRACK_LINE
        onTrackLine = trackLine
        onTrackLineTop = top
      }

      // 在某条轨道下方
      if (isUnderTrackLine) {
        linePositionStatus = LinePosition.ON_TRACK_LINE_INTERVAL
        overIntervalTrackLine = trackLine
        intervalIndex = index + 1
        overTrackLineTop = top
        intervalTop = bottomTop
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

        if (isOnTrackLine || isUnderTrackLine) {
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

    const base: BaseTrackLinePosition = {
      blankTopBottomTop,
      blankBottomTop,
      mainTrackLineTop,
      trackPlaceholder,
      stickyFrame
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
        trackLine: onTrackLine!,
        isIntersection,
        trackLineTop: onTrackLineTop!
      }
    } else if (linePositionStatus === LinePosition.ON_TRACK_LINE_INTERVAL) {
      position = {
        linePosition: LinePosition.ON_TRACK_LINE_INTERVAL,
        ...base,
        overIntervalTrackLine: overIntervalTrackLine!,
        isIntersection,
        intervalIndex: intervalIndex!,
        intervalTop: intervalTop!,
        overTrackLineTop: overTrackLineTop!
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
    const trackStore = useTrackStore()
    let showVerticalLine = false
    let showHorizontalLine = false
    let showTrackPlaceholder = false
    let insertTrackLineIndex: number | null = null

    const trackPlaceholder = position.trackPlaceholder

    const visibleHorizontalLine = () => {
      showHorizontalLine = true
      showTrackPlaceholder = false
    }

    const visibleTrackPlaceholder = () => {
      showHorizontalLine = false
      showTrackPlaceholder = true
    }

    const hideAll = () => {
      showHorizontalLine = false
      showTrackPlaceholder = false
    }

    // 如果 stickyFrame 不为空则是产生了自动吸附
    if (isNumber(position.stickyFrame)) {
      this.updateVerticalLine(position.stickyFrame)
      showVerticalLine = true
    }

    // 轨道中没有任何资源
    if (trackLineList.isEmpty) {
      // 如果在顶部空白区域
      if (position.linePosition === LinePosition.OVER_LIST_TOP) {
        insertTrackLineIndex = 0
        this.updateHorizontalLine(position.blankTopBottomTop - TRACK_LINE_INTERVAL / 2)
        visibleHorizontalLine()
      } else {
        trackPlaceholder.top = position.mainTrackLineTop
        if (trackStore.enableMagnetic) {
          trackPlaceholder.startFrame = 0
        }
        position.trackPlaceholder.setParentTrackLine(trackLineList.mainTrackLine)
        visibleTrackPlaceholder()
      }
    }
    // 当前位置在顶部空白区域
    else if (position.linePosition === LinePosition.OVER_LIST_TOP) {
      insertTrackLineIndex = 0
      this.updateHorizontalLine(position.blankTopBottomTop - TRACK_LINE_INTERVAL / 2)
      visibleHorizontalLine
    }
    // 当前位置在某条 trackLine 上
    else if (position.linePosition === LinePosition.ON_TRACK_LINE) {
      if (position.isIntersection) {
        hideAll()
      } else {
        // 开启了自动磁吸
        if (position.trackLine.type === TrackLineType.MAIN && trackStore.enableMagnetic) {
          trackPlaceholder.startFrame = position.trackLine.getLastFrame(this.dragging!)
        }
        trackPlaceholder.top = position.trackLineTop
        visibleTrackPlaceholder()
      }
    }
    // 当前位置在 trackLine 的 “间隔” 上
    else if (position.linePosition === LinePosition.ON_TRACK_LINE_INTERVAL) {
      // 如果是移动 trackItem 状态
      if (this.moving) {
        insertTrackLineIndex = position.intervalIndex
        this.updateHorizontalLine(position.intervalTop + TRACK_LINE_INTERVAL / 2)
        visibleHorizontalLine()
      }
      // 新插入 trackItem 状态则是插入到上方 trackLine 中，如果有冲突则插入到顶部
      else {
        if (position.isIntersection) {
          insertTrackLineIndex = 0
          this.updateHorizontalLine(position.blankTopBottomTop - TRACK_LINE_INTERVAL / 2)
          visibleHorizontalLine()
        } else {
          insertTrackLineIndex = position.intervalIndex - 1
          trackPlaceholder.top = position.overTrackLineTop
          visibleTrackPlaceholder()
        }
      }
    }
    // 当前位置在 trackLine list 下
    else {
      insertTrackLineIndex = trackLineList.list.length
      this.holderProperty.top = position.mainTrackLineTop
      if (trackStore.enableMagnetic) {
        trackPlaceholder.startFrame = 0
      }
      this.updateHorizontalLine(position.blankBottomTop + TRACK_LINE_INTERVAL / 2)
      visibleHorizontalLine()
    }

    // 把数据更新到响应式对象上，触发更新
    this.holderProperty.startFrame = trackPlaceholder.startFrame
    this.holderProperty.top = trackPlaceholder.top
    this.holderProperty.frameCount = trackPlaceholder.frameCount

    return {
      insertTrackLineIndex,
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

    const position = this.positionHandler(e, this.trackLineListRef.value!)

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

    if (this.dragging) {
      const trackStore = useTrackStore()
      const position = this.positionHandler(e, this.trackLineListRef.value!)

      if (position !== null) {
        const trackPlaceholder = position.trackPlaceholder
        const dragging = this.dragging!

        /**
         * 显示占位符则表示在某条 trackLine 插入当前拖拽的 trackItem
         * 显示水平线则表示在这个位置插入一个新的 trackLine，水平线和插入占位不会同时存在
         * insertTrackLineIndex 不为 null 时，表示插入新的 trackLine
         */
        const { insertTrackLineIndex, showTrackPlaceholder } = this.updateTrackStatus(position)

        dragging.setStartFrame(trackPlaceholder.startFrame)
        dragging.setEndFrame(trackPlaceholder.endFrame)

        if (showTrackPlaceholder) {
          if (trackPlaceholder.parentTrackLine) {
            trackPlaceholder.parentTrackLine.addTrackItem(dragging)
          } else {
            warn('没有设置 parentTrackLine ?')
          }
        }

        if (insertTrackLineIndex !== null) {
          // 插入到底部时，需要把所有的 trackLine 往上移动
          if (insertTrackLineIndex === trackLineList.list.length) {
            // 在主轨道上面插入一条新的 videoTrackLine，并把主轨道的 trackItem 复制进去
            const lastTrackList = trackLineList.list[trackLineList.list.length - 1].trackList
            const trackLine = VideoTrackLine.create()
            trackLineList.insert(trackLine, insertTrackLineIndex - 1)
            trackLine.addTrackItem(lastTrackList)

            trackLineList.mainTrackLine.clearTrackList()
            trackLineList.mainTrackLine.addTrackItem(dragging)
          } else {
            const trackLine = VideoTrackLine.create()
            trackLineList.insert(trackLine, insertTrackLineIndex)
            trackLine.addTrackItem(dragging)
          }
        }
      }

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
    this.removeDraggingTarget()
    this.removeListener()
  }

  onDragStart(
    e: PointerEvent,
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
