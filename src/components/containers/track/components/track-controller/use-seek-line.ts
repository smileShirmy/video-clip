import { useTimelineStore } from '@/stores/timeline'
import { useTrackStore } from '@/stores/track'
import { onMounted, type Ref } from 'vue'

export const useSeekLine = (
  timelineResourceRef: Ref<HTMLDivElement | undefined>,
  previewLineX: Ref<number>
) => {
  const trackStore = useTrackStore()
  const timeLienStore = useTimelineStore()

  function onPointerdown(e: PointerEvent) {
    if (trackStore.showPreviewLine) {
      trackStore.seekLineFrame = timeLienStore.pixelToFrame(previewLineX.value)
      return
    }

    trackStore.seekLineFrame = timeLienStore.pixelToFrame(e.offsetX)
  }

  function addListener() {
    const ref = timelineResourceRef.value
    if (!ref) return

    ref.addEventListener('pointerdown', onPointerdown)
  }

  onMounted(() => {
    addListener()
  })
}
