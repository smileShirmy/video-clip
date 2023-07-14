import { VIDEO_TRACK_HEIGHT } from '@/config'
import type { TextTrackItem } from '../track-item/text-track-item'
import type { VideoTrackItem } from '../track-item/video-track-item'
import { BaseTrack, TrackType } from './base-track'
import type { StickerTrackItem } from '../track-item/sticker-track-item'

export interface VideoTrackOptions {
  height?: number
}

export class VideoTrack extends BaseTrack<VideoTrackItem | TextTrackItem | StickerTrackItem> {
  type = TrackType.VIDEO

  height: number

  constructor(options: VideoTrackOptions = {}) {
    super()

    const { height = VIDEO_TRACK_HEIGHT } = options
    this.height = height
    this.bindParentTrack(this._trackList)
  }

  static create(options: VideoTrackOptions = {}) {
    return new VideoTrack(options)
  }
}
