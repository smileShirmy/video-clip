import {
  TrackItemName,
  type AudioResource,
  type AudioTrackItemData,
  type BaseTrackItemData
} from '@/types'
import { BaseTrackItem } from './base-track-item'
import type { AudioTrack } from '../track/audio-track'
import { deepClone } from '../helpers/general'

export class AudioTrackItem extends BaseTrackItem<AudioResource, AudioTrackItem, AudioTrack> {
  readonly component = TrackItemName.TRACK_ITEM_AUDIO

  constructor(
    resource: AudioResource,
    options: {
      base?: BaseTrackItemData
    } = {}
  ) {
    const { base } = options

    super(resource, base)
  }

  split(splitFrame: number) {
    const newItem = AudioTrackItem.create(Object.assign({}, this.resource))
    this.parentTrack?.addTrackItemWithNoEffect(newItem)

    return this.baseSplit(newItem, splitFrame)
  }

  toData(): AudioTrackItemData {
    return {
      type: this.component,
      base: this.toBaseData(),
      resource: deepClone(this.resource)
    }
  }

  static toTrackItem(data: AudioTrackItemData) {
    const { resource, base } = data
    return new AudioTrackItem(resource, {
      base
    })
  }

  static create(resource: AudioResource) {
    return new AudioTrackItem(resource)
  }
}
