'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { Cart } from '@/lib/shopify/types'

interface CartContextType {
  cart: Cart | null
  isOpen: boolean
  isLoading: boolean
  openCart: () => void
  closeCart: () => void
  addToCart: (variantId: string, quantity?: number) => Promise<void>
  updateQuantity: (lineId: string, quantity: number) => Promise<void>
  removeFromCart: (lineId: string) => Promise<void>
  cartCount: number
}

const CartContext = createContext<CartContextType | null>(null)

const CART_ID_KEY = 'gransvilla-cart-id'

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load cart on mount
  useEffect(() => {
    const loadCart = async () => {
      const cartId = localStorage.getItem(CART_ID_KEY)
      if (cartId) {
        try {
          const response = await fetch(`/api/cart?cartId=${cartId}`)
          if (response.ok) {
            const data = await response.json()
            if (data.cart) {
              setCart(data.cart)
            } else {
              localStorage.removeItem(CART_ID_KEY)
            }
          }
        } catch (error) {
          console.error('Failed to load cart:', error)
          localStorage.removeItem(CART_ID_KEY)
        }
      }
    }
    loadCart()
  }, [])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const addToCart = useCallback(async (variantId: string, quantity = 1) => {
    setIsLoading(true)
    try {
      const cartId = localStorage.getItem(CART_ID_KEY)

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId, variantId, quantity }),
      })

      if (!response.ok) throw new Error('Failed to add to cart')

      const data = await response.json()
      setCart(data.cart)
      localStorage.setItem(CART_ID_KEY, data.cart.id)
      setIsOpen(true)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateQuantity = useCallback(async (lineId: string, quantity: number) => {
    const cartId = localStorage.getItem(CART_ID_KEY)
    if (!cartId) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId, lineId, quantity }),
      })

      if (!response.ok) throw new Error('Failed to update cart')

      const data = await response.json()
      setCart(data.cart)
    } catch (error) {
      console.error('Failed to update cart:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeFromCart = useCallback(async (lineId: string) => {
    const cartId = localStorage.getItem(CART_ID_KEY)
    if (!cartId) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId, lineId }),
      })

      if (!response.ok) throw new Error('Failed to remove from cart')

      const data = await response.json()
      setCart(data.cart)
    } catch (error) {
      console.error('Failed to remove from cart:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        isLoading,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    // Return a default context for SSR - actions will be no-ops
    return {
      cart: null,
      isOpen: false,
      isLoading: true,
      openCart: () => {},
      closeCart: () => {},
      addToCart: async () => {},
      updateQuantity: async () => {},
      removeFromCart: async () => {},
      cartCount: 0,
    } as CartContextType
  }
  return context
}
