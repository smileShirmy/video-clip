import { PlayerAttributeChangeAction } from '@/services/steps-manager/player-attribute-action'
import type { PlayerTrackItem } from '@/services/track-item'
import { computed, type ComputedRef } from 'vue'

export const useRotate = (trackItem: ComputedRef<PlayerTrackItem>) => {
  const rotate = computed({
    get() {
      return trackItem.value.attribute.rotate
    },
    set(rotate) {
      trackItem.value.attribute.rotate = rotate
    }
  })

  function onRotateChange(newVal: number, oldVal: number) {
    new PlayerAttributeChangeAction(trackItem.value.id, {
      rotate: oldVal
    }).end({
      rotate: newVal
    })
  }

  return {
    rotate,
    onRotateChange
  }
}
