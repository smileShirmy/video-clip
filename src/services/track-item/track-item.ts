import { ref } from 'vue'
import { uuid } from '../helpers/general'
import { TrackComponentName, type VideoResource } from '@/types'

// TODO: extends 的类型抽个 base 类型出来
abstract class BaseTrackItem<T extends { frameCount: number }> {
  abstract readonly component: TrackComponentName

  abstract resource: T

  readonly id = uuid()

  minFrame = 0

  private beforeDragFrame = 0

  private _startFrame = ref<number>(0)

  private _endFrame = ref<number>(0)

  get startFrame(): number {
    return this._startFrame.value
  }

  get endFrame(): number {
    return this._endFrame.value
  }

  get maxFrame() {
    return this.minFrame + this.resource.frameCount
  }

  updateDropFrame() {
    const offsetFrame = this.startFrame - this.beforeDragFrame
    this.minFrame = this.minFrame + offsetFrame
    this.setEndFrame(this.endFrame + offsetFrame)
  }

  setStartFrame(startFrame: number) {
    this._startFrame.value = startFrame
  }

  recordBeforeDragFrame() {
    this.beforeDragFrame = this.startFrame
  }

  setEndFrame(endFrame: number) {
    this._endFrame.value = endFrame
  }
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
