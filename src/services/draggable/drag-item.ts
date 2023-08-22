import { TRACK_INTERVAL, TRACK_STICK_WIDTH } from '@/config'
import { findParent, getElementPosition } from '../helpers/dom'
import { isNumber, isString } from '../helpers/general'
import type { TrackItem } from '../track-item'
import { trackList } from '../track-list/track-list'
import {
  TrackDataType,
  type BlankBottomData,
  type BlankTopData,
  type DragOffset,
  type DragOptions,
  type DragPosition,
  type DraggingStateData,
  type TrackData,
  type TrackDataItem,
  type TrackIntervalData,
  type AddToNewTrackState,
  DraggingState,
  type AddToCurrentTrackState,
  type StartMoveTargetAttribute
} from './types'
import { TrackType } from '../track/base-track'
import type { TimelineStore } from '@/stores/timeline'
import type { TrackStore } from '@/stores/track'
import { MoveTrackItemAction } from '../steps-manager/move-track-item-action'
import { AddTrackItemAction } from '../steps-manager/add-track-item-action'

export const INTERVAL_MIDDLE_OFFSET = (TRACK_INTERVAL - 1) / 2

export abstract class DragItem<T extends TrackItem> implements DragOptions<T> {
  readonly dragTarget: HTMLElement
  readonly dragTrackItem: T
  readonly movingId: string | null
  readonly timelineResourceRef: HTMLElement
  readonly dragOffset: DragOffset
  readonly trackListRef: HTMLDivElement[]
  readonly trackContentRef!: HTMLDivElement
  readonly timelineStore: TimelineStore
  readonly trackStore: TrackStore
  readonly onStateChange: (state: DraggingStateData | null) => void
  readonly onDragEnd: (movingId: string | null) => void
  readonly startPointerEvent: PointerEvent

  protected isFirstDrag = true

  protected baseTrackDataList: TrackDataItem[] = []
  protected mainTrackData!: TrackData
  protected mainTrackIntervalData!: TrackIntervalData
  abstract trackDataList: TrackDataItem[]

  private stickyFrameCache: { frame: number; pixel: number }[] = []

  protected addTrackStartFrame = 0
  protected stateData: DraggingStateData | null = null

  protected draggingTarget: HTMLElement | null = null
  private timelineResourceRefLeft = 0
  private timelineResourceRefTop = 0

  private startMoveParentTrackTop = 0

  protected startMoveTargetAttribute: StartMoveTargetAttribute | null = null

  moveTrackItemAction?: MoveTrackItemAction

  constructor(options: DragOptions<T>) {
    this.startPointerEvent = options.startPointerEvent
    this.dragTarget = options.dragTarget
    this.dragTrackItem = options.dragTrackItem
    this.movingId = options.movingId
    this.timelineResourceRef = options.timelineResourceRef
    this.trackListRef = options.trackListRef
    this.dragOffset = options.dragOffset
    this.trackContentRef = options.trackContentRef
    this.timelineStore = options.timelineStore
    this.trackStore = options.trackStore
    this.onStateChange = options.onStateChange
    this.onDragEnd = options.onDragEnd

    this.initBaseTrackListData()
  }

  protected get isMoveTrackItem() {
    return isString(this.movingId)
  }

  abstract draggingHandler: (e: PointerEvent) => void

  abstract dragEndHandler: (e: PointerEvent) => void

  abstract addListener(): void

  abstract removeListener(): void

  abstract destroy(): void

  abstract [TrackDataType.BLANK_TOP](trackData: BlankTopData, startFrame: number): void

  abstract [TrackDataType.TRACK](trackData: TrackData, startFrame: number): void

  abstract [TrackDataType.TRACK_INTERVAL](trackData: TrackIntervalData, startFrame: number): void

  abstract [TrackDataType.BLANK_BOTTOM](trackData: BlankBottomData, startFrame: number): void

  isInTrackContent(e: PointerEvent) {
    return e.pageX >= this.timelineResourceRefLeft && e.pageY >= this.timelineResourceRefTop
  }

  isOver(y: number, compareTop: number) {
    return y < compareTop
  }

  isOverOrEqual(y: number, compareTop: number) {
    return y <= compareTop
  }

  isUnder(y: number, compareTop: number) {
    return y > compareTop
  }

  isUnderOrEqual(y: number, compareTop: number) {
    return y >= compareTop
  }

  cacheCompareStickyFrame(trackItemList: TrackItem[]) {
    const { frameToPixel } = this.timelineStore
    this.stickyFrameCache.push({
      pixel: 0,
      frame: 0
    })

    for (const trackItem of trackItemList) {
      if (trackItem.id === this.dragTrackItem.id) continue

      this.stickyFrameCache.push(
        {
          pixel: frameToPixel(trackItem.startFrame),
          frame: trackItem.startFrame
        },
        {
          pixel: frameToPixel(trackItem.endFrame),
          frame: trackItem.endFrame
        }
      )
    }
  }

  initBaseTrackListData() {
    const baseTrackDataList: TrackDataItem[] = []

    const position = getElementPosition(this.timelineResourceRef, this.trackContentRef)

    for (const trackRef of this.trackListRef) {
      const { top } = getElementPosition(trackRef, this.trackContentRef)
      const index = Number(trackRef.dataset.index)
      const track = trackList.list[index]
      const bottomTop = top + track.height - 1

      this.cacheCompareStickyFrame(track.trackItemList)

      const trackData: TrackData = {
        type: TrackDataType.TRACK,
        top,
        bottomTop,
        track,
        trackType: track.type,
        trackRef,
        index,
        overIntervalMiddleTop: top - INTERVAL_MIDDLE_OFFSET - 1,
        underIntervalMiddleTop: bottomTop + INTERVAL_MIDDLE_OFFSET + 1
      }

      baseTrackDataList.push(trackData)

      const intervalTop = bottomTop + 1
      const intervalBottomTop = intervalTop + TRACK_INTERVAL - 1
      const trackIntervalData: TrackIntervalData = {
        type: TrackDataType.TRACK_INTERVAL,
        top: intervalTop,
        middleTop: intervalTop + INTERVAL_MIDDLE_OFFSET,
        bottomTop: intervalBottomTop,
        overTrack: track,
        overTrackType: track.type,
        overTrackRef: trackRef,
        overTrackIndex: index
      }
      baseTrackDataList.push(trackIntervalData)

      if (track.type === TrackType.MAIN) {
        this.mainTrackData = trackData
        this.mainTrackIntervalData = trackIntervalData
      }

      if (index === 0) {
        baseTrackDataList.unshift({
          type: TrackDataType.BLANK_TOP,
          top: position.top,
          bottomTop: top - 1,
          overBottomIntervalTop: top - 1 - INTERVAL_MIDDLE_OFFSET
        })
      }

      if (index === this.trackListRef.length - 1) {
        const { height } = this.timelineResourceRef.getBoundingClientRect()
        baseTrackDataList.push({
          type: TrackDataType.BLANK_BOTTOM,
          top: intervalBottomTop + 1,
          bottomTop: position.top + height - 1
        })
      }

      if (this.isMoveTrackItem && this.startPointerEvent) {
        const { y } = this.getDragPosition(this.startPointerEvent)!
        this.startMoveParentTrackTop = y
      }
    }

    this.baseTrackDataList = baseTrackDataList.sort((a, b) => a.top - b.top)
  }

  protected resetMoveTargetAttribute() {
    if (this.startMoveTargetAttribute) {
      const { top, left, width, height, zIndex } = this.startMoveTargetAttribute

      this.dragTarget.style.top = top
      this.dragTarget.style.left = left
      this.dragTarget.style.width = width
      this.dragTarget.style.height = height
      this.dragTarget.style.zIndex = zIndex

      this.startMoveTargetAttribute = null
    }
  }

  private initMoveTargetAttribute() {
    if (this.startMoveTargetAttribute) return

    const { top, left, width, height, zIndex } = this.dragTarget.style

    this.startMoveTargetAttribute = {
      top,
      left,
      width,
      height,
      zIndex
    }

    const { width: rectWidth, height: rectHeight } = this.dragTarget.getBoundingClientRect()
    this.dragTarget.style.width = `${rectWidth}px`
    this.dragTarget.style.height = `${rectHeight}px`
    this.dragTarget.style.zIndex = '1'
  }

  private initDraggingTarget(e: PointerEvent) {
    if (this.draggingTarget) return

    const { top, left } = this.timelineResourceRef.getBoundingClientRect()
    this.timelineResourceRefLeft = left
    this.timelineResourceRefTop = top

    const cloneNode = this.dragTarget.cloneNode(true)
    if (cloneNode instanceof HTMLElement) {
      const { width, height } = this.dragTarget.getBoundingClientRect()
      cloneNode.style.position = 'fixed'
      cloneNode.style.pointerEvents = 'none'
      cloneNode.style.width = `${width}px`
      cloneNode.style.height = `${height}px`
      cloneNode.style.zIndex = '1'
      document.body.appendChild(cloneNode)

      this.draggingTarget = cloneNode
      this.updateDraggingTargetPosition({ x: e.pageX, y: e.pageY })
    }
  }

  /**
   * 第一次移动时初始化
   */
  protected initFirstDrag(e: PointerEvent) {
    if (this.isFirstDrag) {
      this.isFirstDrag = false
      this.moveTrackItemAction = new MoveTrackItemAction(this.dragTrackItem)
    }

    if (this.isMoveTrackItem) {
      this.initMoveTargetAttribute()
    } else {
      this.initDraggingTarget(e)
    }
  }

  protected updateMoveTargetPosition(x: number, y: number) {
    if (this.isMoveTrackItem && this.startMoveTargetAttribute) {
      const { offsetX } = this.dragOffset
      const left = x - offsetX
      this.dragTarget.style.top = `${y - this.startMoveParentTrackTop}px`
      this.dragTarget.style.left = `${left > 0 ? left : 0}px`
    }
  }

  protected updateDraggingTargetPosition({ x, y }: { x: number; y: number }) {
    if (this.draggingTarget) {
      const { offsetX, offsetY } = this.dragOffset
      let left = x - offsetX
      if (this.isMoveTrackItem && left < this.timelineResourceRefLeft) {
        left = this.timelineResourceRefLeft
      }

      this.draggingTarget.style.top = `${y - offsetY}px`
      this.draggingTarget.style.left = `${left}px`
    }
  }

  /**
   * 获取当前拖拽点相对于 track-content 元素的位置
   */
  protected getDragPosition(event: PointerEvent): DragPosition | null {
    const { trackContentRef } = this
    const target = event.target as HTMLElement
    if (!findParent(target, (el) => el === trackContentRef)) {
      return null
    }

    const { top, left } = getElementPosition(event.target as HTMLElement, trackContentRef)
    const y = top + event.offsetY
    const x = left + event.offsetX

    return {
      targetTop: top,
      targetLeft: left,
      y,
      x
    }
  }

  protected xToFrame(x: number) {
    return this.timelineStore.pixelToFrame(x - this.dragOffset.offsetX)
  }

  /**
   * 获取产生吸附的帧
   *
   * @param {number} frame 当前鼠标所在位置上的帧
   * @returns {number | null} 如果存在满足吸附条件的则返回 number 如果不满足则返回 null
   */
  protected getStickyStartFrame(frame: number): number | null {
    if (!this.trackStore.enableSticky) return null

    const { frameToPixel } = this.timelineStore
    const x = frameToPixel(frame)
    let stickyFrame: number | null = null
    let closestDiff: number | null = null

    for (const { frame, pixel } of this.stickyFrameCache) {
      const diff = Math.abs(x - pixel)
      if (diff < TRACK_STICK_WIDTH) {
        if (closestDiff === null || diff < closestDiff) {
          closestDiff = diff
          stickyFrame = frame
        }
      }
    }

    return stickyFrame
  }

  /**
   * 获取产生吸附的帧(根据范围判断,可能开始产生吸附也可能结束产生吸附)
   *
   * @param {number} startFrame
   * @param {number} endFrame
   * @returns 没有产生吸附时返回 null isStartSticky 表示开始帧产生吸附
   */
  protected getStickyStartFrameWidthInterval(
    startFrame: number,
    endFrame: number
  ): { isStartSticky: boolean; stickyFrame: number } | null {
    if (!this.trackStore.enableSticky) return null

    const { frameToPixel } = this.timelineStore
    const startX = frameToPixel(startFrame)
    const endX = frameToPixel(endFrame)
    let stickyFrame: number | null = null
    let closestDiff: number | null = null
    let isStartSticky = false

    for (const { frame, pixel } of this.stickyFrameCache) {
      const startDiff = Math.abs(startX - pixel)
      if (startDiff < TRACK_STICK_WIDTH) {
        if (closestDiff === null || startDiff < closestDiff) {
          closestDiff = startDiff
          stickyFrame = frame
          isStartSticky = true
        }
      }

      const endDiff = Math.abs(endX - pixel)
      if (endDiff < TRACK_STICK_WIDTH) {
        if (closestDiff === null || endDiff < closestDiff) {
          closestDiff = startDiff
          stickyFrame = frame
          isStartSticky = false
        }
      }
    }

    return isNumber(stickyFrame)
      ? {
          isStartSticky,
          stickyFrame
        }
      : null
  }

  /**
   * 设置添加资源到一个新的轨道的状态
   */
  protected setAddToNewTrackState(stateData: Omit<AddToNewTrackState, 'state'>) {
    const stickyFrame = this.getStickyStartFrame(stateData.startFrame)
    const data: AddToNewTrackState = {
      state: DraggingState.ADD_TO_NEW_TRACK_STATE,
      isSticky: isNumber(stickyFrame),
      ...stateData,
      startFrame: isNumber(stickyFrame) ? stickyFrame : stateData.startFrame
    }
    this.stateData = data
    this.onStateChange(data)
  }

  /**
   * 设置添加资源到当前轨道的状态
   */
  protected setAddToCurrentTrackState(
    stateData: Omit<AddToCurrentTrackState, 'state' | 'stickyInfo'>
  ) {
    let { startFrame } = stateData
    const { widthFrame } = stateData

    const stickyInfo = this.getStickyStartFrameWidthInterval(startFrame, startFrame + widthFrame)
    if (stickyInfo) {
      const { isStartSticky, stickyFrame } = stickyInfo
      startFrame = isStartSticky ? stickyFrame : stickyFrame - widthFrame
    }

    const data: AddToCurrentTrackState = {
      state: DraggingState.ADD_TO_CURRENT_TRACK_STATE,
      ...stateData,
      startFrame,
      stickyInfo
    }

    this.stateData = data
    this.onStateChange(data)
  }

  protected addDragEndAction() {
    setTimeout(() => {
      if (this.movingId === null) {
        new AddTrackItemAction(this.dragTrackItem.toData())
      } else {
        this.moveTrackItemAction?.end()
      }
    })
  }
}
