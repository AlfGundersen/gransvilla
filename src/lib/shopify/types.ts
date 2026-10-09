export interface ShopifyImage {
  url: string
  altText: string | null
  width: number
  height: number
}

export interface ShopifyPrice {
  amount: string
  currencyCode: string
}

export interface ShopifyProductVariant {
  id: string
  title: string
  availableForSale: boolean
  quantityAvailable?: number | null
  price: ShopifyPrice
  selectedOptions?: {
    name: string
    value: string
  }[]
}

export interface ShopifyProduct {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml: string
  priceRange: {
    minVariantPrice: ShopifyPrice
  }
  images: {
    edges: {
      node: ShopifyImage
    }[]
  }
  variants: {
    edges: {
      node: ShopifyProductVariant
    }[]
  }
  options?: {
    name: string
    values: string[]
  }[]
  comingSoon?: {
    value: string
  } | null
  askAllergies?: {
    value: string
  } | null
  guestAddon?: {
    reference: { variants?: { nodes: { id: string; price: { amount: string } }[] } } | null
  } | null
}

/**
 * What a guest pays on top of a lunch, and the variant that charges it.
 *
 * A lunch a member can bring a guest to points at this product through the
 * metafield `custom.guest_addon` in Shopify. A guest is booked as one more
 * lunch plus this surcharge, not as a variant of their own, because the
 * kitchen has one number of seats a day for members and guests together — and
 * Shopify counts stock per variant.
 */
export interface GuestAddon {
  variantId: string
  price: number
}

export interface ShopifyCartLine {
  id: string
  quantity: number
  attributes: {
    key: string
    value: string | null
  }[]
  merchandise: {
    id: string
    title: string
    price: ShopifyPrice
    product: {
      title: string
      handle: string
      images: {
        edges: {
          node: {
            url: string
            altText: string | null
          }
        }[]
      }
    }
  }
}

export interface ShopifyCart {
  id: string
  checkoutUrl: string
  lines: {
    edges: {
      node: ShopifyCartLine
    }[]
  }
  cost: {
    totalAmount: ShopifyPrice
  }
}

// Simplified types for components
export interface Product {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml: string
  price: number
  currencyCode: string
  images: ShopifyImage[]
  variants: ShopifyProductVariant[]
  options?: {
    name: string
    values: string[]
  }[]
  comingSoon: boolean
  /** The product page asks the buyer for allergies and sends them with the order */
  askAllergies: boolean
  /** Set where a guest can be brought along, for a surcharge */
  guestAddon?: GuestAddon
}

export interface CartItem {
  id: string
  variantId: string
  title: string
  variantTitle: string
  quantity: number
  price: number
  currencyCode: string
  image?: {
    url: string
    altText: string | null
  }
  handle: string
  allergies?: string
  /** The date a line is for, where the variant does not say: a guest surcharge */
  date?: string
  /** On a guest surcharge: the lunch variant the guest has a seat on */
  guestOf?: string
}

export interface Cart {
  id: string
  checkoutUrl: string
  items: CartItem[]
  totalAmount: number
  currencyCode: string
}
