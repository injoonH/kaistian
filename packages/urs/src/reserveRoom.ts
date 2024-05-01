import { get } from '@kaistian/fetch'
import { padStudentId } from '@kaistian/sso'
import type { Result } from '@kaistian/types'
import dateFormat from 'dateformat'
import { match } from 'ts-pattern'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'

import type { UrsError } from './error'
import type { RoomId } from './rooms'

const successSchema = z
  .object({
    l_communication_status: z.literal('0'),
  })
  .transform(() => ({ ok: true as const, data: null }))
const errorSchema = z
  .object({
    l_communication_status: z.literal('-1'),
    l_communication_message: z.union([
      z.literal(
        '사용시간이 중복이 되거나 마감시간에 초과 됩니다. 시간을 조정해 주시기 바랍니다.',
      ),
      z.literal('일일 최대 예약 (동반자 포함) 건수 3 건을 초과합니다.'),
      z.literal('예약 데이타 기록에 문제가 발생 했습니다.'),
      z.string().startsWith('최소 참석인원은 예약자 포함'),
    ]),
  })
  .transform(({ l_communication_message: msg }) => {
    const error = match(msg)
      .returnType<UrsError>()
      .with(
        '사용시간이 중복이 되거나 마감시간에 초과 됩니다. 시간을 조정해 주시기 바랍니다.',
        () => ({
          code: 'TimeOverlapOrExceeds',
          message:
            'Usage time overlaps or exceeds the closing time. Please adjust the time.',
        }),
      )
      .with('일일 최대 예약 (동반자 포함) 건수 3 건을 초과합니다.', () => ({
        code: 'ExceedsReservationLimit',
        message:
          'Exceeds the daily maximum reservation count of 3 (including companions).',
      }))
      .with('예약 데이타 기록에 문제가 발생 했습니다.', () => ({
        code: 'DataRecordingError',
        message: 'There was a problem recording the reservation data.',
      }))
      .otherwise(() => {
        const minAttendees = msg.match(/\d+/)![0]
        return {
          code: 'MinimumAttendeesRequired',
          message: `The minimum number of attendees is ${minAttendees}, including the reservation holder.`,
        }
      })

    return { ok: false as const, error }
  })
const resultSchema = z.union([successSchema, errorSchema])

export type ReserveRoomOptions = {
  roomId: RoomId
  date: Date
  duration:
    | { hour: 0; minute: 30 }
    | { hour: 1; minute: 0 }
    | { hour: 1; minute: 30 }
    | { hour: 2; minute: 0 }
  title: string
  studentId: string
  members: { studentId: string; name: string }[]
}

export async function reserveRoom({
  roomId,
  date,
  duration: { hour, minute },
  title,
  studentId,
  members,
}: ReserveRoomOptions): Promise<Result<null, UrsError>> {
  const res = await get(
    'https://libit.kaist.ac.kr/Clicker/BookingPublicObjects',
    {
      params: {
        strDeviceName: 'desktop',
        strRoomId: roomId,
        strUserId: padStudentId(studentId),
        strDate: dateFormat(date, 'yyyymmdd'),
        strTime: dateFormat(date, 'HHMM'),
        strDuration: hour.toFixed(),
        strDurationHalf: minute.toFixed(),
        strSubject: title,
        strMembersJoin: members
          .map(({ studentId, name }) => `${padStudentId(studentId)}^${name};`)
          .join(''),
      },
      redirect: 'manual',
    },
  )
  if (res.status === 302)
    // TODO: Check if there are other possible error codes
    return {
      ok: false,
      error: { code: 'InvalidStudentId', message: 'Invalid student ID' },
    }

  const json = await res.json()
  const parsed = resultSchema.safeParse(json)
  if (parsed.success) return parsed.data
  return {
    ok: false,
    error: {
      code: 'ParseError',
      message: fromZodError(parsed.error).message,
    },
  }
}
