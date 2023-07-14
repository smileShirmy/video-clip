import { TRACK_INTERVAL } from '@/config'
import { getElementPosition } from '../helpers/dom'
import { isString } from '../helpers/general'
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
  type AddToCurrentTrackState
} from './types'
import { TrackType } from '../track/base-track'
import type { TimelineStore } from '@/stores/timeline'
import type { TrackStore } from '@/stores/track'

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
  readonly onDragEnd: () => void

  protected baseTrackDataList: TrackDataItem[] = []
  protected mainTrackData!: TrackData
  abstract trackDataList: TrackDataItem[]

  allTrackItem: TrackItem[] = []

  protected addTrackStartFrame = 0
  protected stateData: DraggingStateData | null = null

  protected draggingTarget: HTMLElement | null = null
  private timelineResourceRefLeft = 0
  private timelineResourceRefTop = 0

  constructor(options: DragOptions<T>) {
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

  isSticky() {
    for (const trackItem of this.allTrackItem) {
      if (trackItem.id === this.dragTrackItem.id) continue
    }
  }

  initBaseTrackListData() {
    const baseTrackDataList: TrackDataItem[] = []

    const position = getElementPosition(this.timelineResourceRef, this.trackContentRef)

    for (const trackRef of this.trackListRef) {
      const { top } = getElementPosition(trackRef, this.trackContentRef)
      const index = Number(trackRef.dataset.index)
      const track = trackList.list[index]
      const bottomTop = top + track.height
      this.allTrackItem = this.allTrackItem.concat(track.trackList)

      const trackData: TrackData = {
        type: TrackDataType.TRACK,
        top,
        bottomTop,
        track,
        trackType: track.type,
        trackRef,
        index,
        overIntervalMiddleTop: top - TRACK_INTERVAL / 2,
        underIntervalMiddleTop: bottomTop + TRACK_INTERVAL / 2
      }

      baseTrackDataList.push(trackData)

      const intervalTop = bottomTop + 1
      const intervalBottomTop = intervalTop + TRACK_INTERVAL
      baseTrackDataList.push({
        type: TrackDataType.TRACK_INTERVAL,
        top: intervalTop,
        middleTop: bottomTop + TRACK_INTERVAL / 2,
        bottomTop: intervalBottomTop,
        overTrack: track,
        overTrackType: track.type,
        overTrackRef: trackRef,
        overTrackIndex: index
      })

      if (track.type === TrackType.MAIN) {
        this.mainTrackData = trackData
      }

      if (index === 0) {
        baseTrackDataList.unshift({
          type: TrackDataType.BLANK_TOP,
          top: position.top,
          bottomTop: top - 1,
          overBottomIntervalTop: top - 1 - TRACK_INTERVAL / 2
        })
      }

      if (index === this.trackListRef.length - 1) {
        const { height } = this.timelineResourceRef.getBoundingClientRect()
        baseTrackDataList.push({
          type: TrackDataType.BLANK_BOTTOM,
          top: intervalBottomTop + 1,
          bottomTop: position.top + height
        })
      }
    }

    this.baseTrackDataList = baseTrackDataList.sort((a, b) => a.top - b.top)
  }

  protected initDraggingTarget(e: PointerEvent) {
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

  protected updateDraggingTargetPosition({ x, y }: { x: number; y: number }) {
    if (this.draggingTarget) {
      const { offsetX, offsetY } = this.dragOffset
      let left = x - offsetX
      if (this.isMoveTrackItem && left < this.timelineResourceRefLeft) {
        left = this.timelineResourceRefLeft
      }
      this.draggingTarget.style.left = `${left}px`
      this.draggingTarget.style.top = `${y - offsetY}px`
    }
  }

  /**
   * 获取当前拖拽点相对于 track-content 元素的位置
   */
  protected getDragPosition(event: PointerEvent): DragPosition {
    const { top, left } = getElementPosition(event.target as HTMLElement, this.trackContentRef)
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

  protected setAddToNewTrackState(stateData: Omit<AddToNewTrackState, 'state'>) {
    const data: AddToNewTrackState = {
      state: DraggingState.ADD_TO_NEW_TRACK_STATE,
      ...stateData
    }
    this.stateData = data
    this.onStateChange(data)
  }

  protected setAddToCurrentTrackState(stateData: Omit<AddToCurrentTrackState, 'state'>) {
    const data: AddToCurrentTrackState = {
      state: DraggingState.ADD_TO_CURRENT_TRACK_STATE,
      ...stateData
    }

    this.stateData = data
    this.onStateChange(data)
  }
}
