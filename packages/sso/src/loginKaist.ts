import { getRedirectURL, postURLEncoded } from '@kaistian/fetch'
import type { Result } from '@kaistian/types'

import {
  type LoginKaistError,
  type LoginKaistSuccess,
  loginKaistResultSchema,
} from './types'

export async function loginKaist(
  id: string,
  pw: string,
): Promise<Result<LoginKaistSuccess, LoginKaistError>> {
  const redirectUrl = await getRedirectURL(
    'https://iam2.kaist.ac.kr/api/sso/commonLogin',
    { params: { client_id: 'SPARCS' } },
  )
  if (!redirectUrl) throw new Error('Failed to get the redirect URL')

  const searchParams = new URL(redirectUrl.replace('#', '/')).searchParams
  const paramId = searchParams.get('param_id')
  if (!paramId)
    throw new Error('Failed to find `param_id` from the redirect URL')

  const res = await postURLEncoded('https://iam2.kaist.ac.kr/api/sso/login', {
    body: { user_id: id, pw, param_id: paramId, login_page: 'L_P_COMMON' },
  })
  const json = await res.json()
  return loginKaistResultSchema.parse(json)
}
