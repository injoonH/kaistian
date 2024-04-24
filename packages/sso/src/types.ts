import type { Err, Ok } from '@kaistian/types'
import { z } from 'zod'

export const KaistDegreeCode = {
  Bachelor: 0,
  Master: 1,
  ProfessionalMaster: 3,
  Doctor: 5,
  IntegratedDoctor: 7,
  IntegratedMaster: 8,
  Entire: 9,
  Auditor: 10,
} as const

export const loginKaistSuccessSchema = z
  .object({
    dataMap: z.object({
      USER_INFO: z.object({
        kaist_uid: z.coerce.number(),
        mail: z.string().email().nullable(),
        ku_sex: z.enum(['M', 'F']),
        ku_acad_prog_code: z
          .preprocess((val) => Number(val), z.nativeEnum(KaistDegreeCode))
          .nullable(),
        ku_kaist_org_id: z.coerce.number(),
        ku_kname: z.string(),
        ku_person_type: z.string().nullable(),
        ku_person_type_kor: z.string().nullable(),
        ku_psft_user_status_kor: z.string().nullable(),
        ku_born_date: z.coerce.date(),
        ku_std_no: z.string().nullable(),
        ku_psft_user_status: z.string().nullable(),
        employeeType: z.string(),
        givenname: z.string(),
        displayname: z.string(),
        sn: z.string(),
      }),
    }),
    error: z.literal(false),
  })
  .transform(({ dataMap: { USER_INFO: info } }) => ({
    ok: true as const,
    data: {
      kaistUid: info.kaist_uid,
      studentId: info.ku_std_no,
      email: info.mail,
      name: info.ku_kname,
      firstName: info.sn,
      lastName: info.givenname,
      fullName: info.displayname,
      birthdate: info.ku_born_date,
      gender: info.ku_sex,
      degreeCode: info.ku_acad_prog_code,
      departmentCode: info.ku_kaist_org_id,
      employeeType: info.employeeType,
      facultyType: info.ku_person_type,
      facultyTypeKo: info.ku_person_type_kor,
      studentStatus: info.ku_psft_user_status,
      studentStatusKo: info.ku_psft_user_status_kor,
    },
  }))
export type LoginKaistSuccess = Ok<z.infer<typeof loginKaistSuccessSchema>>

export const loginKaistErrorSchema = z
  .object({
    dataMap: z.object({
      LOGIN_FAIL_COUNT: z.coerce.number().optional(),
    }),
    error: z.literal(true),
    errorCode: z.enum([
      'SSO_SERVER_ERROR',
      'SSO_NEED_LOGIN',
      'SSO_HTTP_CLIENT_CALL_ERROR',
      'SSO_LOGIN_PASSWORD_CHANGE_REQUIRED',
      'SSO_LOGIN_PASSWORD_INCORRECT',
      'SSO_LOGIN_PASSWORD_EXPIRED',
      'SSO_LOGIN_NOT_REGISTER',
      'SSO_LOGIN_ACCOUNT_LOCKED',
      'SSO_LOGIN_ERROR',
      'FILE_NOT_FOUND',
    ]),
    errorMessage: z.string(),
  })
  .transform((val) => ({
    ok: false as const,
    error: {
      code: val.errorCode,
      message: val.errorMessage,
      failureCount: val.dataMap.LOGIN_FAIL_COUNT,
    },
  }))
export type LoginKaistError = Err<z.infer<typeof loginKaistErrorSchema>>

export const loginKaistResultSchema = z.union([
  loginKaistSuccessSchema,
  loginKaistErrorSchema,
])
export type LoginKaistResult = z.infer<typeof loginKaistResultSchema>
