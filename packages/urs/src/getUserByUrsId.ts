import { getJson } from '@kaistian/fetch'
import type { Ok, Result } from '@kaistian/types'
import { match } from 'ts-pattern'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'

import type { UrsError } from './error'

const successSchema = z
  .object({
    g_clicker_l_user_id: z.string(),
    g_clicker_l_user_name: z.string(),
  })
  .transform(
    ({ g_clicker_l_user_id: studentId, g_clicker_l_user_name: name }) => ({
      ok: true as const,
      data: { studentId, name },
    }),
  )
const errorSchema = z
  .object({
    l_communication_message: z.union([
      z.literal('이용자정보가 확인되지 않습니다.'),
      z.literal('자기 자신을 등록 하실 수 없습니다.'),
      z.literal('이용자정보가 확인 되지 않습니다.'),
    ]),
  })
  .transform(({ l_communication_message: msg }) => {
    const error = match(msg)
      .returnType<UrsError>()
      .with('이용자정보가 확인되지 않습니다.', () => ({
        code: 'NotFound',
        message: 'User not found',
      }))
      .with('자기 자신을 등록 하실 수 없습니다.', () => ({
        code: 'SelfSearch',
        message: 'Cannot search for yourself',
      }))
      .with('이용자정보가 확인 되지 않습니다.', () => ({
        code: 'InvalidSession',
        message: 'Invalid session',
      }))
      .exhaustive()
    return { ok: false as const, error }
  })
const resultSchema = z.union([successSchema, errorSchema])

export type GetUserByUrsIdSuccess = Ok<z.infer<typeof successSchema>>

export async function getUserByUrsId(
  ursId: string,
  sessionId: string,
): Promise<Result<GetUserByUrsIdSuccess, UrsError>> {
  const res = await getJson(
    'https://libit.kaist.ac.kr/Clicker/IsClickerUserFoundWithName',
    {
      params: { UserId: ursId },
      headers: { Cookie: `ASP.NET_SessionId=${sessionId}` },
    },
  )
  const parsed = resultSchema.safeParse(res)
  if (parsed.success) return parsed.data
  return {
    ok: false,
    error: {
      code: 'ParseError',
      message: fromZodError(parsed.error).message,
    },
  }
}
