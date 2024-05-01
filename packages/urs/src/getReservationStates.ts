import { getJson } from '@kaistian/fetch'
import type { Result } from '@kaistian/types'
import dateFormat from 'dateformat'
import { JSDOM } from 'jsdom'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'

import type { UrsError } from './error'
import { Room, type RoomId, type SpaceId } from './room'

const spaceSchema = z
  .object({
    _Model_lg_clicker_study_room_brief_list: z
      .object({
        l_id: z.nativeEnum(Room),
        l_room_book_status_small_html: z.string(),
      })
      .array(),
  })
  .transform(({ _Model_lg_clicker_study_room_brief_list: rooms }) => ({
    rooms: rooms.map(({ l_id: id, l_room_book_status_small_html: html }) => ({
      id,
      html,
    })),
  }))

export type ReservationState =
  | { state: 'my'; time: string; name: string; reservationId: string }
  | { state: 'reserved'; time: string; name: string }
  | { state: 'available'; time: string }
  | { state: 'unavailable'; time: string }
export type GetReservationStatesSuccess = {
  rooms: { id: RoomId; states: ReservationState[] }[]
}

export async function getReservationStates(
  spaceId: SpaceId,
  date: Date,
  sessionId?: string,
): Promise<Result<GetReservationStatesSuccess, UrsError>> {
  const res = await getJson(
    'https://libit.kaist.ac.kr/Clicker/getStudyRoomMatrix',
    {
      params: {
        ActionDate: dateFormat(date, 'yyyymmdd'),
        SpaceTypeID: spaceId,
      },
      headers: sessionId
        ? { Cookie: `ASP.NET_SessionId=${sessionId}` }
        : undefined,
    },
  )
  const parsed = spaceSchema.safeParse(res)
  if (!parsed.success)
    return {
      ok: false,
      error: {
        code: 'ParseError',
        message: fromZodError(parsed.error).message,
      },
    }

  const rooms = parsed.data.rooms.map(({ id, html }) => {
    const { document } = new JSDOM(html).window
    const blocks = document.getElementsByClassName('clicker-box-for-booking')

    const states = Array.from(blocks).map((block): ReservationState => {
      // My reservation
      if (block.classList.contains('clicker-box-for-my-booking'))
        return {
          state: 'my',
          time: block.firstElementChild?.textContent!,
          name: block.lastElementChild?.textContent!,
          reservationId: block.getAttribute('onclick')?.slice(40, 57)!,
        }
      // Already reserved by others
      if (block.classList.contains('clicker-box-for-in-booking'))
        return {
          state: 'reserved',
          time: block.firstElementChild?.textContent?.trim().split(' ')[1]!,
          name: block.lastElementChild?.textContent?.trim().split(' ')[1]!,
        }
      // Available
      if (block.classList.contains('clicker-box-for-yes'))
        return {
          state: 'available',
          time: block.firstElementChild?.textContent!,
        }
      // Unavailable
      return {
        state: 'unavailable',
        time: block.firstElementChild?.textContent!,
      }
      // TODO: Check if there are other states
    })
    return { id, states }
  })
  return { ok: true, data: { rooms } }
}
