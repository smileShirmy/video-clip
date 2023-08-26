import { shallowReactive, warn, watch } from 'vue'
import { isArray, isString, uuid } from '../helpers/general'
import { trackList, type TrackListType } from '../track-list/track-list'
import { useTrackStore } from '@/stores/track'
import type { TrackItem } from '../track-item'
import { TrackItemName, type BaseTrackData } from '@/types'
import { OTHER_TRACK_HEIGHT, VIDEO_TRACK_HEIGHT } from '@/config'
import { Events, emitter } from '../mitt/emitter'

export enum TrackType {
  MAIN = 'main',
  VIDEO = 'video',
  AUDIO = 'audio'
}

export abstract class BaseTrack<T extends TrackItem> {
  readonly id: string

  parentTrackList: TrackListType | null = null

  abstract height: number

  abstract readonly type: TrackType

  protected readonly _trackItemList = shallowReactive<T[]>([])

  get trackItemList() {
    return this._trackItemList
  }

  get hasVideo() {
    return this._trackItemList.some(
      (trackItem) => trackItem.component === TrackItemName.TRACK_ITEM_VIDEO
    )
  }

  constructor(options: Partial<BaseTrackData> = {}) {
    const { id = uuid() } = options
    this.id = id

    watch(
      this._trackItemList,
      () => {
        emitter.emit(Events.UPDATE_PLAYER_ITEMS)
      },
      {
        immediate: true
      }
    )
  }

  abstract bindParentTrack(): void

  getLastFrame(excludeTrackItem?: TrackItem) {
    return this._trackItemList.reduce((pre, cur) => {
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

    const len = this._trackItemList.length - 1
    for (let i = len; i >= 0; i -= 1) {
      const trackItem = this._trackItemList[i]
      if (trackItem.id === id) {
        this._trackItemList.splice(i, 1)
        removed = true
      }
    }

    if (isUpdateMaxFrameCount) {
      const trackStore = useTrackStore()
      trackStore.updateMaxFrameCount()
    }

    this.updateTrackHeight()

    return removed
  }

  addTrackItemWithNoEffect(trackItem: T) {
    this._trackItemList.push(trackItem)
  }

  abstract addTrackItem(trackItem: TrackItem | TrackItem[]): boolean

  /**
   * 添加 trackItem（子类实现 addTrackItem 并调用该方法）
   * 添加之前需要移除相同 id 的 trackItem，由此来实现移动
   */
  protected baseAddTrackItem(trackItem: T | T[]) {
    const beforeTrackItemCount = trackList.trackItemCount

    const list = isArray(trackItem) ? trackItem : [trackItem]
    list.forEach((trackItem) => {
      if (this.parentTrackList) {
        // 添加之前先移除 trackLine 中相同的 trackItem
        const removed = this.parentTrackList.removeTrackItem(trackItem, false)

        this._trackItemList.push(trackItem)

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
      trackList.updatePlayerMaxFrame()

      const trackStore = useTrackStore()
      if (trackList.trackItemCount > beforeTrackItemCount) {
        trackStore.updateMaxFrameCount(2)
      } else {
        trackStore.updateMaxFrameCount()
      }
    }

    this.updateTrackHeight()
  }

  updateTrackHeight() {
    if (this.type === TrackType.MAIN) return

    this.height = this.hasVideo ? VIDEO_TRACK_HEIGHT : OTHER_TRACK_HEIGHT
  }

  getTrackItem(item: string | TrackItem): TrackItem | null {
    const id = isString(item) ? item : item.id
    const target = this._trackItemList.find((item) => item.id === id)
    return target ?? null
  }

  /**
   * 清空当前 trackLine 的 trackList
   */
  clearTrackList() {
    this._trackItemList.splice(0, this._trackItemList.length)

    const trackStore = useTrackStore()
    trackStore.updateMaxFrameCount()
    this.updateTrackHeight()
  }

  protected toBaseData(): BaseTrackData {
    return {
      id: this.id
    }
  }
}
