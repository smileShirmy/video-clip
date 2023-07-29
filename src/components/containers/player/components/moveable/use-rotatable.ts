import type { ComputedRef, Ref } from 'vue'
import { getDegree } from './helper'

export const useRotatable = (
  centerViewportCoordinate: ComputedRef<{ x: number; y: number }>,
  rotate: Ref<number>
) => {
  let dragging = false

  function onDragStart() {
    dragging = true
  }

  function updateDegree(event: PointerEvent) {
    const { clientX, clientY } = event
    const { x, y } = centerViewportCoordinate.value
    const degree = getDegree(
      {
        x: clientX,
        y: clientY
      },
      {
        x,
        y
      }
    )
    rotate.value = degree
  }

  function onDragging(event: PointerEvent) {
    if (dragging) {
      updateDegree(event)
    }
  }

  function onDragEnd(event: PointerEvent) {
    setTimeout(() => {
      dragging = false
      updateDegree(event)
    })
  }

  function onRotate(event: PointerEvent) {
    event.preventDefault()
    event.stopPropagation()
    onDragStart()

    window.addEventListener('pointermove', onDragging)
    window.addEventListener('pointerup', onDragEnd)
  }

  return {
    onRotate
  }
}
