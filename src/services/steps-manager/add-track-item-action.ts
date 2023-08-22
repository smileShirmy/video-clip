import { type TrackData, type TrackItemData } from '@/types'
import { Action } from './action'
import { trackList } from '../track-list/track-list'
import { stepsManager } from './steps-manager'
import { isString } from '../helpers/general'
import { toTrack, toTrackItem } from './helper'

export class AddTrackItemAction extends Action {
  readonly trackItemData: TrackItemData
  private parentTrackData?: TrackData
  private parentTrackIndex = 0

  constructor(trackItemData: TrackItemData) {
    super()
    this.trackItemData = trackItemData
    stepsManager.addAction(this)
  }

  undo() {
    const { id, parentTrackId } = this.trackItemData.base
    if (isString(parentTrackId)) {
      const { index, track } = trackList.findTrack(parentTrackId)
      this.parentTrackData = track.toData()
      this.parentTrackIndex = index
    }

    trackList.removeTrackItem(id)
    trackList.removeEmptyTrack()
  }

  redo() {
    if (this.parentTrackData) {
      const { track } = trackList.findTrack(this.parentTrackData.base.id)
      const trackItem = toTrackItem(this.trackItemData)
      if (track) {
        track.addTrackItem(trackItem)
      } else {
        const parentTrack = toTrack(this.parentTrackData)
        trackList.insertTrack(parentTrack, this.parentTrackIndex)
        parentTrack.addTrackItem(trackItem)
      }
    }
  }
}
