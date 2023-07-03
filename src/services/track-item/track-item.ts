import { ref } from 'vue'
import { uuid } from '../helpers/general'
import { TrackComponentName, type VideoResource } from '@/types'

abstract class BaseTrackItem<T> {
  readonly id = uuid()

  private _startFrame = ref<number>(0)

  private _endFrame = ref<number>(0)

  get startFrame(): number {
    return this._startFrame.value
  }

  setStartFrame(startFrame: number) {
    this._startFrame.value = startFrame
  }

  get endFrame(): number {
    return this._endFrame.value
  }

  setEndFrame(endFrame: number) {
    this._endFrame.value = endFrame
  }

  abstract readonly component: TrackComponentName

  abstract resource: T
}

export class VideoTrackItem extends BaseTrackItem<VideoResource> {
  readonly component = TrackComponentName.TRACK_VIDEO

  resource: VideoResource

  constructor(resource: VideoResource) {
    super()
    this.setEndFrame(resource.frameCount)
    this.resource = Object.assign({}, resource)
  }

  static create(resource: VideoResource) {
    return new VideoTrackItem(resource)
  }
}

export type TrackItem = VideoTrackItem
