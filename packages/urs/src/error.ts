export type UrsErrorCode =
  | 'ParseError'
  | 'NotFound'
  | 'SelfSearch'
  | 'InvalidSession'
export type UrsError = { code: UrsErrorCode; message: string }
