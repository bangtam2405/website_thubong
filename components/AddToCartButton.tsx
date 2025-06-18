"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { toast } from "sonner"
import { Product } from "@/types/product"

interface AddToCartButtonProps {
  product: Product
  variant?: "default" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function AddToCartButton({
  product,
  variant = "default",
  size = "default",
  className = "",
}: AddToCartButtonProps) {
  const { addToCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      setIsLoading(true)
      addToCart(product)
      toast.success("Đã thêm vào giỏ hàng!")
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleAddToCart}
      disabled={isLoading}
      type="button"
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {isLoading ? "Đang thêm..." : "Thêm vào giỏ"}
    </Button>
  )
} 