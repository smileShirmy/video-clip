export const isArray = Array.isArray

export const isNumber = (val: unknown): val is string => typeof val === 'number'
export const isString = (val: unknown): val is string => typeof val === 'string'

export const uuid = () =>
  '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
    (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(
      16
    )
  )
