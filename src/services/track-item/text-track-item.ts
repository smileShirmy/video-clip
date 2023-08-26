import {
  TrackItemName,
  type TextResource,
  type PlayerAttribute,
  type AttributeOptions,
  type TextAttribute,
  type TextTrackItemData,
  type BaseTrackItemData
} from '@/types'
import { BaseTrackItem } from './base-track-item'
import { ref, shallowReactive, type ComputedRef, type ShallowReactive, computed, watch } from 'vue'
import type { VideoTrack } from '../track/video-track'
import { DEFAULT_TEXT } from '@/config'
import { deepClone, isNumber, isString } from '../helpers/general'
import { Events, emitter } from '../mitt/emitter'

export class TextTrackItem extends BaseTrackItem<TextResource, TextTrackItem, VideoTrack> {
  readonly component = TrackItemName.TRACK_ITEM_TEXT

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

  textAttribute = shallowReactive<TextAttribute>({
    letterSpacingRatio: 0,
    lineSpacingRatio: 0
  })

  text = ref<string>(DEFAULT_TEXT)

  constructor(
    resource: TextResource,
    options: {
      base?: BaseTrackItemData
      attribute: AttributeOptions
      textAttribute?: TextAttribute
      text?: string
    }
  ) {
    const {
      base,
      attribute,
      textAttribute = shallowReactive<TextAttribute>({
        letterSpacingRatio: 0,
        lineSpacingRatio: 0
      }),
      text
    } = options

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

    if (textAttribute) {
      const { letterSpacingRatio, lineSpacingRatio } = textAttribute
      this.textAttribute.letterSpacingRatio = letterSpacingRatio
      this.textAttribute.lineSpacingRatio = lineSpacingRatio
    }

    if (isString(text)) {
      this.text.value = text
    }

    watch(
      [this.attribute, this.text, this.textAttribute],
      () => {
        emitter.emit(Events.UPDATE_PLAYER)
      },
      {
        flush: 'post'
      }
    )
  }

  split(splitFrame: number): [TextTrackItem, TextTrackItem] {
    const newItem = TextTrackItem.create(Object.assign({}, this.resource), this.attribute)
    this.parentTrack?.addTrackItemWithNoEffect(newItem)

    this.baseSplit(newItem, splitFrame)

    return [this, newItem]
  }

  toData(): TextTrackItemData {
    return {
      type: this.component,
      base: this.toBaseData(),
      resource: deepClone(this.resource),
      attribute: deepClone(this.attribute),
      textAttribute: deepClone(this.textAttribute),
      text: this.text.value
    }
  }

  static toTrackItem(data: TextTrackItemData) {
    const { resource, attribute, textAttribute, text, base } = data
    return new TextTrackItem(resource, {
      base,
      attribute,
      textAttribute,
      text
    })
  }

  static create(resource: TextResource, attribute: AttributeOptions) {
    return new TextTrackItem(resource, {
      attribute
    })
  }
}
