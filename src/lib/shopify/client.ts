const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!
const storefrontToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!

const endpoint = `https://${domain}/api/2025-10/graphql.json`

interface ShopifyResponse<T> {
  data: T
  errors?: { message: string }[]
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
      next: { revalidate, tags },
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
