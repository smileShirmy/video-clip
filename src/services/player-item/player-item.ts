import { ref, type Ref, type ShallowReactive } from 'vue'
import type { PlayerTrackItem } from '../track-item'
import type { PlayerAttribute } from '@/types'
import type { PlayerStore } from '@/stores/player'

export class PlayerItem {
  readonly trackItem: PlayerTrackItem
  readonly playerStore: PlayerStore

  top: Ref<number> = ref(0)
  left: Ref<number> = ref(0)
  width: Ref<number> = ref(0)
  height: Ref<number> = ref(0)

  get attribute(): ShallowReactive<PlayerAttribute> {
    return this.trackItem.attribute
  }

  constructor(trackItem: PlayerTrackItem, playerStore: PlayerStore) {
    this.trackItem = trackItem
    this.playerStore = playerStore

    this.updateAttribute()
  }

  updateAttribute() {
    const { sceneWidth, sceneHeight } = this.playerStore
    const { topRatio, leftRatio, widthRatio, heightRatio } = this.trackItem.attribute

    const top = sceneHeight * topRatio
    const left = sceneWidth * leftRatio
    const width = sceneWidth * widthRatio
    const height = sceneHeight * heightRatio

    this.top.value = top
    this.left.value = left
    this.width.value = width
    this.height.value = height
  }
}
