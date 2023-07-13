import { VIDEO_TRACK_HEIGHT } from '@/config'
import type { VideoTrackItem } from '../track-item/video-item'
import type { StickerTrackItem } from '../track-item/sticker-item'
import { BaseTrack, TrackType } from './base-track'
import type { TrackItem } from '../track-item'
import { TrackItemComponentName } from '@/types'

export type MainTrackAllowItem = VideoTrackItem | StickerTrackItem

export class MainTrack extends BaseTrack<MainTrackAllowItem> {
  type = TrackType.MAIN

  height = VIDEO_TRACK_HEIGHT

  constructor() {
    super()
    this.bindParentTrack(this._trackList)
  }

  static create() {
    return new MainTrack()
  }
}

export const isMainTrackAllowItem = (trackItem: TrackItem): trackItem is MainTrackAllowItem => {
  return (
    trackItem.component === TrackItemComponentName.TRACK_ITEM_VIDEO ||
    trackItem.component === TrackItemComponentName.TRACK_ITEM_STICKER
  )
}
