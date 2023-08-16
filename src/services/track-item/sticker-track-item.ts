import {
  TrackItemName,
  type StickerResource,
  type PlayerAttribute,
  type AttributeOptions
} from '@/types'
import { BaseTrackItem } from './base-track-item'
import type { VideoTrack } from '../track/video-track'
import { shallowReactive, type ShallowReactive } from 'vue'

export class StickerTrackItem extends BaseTrackItem<StickerResource, StickerTrackItem, VideoTrack> {
  readonly component = TrackItemName.TRACK_ITEM_STICKER

  resource: StickerResource

  attribute: ShallowReactive<PlayerAttribute> = shallowReactive({
    topRatio: 0,
    leftRatio: 0,
    widthRatio: 1,
    heightRatio: 1,
    scale: 1,
    rotate: 0,
    opacity: 1
  })

  constructor(resource: StickerResource, attribute: AttributeOptions) {
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
    const newItem = StickerTrackItem.create(Object.assign({}, this.resource), this.attribute)
    this.parentTrack?.addTrackItemWithNoEffect(newItem)

    return this.baseSplit(newItem, splitFrame)
  }

  static create(resource: StickerResource, attribute: AttributeOptions) {
    return new StickerTrackItem(resource, attribute)
  }
}
