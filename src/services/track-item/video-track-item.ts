import {
  TrackItemName,
  type PlayerAttribute,
  type VideoResource,
  type AttributeOptions
} from '@/types'
import { BaseTrackItem } from './base-track-item'
import type { MainTrack } from '../track/main-track'
import type { VideoTrack } from '../track/video-track'
import { shallowReactive, type ShallowReactive } from 'vue'

export class VideoTrackItem extends BaseTrackItem<
  VideoResource,
  VideoTrackItem,
  MainTrack | VideoTrack
> {
  readonly component = TrackItemName.TRACK_ITEM_VIDEO

  resource: VideoResource

  attribute: ShallowReactive<PlayerAttribute> = shallowReactive({
    topRatio: 0,
    leftRatio: 0,
    widthRatio: 1,
    heightRatio: 1,
    scale: 1,
    rotate: 0,
    opacity: 1
  })

  constructor(resource: VideoResource, attribute: AttributeOptions) {
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
    const newItem = VideoTrackItem.create(Object.assign({}, this.resource), this.attribute)
    this.parentTrack?.addTrackItemWithNoEffect(newItem)

    return this.baseSplit(newItem, splitFrame)
  }

  static create(resource: VideoResource, attribute: AttributeOptions) {
    return new VideoTrackItem(resource, attribute)
  }
}
