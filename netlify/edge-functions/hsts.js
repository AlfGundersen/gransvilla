export default async function handler(request, context) {
  const response = await context.next()

  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )

  return response
}
