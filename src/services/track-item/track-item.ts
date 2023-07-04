import { ref } from 'vue'
import { uuid } from '../helpers/general'
import { TrackComponentName, type VideoResource } from '@/types'
import type { MainTrackLine, TrackLine, VideoTrackLine } from '../track-line/track-line'

// TODO: extends 的类型抽个 base 类型出来
abstract class BaseTrackItem<R extends { frameCount: number }, P extends TrackLine> {
  abstract readonly component: TrackComponentName

  abstract resource: R

  parentTrackLine: P | null = null

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

  getAllowMaxFrame() {
    if (!this.parentTrackLine) return this.maxFrame

    const { trackList } = this.parentTrackLine
    const frames = trackList.reduce((pre: number[], cur) => {
      if (
        cur.id !== this.id &&
        cur.startFrame <= this.maxFrame &&
        cur.startFrame >= this.endFrame
      ) {
        return pre.concat([cur.startFrame])
      }
      return pre
    }, [])
    return Math.min(...frames, this.maxFrame)
  }

  getAllowMinFrame() {
    if (!this.parentTrackLine) return this.maxFrame

    const { trackList } = this.parentTrackLine
    const frames = trackList.reduce((pre: number[], cur) => {
      if (cur.id !== this.id && cur.endFrame >= this.minFrame && cur.endFrame <= this.startFrame) {
        return pre.concat([cur.endFrame])
      }
      return pre
    }, [])
    return Math.max(...frames, this.minFrame)
  }
}

export class VideoTrackItem extends BaseTrackItem<VideoResource, VideoTrackLine | MainTrackLine> {
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
