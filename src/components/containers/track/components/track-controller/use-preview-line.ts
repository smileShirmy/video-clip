import { useTrackStore } from '@/stores/track'
import {
  onMounted,
  ref,
  watch,
  type Ref,
  computed,
  type ComputedRef,
  type CSSProperties
} from 'vue'
import { storeToRefs } from 'pinia'
import { getElementPosition } from '@/services/helpers/dom'
import { useThrottleFn } from '@vueuse/core'
import { trackLineList } from '@/services/track-line-list/track-line-list'
import { useTimelineStore } from '@/stores/timeline'
import { TRACK_STICK_WIDTH } from '@/config'
import { isNumber } from '@/services/helpers/general'
import { draggable } from '@/services/draggable/draggable'

export const usePreviewLine = (
  trackContentRef: Ref<HTMLDivElement | undefined>,
  timelineResourceRef: Ref<HTMLDivElement | undefined>
) => {
  const trackStore = useTrackStore()
  const timelineStore = useTimelineStore()
  const { enablePreviewLine, showPreviewLine, enableSticky } = storeToRefs(trackStore)

  const previewLineX = ref(0)

  const isSticky = ref(false)

  const previewLineStyle: ComputedRef<CSSProperties> = computed(() => ({
    visibility: previewLineX.value < 0 ? 'hidden' : 'unset',
    left: `${previewLineX.value}px`,
    backgroundColor: isSticky.value ? '#7086e9' : '#ff6490'
  }))

  const onMove = useThrottleFn((e: MouseEvent) => {
    if (!trackContentRef.value || !showPreviewLine.value) return

    const { left } = getElementPosition(e.target as HTMLElement, trackContentRef.value)
    const x = left + e.offsetX
    let stickyX: number | null = null
    let closestDiff: number | null = null
    isSticky.value = false

    const maxFrame = timelineStore.frameToPixelWidth(trackLineList.getMaxFrame())
    if (maxFrame === 0 || x > maxFrame) {
      previewLineX.value = -1
      return
    }

    if (enableSticky) {
      trackLineList.list.forEach((line) => {
        line.trackList.forEach((trackItem) => {
          const start = timelineStore.frameToPixel(trackItem.startFrame)
          const end = timelineStore.frameToPixel(trackItem.endFrame)

          const startDiff = Math.abs(start - x)
          if (startDiff < TRACK_STICK_WIDTH) {
            if (closestDiff === null || startDiff < closestDiff) {
              closestDiff = startDiff
              stickyX = start
            }
          }
          const endDiff = Math.abs(end - x)
          if (endDiff < TRACK_STICK_WIDTH) {
            if (closestDiff === null || endDiff < closestDiff) {
              closestDiff = endDiff
              stickyX = end
            }
          }
        })
      })
    }

    isSticky.value = isNumber(stickyX)
    showPreviewLine.value = true
    previewLineX.value = isNumber(stickyX) ? stickyX : x
  }, 15)

  function onMouseleave() {
    showPreviewLine.value = false
  }

  function onMouseenter() {
    if (enablePreviewLine.value && !draggable.dragging) {
      showPreviewLine.value = true
    }
  }

  function addListener() {
    const ref = timelineResourceRef.value
    if (ref) {
      ref.addEventListener('mouseenter', onMouseenter)
      ref.addEventListener('mousemove', onMove)
      ref.addEventListener('mouseleave', onMouseleave)
    }
  }

  function removeListener() {
    const ref = timelineResourceRef.value
    if (ref) {
      ref.removeEventListener('mouseenter', onMouseenter)
      ref.removeEventListener('mousemove', onMove)
      ref.removeEventListener('mouseleave', onMouseleave)
    }
  }

  watch(enablePreviewLine, (enable) => {
    enable ? addListener() : removeListener()
  })

  onMounted(() => {
    if (enablePreviewLine) {
      addListener()
    }
  })

  return {
    previewLineX,
    previewLineStyle
  }
}
