import {
  TrackItemName,
  type AudioResource,
  type AudioTrackItemData,
  type BaseTrackItemData
} from '@/types'
import { BaseTrackItem } from './base-track-item'
import type { AudioTrack } from '../track/audio-track'
import { deepClone } from '../helpers/general'
import { watch } from 'vue'
import { Events, emitter } from '../mitt/emitter'

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
    this.setLoading(true)

    watch([this.loading, this._startFrame, this._endFrame], () => {
      emitter.emit(Events.INIT_AUDIO)
    })
  }

  split(splitFrame: number): [AudioTrackItem, AudioTrackItem] {
    const newItem = AudioTrackItem.create(Object.assign({}, this.resource))
    this.parentTrack?.addTrackItemWithNoEffect(newItem)

    this.baseSplit(newItem, splitFrame)

    return [this, newItem]
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
