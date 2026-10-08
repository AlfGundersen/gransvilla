import { isPastVariantDate } from '@/lib/i18n/variant-date'
import { shopifyFetch } from './client'
import { descriptionParagraphs } from './description'
import {
  ADD_TO_CART_MUTATION,
  COLLECTIONS_QUERY,
  CREATE_CART_MUTATION,
  GET_CART_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCTS_QUERY,
  REMOVE_FROM_CART_MUTATION,
  UPDATE_CART_BUYER_MUTATION,
  UPDATE_CART_MUTATION,
  VARIANT_FOR_CART_QUERY,
} from './queries'
import type { Cart, CartItem, Product, ShopifyCart, ShopifyProduct } from './types'

// Collection type
export type Collection = {
  id: string
  title: string
  handle: string
  description: string
  products: Product[]
}

/**
 * The line item attribute a buyer's allergies travel under. Shopify shows it
 * beneath the line in checkout, on the order and on the packing slip, so the
 * key is the Norwegian word the kitchen reads.
 */
export const ALLERGY_ATTRIBUTE = 'Allergier'

type CartLineAttribute = { key: string; value: string }

function displayCurrency(code: string): string {
  return code === 'NOK' ? 'kr' : code
}

// Helper to transform Shopify product to simplified format
function transformProduct(product: ShopifyProduct): Product {
  // Shopify does not know a variant titled `08.11.2026 kl. 12:00` is a date,
  // so one that has been stays for sale until it is deleted there. Dropped
  // here, it is gone from every listing, page and picker at once.
  const allVariants = product.variants.edges.map((edge) => edge.node)
  const variants = allVariants.filter((variant) => !isPastVariantDate(variant.title))
  const droppedPast = variants.length < allVariants.length

  // The options list is separate from the variants, and would go on offering
  // a date no variant is left to back.
  const options = droppedPast
    ? product.options
        ?.map((option) => ({
          ...option,
          values: option.values.filter((value) =>
            variants.some((variant) =>
              variant.selectedOptions?.some(
                (selected) => selected.name === option.name && selected.value === value,
              ),
            ),
          ),
        }))
        .filter((option) => option.values.length > 0)
    : product.options

  // Shopify's lowest price may belong to a date that has been.
  const price =
    droppedPast && variants.length > 0
      ? Math.min(...variants.map((variant) => parseFloat(variant.price.amount)))
      : parseFloat(product.priceRange.minVariantPrice.amount)

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    // Shopify's plain text runs the paragraphs together; keep them apart
    description: product.descriptionHtml
      ? descriptionParagraphs(product.descriptionHtml)
      : product.description,
    descriptionHtml: product.descriptionHtml,
    price,
    currencyCode: displayCurrency(product.priceRange.minVariantPrice.currencyCode),
    images: product.images.edges.map((edge) => edge.node),
    variants,
    options,
    comingSoon: product.comingSoon?.value === 'true',
    askAllergies: product.askAllergies?.value === 'true',
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
      currencyCode: displayCurrency(edge.node.merchandise.price.currencyCode),
      image: edge.node.merchandise.product.images.edges[0]?.node,
      handle: edge.node.merchandise.product.handle,
      allergies:
        edge.node.attributes.find((attribute) => attribute.key === ALLERGY_ATTRIBUTE)?.value ||
        undefined,
    })),
    totalAmount: parseFloat(cart.cost.totalAmount.amount),
    currencyCode: displayCurrency(cart.cost.totalAmount.currencyCode),
  }
}

// Get all products
export async function getProducts(first = 20): Promise<Product[]> {
  const data = await shopifyFetch<{
    products: { edges: { node: ShopifyProduct }[] }
  }>({
    query: PRODUCTS_QUERY,
    variables: { first },
    fallback: { products: { edges: [] } },
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
    fallback: { collections: { edges: [] } },
  })

  return data.collections.edges.map((edge) => ({
    id: edge.node.id,
    title: edge.node.title,
    handle: edge.node.handle,
    description: edge.node.description,
    products: edge.node.products.edges.map((productEdge) => transformProduct(productEdge.node)),
  }))
}

// Get single product by handle
export async function getProductByHandle(handle: string): Promise<Product | null> {
  const data = await shopifyFetch<{
    productByHandle: ShopifyProduct | null
  }>({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
    fallback: { productByHandle: null },
  })

  if (!data.productByHandle) {
    return null
  }

  return transformProduct(data.productByHandle)
}

/**
 * What the cart route checks before accepting a variant: its title, to turn
 * away a date that has been, and whether its product takes allergies at all.
 */
export async function getVariantForCart(
  variantId: string,
): Promise<{ title: string; askAllergies: boolean } | null> {
  const data = await shopifyFetch<{
    node: { title?: string; product?: { askAllergies: { value: string } | null } } | null
  }>({
    query: VARIANT_FOR_CART_QUERY,
    variables: { id: variantId },
  })

  if (!data.node?.title) return null

  return {
    title: data.node.title,
    askAllergies: data.node.product?.askAllergies?.value === 'true',
  }
}

// Create a new cart
export async function createCart(
  variantId?: string,
  quantity = 1,
  attributes: CartLineAttribute[] = [],
): Promise<Cart> {
  const input = variantId ? { lines: [{ merchandiseId: variantId, quantity, attributes }] } : {}

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
  quantity = 1,
  attributes: CartLineAttribute[] = [],
): Promise<Cart> {
  const data = await shopifyFetch<{
    cartLinesAdd: { cart: ShopifyCart }
  }>({
    query: ADD_TO_CART_MUTATION,
    variables: {
      cartId,
      lines: [{ merchandiseId: variantId, quantity, attributes }],
    },
  })

  return transformCart(data.cartLinesAdd.cart)
}

/** One line on its way into a cart. */
export type CartLineInput = {
  variantId: string
  quantity: number
  attributes?: CartLineAttribute[]
}

function toShopifyLines(lines: CartLineInput[]) {
  return lines.map(({ variantId, quantity, attributes = [] }) => ({
    merchandiseId: variantId,
    quantity,
    attributes,
  }))
}

/**
 * Several lines in one mutation. Booking a week of lunches used to be one
 * request per date, and the cart filled up a line at a time while the visitor
 * watched; this way they all arrive together or not at all.
 */
export async function createCartWithLines(lines: CartLineInput[]): Promise<Cart> {
  const data = await shopifyFetch<{
    cartCreate: { cart: ShopifyCart }
  }>({
    query: CREATE_CART_MUTATION,
    variables: { input: { lines: toShopifyLines(lines) } },
  })

  return transformCart(data.cartCreate.cart)
}

export async function addLinesToCart(cartId: string, lines: CartLineInput[]): Promise<Cart> {
  const data = await shopifyFetch<{
    cartLinesAdd: { cart: ShopifyCart }
  }>({
    query: ADD_TO_CART_MUTATION,
    variables: { cartId, lines: toShopifyLines(lines) },
  })

  return transformCart(data.cartLinesAdd.cart)
}

// Get cart by ID
export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await shopifyFetch<{
    cart: ShopifyCart | null
  }>({
    query: GET_CART_QUERY,
    // One visitor's cart as it is now, not as it was a minute ago
    revalidate: 0,
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
  quantity: number,
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
export async function removeFromCart(cartId: string, lineId: string): Promise<Cart> {
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
  buyerIdentity: BuyerIdentityInput,
): Promise<{
  cart: Cart
  checkoutUrl: string
  errors: Array<{ field: string[]; message: string }>
}> {
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
export type { Cart, CartItem, Product } from './types'
