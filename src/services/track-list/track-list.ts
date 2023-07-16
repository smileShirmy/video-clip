import { ref, shallowReactive, watch } from 'vue'
import { useTrackStore } from '@/stores/track'
import type { Track } from '../track'
import { MainTrack } from '../track/main-track'
import type { TrackItem } from '../track-item'
import { TrackType } from '../track/base-track'

class TrackList {
  static create() {
    return new TrackList()
  }

  private _list = shallowReactive<Track[]>([MainTrack.create()])

  private _selectedId = ref('')

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

  get list(): Track[] {
    return this._list
  }

  /**
   * 轨道中不存在任何资源
   */
  get isEmpty() {
    return this.list.length === 1 && this.list[0].trackItemList.length === 0
  }

  get mainTrack(): MainTrack {
    return this.list.find((track) => track.type === TrackType.MAIN) as MainTrack
  }

  get trackItemCount(): number {
    return this.list.reduce((pre, cur) => pre + cur.trackItemList.length, 0)
  }

  constructor() {
    watch(
      this.list,
      () => {
        this.list.forEach((line) => (line.parentTrackList = this))
      },
      { immediate: true }
    )
  }

  getMaxFrame() {
    return Math.max(...this.list.map((f) => f.getLastFrame()))
  }

  setSelectedId(id: string) {
    this._selectedId.value = id
  }

  removeSelected() {
    if (!this.selectedId) return

    const trackItem = this.selectedTrackItem
    trackItem && this.removeTrackItem(trackItem)
    this.removeEmptyTrack()
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
   * 移除没有资源的轨道（主轨道不移除）
   */
  removeEmptyTrack() {
    const len = this.list.length - 1
    for (let i = len; i >= 0; i -= 1) {
      const track = this.list[i]
      if (track.type !== TrackType.MAIN && track.trackItemList.length === 0) {
        this.list.splice(i, 1)
      }
    }
  }

  insert(track: Track, insertIndex: number) {
    track.parentTrackList = this
    this.list.splice(insertIndex, 0, track)
  }

  /**
   * 从下往上找到分割的资源
   */
  getSplitTrackItem(splitFrame: number): TrackItem | null {
    const len = trackList.list.length
    for (let i = len - 1; i >= 0; i -= 1) {
      const { trackItemList } = trackList.list[i]
      for (let j = 0; j < trackItemList.length; j += 1) {
        const item = trackItemList[j]
        if (splitFrame > item.startFrame && splitFrame < item.endFrame) {
          return trackItemList[j]
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

export type TrackListType = TrackList

export const trackList = TrackList.create()
