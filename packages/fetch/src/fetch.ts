import { stringify } from 'qs'

import type {
  GetOptions,
  GetRedirectURLOptions,
  Params,
  PostOptions,
  RequestOptions,
} from './types'

function concatSearchParams(url: string, params?: Params): string {
  const searchParams = stringify(params)
  return `${url}?${searchParams}`
}

export function request(
  url: string,
  { params, ...options }: RequestOptions,
): Promise<Response> {
  const _url = concatSearchParams(url, params)
  return fetch(_url, options)
}

export function get(url: string, options: GetOptions = {}): Promise<Response> {
  return request(url, options)
}

export async function getJson<T>(
  url: string,
  options: GetOptions = {},
): Promise<T> {
  const res = await get(url, options)
  return res.json()
}

export async function getRedirectURL(
  url: string,
  options: GetRedirectURLOptions = {},
): Promise<string | null> {
  const res = await request(url, { redirect: 'manual', ...options })
  return res.headers.get('location')
}

export function post(
  url: string,
  { body, ...options }: PostOptions = {},
): Promise<Response> {
  return request(url, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options,
  })
}

export async function postJson<T>(
  url: string,
  options: PostOptions = {},
): Promise<T> {
  const res = await post(url, options)
  return res.json()
}

export function postURLEncoded(
  url: string,
  { headers, body, ...options }: PostOptions = {},
): Promise<Response> {
  return request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      ...headers,
    },
    body: stringify(body),
    ...options,
  })
}
