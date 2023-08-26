export const isArray = Array.isArray

export const objectToString = Object.prototype.toString
export const toTypeString = (value: unknown): string => objectToString.call(value)

export const isNumber = (val: unknown): val is number => typeof val === 'number'
export const isString = (val: unknown): val is string => typeof val === 'string'
export const isBoolean = (val: unknown): val is boolean => typeof val === 'boolean'
export const isFunction = (val: unknown): val is Function => typeof val === 'function'

export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object'

export const isPlainObject = (val: unknown): val is object =>
  toTypeString(val) === '[object Object]'

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

export const deepClone = (obj: any) => {
  if (obj === null) return null
  const clone = Object.assign({}, obj)
  Object.keys(clone).forEach(
    (key) => (clone[key] = typeof obj[key] === 'object' ? deepClone(obj[key]) : obj[key])
  )
  if (Array.isArray(obj)) {
    clone.length = obj.length
    return Array.from(clone)
  }
  return clone
}
