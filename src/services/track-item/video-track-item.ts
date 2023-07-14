import { TrackItemComponentName, type VideoResource } from '@/types'
import { BaseTrackItem } from './base-track-item'
import type { MainTrack } from '../track/main-track'
import type { VideoTrack } from '../track/video-track'

export class VideoTrackItem extends BaseTrackItem<
  VideoResource,
  VideoTrackItem,
  MainTrack | VideoTrack
> {
  readonly component = TrackItemComponentName.TRACK_ITEM_VIDEO

  resource: VideoResource

  constructor(resource: VideoResource) {
    super()
    this.setEndFrame(resource.frameCount)
    this.resource = Object.assign({}, resource)
  }

  split(splitFrame: number) {
    const newItem = VideoTrackItem.create(Object.assign({}, this.resource))
    this.parentTrack?.addTrackItemWithNoEffect(newItem)

    return this.baseSplit(newItem, splitFrame)
  }

  static create(resource: VideoResource) {
    return new VideoTrackItem(resource)
  }
}
