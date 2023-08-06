import { ref, type Ref, type ShallowReactive } from 'vue'
import type { PlayerTrackItem } from '../track-item'
import type { PlayerAttribute } from '@/types'
import type { PlayerStore } from '@/stores/player'

export class PlayerItem {
  readonly trackItem: PlayerTrackItem

  top: Ref<number> = ref(0)
  left: Ref<number> = ref(0)
  width: Ref<number> = ref(0)
  height: Ref<number> = ref(0)

  private startTop: number
  private startLeft: number
  private startWidth: number
  private startHeight: number

  get attribute(): ShallowReactive<PlayerAttribute> {
    return this.trackItem.attribute
  }

  constructor(trackItem: PlayerTrackItem, playerStore: PlayerStore) {
    this.trackItem = trackItem
    const { topRatio, leftRatio, widthRatio, heightRatio } = trackItem.attribute
    const { sceneWidth, sceneHeight } = playerStore

    const top = sceneHeight * topRatio
    const left = sceneWidth * leftRatio
    const width = sceneWidth * widthRatio
    const height = sceneHeight * heightRatio

    this.top.value = top
    this.left.value = left
    this.width.value = width
    this.height.value = height

    this.startTop = top
    this.startLeft = left
    this.startWidth = width
    this.startHeight = height
  }

  recordStartAttribute() {
    this.startTop = this.top.value
    this.startLeft = this.left.value
    this.startHeight = this.height.value
    this.startWidth = this.width.value
  }

  updateAttribute(ratio: number) {
    this.top.value = this.startTop * ratio
    this.left.value = this.startLeft * ratio
    this.width.value = this.startWidth * ratio
    this.height.value = this.startHeight * ratio
  }
}
