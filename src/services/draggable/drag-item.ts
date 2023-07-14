import { TRACK_INTERVAL } from '@/config'
import { getElementPosition } from '../helpers/dom'
import { isString } from '../helpers/general'
import type { Track } from '../track'
import type { TrackItem } from '../track-item'
import { trackList } from '../track-list/track-list'
import type { DragOffset } from './types'
import { TrackType } from '../track/base-track'

enum TrackDataType {
  BLANK_TOP = 'blankTop',
  TRACK = 'track',
  TRACK_INTERVAL = 'trackInterval',
  BLANK_BOTTOM = 'blankBottom'
}

interface BaseTrackData {
  top: number
  bottomTop: number
}

interface BlankTopData extends BaseTrackData {
  type: TrackDataType.BLANK_TOP
  bottomTop: number
}

interface TrackData extends BaseTrackData {
  type: TrackDataType.TRACK
  track: Track
  trackRef: HTMLElement
  index: number
}

interface TrackIntervalData extends BaseTrackData {
  type: TrackDataType.TRACK_INTERVAL
  overTrack: Track
  overTrackRef: HTMLElement
  overIndex: number
}

interface BlankBottomData extends BaseTrackData {
  type: TrackDataType.BLANK_BOTTOM
  top: number
}

type TrackDataItem = BlankTopData | TrackData | TrackIntervalData | BlankBottomData

export interface DragOptions<T> {
  dragTarget: HTMLElement
  dragTrackItem: T
  movingId: string | null
  dragOffset: DragOffset
  timelineResourceRef: HTMLElement
  trackListRef: HTMLDivElement[]
  trackContentRef: HTMLDivElement
}

export abstract class DragItem<T extends TrackItem> {
  protected readonly dragTarget: HTMLElement
  protected readonly dragTrackItem: T
  protected readonly movingId: string | null
  protected readonly timelineResourceRef: HTMLElement
  protected readonly dragOffset: DragOffset
  protected readonly trackListRef: HTMLDivElement[]
  protected readonly trackContentRef!: HTMLElement

  protected trackDataList: TrackDataItem[] = []
  protected mainTrackData!: TrackData

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

    this.initTrackListData()
    this.addListener()
  }

  protected get isMoveTrackItem() {
    return isString(this.movingId)
  }

  abstract onDragging: (e: PointerEvent) => void

  abstract onDragEnd: (e: PointerEvent) => void

  protected addListener() {
    window.addEventListener('pointermove', this.onDragging)
    window.addEventListener('pointerup', this.onDragEnd)
  }

  protected removeListener() {
    window.removeEventListener('pointermove', this.onDragging)
    window.removeEventListener('pointerup', this.onDragEnd)
  }

  protected destroy() {
    if (this.draggingTarget) {
      this.draggingTarget.remove()
    }
    this.removeListener()
  }

  initTrackListData() {
    const trackDataList: TrackDataItem[] = []

    const position = getElementPosition(this.timelineResourceRef, this.trackContentRef)

    for (let i = 0; i < this.trackListRef.length; i += 1) {
      const trackRef = this.trackListRef[i]

      const { top } = getElementPosition(trackRef, this.trackContentRef)
      const index = Number(trackRef.dataset.index)
      const track = trackList.list[index]
      const bottomTop = top + track.height

      const trackData: TrackData = {
        type: TrackDataType.TRACK,
        top,
        bottomTop,
        track,
        trackRef,
        index
      }

      trackDataList.push(trackData)

      const intervalTop = bottomTop + 1
      trackDataList.push({
        type: TrackDataType.TRACK_INTERVAL,
        top: intervalTop,
        bottomTop: intervalTop + TRACK_INTERVAL,
        overTrack: track,
        overTrackRef: trackRef,
        overIndex: index
      })

      if (track.type === TrackType.MAIN) {
        this.mainTrackData = trackData
      }

      if (index === 0) {
        trackDataList.unshift({
          type: TrackDataType.BLANK_TOP,
          top: position.top,
          bottomTop: top - 1
        })
      } else if (index === this.trackListRef.length - 1) {
        const { height } = this.timelineResourceRef.getBoundingClientRect()
        trackDataList.push({
          type: TrackDataType.BLANK_BOTTOM,
          top: bottomTop + 1,
          bottomTop: position.top + height
        })
      }
    }

    this.trackDataList = trackDataList.sort((a, b) => a.top - b.top)
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
      this.updateTargetPosition({ x: e.pageX, y: e.pageY })
    }
  }

  protected updateTargetPosition({ x, y }: { x: number; y: number }) {
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
}
