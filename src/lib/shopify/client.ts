const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!
const storefrontToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!

const endpoint = `https://${domain}/api/2025-10/graphql.json`

interface ShopifyResponse<T> {
  data: T
  errors?: { message: string }[]
}

/**
 * Every Storefront request is a POST, queries and mutations alike, and
 * `next.revalidate` puts a POST in Next's data cache keyed on its body. That is
 * what makes the product pages fast — and what must never happen to a
 * mutation: two visitors adding the same first item within a minute sent
 * byte-identical `cartCreate` requests, the second was answered from the
 * cache, and both walked away holding the same cart. An identical
 * `cartLinesAdd` repeated inside the window was not sent at all.
 *
 * So a mutation is never cached, whatever the caller asks for, and neither is
 * anything fetched with `revalidate: 0` — one visitor's cart, read back.
 */
function isMutation(query: string): boolean {
  return /^\s*mutation\b/.test(query)
}

export async function shopifyFetch<T>({
  query,
  variables = {},
  revalidate = 60,
  tags = ['shopify-products'],
  fallback,
}: {
  query: string
  variables?: Record<string, unknown>
  revalidate?: number | false
  tags?: string[]
  fallback?: T
}): Promise<T> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontToken,
      },
      body: JSON.stringify({ query, variables }),
      ...(revalidate === 0 || isMutation(query)
        ? { cache: 'no-store' as const }
        : { next: { revalidate, tags } }),
    })

    const json: ShopifyResponse<T> = await response.json()

    if (json.errors) {
      if (fallback !== undefined) return fallback
      throw new Error(json.errors.map((e) => e.message).join('\n'))
    }

    return json.data
  } catch (error) {
    if (fallback !== undefined) return fallback
    throw error
  }
}
