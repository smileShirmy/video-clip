export const isArray = Array.isArray

export const isNumber = (val: unknown): val is number => typeof val === 'number'
export const isString = (val: unknown): val is string => typeof val === 'string'
export const isBoolean = (val: unknown): val is boolean => typeof val === 'boolean'

export const uuid = () =>
  '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
    (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(
      16
    )
  )

/**
 * 判断两个区间是否有交集
 */
export const isIntersectionOfTwoIntervals = (
  arr1: [number, number],
  arr2: [number, number]
): boolean => {
  const start = [Math.min(...arr1), Math.min(...arr2)]
  const end = [Math.max(...arr1), Math.max(...arr2)]
  return Math.max(...start) < Math.min(...end)
}

/**
 * 根据开始帧和总帧数获取结束帧
 *
 * 帧区间为左闭右开区间，比如 [0, 100)
 * startFrame = 0
 * frameCount = 100
 * endFrame = 99
 * 0 + 100 - 1 = 99
 */
export const getEndFrame = (startFrame: number, frameCount: number): number =>
  startFrame + frameCount - 1

/**
 * 根据结束帧和总帧数获取结束帧
 *
 * 帧区间为左闭右开区间，比如 [0, 100)
 * endFrame = 99
 * frameCount = 100
 * startFrame = 0
 * 99 - 100 + 1 = 0
 */
export const getStartFrame = (endFrame: number, frameCount: number): number =>
  endFrame - frameCount + 1
