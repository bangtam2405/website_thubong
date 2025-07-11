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
import { useNavigation } from "react-day-picker"

export default function CartPage() {
  // const navigate = useNavigation
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
      <h1 className="text-3xl font-bold mb-2">Giỏ Hàng Của Bạn</h1>
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
            <div className="bg-white rounded-2xl shadow-md border border-gray-100">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="mr-2 accent-pink-500 scale-125" />
                  <span className="font-medium">Chọn tất cả</span>
                </div>
                <h2 className="text-xl font-semibold mb-4">Sản Phẩm Trong Giỏ Hàng</h2>
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item._id} className="flex flex-col sm:flex-row gap-4 items-center bg-gray-50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100">
                      <input type="checkbox" checked={selectedIds.includes(item._id)} onChange={() => toggleSelect(item._id)} className="mr-2 self-start accent-pink-500 scale-125" />
                      <div className="flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={100}
                          height={100}
                          className="rounded-lg border border-gray-200 object-cover w-[100px] h-[100px]"
                        />
                      </div>
                      <div className="flex-grow w-full">
                        <h3 className="font-semibold text-lg mb-1 text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                          {item.description}
                          {/* eslint-disable-next-line */}
                          {(item.specifications && (item.specifications as any).giftBox && (item.specifications as any).giftBox.name) && (
                            <>
                              <br />Hộp quà: {(item.specifications as any).giftBox.name}
                            </>
                          )}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                          <div className="text-lg font-bold text-pink-600">
                            {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                          </div>
                          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="border-none text-xl"
                            >
                              <Minus />
                            </Button>
                            <span className="w-8 text-center font-semibold text-base">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="border-none text-xl"
                            >
                              <Plus />
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
                          aria-label="Xóa sản phẩm"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4">Bạn có mã giảm giá?</h2>
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập mã giảm giá"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="rounded-lg"
                />
                <Button onClick={applyPromoCode} className="bg-pink-500 hover:bg-pink-600 rounded-lg">Áp Dụng</Button>
              </div>
              {promoApplied && (
                <p className="text-green-600 text-sm mt-2">Đã áp dụng mã giảm giá! Giảm {promoDiscount}%.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 h-fit sticky top-24">
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
              <Button className="w-full bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 mt-4 text-lg py-3 rounded-xl shadow-pink-100 shadow-md" onClick={handleCheckout}>
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
