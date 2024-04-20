export interface Params {
  [key: string]: unknown
}
export interface Body {
  [key: string]: unknown
}

export interface RequestOptions extends RequestInit {
  params?: Params
}

export type GetOptions = Omit<RequestOptions, 'method' | 'body'>
export type GetRedirectURLOptions = Omit<GetOptions, 'redirect'>

export interface PostOptions extends Omit<RequestOptions, 'method' | 'body'> {
  body?: Body
}
