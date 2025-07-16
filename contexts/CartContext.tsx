"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { Product } from "@/types/product"

interface CartItem extends Product {
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        setItems(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error)
    }
    setMounted(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem("cart", JSON.stringify(items))
        // Calculate total
        const newTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        setTotal(newTotal)
      } catch (error) {
        console.error("Error saving cart to localStorage:", error)
      }
    }
  }, [items, mounted])

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item._id === product._id)
      if (existingItem) {
        // Tăng số lượng và đưa sản phẩm lên đầu
        const updated = currentItems
          .map((item) => item._id === product._id ? { ...item, quantity: item.quantity + quantity } : item)
          .filter((item) => item._id !== product._id)
        return [{ ...existingItem, quantity: existingItem.quantity + quantity }, ...updated]
      }
      // Thêm mới lên đầu
      return [{ ...product, quantity }, ...currentItems]
    })
  }

  const removeFromCart = (productId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item._id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return
    setItems((currentItems) =>
      currentItems.map((item) =>
        item._id === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  // Don't render children until mounted
  if (!mounted) {
    return null
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
} 