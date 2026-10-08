import 'server-only'
import { isPastVariantDate, variantDateOrder } from '@/lib/i18n/variant-date'
import { ALLERGY_ATTRIBUTE } from './index'

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!

const endpoint = `https://${domain}/admin/api/2025-10/graphql.json`

/**
 * Orders per request. A query is priced on what it could return, and one may
 * cost 1000 points at most: 20 orders of up to 30 lines each stays well under.
 */
const PAGE_SIZE = 20
/** Stops a runaway loop; 2000 orders is far more than the lists will ever hold. */
const MAX_PAGES = 100

const ATTENDEE_ORDERS_QUERY = /* GraphQL */ `
  query AttendeeOrders($first: Int!, $cursor: String) {
    orders(first: $first, after: $cursor, sortKey: CREATED_AT, reverse: true) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        name
        cancelledAt
        email
        phone
        customer {
          displayName
          defaultEmailAddress {
            emailAddress
          }
          defaultPhoneNumber {
            phoneNumber
          }
        }
        billingAddress {
          name
          phone
        }
        lineItems(first: 30) {
          nodes {
            title
            variantTitle
            currentQuantity
            customAttributes {
              key
              value
            }
          }
        }
      }
    }
  }
`

interface AdminOrder {
  name: string
  cancelledAt: string | null
  email: string | null
  phone: string | null
  customer: {
    displayName: string | null
    defaultEmailAddress: { emailAddress: string | null } | null
    defaultPhoneNumber: { phoneNumber: string | null } | null
  } | null
  billingAddress: { name: string | null; phone: string | null } | null
  lineItems: {
    nodes: {
      title: string
      variantTitle: string | null
      currentQuantity: number
      customAttributes: { key: string; value: string | null }[]
    }[]
  }
}

interface AttendeeOrdersData {
  orders: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
    nodes: AdminOrder[]
  }
}

export interface Attendee {
  /** Order number as Shopify shows it: `#1054` */
  order: string
  name: string
  quantity: number
  allergies: string
  /** Checkout asks for one or the other, so either may be empty */
  email: string
  phone: string
}

/** Everyone booked on one date of one product. */
export interface AttendeeList {
  product: string
  date: string
  past: boolean
  seats: number
  attendees: Attendee[]
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.SHOPIFY_ADMIN_ACCESS_TOKEN)
}

async function adminFetch<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!,
    },
    body: JSON.stringify({ query, variables }),
    // Names and allergies: never kept in the data cache
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Shopify Admin API answered ${response.status}`)
  }

  const json: { data?: T; errors?: { message: string }[] } = await response.json()
  if (json.errors?.length || !json.data) {
    throw new Error(json.errors?.map((e) => e.message).join('\n') || 'No data from Shopify')
  }

  return json.data
}

/**
 * Who is coming, per product and date.
 *
 * Built from the orders themselves rather than from tags or notes, so a
 * cancelled order is gone and a refunded seat is no longer counted. Only
 * lines sold on a dated variant are attendees; a cup bought in the same order
 * is not.
 */
export async function getAttendeeLists(): Promise<AttendeeList[]> {
  const lists = new Map<string, AttendeeList & { order: number }>()
  const now = Date.now()
  let cursor: string | null = null

  for (let page = 0; page < MAX_PAGES; page++) {
    const data: AttendeeOrdersData = await adminFetch<AttendeeOrdersData>(ATTENDEE_ORDERS_QUERY, {
      first: PAGE_SIZE,
      cursor,
    })

    for (const order of data.orders.nodes) {
      if (order.cancelledAt) continue

      for (const line of order.lineItems.nodes) {
        const date = line.variantTitle?.trim()
        const dateOrder = date ? variantDateOrder(date) : null
        if (!date || dateOrder === null || line.currentQuantity <= 0) continue

        const key = `${line.title}\n${date}`
        let list = lists.get(key)
        if (!list) {
          list = {
            product: line.title,
            date,
            past: isPastVariantDate(date, now),
            seats: 0,
            attendees: [],
            order: dateOrder,
          }
          lists.set(key, list)
        }

        list.seats += line.currentQuantity
        list.attendees.push({
          order: order.name,
          name: order.customer?.displayName || order.billingAddress?.name || 'Uten navn',
          quantity: line.currentQuantity,
          allergies:
            line.customAttributes.find((attribute) => attribute.key === ALLERGY_ATTRIBUTE)?.value ||
            '',
          email: order.email || order.customer?.defaultEmailAddress?.emailAddress || '',
          phone:
            order.phone ||
            order.billingAddress?.phone ||
            order.customer?.defaultPhoneNumber?.phoneNumber ||
            '',
        })
      }
    }

    if (!data.orders.pageInfo.hasNextPage) break
    cursor = data.orders.pageInfo.endCursor
  }

  return [...lists.values()]
    .sort((a, b) => a.order - b.order || a.product.localeCompare(b.product, 'nb'))
    .map(({ order: _order, ...list }) => ({
      ...list,
      attendees: list.attendees.sort((a, b) => a.name.localeCompare(b.name, 'nb')),
    }))
}
