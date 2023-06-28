import { ref, type ComputedRef, type CSSProperties, computed } from 'vue'
import { useTimelineStore } from '@/stores/timeline'

export const useStickyLine = () => {
  const timelineStore = useTimelineStore()

  const horizontalLineTop = ref(0)

  const verticalLineFrame = ref(0)

  const horizontalLineStyle: ComputedRef<CSSProperties> = computed(() => ({
    top: `${horizontalLineTop.value}px`
  }))

  const verticalLineStyle: ComputedRef<CSSProperties> = computed(() => ({
    left: timelineStore.frameToPercentWithUnit(verticalLineFrame.value)
  }))

  function updateHorizontalLine(top: number) {
    horizontalLineTop.value = top
  }

  function updateVerticalLine(frame: number) {
    verticalLineFrame.value = frame
  }

  return {
    horizontalLineTop,
    verticalLineFrame,
    horizontalLineStyle,
    verticalLineStyle,
    updateHorizontalLine,
    updateVerticalLine
  }
}
