import { computed, ref, shallowReactive, watch, type ComputedRef } from 'vue'
import { useTrackStore } from '@/stores/track'
import type { Track } from '../track'
import { MainTrack } from '../track/main-track'
import type { PlayerTrackItem, TrackItem } from '../track-item'
import { TrackType } from '../track/base-track'
import { isPlayerTrackItem } from '../track-item/helper'
import { isString } from '../helpers/general'

class TrackList {
  static create() {
    return new TrackList()
  }

  private _list = shallowReactive<Track[]>([MainTrack.create()])

  selectedId = ref<string>('')

  private _maxFrame = ref(0)

  readonly isEmpty: ComputedRef<boolean>

  get maxFrame() {
    return this._maxFrame.value
  }

  get list(): Track[] {
    return this._list
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

    this.isEmpty = computed(() => this.list.length === 1 && this.list[0].trackItemList.length === 0)
  }

  updatePlayerMaxFrame() {
    this._maxFrame.value = Math.max(...this.list.map((f) => f.getLastFrame()))
  }

  setSelectedId(id: string) {
    this.selectedId.value = id
  }

  removeSelected() {
    if (!this.selectedId.value) return

    this.removeTrackItem(this.selectedId.value)
    this.removeEmptyTrack()
  }

  removeTrackItem(trackItem: TrackItem | string, isUpdateMaxFrameCount = true) {
    let removed = false
    this.list.forEach((line) => {
      const r = line.removeTrackItem(trackItem, false)
      if (r) {
        removed = true

        if (isString(trackItem)) {
          if (trackItem === this.selectedId.value) {
            this.selectedId.value = ''
          }
        } else if (trackItem.id === this.selectedId.value) {
          this.selectedId.value = ''
        }
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

  insertTrack(track: Track, insertIndex: number) {
    track.parentTrackList = this
    this.list.splice(insertIndex, 0, track)
  }

  findTrack(trackId: string) {
    const index = this._list.findIndex((v) => v.id === trackId)
    return {
      index,
      track: this._list[index]
    }
  }

  /**
   * 获取当前帧用于播放的 trackItem
   */
  getCurrentFramePlayItems(currentFrame: number): PlayerTrackItem[] {
    const len = trackList.list.length
    const trackItems: PlayerTrackItem[] = []
    for (let i = len - 1; i >= 0; i -= 1) {
      const { trackItemList } = trackList.list[i]
      for (let j = 0; j < trackItemList.length; j += 1) {
        const trackItem = trackItemList[j]
        if (
          isPlayerTrackItem(trackItem) &&
          currentFrame > trackItem.startFrame &&
          currentFrame <= trackItem.endFrame
        ) {
          trackItems.push(trackItem)
        }
      }
    }

    return trackItems
  }
}

export type TrackListType = TrackList

export const trackList = TrackList.create()
