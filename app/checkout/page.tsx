"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { CreditCard, QrCode, Wallet2 } from "lucide-react"

// Log the environment variable for debugging
console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);

interface CartItem {
  _id: string
  name: string
  price: number
  image: string
  quantity: number
  type: string
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [payment, setPayment] = useState("cod")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const itemsParam = searchParams.get("items")
    if (itemsParam) {
      try {
        setItems(JSON.parse(decodeURIComponent(itemsParam)))
      } catch {
        setItems([])
      }
    }
  }, [searchParams])

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone || !address) {
      toast.error("Vui lòng nhập đầy đủ thông tin nhận hàng!")
      return
    }
    setLoading(true)

    if (payment === 'vnpay') {
      const res = await fetch('http://localhost:5000/api/payment/vnpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          orderId: `ORDER${Date.now()}`,
          orderInfo: `Thanh toán đơn hàng cho ${name}`,
          returnUrl: `${window.location.origin}/payment-result`
        })
      });
      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        toast.error("Không lấy được link thanh toán VNPay. Vui lòng thử lại!")
        setLoading(false)
      }
    } else if (payment === 'momo') {
      const res = await fetch('http://localhost:5000/api/payment/momo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          orderId: `ORDER${Date.now()}`,
          orderInfo: `Thanh toán đơn hàng cho ${name}`,
          returnUrl: `${window.location.origin}/payment-result`,
          notifyUrl: `${window.location.origin}/api/payment/momo-notify`
        })
      });
      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        toast.error("Không lấy được link thanh toán MoMo. Vui lòng thử lại!")
        setLoading(false)
      }
    } else {
      setTimeout(() => {
        setLoading(false)
        toast.success("Đặt hàng thành công! Cảm ơn bạn đã mua hàng.")
        router.push("/")
      }, 2000)
    }
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Thanh Toán Đơn Hàng</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Sản phẩm đã chọn</h2>
        {items.length === 0 ? (
          <div className="text-gray-500 text-center">Không có sản phẩm nào được chọn.</div>
        ) : (
          <div className="divide-y">
            {items.map((item) => (
              <div key={item._id} className="flex items-center gap-4 py-4">
                <Image src={item.image || "/placeholder.svg"} alt={item.name} width={64} height={64} className="rounded-md" />
                <div className="flex-1">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-sm text-gray-500">x{item.quantity}</div>
                </div>
                <div className="font-bold text-pink-600">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-between items-center mt-6 text-lg font-bold">
          <span>Tổng cộng:</span>
          <span className="text-pink-600">{total.toLocaleString('vi-VN')}₫</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <h2 className="text-xl font-semibold mb-4">Thông tin nhận hàng</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Họ và tên" value={name} onChange={e => setName(e.target.value)} required />
          <Input placeholder="Số điện thoại" value={phone} onChange={e => setPhone(e.target.value)} required />
        </div>
        <Input placeholder="Địa chỉ nhận hàng" value={address} onChange={e => setAddress(e.target.value)} required />

        <div>
          <h3 className="font-semibold mb-4">Phương thức thanh toán</h3>
          <RadioGroup value={payment} onValueChange={setPayment} className="space-y-3">
            <div className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${payment === 'cod' ? 'border-pink-500 bg-pink-50' : 'hover:border-gray-300'}`}>
              <RadioGroupItem value="cod" id="cod" className="mr-3" />
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-gray-500 mr-2" />
                <span className="font-medium">Thanh toán khi nhận hàng (COD)</span>
              </div>
            </div>
            <div className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${payment === 'vnpay' ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'}`}>
              <RadioGroupItem value="vnpay" id="vnpay" className="mr-3" />
              <div className="flex items-center">
                <QrCode className="h-5 w-5 text-blue-500 mr-2" />
                <span className="font-medium text-blue-600">VNPay (QR/ATM/Internet Banking)</span>
              </div>
            </div>
            <div className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${payment === 'momo' ? 'border-pink-500 bg-pink-50' : 'hover:border-gray-300'}`}>
              <RadioGroupItem value="momo" id="momo" className="mr-3" />
              <div className="flex items-center">
                <Wallet2 className="h-5 w-5 text-pink-500 mr-2" />
                <span className="font-medium text-pink-600">MoMo (QR/Ứng dụng MoMo)</span>
              </div>
            </div>
          </RadioGroup>
        </div>

        <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-lg" disabled={loading || items.length === 0}>
          {loading ? "Đang xử lý..." : `Xác nhận thanh toán (${total.toLocaleString('vi-VN')}₫)`}
        </Button>
      </form>
    </div>
  )
} 