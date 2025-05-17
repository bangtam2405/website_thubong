"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react"
import { Separator } from "@/components/ui/separator"

// Dữ liệu giỏ hàng mẫu
const initialCartItems = [
  {
    id: "1",
    name: "Gấu Nâu Tùy Chỉnh",
    description: "Gấu nâu với mắt nút và áo thun đỏ",
    price: 39.99,
    quantity: 1,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "2",
    name: "Thỏ Hồng Tùy Chỉnh",
    description: "Thỏ hồng với tai xệ và váy xanh",
    price: 42.99,
    quantity: 1,
    image: "/placeholder.svg?height=100&width=100",
  },
]

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems)
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoDiscount, setPromoDiscount] = useState(0)

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "welcome10") {
      setPromoApplied(true)
      setPromoDiscount(10)
    } else {
      setPromoApplied(false)
      setPromoDiscount(0)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 5.99
  const discount = promoApplied ? (subtotal * promoDiscount) / 100 : 0
  const total = subtotal + shipping - discount

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Giỏ Hàng Của Bạn</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-medium mb-4">Giỏ hàng của bạn đang trống</h2>
          <p className="text-gray-500 mb-8">Có vẻ như bạn chưa thêm thú nhồi bông nào vào giỏ hàng.</p>
          <Link href="/customize">
            <Button className="bg-pink-500 hover:bg-pink-600">Bắt Đầu Thiết Kế</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Sản Phẩm Trong Giỏ Hàng</h2>
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={100}
                          height={100}
                          className="rounded-md"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">{item.description}</p>
                        <p className="font-medium">{item.price.toFixed(2)}$</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Bạn có mã giảm giá?</h2>
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập mã giảm giá"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <Button onClick={applyPromoCode}>Áp Dụng</Button>
              </div>
              {promoApplied && (
                <p className="text-green-600 text-sm mt-2">Đã áp dụng mã giảm giá! Giảm {promoDiscount}%.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
            <h2 className="text-xl font-semibold mb-4">Tóm Tắt Đơn Hàng</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính</span>
                <span>{subtotal.toFixed(2)}$</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span>{shipping.toFixed(2)}$</span>
              </div>
              {promoApplied && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá ({promoDiscount}%)</span>
                  <span>-{discount.toFixed(2)}$</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Tổng cộng</span>
                <span>{total.toFixed(2)}$</span>
              </div>
              <Button className="w-full bg-pink-500 hover:bg-pink-600 mt-4">
                Tiến Hành Thanh Toán <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-xs text-gray-500 text-center mt-4">
                Phí vận chuyển được tính tại bước thanh toán. Có thể áp dụng thuế.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
