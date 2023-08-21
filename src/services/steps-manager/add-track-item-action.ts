import { TrackItemName, type TrackData, type TrackItemData } from '@/types'
import { Action } from './action'
import { trackList } from '../track-list/track-list'
import { stepsManager } from './steps-manager'
import { isString } from '../helpers/general'
import { AudioTrackItem } from '../track-item/audio-track-item'
import { StickerTrackItem } from '../track-item/sticker-track-item'
import { TextTrackItem } from '../track-item/text-track-item'
import { VideoTrackItem } from '../track-item/video-track-item'
import { TrackType } from '../track/base-track'
import { AudioTrack } from '../track/audio-track'
import { VideoTrack } from '../track/video-track'
import { MainTrack } from '../track/main-track'

function toTrackItem(trackItemData: TrackItemData) {
  if (trackItemData.type === TrackItemName.TRACK_ITEM_AUDIO) {
    return AudioTrackItem.toTrackItem(trackItemData)
  } else if (trackItemData.type === TrackItemName.TRACK_ITEM_STICKER) {
    return StickerTrackItem.toTrackItem(trackItemData)
  } else if (trackItemData.type === TrackItemName.TRACK_ITEM_TEXT) {
    return TextTrackItem.toTrackItem(trackItemData)
  } else {
    return VideoTrackItem.toTrackItem(trackItemData)
  }
}

function toTrack(trackData: TrackData) {
  if (trackData.type === TrackType.AUDIO) {
    return AudioTrack.toTrack(trackData)
  } else if (trackData.type === TrackType.VIDEO) {
    return VideoTrack.toTrack(trackData)
  } else {
    // 不应该走到这一步，MainTrack 有且仅有一个且一开始就存在
    return MainTrack.toTrack(trackData)
  }
}

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
