import { computed, ref, type ComputedRef, type CSSProperties, reactive } from 'vue'
import { trackLineList } from '@/services/track-line-list/track-line-list'
import { isIntersectionOfTwoIntervals, isNumber } from '@/services/helpers/general'
import { getElementPosition } from '@/services/helpers/dom'
import { useTimelineStore } from '@/stores/timeline'
import { type TrackItem } from '@/services/track-item/track-item'
import { TRACK_LINE_INTERVAL, TRACK_STICK_WIDTH } from '@/config'
import { useTrackStore } from '@/stores/track'
import { TrackLineType, type TrackLine, VideoTrackLine } from '@/services/track-line/track-line'

class HolderRect {
  top: number

  startFrame: number

  frameCount: number

  parentTrackLine: TrackLine | null = null

  get endFrame() {
    return this.startFrame + this.frameCount
  }

  constructor(top: number, startFrame: number, frameCount: number) {
    this.top = top
    this.startFrame = startFrame
    this.frameCount = frameCount
  }

  setParentTrackLine(trackLine: TrackLine) {
    this.parentTrackLine = trackLine
  }

  static create(position: DragPosition, draggingItem: TrackItem) {
    const timelineStore = useTimelineStore()

    let x = position.x
    // 如果是拖动 trackItem，需要以这个被拖动的 trackItem 的 startFrame 作为基准进行计算，而不是以鼠标 x 轴位置进行计算
    if (trackLineList.move && trackLineList.move.dragOffsetX) {
      const newX = x - trackLineList.move.dragOffsetX
      x = newX > 0 ? newX : 0
    }

    return new HolderRect(
      position.y,
      timelineStore.pixelToFrame(x),
      draggingItem.endFrame - draggingItem.startFrame
    )
  }
}

interface DragPosition {
  targetTop: number // 目标元素距离顶部的距离
  targetLeft: number // 目标元素距离
  y: number // 当前鼠标点距离顶部的距离
  x: number //  当前鼠标点距离左边的距离
}

// Y 轴方向上所处的位置
enum LinePosition {
  OVER_LIST_TOP = 'overListTop',
  ON_TRACK_LINE = 'onTrackLine',
  ON_TRACK_LINE_INTERVAL = 'onTrackLineInterval',
  UNDER_LIST_BOTTOM = 'underListBottom'
}

interface BaseTrackLinePosition {
  blankTopBottomTop: number
  blankBottomTop: number
  mainTrackLineTop: number
  holderRect: HolderRect
  draggingItem: TrackItem
  stickyFrame: number | null
}

interface OverListTop extends BaseTrackLinePosition {
  linePosition: LinePosition.OVER_LIST_TOP
}

interface OverTrackLine extends BaseTrackLinePosition {
  linePosition: LinePosition.ON_TRACK_LINE
  trackLine: TrackLine
  isIntersection: boolean
  trackLineTop: number
}

interface OnTrackLineInterval extends BaseTrackLinePosition {
  linePosition: LinePosition.ON_TRACK_LINE_INTERVAL
  isIntersection: boolean
  overIntervalTrackLine: TrackLine
  intervalTop: number
  intervalIndex: number
  overTrackLineTop: number
}

interface UnderListBottom extends BaseTrackLinePosition {
  linePosition: LinePosition.UNDER_LIST_BOTTOM
}

type TrackPosition = OverListTop | OverTrackLine | OnTrackLineInterval | UnderListBottom

const isOver = (y: number, top: number) => y < top

const isUnder = (y: number, top: number) => y > top

export const useDrag = () => {
  const timelineStore = useTimelineStore()
  const trackStore = useTrackStore()

  const trackLineListRef = ref<HTMLDivElement[]>()

  const trackContentRef = ref<HTMLDivElement>()

  const trackPlaceholderRef = ref<HTMLDivElement>()

  const holderProperty = reactive({
    top: 0,
    startFrame: 0,
    frameCount: 0,
    height: 60
  })

  const horizontalLineTop = ref(0)

  const verticalLineFrame = ref(0)

  const horizontalLineStyle: ComputedRef<CSSProperties> = computed(() => ({
    top: `${horizontalLineTop.value}px`
  }))

  const verticalLineStyle: ComputedRef<CSSProperties> = computed(() => ({
    left: timelineStore.frameToPercentWithUnit(verticalLineFrame.value)
  }))

  function updateHorizontalLine(top: number) {
    horizontalLineTop.value = top
  }

  function updateVerticalLine(frame: number) {
    verticalLineFrame.value = frame
  }

  const trackPlaceholderStyle: ComputedRef<CSSProperties> = computed(() => {
    return {
      top: `${holderProperty.top}px`,
      left: timelineStore.frameToPercentWithUnit(holderProperty.startFrame),
      width: timelineStore.frameToPixelWidthWithUnit(holderProperty.frameCount),
      height: `${holderProperty.height}px`
    }
  })

  /**
   * 获取当前拖拽点相对于 track-content 元素的位置
   */
  function getDragPosition(event: DragEvent): DragPosition {
    const { top, left } = getElementPosition(event.target as HTMLElement, trackContentRef.value!)
    const y = top + event.offsetY
    const x = left + event.offsetX

    return {
      targetTop: top,
      targetLeft: left,
      y,
      x
    }
  }

  function getCurrentTrackLine(trackLineRef: HTMLDivElement, position: DragPosition) {
    const { y } = position
    const index = Number(trackLineRef.dataset.index)
    const trackLine = trackLineList.list[index]
    const { top } = getElementPosition(trackLineRef, trackContentRef.value!)
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

  /**
   * 获取当前拖拽点在轨道中相应的数据
   */
  function positionHandler(e: DragEvent, trackLineListRef: HTMLDivElement[]): TrackPosition {
    const draggingItem = trackLineList.getDraggingTrackItem()!

    const dragPosition = getDragPosition(e)
    const holderRect = HolderRect.create(dragPosition, draggingItem)

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
        getCurrentTrackLine(trackLineListRef[i], dragPosition)
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
        holderRect.parentTrackLine = trackLine
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

        if (trackItem.id === draggingItem.id) continue

        if (isOnTrackLine || isUnderTrackLine) {
          isIntersection = isIntersectionOfTwoIntervals(
            [holderRect.startFrame, holderRect.endFrame],
            [trackItem.startFrame, trackItem.endFrame]
          )
        }

        if (trackStore.enableSticky) {
          const startFramePixel = timelineStore.frameToPixel(trackItem.startFrame)
          const endFramePixel = timelineStore.frameToPixel(trackItem.endFrame)
          const holderStartFramePixel = timelineStore.frameToPixel(holderRect.startFrame)
          const holderEndFramePixel = timelineStore.frameToPixel(holderRect.endFrame)

          // trackItem 开始帧和 trackPlaceholder 开始帧产生黏性
          const startToStartDiff = Math.abs(startFramePixel - holderStartFramePixel)
          if (startToStartDiff < TRACK_STICK_WIDTH) {
            if (closestPixel === null || startToStartDiff < closestPixel) {
              closestPixel = startToStartDiff
              holderRect.startFrame = trackItem.startFrame
              stickyFrame = trackItem.startFrame
            }
          }
          // trackItem 结束帧和 trackPlaceholder 开始帧产生黏性
          const endToStartDiff = Math.abs(endFramePixel - holderStartFramePixel)
          if (endToStartDiff < TRACK_STICK_WIDTH) {
            if (closestPixel === null || endToStartDiff < closestPixel) {
              closestPixel = endToStartDiff
              holderRect.startFrame = trackItem.endFrame
              stickyFrame = trackItem.endFrame
            }
          }
          // trackItem 开始帧和 trackPlaceholder 结束帧产生黏性
          const startToEndDiff = Math.abs(startFramePixel - holderEndFramePixel)
          if (startToEndDiff < TRACK_STICK_WIDTH) {
            if (closestPixel === null || startToStartDiff < closestPixel) {
              closestPixel = startToStartDiff
              holderRect.startFrame = trackItem.startFrame - holderRect.frameCount
              stickyFrame = trackItem.startFrame
            }
          }
          // trackItem 结束帧和 trackPlaceholder 结束帧产生黏性
          const endToEndDiff = Math.abs(endFramePixel - holderEndFramePixel)
          if (endToEndDiff < TRACK_STICK_WIDTH) {
            if (closestPixel === null || endToStartDiff < closestPixel) {
              closestPixel = endToStartDiff
              holderRect.startFrame = trackItem.endFrame - holderRect.frameCount
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
      holderRect,
      draggingItem,
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
  function updateTrackStatus(position: TrackPosition) {
    let showVerticalLine = false
    let showHorizontalLine = false
    let showTrackPlaceholder = false
    let insertTrackLineIndex: number | null = null

    const holderRect = position.holderRect

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
      updateVerticalLine(position.stickyFrame)
      showVerticalLine = true
    }

    // 轨道中没有任何资源
    if (trackLineList.isEmpty) {
      // 如果在顶部空白区域
      if (position.linePosition === LinePosition.OVER_LIST_TOP) {
        insertTrackLineIndex = 0
        updateHorizontalLine(position.blankTopBottomTop - TRACK_LINE_INTERVAL / 2)
        visibleHorizontalLine()
      } else {
        holderRect.top = position.mainTrackLineTop
        if (trackStore.enableMagnetic) {
          holderRect.startFrame = 0
        }
        position.holderRect.setParentTrackLine(trackLineList.mainTrackLine)
        visibleTrackPlaceholder()
      }
    }
    // 当前位置在顶部空白区域
    else if (position.linePosition === LinePosition.OVER_LIST_TOP) {
      insertTrackLineIndex = 0
      updateHorizontalLine(position.blankTopBottomTop - TRACK_LINE_INTERVAL / 2)
      visibleHorizontalLine
    }
    // 当前位置在某条 trackLine 上
    else if (position.linePosition === LinePosition.ON_TRACK_LINE) {
      if (position.isIntersection) {
        hideAll()
      } else {
        // 开启了自动磁吸
        if (position.trackLine.type === TrackLineType.MAIN && trackStore.enableMagnetic) {
          holderRect.startFrame = position.trackLine.getLastFrame(position.draggingItem)
        }
        holderRect.top = position.trackLineTop
        visibleTrackPlaceholder()
      }
    }
    // 当前位置在 trackLine 的 “间隔” 上
    else if (position.linePosition === LinePosition.ON_TRACK_LINE_INTERVAL) {
      // 如果是移动 trackItem 状态
      if (trackLineList.move !== null) {
        insertTrackLineIndex = position.intervalIndex
        updateHorizontalLine(position.intervalTop + TRACK_LINE_INTERVAL / 2)
        visibleHorizontalLine()
      }
      // 新插入 trackItem 状态则是插入到上方 trackLine 中，如果有冲突则插入到顶部
      else {
        if (position.isIntersection) {
          insertTrackLineIndex = 0
          console.log(position.blankTopBottomTop - TRACK_LINE_INTERVAL / 2)
          updateHorizontalLine(position.blankTopBottomTop - TRACK_LINE_INTERVAL / 2)
          visibleHorizontalLine()
        } else {
          insertTrackLineIndex = position.intervalIndex - 1
          holderRect.top = position.overTrackLineTop
          visibleTrackPlaceholder()
        }
      }
    }
    // 当前位置在 trackLine list 下
    else {
      insertTrackLineIndex = trackLineList.list.length
      holderProperty.top = position.mainTrackLineTop
      if (trackStore.enableMagnetic) {
        holderRect.startFrame = 0
      }
      updateHorizontalLine(position.blankBottomTop + TRACK_LINE_INTERVAL / 2)
      visibleHorizontalLine()
    }

    // 把数据更新到响应式对象上，触发更新
    holderProperty.startFrame = holderRect.startFrame
    holderProperty.top = holderRect.top
    holderProperty.frameCount = holderRect.frameCount

    return {
      insertTrackLineIndex,
      showVerticalLine,
      showHorizontalLine,
      showTrackPlaceholder
    }
  }

  function onDragover(e: DragEvent) {
    e.preventDefault()

    const position = positionHandler(e, trackLineListRef.value!)

    const { showVerticalLine, showHorizontalLine, showTrackPlaceholder } =
      updateTrackStatus(position)

    trackStore.showVerticalLine = showVerticalLine
    trackStore.showHorizontalLine = showHorizontalLine
    trackStore.showTrackPlaceholder = showTrackPlaceholder
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()

    const position = positionHandler(e, trackLineListRef.value!)
    const holderRect = position.holderRect
    const draggingItem = position.draggingItem

    /**
     * 显示占位符则表示在某条 trackLine 插入当前拖拽的 trackItem
     * 显示水平线则表示在这个位置插入一个新的 trackLine，水平线和插入占位不会同时存在
     * insertTrackLineIndex 不为 null 时，表示插入新的 trackLine
     */
    const { insertTrackLineIndex, showTrackPlaceholder } = updateTrackStatus(position)

    draggingItem.setStartFrame(holderRect.startFrame)
    draggingItem.setEndFrame(holderRect.endFrame)

    if (showTrackPlaceholder) {
      if (holderRect.parentTrackLine) {
        holderRect.parentTrackLine.addTrackItem(draggingItem)
      } else {
        console.log('没有设置 parentTrackLine ?')
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
        trackLineList.mainTrackLine.addTrackItem(draggingItem)
      } else {
        const trackLine = VideoTrackLine.create()
        trackLineList.insert(trackLine, insertTrackLineIndex)
        trackLine.addTrackItem(draggingItem)
      }
    }

    trackStore.showVerticalLine = false
    trackStore.showHorizontalLine = false
    trackStore.showTrackPlaceholder = false
  }

  function onDragleave() {
    trackStore.showVerticalLine = false
    trackStore.showHorizontalLine = false
  }

  return {
    horizontalLineStyle,
    verticalLineStyle,
    trackLineListRef,
    trackContentRef,
    trackPlaceholderRef,
    trackPlaceholderStyle,
    onDragover,
    onDragleave,
    onDrop
  }
}
