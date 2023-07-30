import type { ComputedRef, Ref } from 'vue'
import { getDistance } from './helper'

export const useScalable = (
  centerViewportCoordinate: ComputedRef<{ x: number; y: number }>,
  viewPortRotatedRotation: ComputedRef<{ x: number; y: number }>,
  scale: Ref<number>,
  notScalableDistance: Ref<number>
) => {
  let dragging = false

  function updateScale(event: PointerEvent) {
    const { clientX, clientY } = event

    const distance = getDistance(
      {
        x: clientX,
        y: clientY
      },
      [centerViewportCoordinate.value, viewPortRotatedRotation.value]
    )

    scale.value = distance / notScalableDistance.value
  }

  function onDragStart() {
    dragging = true
  }

  function onDragging(event: PointerEvent) {
    if (dragging) {
      updateScale(event)
    }
  }

  function onDragEnd(event: PointerEvent) {
    setTimeout(() => {
      dragging = false
      updateScale(event)
    }, 0)

    window.removeEventListener('pointermove', onDragging)
    window.removeEventListener('pointerup', onDragEnd)
  }

  function onScale(event: PointerEvent) {
    event.preventDefault()
    event.stopPropagation()
    onDragStart()

    window.addEventListener('pointermove', onDragging)
    window.addEventListener('pointerup', onDragEnd)
  }

  return {
    onScale
  }
}
