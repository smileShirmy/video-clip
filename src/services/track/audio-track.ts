import { OTHER_TRACK_HEIGHT } from '@/config'
import { BaseTrack, TrackType } from './base-track'
import type { AudioTrackItem } from '../track-item/audio-track-item'
import { watch } from 'vue'
import type { TrackItem } from '../track-item'
import { isArray } from '../helpers/general'
import { isAudioTrackAllowItem, isAudioTrackAllowItems } from './helper'

export type AudioTrackAllowItem = AudioTrackItem

export class AudioTrack extends BaseTrack<AudioTrackItem> {
  type = TrackType.AUDIO

  height = OTHER_TRACK_HEIGHT

  constructor() {
    super()

    this.bindParentTrack()
  }

  addTrackItem(trackItem: TrackItem | TrackItem[]): boolean {
    let allow = false
    if (isArray(trackItem)) {
      if (isAudioTrackAllowItems(trackItem)) {
        this.baseAddTrackItem(trackItem)
        allow = true
      }
    } else if (isAudioTrackAllowItem(trackItem)) {
      this.baseAddTrackItem(trackItem)
      allow = true
    }
    return allow
  }

  bindParentTrack() {
    watch(
      this.trackList,
      () => {
        this.trackList.forEach((item) => (item.parentTrack = this))
      },
      { immediate: true }
    )
  }

  static create() {
    return new AudioTrack()
  }
}
