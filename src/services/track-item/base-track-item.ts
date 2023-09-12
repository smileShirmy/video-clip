import { ref, watch } from 'vue'
import { deepClone, isNumber, uuid } from '../helpers/general'
import { TrackItemName, type BaseTrackItemData, type TrackItemData } from '@/types'
import type { TrackItem } from '.'
import type { Track } from '../track'
import { usePlayerStore, type PlayerStore } from '@/stores/player'
import { Events, emitter } from '../mitt/emitter'

export abstract class BaseTrackItem<
  R extends { frameCount: number },
  T extends TrackItem,
  P extends Track
> {
  abstract readonly component: TrackItemName

  readonly resource: R

  readonly id: string

  readonly playerStore: PlayerStore

  parentTrack: P | null = null

  minFrame = 0

  loading = ref(false)

  private beforeDragFrame = 0

  protected _startFrame = ref<number>(0)

  protected _endFrame = ref<number>(0)

  get startFrame(): number {
    return this._startFrame.value
  }

  get endFrame(): number {
    return this._endFrame.value
  }

  get maxFrame() {
    return this.minFrame + this.resource.frameCount
  }

  get isNoLimit() {
    return (
      [TrackItemName.TRACK_ITEM_VIDEO, TrackItemName.TRACK_ITEM_AUDIO].includes(this.component) ===
      false
    )
  }

  constructor(resource: R, options: Partial<BaseTrackItemData> = {}) {
    this.resource = deepClone(resource)

    const { id = uuid(), startFrame, endFrame, minFrame } = options
    this.id = id
    if (isNumber(startFrame)) {
      this._startFrame.value = startFrame
    }
    if (isNumber(endFrame)) {
      this._endFrame.value = endFrame
    } else {
      this._endFrame.value = this.resource.frameCount
    }
    if (isNumber(minFrame)) {
      this.minFrame = minFrame
    }

    this.playerStore = usePlayerStore()

    watch(
      this.loading,
      (loading) => {
        if (!loading) {
          emitter.emit(Events.UPDATE_PLAYER_ITEMS)
        }
      },
      { flush: 'post' }
    )
  }

  abstract split(splitFrame: number): [T, T]

  abstract toData(): TrackItemData

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

  setLoading(is: boolean) {
    this.loading.value = is
  }

  getAllowMaxFrame() {
    if (this.isNoLimit) {
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
    if (this.isNoLimit) {
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

  protected toBaseData(): BaseTrackItemData {
    return {
      id: this.id,
      minFrame: this.minFrame,
      startFrame: this._startFrame.value,
      endFrame: this._endFrame.value,
      parentTrackId: this.parentTrack?.id
    }
  }
}
