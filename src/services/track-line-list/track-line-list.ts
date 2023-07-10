import { shallowReactive, watch } from 'vue'
import { TrackLineType, type TrackLine, MainTrackLine } from '../track-line/track-line'
import type { TrackItem } from '../track-item/track-item'
import { useTrackStore } from '@/stores/track'

interface Move {
  dragOffsetX: number
}

class TrackLineList {
  static create() {
    return new TrackLineList()
  }

  private _list = shallowReactive<TrackLine[]>([MainTrackLine.create()])

  get list() {
    return this._list
  }

  private draggingItem: TrackItem | null = null

  move: Move | null = {
    dragOffsetX: 0
  }

  /**
   * 轨道中不存在任何资源
   */
  get isEmpty() {
    return this.list.length === 1 && this.list[0].trackList.length === 0
  }

  get mainTrackLine(): MainTrackLine {
    return this.list.find((line) => line.type === TrackLineType.MAIN)!
  }

  get trackItemCount(): number {
    return this.list.reduce((pre, cur) => pre + cur.trackList.length, 0)
  }

  constructor() {
    watch(
      this.list,
      () => {
        this.list.forEach((line) => (line.parentTrackLineList = this))
      },
      { immediate: true }
    )
  }

  getMaxFrame() {
    return Math.max(...this.list.map((f) => f.getLastFrame()))
  }

  removeMove() {
    this.move = null
  }

  // 初始化开始移动 trackItem
  setMove(trackItem: TrackItem, move: Move) {
    trackItem.recordBeforeDragFrame()
    this.move = move
  }

  getDraggingTrackItem() {
    return this.draggingItem
  }

  setDraggingTrackItem(trackItem: TrackItem) {
    this.draggingItem = trackItem
  }

  removeTrackItem(trackItem: TrackItem, isUpdateMaxFrameCount = true) {
    let removed = false
    this.list.forEach((line) => {
      const r = line.removeTrackItem(trackItem, false)
      if (!removed && r) {
        removed = true
      }
    })

    if (isUpdateMaxFrameCount) {
      const trackStore = useTrackStore()
      trackStore.updateMaxFrameCount()
    }
    return removed
  }

  /**
   * 移除没有 trackItem 的 trackLine（主轨道不移除）
   */
  removeEmptyTrackLine() {
    const len = this.list.length - 1
    for (let i = len; i >= 0; i -= 1) {
      const trackLine = this.list[i]
      if (trackLine.type !== TrackLineType.MAIN && trackLine.trackList.length === 0) {
        this.list.splice(i, 1)
      }
    }
  }

  insert(trackLine: TrackLine, insertIndex: number) {
    trackLine.parentTrackLineList = this
    this.list.splice(insertIndex, 0, trackLine)
  }
}

export type TrackLineListType = TrackLineList

export const trackLineList = TrackLineList.create()
