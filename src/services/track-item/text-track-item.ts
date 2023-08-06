import {
  TrackItemName,
  type TextResource,
  type PlayerAttribute,
  type AttributeOptions
} from '@/types'
import { BaseTrackItem } from './base-track-item'
import { ref, shallowReactive, type ShallowReactive } from 'vue'
import type { VideoTrack } from '../track/video-track'

export class TextTrackItem extends BaseTrackItem<TextResource, TextTrackItem, VideoTrack> {
  readonly component = TrackItemName.TRACK_ITEM_TEXT

  resource: TextResource

  attribute: ShallowReactive<PlayerAttribute> = shallowReactive({
    topRatio: 0,
    leftRatio: 0,
    widthRatio: 1,
    heightRatio: 1,
    scale: 1,
    rotate: 0
  })

  text = ref<string>('默认文本')

  constructor(resource: TextResource, attribute: AttributeOptions) {
    super()
    const { topRatio, leftRatio, widthRatio, heightRatio } = attribute
    this.attribute.topRatio = topRatio
    this.attribute.leftRatio = leftRatio
    this.attribute.widthRatio = widthRatio
    this.attribute.heightRatio = heightRatio

    this.setEndFrame(resource.frameCount)
    this.resource = Object.assign({}, resource)
  }

  split(splitFrame: number) {
    const newItem = TextTrackItem.create(Object.assign({}, this.resource), this.attribute)
    this.parentTrack?.addTrackItemWithNoEffect(newItem)

    return this.baseSplit(newItem, splitFrame)
  }

  static create(resource: TextResource, attribute: AttributeOptions) {
    return new TextTrackItem(resource, attribute)
  }
}
