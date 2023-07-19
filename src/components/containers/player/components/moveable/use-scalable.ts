import type { Ref } from 'vue'

export const useScalable = (
  scale: Ref<number>,
  sceneRect: { top: number; left: number },
  rect: {
    top: number
    left: number
    width: number
    height: number
  }
) => {
  let dragging = false
  let centerX = 0
  let centerY = 0
  let normalHypotenuse = 0

  const degreeToRadian = (degree: number) => ((2 * Math.PI) / 360) * degree

  function getDistance(x: number, y: number) {
    const k = Math.cos(degreeToRadian(45))
    const b = centerY - k * centerX
    return Math.abs(k * x - y + b) / Math.hypot(1, k * k)
  }

  /**
   * 计算根据圆心旋转后的点的坐标
   * @param   {Object}  point   旋转前的点坐标
   * @param   {Object}  center  旋转中心
   * @param   {Int}     rotate  旋转的角度
   * @return  {Object}          旋转后的坐标
   */
  const getRotatedPoint = (
    point: { x: number; y: number },
    center: { x: number; y: number },
    rotate: number
  ) => {
    /**
     * 旋转公式：
     *  点a(x, y)
     *  旋转中心c(x, y)
     *  旋转后点n(x, y)
     *  旋转角度θ
     * nx = cosθ * (ax - cx) - sinθ * (ay - cy) + cx
     * ny = sinθ * (ax - cx) + cosθ * (ay - cy) + cy
     */
    return {
      x:
        (point.x - center.x) * Math.cos(degreeToRadian(rotate)) -
        (point.y - center.y) * Math.sin(degreeToRadian(rotate)) +
        center.x,
      y:
        (point.x - center.x) * Math.sin(degreeToRadian(rotate)) +
        (point.y - center.y) * Math.cos(degreeToRadian(rotate)) +
        center.y
    }
  }

  function onDragStart(event: PointerEvent) {
    console.log(event.target)
    const { top, left, width, height } = rect
    dragging = true

    centerX = sceneRect.left + left + width / 2
    centerY = sceneRect.top + top + height / 2
    normalHypotenuse = Math.hypot(width / 2, height / 2)
  }

  function onDragging(event: PointerEvent) {
    if (dragging) {
      const { clientX, clientY } = event

      const distance = getDistance(clientX, clientY)
      scale.value = distance / normalHypotenuse
      console.log(scale.value)
    }
  }

  function onDragEnd() {
    setTimeout(() => {
      dragging = false
    })

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
