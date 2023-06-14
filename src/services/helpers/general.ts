export const isArray = Array.isArray

export const isNumber = (val: unknown): val is string => typeof val === 'number'
export const isString = (val: unknown): val is string => typeof val === 'string'
