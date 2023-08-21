import { VIDEO_TRACK_HEIGHT } from '@/config'
import type { VideoTrackItem } from '../track-item/video-track-item'
import type { StickerTrackItem } from '../track-item/sticker-track-item'
import { BaseTrack, TrackType } from './base-track'
import { watch } from 'vue'
import type { TrackItem } from '../track-item'
import { isMainTrackAllowItem, isMainTrackAllowItems } from './helper'
import { isArray } from '../helpers/general'
import type { BaseTrackData, MainTrackData } from '@/types'

export type MainTrackAllowItem = VideoTrackItem | StickerTrackItem

export class MainTrack extends BaseTrack<MainTrackAllowItem> {
  readonly type = TrackType.MAIN

  readonly height = VIDEO_TRACK_HEIGHT

  constructor(
    options: {
      base?: BaseTrackData
    } = {}
  ) {
    const { base } = options
    super(base)

    this.bindParentTrack()
  }

  addTrackItem(trackItem: TrackItem | TrackItem[]): boolean {
    let allow = false
    if (isArray(trackItem)) {
      if (isMainTrackAllowItems(trackItem)) {
        this.baseAddTrackItem(trackItem)
        allow = true
      }
    } else if (isMainTrackAllowItem(trackItem)) {
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

  toData(): MainTrackData {
    return {
      base: this.toBaseData(),
      type: this.type
    }
  }

  static toTrack(options: MainTrackData) {
    return new MainTrack(options)
  }

  static create() {
    return new MainTrack()
  }
}
