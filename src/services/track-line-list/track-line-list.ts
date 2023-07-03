import { shallowReactive } from 'vue'
import { TrackLineType, type TrackLine, MainTrackLine } from '../track-line/track-line'
import type { TrackItem } from '../track-item/track-item'

class TrackLineList {
  static create() {
    return new TrackLineList()
  }

  list = shallowReactive<TrackLine[]>([MainTrackLine.create()])

  draggingItem: TrackItem | null = null

  /**
   * 轨道中不存在任何资源
   */
  get isEmpty() {
    return this.list.length === 1 && this.list[0].trackList.length === 0
  }

  getDraggingItem() {
    return this.draggingItem
  }

  setDraggingItem(trackItem: TrackItem) {
    this.draggingItem = trackItem
  }

  removeTrackItem(trackItem: TrackItem) {
    this.list.forEach((line) => line.removeTrackItem(trackItem))
  }

  /**
   * 移除没有 trackItem 的 trackLine（主轨道不移除）
   */
  removeEmptyTrackLine() {
    this.list = this.list.filter(
      (line) => line.type === TrackLineType.MAIN || line.trackList.length > 0
    )
  }
}

export const trackLineList = TrackLineList.create()
