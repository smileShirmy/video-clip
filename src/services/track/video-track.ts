import { VIDEO_TRACK_HEIGHT } from '@/config'
import type { TextTrackItem } from '../track-item/text-track-item'
import type { VideoTrackItem } from '../track-item/video-track-item'
import { BaseTrack, TrackType } from './base-track'
import type { StickerTrackItem } from '../track-item/sticker-track-item'
import { watch } from 'vue'
import type { TrackItem } from '../track-item'
import { isArray } from '../helpers/general'
import { isVideoTrackAllowItem, isVideoTrackAllowItems } from './helper'
import type { BaseTrackData, VideoTrackData } from '@/types'

export type VideoTrackAllowItem = VideoTrackItem | TextTrackItem | StickerTrackItem

export interface VideoTrackOptions {
  height?: number
}

export class VideoTrack extends BaseTrack<VideoTrackAllowItem> {
  readonly type = TrackType.VIDEO

  height: number

  constructor(
    options: {
      base?: BaseTrackData
      height?: number
    } = {}
  ) {
    const { base, height = VIDEO_TRACK_HEIGHT } = options
    super(base)

    this.height = height
    this.bindParentTrack()
  }

  addTrackItem(trackItem: TrackItem | TrackItem[]) {
    let allow = false
    if (isArray(trackItem)) {
      if (isVideoTrackAllowItems(trackItem)) {
        this.baseAddTrackItem(trackItem)
        allow = true
      }
    } else if (isVideoTrackAllowItem(trackItem)) {
      this.baseAddTrackItem(trackItem)
      allow = true
    }
    return allow
  }

  bindParentTrack() {
    watch(
      this.trackItemList,
      () => {
        this.trackItemList.forEach((item) => (item.parentTrack = this))
      },
      { immediate: true }
    )
  }

  toData(): VideoTrackData {
    return {
      base: this.toBaseData(),
      height: this.height,
      type: this.type
    }
  }

  static toTrack(options: VideoTrackData) {
    return new VideoTrack(options)
  }

  static create(options: VideoTrackOptions = {}) {
    return new VideoTrack(options)
  }
}
