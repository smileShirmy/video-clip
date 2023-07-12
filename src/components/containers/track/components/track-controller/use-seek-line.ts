import { draggable } from '@/services/draggable/draggable'
import { useTimelineStore } from '@/stores/timeline'
import { useTrackStore } from '@/stores/track'
import { onMounted, type Ref } from 'vue'

export const useSeekLine = (
  timelineResourceRef: Ref<HTMLDivElement | undefined>,
  previewLineX: Ref<number>
) => {
  const trackStore = useTrackStore()
  const timeLienStore = useTimelineStore()

  function onPointerup(e: PointerEvent) {
    if (draggable.resizing || draggable.dragging || e.target !== timelineResourceRef.value) return

    if (trackStore.showPreviewLine) {
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
