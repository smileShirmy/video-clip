import { draggable } from '@/services/draggable/draggable'
import { findParent } from '@/services/helpers/dom'
import { isString } from '@/services/helpers/general'
import { useTimelineStore } from '@/stores/timeline'
import { useTrackStore } from '@/stores/track'
import { onMounted, type Ref } from 'vue'

export const useSeekLine = (
  timelineResourceRef: Ref<HTMLDivElement | null>,
  previewLineX: Ref<number>
) => {
  const trackStore = useTrackStore()
  const timeLienStore = useTimelineStore()

  function onPointerup(e: PointerEvent) {
    if (draggable.resizing || draggable.draggingState !== null) return

    const target = e.target
    if (target instanceof HTMLElement && findParent(target, (el) => isString(el.dataset.trackItem)))
      return

    if (trackStore.showPreviewLine && previewLineX.value > -1) {
      trackStore.seekLineFrame = timeLienStore.pixelToFrame(previewLineX.value)
      return
    }

    trackStore.seekLineFrame = timeLienStore.pixelToFrame(e.offsetX)
  }

  function addListener() {
    const ref = timelineResourceRef.value
    if (!ref) return

    ref.addEventListener('pointerup', onPointerup)
  }

  onMounted(() => {
    addListener()
  })
}
