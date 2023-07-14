import { TrackItemName, type AudioResource } from '@/types'
import { BaseTrackItem } from './base-track-item'
import type { AudioTrack } from '../track/audio-track'

export class AudioTrackItem extends BaseTrackItem<AudioResource, AudioTrackItem, AudioTrack> {
  readonly component = TrackItemName.TRACK_ITEM_AUDIO

  resource: AudioResource

  constructor(resource: AudioResource) {
    super()
    this.setEndFrame(resource.frameCount)
    this.resource = Object.assign({}, resource)
  }

  split(splitFrame: number) {
    const newItem = AudioTrackItem.create(Object.assign({}, this.resource))
    this.parentTrack?.addTrackItemWithNoEffect(newItem)

    return this.baseSplit(newItem, splitFrame)
  }

  static create(resource: AudioResource) {
    return new AudioTrackItem(resource)
  }
}
