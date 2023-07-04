import { shallowReactive, watch, type ShallowReactive } from 'vue'
import { isString, uuid } from '../helpers/general'
import type { TrackItem, VideoTrackItem } from '../track-item/track-item'

export enum TrackLineType {
  MAIN = 'main',
  VIDEO = 'video'
}

abstract class BaseTrackLine<T extends TrackItem> {
  readonly id = uuid()

  abstract readonly height: number

  abstract readonly type: TrackLineType

  abstract readonly trackList: ShallowReactive<T[]>

  /**
   * 移除指定 trackItem
   */
  removeTrackItem(item: string | TrackItem) {
    const id = isString(item) ? item : item.id

    const len = this.trackList.length - 1
    for (let i = len; i >= 0; i -= 1) {
      const trackItem = this.trackList[i]
      if (trackItem.id === id) {
        this.trackList.splice(i, 1)
      }
    }
  }

  bindParentTrackLine(trackList: T[]) {
    watch(trackList, () => {
      trackList.forEach((item) => (item.parentTrackLine = this))
    })
  }
}

export class MainTrackLine extends BaseTrackLine<VideoTrackItem> {
  type = TrackLineType.MAIN

  height = 60

  trackList = shallowReactive<VideoTrackItem[]>([])

  constructor() {
    super()
    this.bindParentTrackLine(this.trackList)
  }

  static create() {
    return new MainTrackLine()
  }
}

export class VideoTrackLine extends BaseTrackLine<VideoTrackItem> {
  type = TrackLineType.VIDEO

  height = 60

  trackList = shallowReactive<VideoTrackItem[]>([])

  constructor(videoTrackItem: VideoTrackItem) {
    super()
    this.bindParentTrackLine(this.trackList)

    this.trackList.push(videoTrackItem)
  }

  static create(videoTrackItem: VideoTrackItem) {
    return new VideoTrackLine(videoTrackItem)
  }
}

export type TrackLine = MainTrackLine | VideoTrackLine
