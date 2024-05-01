export type UrsErrorCode =
  | 'ParseError'
  | 'NotFound'
  | 'SelfSearch'
  | 'InvalidSession'
  | 'TimeOverlapOrExceeds'
  | 'ExceedsReservationLimit'
  | 'DataRecordingError'
  | 'InvalidStudentId'
  | 'MinimumAttendeesRequired'
export type UrsError = { code: UrsErrorCode; message: string }
