import { VIDEO_TRACK_HEIGHT } from '@/config'
import type { VideoTrackItem } from '../track-item/video-item'
import { BaseTrack, TrackType } from './base-track'

export class MainTrack extends BaseTrack<VideoTrackItem> {
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
