import { useTimelineStore } from '@/stores/timeline'
import type { DragOffset, DragPosition } from './types'
import type { TrackItem } from '../track-item'
import type { Track } from '../track'

export class TrackPlaceholder {
  top: number

  startFrame: number

  frameCount: number

  height: number

  parentTrack: Track | null = null

  get endFrame() {
    return this.startFrame + this.frameCount
  }

  constructor(top: number, startFrame: number, frameCount: number) {
    this.top = top
    this.startFrame = startFrame
    this.frameCount = frameCount
    this.height = 60
  }

  setParentTrack(track: Track) {
    this.parentTrack = track
  }

  static create(position: DragPosition, dragging: TrackItem, dragOffset: DragOffset) {
    const timelineStore = useTimelineStore()

    const x = position.x - dragOffset.offsetX

    return new TrackPlaceholder(
      position.y,
      timelineStore.pixelToFrame(x),
      dragging.endFrame - dragging.startFrame
    )
  }
}
