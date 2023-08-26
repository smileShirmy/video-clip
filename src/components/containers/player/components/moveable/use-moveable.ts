import type { Ref, ShallowReactive } from 'vue'

export const useMoveable = (
  translate: ShallowReactive<{ x: number; y: number }>,
  moveTargetRect: ShallowReactive<{ top: number; left: number; width: number; height: number }>,
  inOperation: Ref<boolean>,
  events: {
    change: (newVal: { x: number; y: number }, oldVal: { x: number; y: number }) => void
  }
) => {
  let dragging = false
  let startX = 0
  let startY = 0
  let startTranslateX = 0
  let startTranslateY = 0
  let startRectLeft = 0
  let startRectTop = 0

  function onDragStart(event: PointerEvent) {
    dragging = true
    inOperation.value = true
    startX = event.clientX
    startY = event.clientY
    startTranslateX = translate.x
    startTranslateY = translate.y

    startRectLeft = moveTargetRect.left
    startRectTop = moveTargetRect.top
  }

  function updatePosition(event: PointerEvent) {
    const diffX = event.clientX - startX
    const diffY = event.clientY - startY

    translate.x = startTranslateX + diffX
    translate.y = startTranslateY + diffY

    moveTargetRect.left = startRectLeft + diffX
    moveTargetRect.top = startRectTop + diffY
  }

  function onDragging(event: PointerEvent) {
    if (dragging) {
      updatePosition(event)
    }
  }

  function onDragEnd(event: PointerEvent) {
    setTimeout(() => {
      dragging = false
      inOperation.value = false
      updatePosition(event)

      if (translate.x !== startTranslateX || translate.y !== startTranslateY) {
        events.change(
          {
            x: translate.x,
            y: translate.y
          },
          { x: startTranslateX, y: startTranslateY }
        )
      }
    }, 0)

    window.removeEventListener('pointermove', onDragging)
    window.removeEventListener('pointerup', onDragEnd)
  }

  function onMove(event: PointerEvent) {
    event.preventDefault()
    event.stopPropagation()
    onDragStart(event)

    window.addEventListener('pointermove', onDragging)
    window.addEventListener('pointerup', onDragEnd)
  }

  return {
    onMove
  }
}
