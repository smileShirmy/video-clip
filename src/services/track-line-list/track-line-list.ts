import { shallowReactive } from 'vue'
import { TrackLineType, type TrackLine, MainTrackLine } from '../track-line/track-line'
import type { TrackItem } from '../track-item/track-item'

class TrackLineList {
  static create() {
    return new TrackLineList()
  }

  readonly list = shallowReactive<TrackLine[]>([MainTrackLine.create()])

  private draggingItem: TrackItem | null = null

  dragOffsetX = 0

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
    const len = this.list.length - 1
    for (let i = len; i >= 0; i -= 1) {
      const trackLine = this.list[i]
      if (trackLine.type !== TrackLineType.MAIN && trackLine.trackList.length === 0) {
        this.list.splice(i, 1)
      }
    }
  }
}

export const trackLineList = TrackLineList.create()
