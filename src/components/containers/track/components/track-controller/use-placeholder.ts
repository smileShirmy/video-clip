import { useTimelineStore } from '@/stores/timeline'
import { reactive, ref, type ComputedRef, type CSSProperties, computed } from 'vue'

interface PlaceholderProperty {
  top: number
  startFrame: number
  frameCount: number
  height: number
}

type PartialPlaceholderProperty = Partial<PlaceholderProperty>

type Property = keyof PlaceholderProperty

const createProperty = (): PlaceholderProperty => ({
  top: 0,
  startFrame: 0,
  frameCount: 0,
  height: 60
})

export const usePlaceholder = () => {
  const timelineStore = useTimelineStore()

  const trackPlaceholderRef = ref<HTMLDivElement>()

  const placeholderProperty: PlaceholderProperty = createProperty()

  const reactiveProperty = reactive<PlaceholderProperty>(createProperty())

  const trackPlaceholderStyle: ComputedRef<CSSProperties> = computed(() => {
    return {
      top: `${reactiveProperty.top}px`,
      left: timelineStore.frameToPercentWithUnit(reactiveProperty.startFrame),
      width: timelineStore.frameToPixelWidthWithUnit(reactiveProperty.frameCount),
      height: `${reactiveProperty.height}px`
    }
  })

  const updatePlaceholder = (options: PartialPlaceholderProperty) => {
    for (const [k, v] of Object.entries(options)) {
      if (reactiveProperty[k as Property] !== v) {
        reactiveProperty[k as Property] = v
      }
    }
  }

  return {
    placeholderProperty,
    trackPlaceholderRef,
    trackPlaceholderStyle,
    updatePlaceholder
  }
}
