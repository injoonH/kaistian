import { get } from '@kaistian/fetch'
import type { Result } from '@kaistian/types'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'

import type { UrsError } from './error'

const searchedUserSchema = z
  .object({
    libtechAccountUserid: z.string(),
    libtechAccountUseridQr: z.string(),
    libtechAccountName: z.string(),
    libtechAccountDepartName: z.string(),
  })
  .transform((val) => ({
    ursId: val.libtechAccountUserid,
    maskedStudentId: val.libtechAccountUseridQr,
    name: val.libtechAccountName,
    department: val.libtechAccountDepartName,
  }))
export type SearchedUser = z.infer<typeof searchedUserSchema>

export async function searchUserByName(
  name: string,
): Promise<Result<SearchedUser[], UrsError>> {
  const res = await get('https://libit.kaist.ac.kr/clicker/KaistUserInfo', {
    params: { UserName: name },
    redirect: 'manual',
  })
  if (res.status === 302) return { ok: true, data: [] }
  const json = await res.json()
  const users = searchedUserSchema.array().safeParse(json)
  if (users.success) return { ok: true, data: users.data }
  return {
    ok: false,
    error: { code: 'ParseError', message: fromZodError(users.error).message },
  }
}
