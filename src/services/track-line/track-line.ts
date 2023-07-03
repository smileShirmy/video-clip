import { shallowReactive, type ShallowReactive } from 'vue'
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

  abstract trackList: ShallowReactive<T[]>

  /**
   * 移除指定 trackItem
   */
  removeTrackItem(item: string | TrackItem) {
    const id = isString(item) ? item : item.id
    this.trackList = this.trackList.filter((v) => v.id !== id)
  }
}

export class MainTrackLine extends BaseTrackLine<VideoTrackItem> {
  type = TrackLineType.MAIN

  height = 60

  trackList = shallowReactive<VideoTrackItem[]>([])

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
    this.trackList = [videoTrackItem]
  }

  static create(videoTrackItem: VideoTrackItem) {
    return new VideoTrackLine(videoTrackItem)
  }
}

export type TrackLine = MainTrackLine | VideoTrackLine
