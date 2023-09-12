import type { TrackItemData } from '@/types'
import { Action } from './action'
import { trackList } from '../track-list/track-list'
import { toTrackItem } from './helper'
import { stepsManager } from './steps-manager'
import { nextTick } from 'vue'

export class SplitTrackItemAction extends Action {
  private readonly startTrackItemData: TrackItemData
  private parentTrackId: string
  private endTrackItemData: TrackItemData[] = []

  constructor(trackItemData: TrackItemData) {
    super()
    this.startTrackItemData = trackItemData
    this.parentTrackId = trackItemData.base.parentTrackId!
  }

  end(before: TrackItemData, after: TrackItemData) {
    this.endTrackItemData = [before, after]

    stepsManager.addAction(this)
  }

  undo() {
    const { track: parentTrack } = trackList.findTrack(this.parentTrackId)
    this.endTrackItemData.forEach((v) => {
      parentTrack.removeTrackItem(v.base.id, false)
    })

    nextTick(() => {
      parentTrack.addTrackItem(toTrackItem(this.startTrackItemData))
    })
  }

  redo() {
    const { track: parentTrack } = trackList.findTrack(this.parentTrackId)

    parentTrack.removeTrackItem(this.startTrackItemData.base.id, false)

    nextTick(() => {
      const trackItems = this.endTrackItemData.map((data) => toTrackItem(data))
      parentTrack.addTrackItem(trackItems)
    })
  }
}
