import { useTimelineStore } from '@/stores/timeline'
import { useTrackStore } from '@/stores/track'
import { onMounted, type Ref } from 'vue'

export const useMousedown = (
  timelineResourceRef: Ref<HTMLDivElement | undefined>,
  previewLineX: Ref<number>
) => {
  const trackStore = useTrackStore()
  const timeLienStore = useTimelineStore()

  function onMousedown(e: MouseEvent) {
    if (trackStore.showPreviewLine) {
      trackStore.seekLineFrame = timeLienStore.pixelToFrame(previewLineX.value)
      return
    }

    trackStore.seekLineFrame = timeLienStore.pixelToFrame(e.offsetX)
  }

  function addListener() {
    const ref = timelineResourceRef.value
    if (!ref) return

    ref.addEventListener('mousedown', onMousedown)
  }

  onMounted(() => {
    addListener()
  })
}
