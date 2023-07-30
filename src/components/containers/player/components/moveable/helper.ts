/**
 * 角度转为弧度
 *
 * @param degree
 * @returns
 */
export function degreeToRadian(degree: number): number {
  return ((2 * Math.PI) / 360) * degree
}

/**
 * @param {x: number, y: number} point 旋转前的坐标
 * @param {x: number, y: number} center 旋转中心点
 * @param {number} rotate 旋转角度
 * @returns {x: number, y: number} 旋转后的坐标
 */
export function getRotatedPoint(
  point: { x: number; y: number },
  center: { x: number; y: number },
  rotate: number
): { x: number; y: number } {
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

/**
 * @param {x: number, y: number} point 旋转前的坐标
 * @param {x: number, y: number} center 旋转中心点
 * @returns {number} 旋转后的角度
 */
export function getDegree(
  point: { x: number; y: number },
  center: { x: number; y: number }
): number {
  const addX = point.x - center.x
  const addY = point.y - center.y
  let degree = (Math.atan(addX / addY) / Math.PI) * 180

  // 第一象限
  if (addX >= 0 && addY < 0) {
    degree = 180 + Math.abs(degree)
  }
  // 第二象限
  else if (addX <= 0 && addY < 0) {
    degree = 180 - Math.abs(degree)
  }
  // 第三象限
  else if (addX <= 0 && addY > 0) {
    degree = Math.abs(degree)
  }
  // 第四象限
  else if (addX >= 0 && addY > 0) {
    degree = 360 - Math.abs(degree)
  }

  return degree
}

/**
 * 获取某点到直线的距离
 *
 * @param {x: number, y: number} point 旋转前的坐标
 * @param {x: number, y: number} center 旋转中心点
 * @returns {number} 旋转的角度
 */
export function getDistance(
  point: { x: number; y: number },
  center: { x: number; y: number },
  rotate: number
): number {
  let k = 1
  if (rotate === 0 || rotate === 180) {
    return Math.abs(point.x - center.x)
  } else if (rotate === 90 || rotate === 270) {
    return Math.abs(point.y - center.y)
  }
  if (rotate < 90) {
    k = Math.tan(degreeToRadian(90 - rotate))
  } else if (rotate < 180) {
    k = -Math.tan(degreeToRadian(rotate - 90))
  } else if (rotate < 270) {
    k = Math.tan(degreeToRadian(270 - rotate))
  } else if (rotate < 360) {
    k = -Math.tan(degreeToRadian(360 - rotate))
  }

  // TODO:

  const b = center.y - k * center.x
  return Math.abs(k * point.x - point.y + b) / Math.hypot(1, k * k)
}
