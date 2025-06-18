"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/CartContext"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const { items, removeFromCart, updateQuantity } = useCart()
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const router = useRouter()

  // Chọn tất cả
  const allSelected = items.length > 0 && selectedIds.length === items.length
  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([])
    else setSelectedIds(items.map(i => i._id))
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const selectedItems = items.filter(i => selectedIds.includes(i._id))
  const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = promoApplied ? (total * promoDiscount) / 100 : 0
  const finalTotal = total - discount

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán!")
      return
    }
    router.push(`/checkout?items=${encodeURIComponent(JSON.stringify(selectedItems))}`)
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

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Giỏ Hàng Của Bạn</h1>

      {items.length === 0 ? (
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
                <div className="flex items-center mb-4">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="mr-2" />
                  <span>Chọn tất cả</span>
                </div>
                <h2 className="text-xl font-semibold mb-4">Sản Phẩm Trong Giỏ Hàng</h2>
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item._id} className="flex flex-col sm:flex-row gap-4 items-center">
                      <input type="checkbox" checked={selectedIds.includes(item._id)} onChange={() => toggleSelect(item._id)} className="mr-2 self-start" />
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
                        <div className="flex justify-between items-center">
                          <div className="text-lg font-semibold text-pink-600">
                            {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item._id)}
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
              <div className="flex justify-between text-lg">
                <span>Tạm tính:</span>
                <span className="font-semibold">{total.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between text-lg">
                <span>Phí vận chuyển:</span>
                <span className="font-semibold">Miễn phí</span>
              </div>
              {promoApplied && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá ({promoDiscount}%)</span>
                  <span>-{discount.toLocaleString('vi-VN')}₫</span>
                </div>
              )}
              <Separator />
              <div className="border-t pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-pink-600">{finalTotal.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>
              <Button className="w-full bg-pink-500 hover:bg-pink-600 mt-4" onClick={handleCheckout}>
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
