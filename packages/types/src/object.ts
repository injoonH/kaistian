export type BaseKey = string | number | symbol
export type BaseObject = Record<BaseKey, unknown>
export type BaseArray = ArrayLike<unknown>

export type Keys<T extends BaseObject> = keyof T
export type Values<T extends BaseObject> = T[keyof T]
export type Elements<T extends BaseArray> = T[number]
