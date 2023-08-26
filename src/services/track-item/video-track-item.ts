import {
  TrackItemName,
  type PlayerAttribute,
  type VideoResource,
  type AttributeOptions,
  type VideoTrackItemData,
  type BaseTrackItemData
} from '@/types'
import { BaseTrackItem } from './base-track-item'
import type { MainTrack } from '../track/main-track'
import type { VideoTrack } from '../track/video-track'
import { computed, shallowReactive, type ComputedRef, type ShallowReactive, watch } from 'vue'
import { deepClone, isNumber } from '../helpers/general'
import { Events, emitter } from '../mitt/emitter'

export class VideoTrackItem extends BaseTrackItem<
  VideoResource,
  VideoTrackItem,
  MainTrack | VideoTrack
> {
  readonly component = TrackItemName.TRACK_ITEM_VIDEO

  readonly renderSize: {
    top: ComputedRef<number>
    left: ComputedRef<number>
    width: ComputedRef<number>
    height: ComputedRef<number>
  }

  attribute: ShallowReactive<PlayerAttribute> = shallowReactive({
    topRatio: 0,
    leftRatio: 0,
    widthRatio: 1,
    heightRatio: 1,
    scale: 1,
    rotate: 0,
    opacity: 1
  })

  constructor(
    resource: VideoResource,
    options: {
      base?: BaseTrackItemData
      attribute: AttributeOptions
    }
  ) {
    const { base, attribute } = options

    super(resource, base)

    const { topRatio, leftRatio, widthRatio, heightRatio, scale, rotate, opacity } = attribute
    this.attribute.topRatio = topRatio
    this.attribute.leftRatio = leftRatio
    this.attribute.widthRatio = widthRatio
    this.attribute.heightRatio = heightRatio

    if (isNumber(scale)) {
      this.attribute.scale = scale
    }
    if (isNumber(rotate)) {
      this.attribute.rotate = rotate
    }
    if (isNumber(opacity)) {
      this.attribute.opacity = opacity
    }

    this.renderSize = {
      top: computed(() => this.playerStore.sceneHeight * this.attribute.topRatio),
      left: computed(() => this.playerStore.sceneWidth * this.attribute.leftRatio),
      width: computed(() => this.playerStore.sceneWidth * this.attribute.widthRatio),
      height: computed(() => this.playerStore.sceneHeight * this.attribute.heightRatio)
    }

    watch(
      [this.attribute],
      () => {
        emitter.emit(Events.UPDATE_PLAYER)
      },
      {
        flush: 'post'
      }
    )
  }

  split(splitFrame: number): [VideoTrackItem, VideoTrackItem] {
    const newItem = VideoTrackItem.create(Object.assign({}, this.resource), this.attribute)
    this.parentTrack?.addTrackItemWithNoEffect(newItem)

    this.baseSplit(newItem, splitFrame)

    return [this, newItem]
  }

  toData(): VideoTrackItemData {
    return {
      type: this.component,
      base: this.toBaseData(),
      resource: deepClone(this.resource),
      attribute: deepClone(this.attribute)
    }
  }

  static toTrackItem(data: VideoTrackItemData) {
    const { resource, base, attribute } = data
    return new VideoTrackItem(resource, {
      base,
      attribute
    })
  }

  static create(resource: VideoResource, attribute: AttributeOptions) {
    return new VideoTrackItem(resource, {
      attribute
    })
  }
}
