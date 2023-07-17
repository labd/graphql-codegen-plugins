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

/**
 * Utility to filter out double items in an array by some measure.
 *
 * @example
 * ```ts
 * const products = [
 * {id: 'a', price: 1},
 * {id: 'a', price: 1},
 * {id: 'b', price: 1}
 * ]
 * products.filter(uniqueBy(p => p.id))
 *
 * // results in
 * [{id: 'a', price: 1}, {id: 'b', price: 1}]
 * ```
 */
export const uniqueBy =
  <T, S>(getValue: (item: T) => S) =>
  (v: T, i: number, s: T[]) =>
    s.findIndex((e) => getValue(e) === getValue(v)) === i
