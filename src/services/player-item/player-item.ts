import { ref, type Ref, type ShallowReactive } from 'vue'
import type { PlayerTrackItem } from '../track-item'
import type { PlayerAttribute } from '@/types'

export class PlayerItem {
  readonly trackItem: PlayerTrackItem
  private readonly sceneHeight: number
  private readonly sceneWidth: number

  top: Ref<number> = ref(0)
  left: Ref<number> = ref(0)
  width: Ref<number> = ref(0)
  height: Ref<number> = ref(0)

  get attribute(): ShallowReactive<PlayerAttribute> {
    return this.trackItem.attribute
  }

  constructor(trackItem: PlayerTrackItem, sceneWidth: number, sceneHeight: number) {
    this.trackItem = trackItem
    this.sceneWidth = sceneWidth
    this.sceneHeight = sceneHeight

    this.updateAttribute()
  }

  updateAttribute() {
    const { topRatio, leftRatio, widthRatio, heightRatio } = this.trackItem.attribute

    const top = this.sceneHeight * topRatio
    const left = this.sceneWidth * leftRatio
    const width = this.sceneWidth * widthRatio
    const height = this.sceneHeight * heightRatio

    this.top.value = top
    this.left.value = left
    this.width.value = width
    this.height.value = height
  }
}
