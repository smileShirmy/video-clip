import { TrackItemComponentName, type StickerResource } from '@/types'
import { BaseTrackItem } from './base-track-item'
import type { VideoTrack } from '../track/video-track'

export class StickerTrackItem extends BaseTrackItem<StickerResource, StickerTrackItem, VideoTrack> {
  readonly component = TrackItemComponentName.TRACK_ITEM_STICKER

  resource: StickerResource

  constructor(resource: StickerResource) {
    super()
    this.setEndFrame(resource.frameCount)
    this.resource = Object.assign({}, resource)
  }

  split(splitFrame: number) {
    const newItem = StickerTrackItem.create(Object.assign({}, this.resource))
    this.parentTrack?.addTrackItemWithNoEffect(newItem)

    return this.baseSplit(newItem, splitFrame)
  }

  static create(resource: StickerResource) {
    return new StickerTrackItem(resource)
  }
}
