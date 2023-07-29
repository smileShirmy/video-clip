import type { ShallowReactive } from 'vue'

export const useMoveable = (
  translate: ShallowReactive<{ x: number; y: number }>,
  centerBoxCoordinate: ShallowReactive<{ x: number; y: number }>
) => {
  let dragging = false
  let startX = 0
  let startY = 0
  let startTranslateX = 0
  let startTranslateY = 0
  let startCenterX = 0
  let startCenterY = 0

  function onDragStart(event: PointerEvent) {
    dragging = true
    startX = event.clientX
    startY = event.clientY
    startTranslateX = translate.x
    startTranslateY = translate.y
    startCenterX = centerBoxCoordinate.x
    startCenterY = centerBoxCoordinate.y
  }

  function updatePosition(event: PointerEvent) {
    const diffX = event.clientX - startX
    const diffY = event.clientY - startY

    translate.x = startTranslateX + diffX
    translate.y = startTranslateY + diffY

    centerBoxCoordinate.x = startCenterX + diffX
    centerBoxCoordinate.y = startCenterY + diffY
  }

  function onDragging(event: PointerEvent) {
    if (dragging) {
      updatePosition(event)
    }
  }

  function onDragEnd(event: PointerEvent) {
    setTimeout(() => {
      dragging = false
      updatePosition(event)
    }, 0)

    window.removeEventListener('pointermove', onDragging)
    window.removeEventListener('pointerup', onDragEnd)
  }

  function onPointerDown(event: PointerEvent) {
    event.preventDefault()
    event.stopPropagation()
    onDragStart(event)

    window.addEventListener('pointermove', onDragging)
    window.addEventListener('pointerup', onDragEnd)
  }

  function onMove(moveTarget: HTMLDivElement) {
    moveTarget.addEventListener('pointerdown', onPointerDown)
  }

  // TODO: moveTarget.removeEventListener()

  return {
    onMove
  }
}
