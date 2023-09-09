import {
  TrackItemName,
  type StickerResource,
  type PlayerAttribute,
  type AttributeOptions,
  type StickerTrackItemData,
  type BaseTrackItemData
} from '@/types'
import { BaseTrackItem } from './base-track-item'
import type { VideoTrack } from '../track/video-track'
import { shallowReactive, type ComputedRef, type ShallowReactive, computed, watch } from 'vue'
import { deepClone, isNumber } from '../helpers/general'
import { Events, emitter } from '../mitt/emitter'

export class StickerTrackItem extends BaseTrackItem<StickerResource, StickerTrackItem, VideoTrack> {
  readonly component = TrackItemName.TRACK_ITEM_STICKER

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
    resource: StickerResource,
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
        emitter.emit(Events.UPDATE_PLAYER_ATTRIBUTE)
      },
      {
        flush: 'post'
      }
    )
  }

  split(splitFrame: number): [StickerTrackItem, StickerTrackItem] {
    const newItem = StickerTrackItem.create(Object.assign({}, this.resource), this.attribute)
    this.parentTrack?.addTrackItemWithNoEffect(newItem)

    this.baseSplit(newItem, splitFrame)

    return [this, newItem]
  }

  toData(): StickerTrackItemData {
    return {
      type: this.component,
      base: this.toBaseData(),
      resource: deepClone(this.resource),
      attribute: deepClone(this.attribute)
    }
  }

  static toTrackItem(data: StickerTrackItemData) {
    const { resource, base, attribute } = data
    return new StickerTrackItem(resource, {
      base,
      attribute
    })
  }

  static create(resource: StickerResource, attribute: AttributeOptions) {
    return new StickerTrackItem(resource, {
      attribute
    })
  }
}
