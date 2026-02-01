import { NextResponse } from 'next/server'

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN

export async function GET() {
  if (!domain || !token) {
    return NextResponse.json(
      { error: 'Shopify configuration missing' },
      { status: 500 }
    )
  }

  const response = await fetch(
    `https://${domain}/api/2025-10/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({
        query: `
          query Products {
            products(first: 50) {
              edges {
                node {
                  id
                  title
                  handle
                  priceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                  images(first: 1) {
                    edges {
                      node {
                        url
                      }
                    }
                  }
                }
              }
            }
          }
        `,
      }),
      next: { revalidate: 60 },
    }
  )

  const json = await response.json()

  if (json.errors) {
    return NextResponse.json(
      { error: json.errors[0]?.message || 'Failed to fetch products' },
      { status: 502 }
    )
  }

  const products = json.data.products.edges.map(
    (edge: { node: unknown }) => edge.node
  )

  return NextResponse.json(products)
}
