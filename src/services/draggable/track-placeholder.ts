import { useTimelineStore } from '@/stores/timeline'
import type { TrackItem } from '../track-item/track-item'
import type { TrackLine } from '../track-line/track-line'
import type { DragOffset, DragPosition } from './types'

export class TrackPlaceholder {
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

  static create(position: DragPosition, draggingItem: TrackItem, dragOffset: DragOffset) {
    const timelineStore = useTimelineStore()

    const x = position.x - dragOffset.offsetX

    return new TrackPlaceholder(
      position.y,
      timelineStore.pixelToFrame(x),
      draggingItem.endFrame - draggingItem.startFrame
    )
  }
}
