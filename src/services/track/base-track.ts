import { shallowReactive, warn, watch } from 'vue'
import { isArray, isString, uuid } from '../helpers/general'
import { trackList, type TrackListType } from '../track-list/track-list'
import { useTrackStore } from '@/stores/track'
import type { TrackItem } from '../track-item'
import { TrackItemComponentName } from '@/types'
import { OTHER_TRACK_HEIGHT, VIDEO_TRACK_HEIGHT } from '@/config'

export enum TrackType {
  MAIN = 'main',
  VIDEO = 'video',
  OTHER = 'other'
}

export abstract class BaseTrack<T extends TrackItem> {
  readonly id = uuid()

  parentTrackList: TrackListType | null = null

  abstract height: number

  abstract readonly type: TrackType

  protected readonly _trackList = shallowReactive<T[]>([])

  get trackList() {
    return this._trackList
  }

  getLastFrame(excludeTrackItem?: TrackItem) {
    return this._trackList.reduce((pre, cur) => {
      if (excludeTrackItem && excludeTrackItem.id === cur.id) return pre
      return cur.endFrame > pre ? cur.endFrame : pre
    }, 0)
  }

  /**
   * 移除指定 trackItem
   */
  removeTrackItem(item: string | TrackItem, isUpdateMaxFrameCount = false) {
    const id = isString(item) ? item : item.id
    let removed = false

    const len = this._trackList.length - 1
    for (let i = len; i >= 0; i -= 1) {
      const trackItem = this._trackList[i]
      if (trackItem.id === id) {
        this._trackList.splice(i, 1)
        removed = true
      }
    }

    if (isUpdateMaxFrameCount) {
      const trackStore = useTrackStore()
      trackStore.updateMaxFrameCount()
    }

    return removed
  }

  addTrackItemWithNoEffect(trackItem: T) {
    this._trackList.push(trackItem)
  }

  /**
   * 添加 trackItem
   * 添加之前需要移除相同 id 的 trackItem，由此来实现移动
   */
  addTrackItem(trackItem: T | T[]) {
    const beforeTrackItemCount = trackList.trackItemCount

    const list = isArray(trackItem) ? trackItem : [trackItem]
    list.forEach((trackItem) => {
      if (this.parentTrackList) {
        // 添加之前先移除 trackLine 中相同的 trackItem
        const removed = this.parentTrackList.removeTrackItem(trackItem, false)

        this._trackList.push(trackItem)

        // 如果之前没有相同的 trackItem，说明这是一个全新的 trackItem
        if (!removed) {
          trackItem.initMinAndMaxFrame(trackItem.startFrame)
        } else {
          // 更新允许拖动范围的最大最小帧
          trackItem.updateMinAndMax()
        }

        // 添加之后需要移除空的 trackLine
        this.parentTrackList.removeEmptyTrack()
        return
      }
      warn('添加 trackItem 之前请先把当前 trackLine 插入到 trackList 中')
    })

    if (list.length) {
      const trackStore = useTrackStore()
      if (trackList.trackItemCount > beforeTrackItemCount) {
        trackStore.updateMaxFrameCount(2)
      } else {
        trackStore.updateMaxFrameCount()
      }
    }
  }

  updateTrackHeight() {
    if (this.type === TrackType.MAIN) return

    const hasVideo = this.trackList.some(
      (item) => item.component === TrackItemComponentName.TRACK_ITEM_VIDEO
    )
    this.height = hasVideo ? VIDEO_TRACK_HEIGHT : OTHER_TRACK_HEIGHT
  }

  getTrackItem(item: string | TrackItem): TrackItem | null {
    const id = isString(item) ? item : item.id
    const target = this._trackList.find((item) => item.id === id)
    return target ?? null
  }

  /**
   * 清空当前 trackLine 的 trackList
   */
  clearTrackList() {
    this._trackList.splice(0, this._trackList.length)

    const trackStore = useTrackStore()
    trackStore.updateMaxFrameCount()
  }

  /**
   * 绑定所属 trackLine
   */
  bindParentTrack(trackList: T[]) {
    watch(
      trackList,
      () => {
        trackList.forEach((item) => (item.parentTrack = this))

        this.updateTrackHeight()
      },
      { immediate: true }
    )
  }
}
