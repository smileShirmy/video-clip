import {
  TrackItemName,
  type TextResource,
  type PlayerAttribute,
  type AttributeOptions,
  type TextAttribute
} from '@/types'
import { BaseTrackItem } from './base-track-item'
import { ref, shallowReactive, type ComputedRef, type ShallowReactive, computed } from 'vue'
import type { VideoTrack } from '../track/video-track'
import { DEFAULT_TEXT } from '@/config'

export class TextTrackItem extends BaseTrackItem<TextResource, TextTrackItem, VideoTrack> {
  readonly component = TrackItemName.TRACK_ITEM_TEXT

  resource: TextResource

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
    letterSpacingRatio: 0
  })

  text = ref<string>(DEFAULT_TEXT)

  constructor(resource: TextResource, attribute: AttributeOptions) {
    super()
    const { topRatio, leftRatio, widthRatio, heightRatio } = attribute
    this.attribute.topRatio = topRatio
    this.attribute.leftRatio = leftRatio
    this.attribute.widthRatio = widthRatio
    this.attribute.heightRatio = heightRatio

    this.setEndFrame(resource.frameCount)
    this.resource = Object.assign({}, resource)

    this.renderSize = {
      top: computed(() => this.playerStore.sceneHeight * this.attribute.topRatio),
      left: computed(() => this.playerStore.sceneWidth * this.attribute.leftRatio),
      width: computed(() => this.playerStore.sceneWidth * this.attribute.widthRatio),
      height: computed(() => this.playerStore.sceneHeight * this.attribute.heightRatio)
    }
  }

  split(splitFrame: number) {
    const newItem = TextTrackItem.create(Object.assign({}, this.resource), this.attribute)
    this.parentTrack?.addTrackItemWithNoEffect(newItem)

    return this.baseSplit(newItem, splitFrame)
  }

  static create(resource: TextResource, attribute: AttributeOptions) {
    return new TextTrackItem(resource, attribute)
  }
}
