import { shopifyFetch } from './client'
import {
  COLLECTIONS_QUERY,
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  CREATE_CART_MUTATION,
  ADD_TO_CART_MUTATION,
  GET_CART_QUERY,
  UPDATE_CART_MUTATION,
  REMOVE_FROM_CART_MUTATION,
  UPDATE_CART_BUYER_MUTATION,
} from './queries'
import type {
  ShopifyProduct,
  ShopifyCart,
  Product,
  Cart,
  CartItem,
} from './types'

// Collection type
export type Collection = {
  id: string
  title: string
  handle: string
  description: string
  products: Product[]
}

// Helper to transform Shopify product to simplified format
function transformProduct(product: ShopifyProduct): Product {
  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.description,
    descriptionHtml: product.descriptionHtml,
    price: parseFloat(product.priceRange.minVariantPrice.amount),
    currencyCode: product.priceRange.minVariantPrice.currencyCode,
    images: product.images.edges.map((edge) => edge.node),
    variants: product.variants.edges.map((edge) => edge.node),
    options: product.options,
  }
}

// Helper to transform Shopify cart to simplified format
function transformCart(cart: ShopifyCart): Cart {
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    items: cart.lines.edges.map((edge) => ({
      id: edge.node.id,
      variantId: edge.node.merchandise.id,
      title: edge.node.merchandise.product.title,
      variantTitle: edge.node.merchandise.title,
      quantity: edge.node.quantity,
      price: parseFloat(edge.node.merchandise.price.amount),
      currencyCode: edge.node.merchandise.price.currencyCode,
      image: edge.node.merchandise.product.images.edges[0]?.node,
      handle: edge.node.merchandise.product.handle,
    })),
    totalAmount: parseFloat(cart.cost.totalAmount.amount),
    currencyCode: cart.cost.totalAmount.currencyCode,
  }
}

// Get all products
export async function getProducts(first = 20): Promise<Product[]> {
  const data = await shopifyFetch<{
    products: { edges: { node: ShopifyProduct }[] }
  }>({
    query: PRODUCTS_QUERY,
    variables: { first },
  })

  return data.products.edges.map((edge) => transformProduct(edge.node))
}

// Get all collections with products
export async function getCollections(first = 20): Promise<Collection[]> {
  const data = await shopifyFetch<{
    collections: {
      edges: {
        node: {
          id: string
          title: string
          handle: string
          description: string
          products: { edges: { node: ShopifyProduct }[] }
        }
      }[]
    }
  }>({
    query: COLLECTIONS_QUERY,
    variables: { first },
  })

  return data.collections.edges.map((edge) => ({
    id: edge.node.id,
    title: edge.node.title,
    handle: edge.node.handle,
    description: edge.node.description,
    products: edge.node.products.edges.map((productEdge) =>
      transformProduct(productEdge.node)
    ),
  }))
}

// Get single product by handle
export async function getProductByHandle(handle: string): Promise<Product | null> {
  const data = await shopifyFetch<{
    productByHandle: ShopifyProduct | null
  }>({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
  })

  if (!data.productByHandle) {
    return null
  }

  return transformProduct(data.productByHandle)
}

// Create a new cart
export async function createCart(variantId?: string, quantity = 1): Promise<Cart> {
  const input = variantId
    ? { lines: [{ merchandiseId: variantId, quantity }] }
    : {}

  const data = await shopifyFetch<{
    cartCreate: { cart: ShopifyCart }
  }>({
    query: CREATE_CART_MUTATION,
    variables: { input },
  })

  return transformCart(data.cartCreate.cart)
}

// Add item to cart
export async function addToCart(
  cartId: string,
  variantId: string,
  quantity = 1
): Promise<Cart> {
  const data = await shopifyFetch<{
    cartLinesAdd: { cart: ShopifyCart }
  }>({
    query: ADD_TO_CART_MUTATION,
    variables: {
      cartId,
      lines: [{ merchandiseId: variantId, quantity }],
    },
  })

  return transformCart(data.cartLinesAdd.cart)
}

// Get cart by ID
export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await shopifyFetch<{
    cart: ShopifyCart | null
  }>({
    query: GET_CART_QUERY,
    variables: { cartId },
  })

  if (!data.cart) {
    return null
  }

  return transformCart(data.cart)
}

// Update cart line quantity
export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<Cart> {
  const data = await shopifyFetch<{
    cartLinesUpdate: { cart: ShopifyCart }
  }>({
    query: UPDATE_CART_MUTATION,
    variables: {
      cartId,
      lines: [{ id: lineId, quantity }],
    },
  })

  return transformCart(data.cartLinesUpdate.cart)
}

// Remove item from cart
export async function removeFromCart(
  cartId: string,
  lineId: string
): Promise<Cart> {
  const data = await shopifyFetch<{
    cartLinesRemove: { cart: ShopifyCart }
  }>({
    query: REMOVE_FROM_CART_MUTATION,
    variables: {
      cartId,
      lineIds: [lineId],
    },
  })

  return transformCart(data.cartLinesRemove.cart)
}

// Buyer identity input for checkout
export interface BuyerIdentityInput {
  email: string
  phone?: string
  deliveryAddressPreferences?: {
    deliveryAddress: {
      firstName: string
      lastName: string
      address1: string
      address2?: string
      city: string
      provinceCode?: string
      countryCode: string
      zip: string
      phone?: string
    }
  }[]
}

// Update cart with buyer identity (for checkout)
export async function updateCartBuyerIdentity(
  cartId: string,
  buyerIdentity: BuyerIdentityInput
): Promise<{ cart: Cart; checkoutUrl: string; errors: Array<{ field: string[]; message: string }> }> {
  const data = await shopifyFetch<{
    cartBuyerIdentityUpdate: {
      cart: ShopifyCart
      userErrors: Array<{ field: string[]; message: string }>
    }
  }>({
    query: UPDATE_CART_BUYER_MUTATION,
    variables: {
      cartId,
      buyerIdentity,
    },
  })

  return {
    cart: transformCart(data.cartBuyerIdentityUpdate.cart),
    checkoutUrl: data.cartBuyerIdentityUpdate.cart.checkoutUrl,
    errors: data.cartBuyerIdentityUpdate.userErrors,
  }
}

// Export types
export type { Product, Cart, CartItem } from './types'
