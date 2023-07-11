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

  abstract split(splitFrame: number): TrackItem

  protected baseSplit(newItem: TrackItem, splitFrame: number): TrackItem {
    newItem.setStartFrame(splitFrame)
    newItem.setEndFrame(this.endFrame)
    newItem.minFrame = this.minFrame
    this.parentTrackLine?.addTrackItemWithNoEffect(newItem)

    this.setEndFrame(splitFrame)
    return newItem
  }

  // 更新允许拖动范围的最大最小帧
  updateMinAndMax() {
    const offsetFrame = this.startFrame - this.beforeDragFrame
    this.minFrame = this.minFrame + offsetFrame
  }

  setStartFrame(startFrame: number) {
    this._startFrame.value = startFrame
  }

  /**
   * 在 trackItem 被加入到 trackLine 时初始化
   */
  initMinAndMaxFrame(minFrame: number) {
    this.minFrame = minFrame
  }

  // 记录拖动之前的帧数
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

  split(splitFrame: number) {
    const newItem = VideoTrackItem.create(Object.assign({}, this.resource))

    return this.baseSplit(newItem, splitFrame)
  }

  static create(resource: VideoResource) {
    return new VideoTrackItem(resource)
  }
}

export type TrackItem = VideoTrackItem
