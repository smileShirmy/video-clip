import { ref, shallowReactive, watch } from 'vue'
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

  private _selectedId = ref('')

  private draggingItem: TrackItem | null = null

  move: Move | null = {
    dragOffsetX: 0
  }

  resizingTrackItem = false

  get selectedId() {
    return this._selectedId.value
  }

  get selectedTrackItem(): TrackItem | null {
    for (let i = 0; i < this.list.length; i += 1) {
      const exist = this.list[i].getTrackItem(this.selectedId)
      if (exist) return exist
    }
    return null
  }

  get list() {
    return this._list
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

  setSelectedId(id: string) {
    this._selectedId.value = id
  }

  getDraggingTrackItem() {
    return this.draggingItem
  }

  setDraggingTrackItem(trackItem: TrackItem) {
    this.draggingItem = trackItem
  }

  removeSelected() {
    if (!this.selectedId) return

    const trackItem = this.selectedTrackItem
    trackItem && this.removeTrackItem(trackItem)
    this.removeEmptyTrackLine()
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

  getSplitTrackItem(splitFrame: number): TrackItem | null {
    const len = trackLineList.list.length
    for (let i = len - 1; i >= 0; i -= 1) {
      const line = trackLineList.list[i]
      for (let j = 0; j < line.trackList.length; j += 1) {
        const item = line.trackList[j]
        if (splitFrame > item.startFrame && splitFrame < item.endFrame) {
          return line.trackList[j]
        }
      }
    }
    return null
  }

  split(splitFrame: number) {
    const clipItem = this.getSplitTrackItem(splitFrame)
    if (!clipItem) return

    clipItem.split(splitFrame)
  }
}

export type TrackLineListType = TrackLineList

export const trackLineList = TrackLineList.create()
