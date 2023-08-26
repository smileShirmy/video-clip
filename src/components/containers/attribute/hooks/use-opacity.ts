import { PlayerAttributeChangeAction } from '@/services/steps-manager/player-attribute-action'
import type { PlayerTrackItem } from '@/services/track-item'
import { computed, type ComputedRef } from 'vue'

export const useOpacity = (trackItem: ComputedRef<PlayerTrackItem>) => {
  const opacity = computed({
    get() {
      return trackItem.value.attribute.opacity * 100
    },
    set(opacity) {
      trackItem.value.attribute.opacity = opacity / 100
    }
  })

  function onOpacityChange(newVal: number, oldVal: number) {
    new PlayerAttributeChangeAction(trackItem.value.id, {
      opacity: oldVal / 100
    }).end({
      opacity: newVal / 100
    })
  }

  return {
    opacity,
    onOpacityChange
  }
}
