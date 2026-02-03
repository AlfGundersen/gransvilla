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
}

export interface ShopifyCartLine {
  id: string
  quantity: number
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
}

export interface Cart {
  id: string
  checkoutUrl: string
  items: CartItem[]
  totalAmount: number
  currencyCode: string
}
