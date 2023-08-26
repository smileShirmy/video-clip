import { PlayerAttributeChangeAction } from '@/services/steps-manager/player-attribute-action'
import type { PlayerTrackItem } from '@/services/track-item'
import { computed, type ComputedRef } from 'vue'

export const useScale = (trackItem: ComputedRef<PlayerTrackItem>) => {
  const scale = computed({
    get() {
      return trackItem.value.attribute.scale * 100
    },
    set(scale) {
      trackItem.value.attribute.scale = scale / 100
    }
  })

  function onScaleChange(newVal: number, oldVal: number) {
    new PlayerAttributeChangeAction(trackItem.value.id, {
      scale: oldVal / 100
    }).end({
      scale: newVal / 100
    })
  }

  return {
    scale,
    onScaleChange
  }
}
