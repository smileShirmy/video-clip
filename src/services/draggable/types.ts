import type { Track } from '../track'
import type { TrackItem } from '../track-item'
import type { TrackPlaceholder } from './track-placeholder'

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

// Y 轴方向上所处的位置
export enum LinePosition {
  OVER_LIST_TOP = 'overListTop',
  ON_TRACK_LINE = 'onTrack',
  ON_TRACK_LINE_INTERVAL = 'onTrackInterval',
  UNDER_LIST_BOTTOM = 'underListBottom'
}

export interface DragStartStore {
  dragTarget: HTMLElement | null
  dragging: TrackItem | null
  movingId: string | null
}

export interface BaseTrackPosition {
  blankTopBottomTop: number
  blankBottomTop: number
  mainTrackTop: number
  mainTrackIndex: number
  trackPlaceholder: TrackPlaceholder
  stickyFrame: number | null
}

export interface OverListTop extends BaseTrackPosition {
  linePosition: LinePosition.OVER_LIST_TOP
}

export interface OverTrack extends BaseTrackPosition {
  linePosition: LinePosition.ON_TRACK_LINE
  track: Track
  trackIndex: number
  isIntersection: boolean
  trackTop: number
}

export interface OnTrackInterval extends BaseTrackPosition {
  linePosition: LinePosition.ON_TRACK_LINE_INTERVAL
  isIntersection: boolean
  overIntervalTrack: Track
  intervalTop: number
  intervalIndex: number
  overTrackTop: number
}

export interface UnderListBottom extends BaseTrackPosition {
  linePosition: LinePosition.UNDER_LIST_BOTTOM
}

export type TrackPosition = OverListTop | OverTrack | OnTrackInterval | UnderListBottom
