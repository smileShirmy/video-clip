import { TrackItemComponentName, type TextResource } from '@/types'
import { BaseTrackItem } from './base-item'
import { ref } from 'vue'
import type { VideoTrack } from '../track/video-track'

export class TextTrackItem extends BaseTrackItem<TextResource, TextTrackItem, VideoTrack> {
  readonly component = TrackItemComponentName.TRACK_ITEM_TEXT

  resource: TextResource

  text = ref<string>('默认文本')

  constructor(resource: TextResource) {
    super()
    this.setEndFrame(resource.frameCount)
    this.resource = Object.assign({}, resource)
  }

  split(splitFrame: number) {
    const newItem = TextTrackItem.create(Object.assign({}, this.resource))
    this.parentTrack?.addTrackItemWithNoEffect(newItem)

    return this.baseSplit(newItem, splitFrame)
  }

  static create(resource: TextResource) {
    return new TextTrackItem(resource)
  }
}
