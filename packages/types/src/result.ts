export type Result<T, E> = { ok: true; data: T } | { ok: false; error: E }
export type BaseResult = Result<unknown, unknown>

export type Ok<T extends BaseResult> = T extends { ok: true; data: infer D }
  ? D
  : never
export type Err<T extends BaseResult> = T extends { ok: false; error: infer E }
  ? E
  : never
