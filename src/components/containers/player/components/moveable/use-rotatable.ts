export const useRotatable = () => {
  let dragging = false

  function onDragStart() {
    dragging = true
  }

  function onDragging() {
    if (dragging) {
      //
    }
  }

  function onDragEnd() {
    setTimeout(() => {
      dragging = false
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
