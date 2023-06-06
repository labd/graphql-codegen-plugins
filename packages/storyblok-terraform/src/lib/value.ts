/*
Utility file for strings, numbers, arrays, objects etc.
Should be split up or replaced by libraries if this file becomes too big.
*/

export const isValue = <T>(value: T): value is NonNullable<T> =>
  value !== null && value !== undefined

export const ifValue = <T, S>(value: T | undefined, ifValue: (v: T) => S) =>
  value === undefined ? undefined : ifValue(value)

export type Ensure<T extends {}, K extends keyof T> = T &
  Record<K, NonNullable<T[K]>>
