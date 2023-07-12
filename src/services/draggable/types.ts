import type { TrackItem } from '../track-item/track-item'
import type { TrackLine } from '../track-line/track-line'
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
  ON_TRACK_LINE = 'onTrackLine',
  ON_TRACK_LINE_INTERVAL = 'onTrackLineInterval',
  UNDER_LIST_BOTTOM = 'underListBottom'
}

export interface DragStartStore {
  dragTarget: HTMLElement | null
  dragging: TrackItem | null
  movingId: string | null
}

export interface BaseTrackLinePosition {
  blankTopBottomTop: number
  blankBottomTop: number
  mainTrackLineTop: number
  trackPlaceholder: TrackPlaceholder
  stickyFrame: number | null
}

export interface OverListTop extends BaseTrackLinePosition {
  linePosition: LinePosition.OVER_LIST_TOP
}

export interface OverTrackLine extends BaseTrackLinePosition {
  linePosition: LinePosition.ON_TRACK_LINE
  trackLine: TrackLine
  isIntersection: boolean
  trackLineTop: number
}

export interface OnTrackLineInterval extends BaseTrackLinePosition {
  linePosition: LinePosition.ON_TRACK_LINE_INTERVAL
  isIntersection: boolean
  overIntervalTrackLine: TrackLine
  intervalTop: number
  intervalIndex: number
  overTrackLineTop: number
}

export interface UnderListBottom extends BaseTrackLinePosition {
  linePosition: LinePosition.UNDER_LIST_BOTTOM
}

export type TrackPosition = OverListTop | OverTrackLine | OnTrackLineInterval | UnderListBottom
