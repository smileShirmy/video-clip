import { OTHER_TRACK_HEIGHT } from '@/config'
import { BaseTrack, TrackType } from './base-track'
import type { AudioTrackItem } from '../track-item/audio-track-item'
import { watch } from 'vue'
import type { TrackItem } from '../track-item'
import { isArray } from '../helpers/general'
import { isAudioTrackAllowItem, isAudioTrackAllowItems } from './helper'
import type { AudioTrackData, BaseTrackData } from '@/types'

export type AudioTrackAllowItem = AudioTrackItem

export class AudioTrack extends BaseTrack<AudioTrackItem> {
  readonly type = TrackType.AUDIO

  readonly height = OTHER_TRACK_HEIGHT

  constructor(
    options: {
      base?: BaseTrackData
      height?: number
    } = {}
  ) {
    const { base } = options
    super(base)

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
      this.trackItemList,
      () => {
        this.trackItemList.forEach((item) => (item.parentTrack = this))
      },
      { immediate: true }
    )
  }

  toData(): AudioTrackData {
    return {
      base: this.toBaseData(),
      type: this.type
    }
  }

  static toTrack(options: AudioTrackData) {
    return new AudioTrack(options)
  }

  static create() {
    return new AudioTrack()
  }
}
