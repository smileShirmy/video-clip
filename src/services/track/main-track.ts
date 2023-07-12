import type { VideoTrackItem } from '../track-item/video-item'
import { BaseTrack, TrackType } from './base-track'

export class MainTrack extends BaseTrack<VideoTrackItem> {
  type = TrackType.MAIN

  height = 60

  constructor() {
    super()
    this.bindParentTrack(this._trackList)
  }

  static create() {
    return new MainTrack()
  }
}
