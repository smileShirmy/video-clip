import type { ComputedRef, Ref } from 'vue'
import { getDegree } from './helper'

export const useRotatable = (
  centerViewportCoordinate: ComputedRef<{ x: number; y: number }>,
  rotate: Ref<number>,
  inOperation: Ref<boolean>,
  events: {
    change: (newVal: number, oldVal: number) => void
  }
) => {
  let dragging = false
  let startRotate = rotate.value

  function onDragStart() {
    startRotate = rotate.value
    dragging = true
    inOperation.value = true
  }

  function updateRotate(event: PointerEvent) {
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
      updateRotate(event)
    }
  }

  function onDragEnd(event: PointerEvent) {
    setTimeout(() => {
      dragging = false
      inOperation.value = false
      updateRotate(event)

      if (rotate.value !== startRotate) {
        events.change(rotate.value, startRotate)
      }
    }, 0)

    window.removeEventListener('pointermove', onDragging)
    window.removeEventListener('pointerup', onDragEnd)
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
