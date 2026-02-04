import type { Context } from '@netlify/edge-functions'

export default async function handler(request: Request, context: Context) {
  const response = await context.next()

  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )

  return response
}

export const config = {
  path: '/*',
}
