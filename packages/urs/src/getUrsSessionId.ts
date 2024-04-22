import { postURLEncoded } from '@kaistian/fetch'
import { padKaistUid } from '@kaistian/sso'
import dateFormat from 'dateformat'

export async function getUrsSessionId(
  kaistUid: number,
): Promise<string | undefined> {
  const paddedKaistUid = padKaistUid(kaistUid)
  const secret = dateFormat(new Date(), 'yyyymmdd')

  const encodedUid = Buffer.from(paddedKaistUid).toString('base64')
  const encodedSecret = Buffer.from(secret).toString('base64')

  const res = await postURLEncoded(
    'https://libit.kaist.ac.kr/Clicker/UserPublicObjectsAction',
    {
      body: { strUserid: encodedUid, Secretdata: encodedSecret },
      redirect: 'manual',
    },
  )
  const cookies = res.headers.get('set-cookie')
  return cookies?.split(';')[0].split('=')[1]
}
