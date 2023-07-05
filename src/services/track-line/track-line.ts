import { shallowReactive, warn, watch } from 'vue'
import { isArray, isString, uuid } from '../helpers/general'
import type { TrackItem, VideoTrackItem } from '../track-item/track-item'
import type { TrackLineListType } from '../track-line-list/track-line-list'

export enum TrackLineType {
  MAIN = 'main',
  VIDEO = 'video'
}

abstract class BaseTrackLine<T extends TrackItem> {
  readonly id = uuid()

  parentTrackLineList: TrackLineListType | null = null

  abstract readonly height: number

  abstract readonly type: TrackLineType

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
  removeTrackItem(item: string | TrackItem) {
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

    return removed
  }

  /**
   * 添加 trackItem
   * 添加之前需要移除相同 id 的 trackItem，由此来实现移动
   */
  addTrackItem(trackItem: T | T[]) {
    const list = isArray(trackItem) ? trackItem : [trackItem]
    list.forEach((trackItem) => {
      if (this.parentTrackLineList) {
        // 添加之前先移除 trackLine 中相同的 trackItem
        const removed = this.parentTrackLineList.removeTrackItem(trackItem)

        this._trackList.push(trackItem)

        // 如果之前没有相同的 trackItem，说明这是一个全新的 trackItem
        if (!removed) {
          trackItem.initMinAndMaxFrame(trackItem.startFrame)
        } else {
          // 更新允许拖动范围的最大最小帧
          trackItem.updateMinAndMax()
        }

        // 添加之后需要移除空的 trackLine
        this.parentTrackLineList.removeEmptyTrackLine()
        return
      }
      warn('添加 trackItem 之前请先把当前 trackLine 插入到 trackLineList 中')
    })
  }

  /**
   * 清空当前 trackLine 的 trackList
   */
  clearTrackList() {
    this._trackList.splice(0, this._trackList.length)
  }

  /**
   * 绑定所属 trackLine
   */
  bindParentTrackLine(trackList: T[]) {
    watch(
      trackList,
      () => {
        trackList.forEach((item) => (item.parentTrackLine = this))
      },
      { immediate: true }
    )
  }
}

export class MainTrackLine extends BaseTrackLine<VideoTrackItem> {
  type = TrackLineType.MAIN

  height = 60

  constructor() {
    super()
    this.bindParentTrackLine(this._trackList)
  }

  static create() {
    return new MainTrackLine()
  }
}

export class VideoTrackLine extends BaseTrackLine<VideoTrackItem> {
  type = TrackLineType.VIDEO

  height = 60

  constructor() {
    super()
    this.bindParentTrackLine(this._trackList)
  }

  static create() {
    return new VideoTrackLine()
  }
}

export type TrackLine = MainTrackLine | VideoTrackLine
