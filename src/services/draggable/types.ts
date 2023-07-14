import type { TimelineStore } from '@/stores/timeline'
import type { Track } from '../track'
import type { TrackType } from '../track/base-track'
import type { TrackStore } from '@/stores/track'

export interface DragPosition {
  targetTop: number // 目标元素距离顶部的距离
  targetLeft: number // 目标元素距离
  y: number // 当前鼠标点距离顶部的距离
  x: number //  当前鼠标点距离左边的距离
}

export interface DragOffset {
  offsetX: number
  offsetY: number
}

export enum DraggingState {
  ADD_TO_CURRENT_TRACK_STATE = 'addToCurrentTrackState',
  ADD_TO_NEW_TRACK_STATE = 'addToNewTrackState'
}

export interface AddToNewTrackState {
  state: DraggingState.ADD_TO_NEW_TRACK_STATE
  top: number
  insertTrackIndex: number
  startFrame: number
}

export interface AddToCurrentTrackState {
  state: DraggingState.ADD_TO_CURRENT_TRACK_STATE
  top: number
  addToTrack: Track
  startFrame: number
  widthFrame: number
}

export type DraggingStateData = AddToNewTrackState | AddToCurrentTrackState

export enum TrackDataType {
  BLANK_TOP = 'blankTopHandler',
  TRACK = 'trackHandler',
  TRACK_INTERVAL = 'trackIntervalHandler',
  BLANK_BOTTOM = 'blankBottomHandler'
}

export interface BaseTrackData {
  top: number
  bottomTop: number
}

export interface BlankTopData extends BaseTrackData {
  type: TrackDataType.BLANK_TOP
  bottomTop: number
  overBottomIntervalTop: number
}

export interface TrackData extends BaseTrackData {
  type: TrackDataType.TRACK
  track: Track
  trackType: TrackType
  trackRef: HTMLElement
  index: number
  overIntervalMiddleTop: number
  underIntervalMiddleTop: number
}

export interface TrackIntervalData extends BaseTrackData {
  type: TrackDataType.TRACK_INTERVAL
  overTrack: Track
  overTrackType: TrackType
  overTrackRef: HTMLElement
  overTrackIndex: number
  middleTop: number
}

export interface BlankBottomData extends BaseTrackData {
  type: TrackDataType.BLANK_BOTTOM
  top: number
}

export type TrackDataItem = BlankTopData | TrackData | TrackIntervalData | BlankBottomData

export interface DragOptions<T> {
  dragTarget: HTMLElement
  dragTrackItem: T
  movingId: string | null
  dragOffset: DragOffset
  timelineResourceRef: HTMLElement
  trackListRef: HTMLDivElement[]
  trackContentRef: HTMLDivElement
  timelineStore: TimelineStore
  trackStore: TrackStore
  onStateChange: (state: DraggingStateData | null) => void
  onDragEnd: () => void
}
