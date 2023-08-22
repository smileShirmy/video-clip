import type { TrackItemData } from '@/types'
import { Action } from './action'
import { trackList } from '../track-list/track-list'
import type { Track } from '../track'
import { toTrackItem } from './helper'
import { stepsManager } from './steps-manager'

export class SplitTrackItemAction extends Action {
  private readonly startTrackItemData: TrackItemData
  private parentTrack: Track
  private endTrackItemData: TrackItemData[] = []

  constructor(trackItemData: TrackItemData) {
    super()
    this.startTrackItemData = trackItemData
    const { track } = trackList.findTrack(trackItemData.base.parentTrackId!)!
    this.parentTrack = track
  }

  end(before: TrackItemData, after: TrackItemData) {
    this.endTrackItemData = [before, after]

    stepsManager.addAction(this)
  }

  undo() {
    this.endTrackItemData.forEach((v) => {
      this.parentTrack.removeTrackItem(v.base.id, false)
    })
    this.parentTrack.addTrackItem(toTrackItem(this.startTrackItemData))
  }

  redo() {
    this.parentTrack.removeTrackItem(this.startTrackItemData.base.id, false)
    const trackItems = this.endTrackItemData.map((data) => toTrackItem(data))
    this.parentTrack.addTrackItem(trackItems)
  }
}
