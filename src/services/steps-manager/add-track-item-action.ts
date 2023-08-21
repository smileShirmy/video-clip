import type { TextTrackItemData, VideoTrackData } from '@/types'
import { Action } from './action'
import { trackList } from '../track-list/track-list'
import { stepsManager } from './steps-manager'
import { isString } from '../helpers/general'
import { VideoTrack } from '../track/video-track'
import { TextTrackItem } from '../track-item/text-track-item'

export class AddTrackItemAction extends Action {
  readonly trackItemData: TextTrackItemData
  private parentTrackData?: VideoTrackData
  private parentTrackIndex = 0

  constructor(trackItemData: TextTrackItemData) {
    super()
    this.trackItemData = trackItemData
    stepsManager.addAction(this)
  }

  undo() {
    const { id, parentTrackId } = this.trackItemData.base
    if (isString(parentTrackId)) {
      const { index, track } = trackList.findTrack(parentTrackId)
      if (track instanceof VideoTrack) {
        this.parentTrackData = track.toData()
        this.parentTrackIndex = index
      }
    }

    trackList.removeTrackItem(id)
    trackList.removeEmptyTrack()
  }

  redo() {
    if (this.parentTrackData) {
      const { track } = trackList.findTrack(this.parentTrackData.base.id)
      const trackItem = TextTrackItem.toTrackItem(this.trackItemData)
      if (track) {
        track.addTrackItem(trackItem)
      } else {
        const parentTrack = VideoTrack.toTrack(this.parentTrackData)
        trackList.insertTrack(parentTrack, this.parentTrackIndex)
        parentTrack.addTrackItem(trackItem)
      }
    }
  }
}
