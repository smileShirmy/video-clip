import { ref } from 'vue'
import { uuid } from '../helpers/general'
import { TrackItemName } from '@/types'
import type { TrackItem } from '.'
import type { Track } from '../track'

export abstract class BaseTrackItem<
  R extends { frameCount: number },
  T extends TrackItem,
  P extends Track
> {
  abstract readonly component: TrackItemName

  abstract resource: R

  parentTrack: P | null = null

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

  abstract split(splitFrame: number): T

  protected baseSplit(newItem: T, splitFrame: number): T {
    newItem.setStartFrame(splitFrame)
    newItem.setEndFrame(this.endFrame)
    newItem.minFrame = this.minFrame

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
    if (this.component !== TrackItemName.TRACK_ITEM_VIDEO) {
      return Infinity
    }
    if (!this.parentTrack) return this.maxFrame

    const { trackItemList } = this.parentTrack
    const frames = (trackItemList as T[]).reduce((pre: number[], cur) => {
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
    if (this.component !== TrackItemName.TRACK_ITEM_VIDEO) {
      return 0
    }
    if (!this.parentTrack) return this.maxFrame

    const { trackItemList } = this.parentTrack
    const frames = (trackItemList as T[]).reduce((pre: number[], cur) => {
      if (cur.id !== this.id && cur.endFrame >= this.minFrame && cur.endFrame <= this.startFrame) {
        return pre.concat([cur.endFrame])
      }
      return pre
    }, [])
    return Math.max(...frames, this.minFrame)
  }
}
