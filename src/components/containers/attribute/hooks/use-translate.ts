import { PlayerAttributeChangeAction } from '@/services/steps-manager/player-attribute-action'
import type { PlayerTrackItem } from '@/services/track-item'
import { computed, type ComputedRef } from 'vue'

export const useTranslate = (trackItem: ComputedRef<PlayerTrackItem>) => {
  const translateX = computed({
    get() {
      return trackItem.value.attribute.leftRatio * 100
    },
    set(x) {
      trackItem.value.attribute.leftRatio = x / 100
    }
  })

  function onTranslateXChange(newVal: number, oldVal: number) {
    new PlayerAttributeChangeAction(trackItem.value.id, {
      leftRatio: oldVal / 100
    }).end({
      leftRatio: newVal / 100
    })
  }

  const translateY = computed({
    get() {
      return trackItem.value.attribute.topRatio * 100
    },
    set(y) {
      trackItem.value.attribute.topRatio = y / 100
    }
  })

  function onTranslateYChange(newVal: number, oldVal: number) {
    new PlayerAttributeChangeAction(trackItem.value.id, {
      topRatio: oldVal / 100
    }).end({
      topRatio: newVal / 100
    })
  }

  return {
    translateX,
    translateY,
    onTranslateXChange,
    onTranslateYChange
  }
}
