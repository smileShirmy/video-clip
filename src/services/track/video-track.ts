import type { TextTrackItem } from '../track-item/text-item'
import type { VideoTrackItem } from '../track-item/video-item'
import { BaseTrack, TrackType } from './base-track'

export interface VideoTrackOptions {
  height?: number
}

export class VideoTrack extends BaseTrack<VideoTrackItem | TextTrackItem> {
  type = TrackType.VIDEO

  height: number

  constructor(options: VideoTrackOptions = {}) {
    super()

    const { height = 60 } = options
    this.height = height
    this.bindParentTrack(this._trackList)
  }

  static create(options: VideoTrackOptions = {}) {
    return new VideoTrack(options)
  }
}
