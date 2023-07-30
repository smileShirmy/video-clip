import type { ComputedRef, Ref } from 'vue'
import { getDistance } from './helper'

export const useScalable = (
  centerViewportCoordinate: ComputedRef<{ x: number; y: number }>,
  viewPortRotatedRotation: ComputedRef<{ x: number; y: number }>,
  scale: Ref<number>,
  notScalableDistance: Ref<number>
) => {
  let dragging = false
  let sideTag = false

  function inOnSide(event: PointerEvent) {
    const { clientX: x, clientY: y } = event
    const { x: x1, y: y1 } = centerViewportCoordinate.value
    const { x: x2, y: y2 } = viewPortRotatedRotation.value
    if (x1 === x2) {
      return x < x1
    } else if (y1 === y2) {
      return y < y1
    }

    const tmpX = ((x1 - x2) / (y1 - y2)) * (y - y2) + x2
    return tmpX > x
  }

  function updateScale(event: PointerEvent) {
    const { clientX, clientY } = event

    const distance = getDistance(
      {
        x: clientX,
        y: clientY
      },
      [centerViewportCoordinate.value, viewPortRotatedRotation.value]
    )

    if (inOnSide(event) === sideTag) {
      scale.value = distance / notScalableDistance.value
    }
  }

  function onDragStart(event: PointerEvent) {
    sideTag = inOnSide(event)
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
    onDragStart(event)

    window.addEventListener('pointermove', onDragging)
    window.addEventListener('pointerup', onDragEnd)
  }

  return {
    onScale
  }
}
