"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { CreditCard, QrCode, Wallet2 } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Dialog } from '@headlessui/react';
import { formatDateVN } from "@/lib/utils";

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

function SuccessModal({ onContinue, orderId }: { onContinue: () => void; orderId: string | null }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <style>{`
        .checkmark {
          stroke-dasharray: 24;
          stroke-dashoffset: 24;
          animation: checkmark-draw 0.7s cubic-bezier(.65,0,.45,1) infinite;
        }
        @keyframes checkmark-draw {
          0% { stroke-dashoffset: 24; opacity: 1; }
          60% { stroke-dashoffset: 0; opacity: 1; }
          80% { stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dashoffset: 24; opacity: 1; }
        }
      `}</style>
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <svg className="w-24 h-24 text-green-500 mx-auto mb-6" fill="none" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="checkmark" d="M15 25l7 7 11-13" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Đặt hàng thành công!</h2>
        <p className="text-gray-600 mb-6">
          Cảm ơn bạn đã tin tưởng. Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn.
        </p>
        <div className="space-y-3">
           <Button 
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg text-lg"
            onClick={onContinue}
          >
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    </div>
  )
}

const fetchUserCoupons = async (userId: string) => {
  const res = await fetch(`http://localhost:5000/api/admin/coupons/user/${userId}`);
  if (!res.ok) throw new Error('Lỗi khi lấy mã giảm giá');
  return res.json();
};

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [payment, setPayment] = useState("cod")
  const [loading, setLoading] = useState(false)
  const { removeItemsFromCart } = useCart();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const user = useCurrentUser();
  const [userCoupons, setUserCoupons] = useState<any[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoAmount, setPromoAmount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<string>("");
  const [couponSearch, setCouponSearch] = useState("");

  useEffect(() => {
    const itemsParam = searchParams.get("items")
    if (itemsParam) {
      try {
        setItems(JSON.parse(decodeURIComponent(itemsParam)))
      } catch {
        setItems([])
      }
    }
    // Lấy thông tin user từ localStorage nếu có
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.fullName) setName(user.fullName);
        if (user.phone) setPhone(user.phone);
        if (user.addresses && user.addresses[0] && user.addresses[0].address) setAddress(user.addresses[0].address);
      } catch {}
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user?.userId) return;
    fetchUserCoupons(user.userId).then(setUserCoupons).catch(() => setUserCoupons([]));
  }, [user?.userId]);

  // Nhận mã từ query (?coupon=)
  useEffect(() => {
    const couponParam = searchParams.get('coupon');
    if (couponParam) setPromoCode(couponParam);
  }, [searchParams]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalTotal = total - (promoApplied ? promoAmount : 0);

  const handleSelectCoupon = (code: string) => {
    setPromoCode(code);
    setPromoApplied(false);
    setPromoAmount(0);
    setPromoError("");
  };

  const applyPromoCode = async (code?: string) => {
    setPromoError("");
    setPromoApplied(false);
    setPromoAmount(0);
    setPromoLoading(true);
    const codeToApply = code || promoCode;
    if (!codeToApply) return;
    try {
      const res = await fetch("http://localhost:5000/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeToApply, totalAmount: total })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Mã giảm giá không hợp lệ");
      setPromoApplied(true);
      setPromoAmount(data.discountAmount || 0);
      setPromoCode(codeToApply);
      toast.success(data.message || "Áp dụng mã giảm giá thành công!");
    } catch (err: any) {
      setPromoError(err.message);
      toast.error(err.message);
    } finally {
      setPromoLoading(false);
    }
  };

  // Khi bấm áp dụng trong modal
  const handleApplyCoupon = () => {
    setPromoCode(selectedCoupon);
    setShowCouponModal(false);
    setTimeout(() => applyPromoCode(), 100);
  };
  // Khi bấm bỏ áp dụng
  const handleRemoveCoupon = () => {
    setPromoCode("");
    setPromoApplied(false);
    setPromoAmount(0);
    setPromoError("");
    setSelectedCoupon("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone || !address) {
      toast.error("Vui lòng nhập đầy đủ thông tin nhận hàng!")
      return
    }
    setLoading(true)

    if (payment === 'vnpay') {
      const userId = localStorage.getItem("userId");
      if (!userId || userId.length !== 24) {
        toast.error("Bạn cần đăng nhập lại để đặt hàng!");
        localStorage.clear();
        window.location.href = "/login";
        setLoading(false);
        return;
      }

      const res = await fetch('http://localhost:5000/api/payment/vnpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalTotal,
          returnUrl: `${window.location.origin}/payment-result`,
          products: items.map(item => ({
            product: item._id,
            quantity: item.quantity
          })),
          user: userId,
          name,
          phone,
          address,
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
          amount: finalTotal,
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
      // Tạo đơn hàng khi thanh toán COD
      try {
        const userId = localStorage.getItem("userId");
        if (!userId || userId.length !== 24) {
          toast.error("Bạn cần đăng nhập lại để đặt hàng!");
          localStorage.clear();
          window.location.href = "/login";
          setLoading(false);
          return;
        }
        const orderData = {
          user: userId,
          products: items.map(item => ({
            product: item._id,
            quantity: item.quantity
          })),
          totalPrice: finalTotal,
          name,
          phone,
          address,
          paymentMethod: 'COD' // Đảm bảo đúng enum backend
        };
        const res = await fetch("http://localhost:5000/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData)
        });
        if (!res.ok) {
          const errMsg = await res.text();
          console.error("Order API error:", errMsg, orderData);
          toast.error("Có lỗi khi lưu đơn hàng! " + errMsg);
          setLoading(false);
          return;
        }
        const order = await res.json();
        // Xóa sản phẩm khỏi giỏ hàng
        removeItemsFromCart(items.map(i => i._id));
        setLastOrderId(order._id || null);
        setShowSuccessModal(true);
        setLoading(false);
        return;
      } catch (err) {
        toast.error("Có lỗi khi lưu đơn hàng!");
        setLoading(false);
        return;
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {showSuccessModal && (
        <SuccessModal onContinue={() => router.push("/")} orderId={lastOrderId} />
      )}
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
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6 w-full">
        <h2 className="text-xl font-semibold mb-4 text-pink-600">Chọn mã giảm giá của bạn</h2>
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="flex flex-wrap items-center justify-between w-full gap-2">
            <Button type="button" onClick={() => setShowCouponModal(true)} className="bg-pink-500 hover:bg-pink-600 flex-shrink-0">Chọn mã giảm giá</Button>
            {promoApplied && (
              <span className="text-green-600 font-semibold text-base">
                Đã áp dụng: <span className="font-mono">{promoCode}</span>
              </span>
            )}
            {promoApplied && (
              <Button type="button" variant="outline" onClick={handleRemoveCoupon} className="ml-2">Bỏ áp dụng</Button>
            )}
          </div>
          {promoApplied && (
            <div className="text-green-600 text-sm w-full text-left mt-1">
              Đã áp dụng mã giảm giá! Giảm {promoAmount.toLocaleString('vi-VN')}₫.
            </div>
          )}
          {promoError && (
            <div className="text-red-500 text-sm w-full text-left mt-1">{promoError}</div>
          )}
        </div>
        {/* Modal chọn mã giảm giá */}
        <Dialog open={showCouponModal} onClose={() => setShowCouponModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-black opacity-30" />
            <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto z-10">
              <Dialog.Title className="text-lg font-bold mb-4 text-pink-600">Danh sách mã giảm giá của bạn</Dialog.Title>
              <Input
                placeholder="Tìm mã hoặc giá trị..."
                value={couponSearch}
                onChange={e => setCouponSearch(e.target.value)}
                className="mb-3"
              />
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {userCoupons.length === 0 ? (
                  <div className="text-gray-400">Bạn chưa có mã giảm giá nào.</div>
                ) : (
                  userCoupons.filter(c =>
                    c.code.toLowerCase().includes(couponSearch.toLowerCase()) ||
                    (c.type === 'percentage' ? `${c.value}%` : `${c.value}`.includes(couponSearch))
                  ).map(c => {
                    const isExpired = c.validUntil && new Date() > new Date(c.validUntil);
                    const isUsedUp = c.usageLimit && c.usedCount >= c.usageLimit;
                    const isInactive = !c.isActive;
                    const disabled = isExpired || isUsedUp || isInactive;
                    let badge = '';
                    if (isExpired) badge = 'Hết hạn';
                    else if (isUsedUp) badge = 'Đã sử dụng';
                    else if (isInactive) badge = 'Ngừng hoạt động';
                    return (
                      <button
                        key={c._id}
                        className={`w-full flex items-center px-4 py-2 rounded border mb-1 cursor-pointer text-left transition ${disabled ? 'opacity-50 border-gray-200' : 'border-pink-300 hover:bg-pink-50'} ${promoCode === c.code ? 'bg-pink-100 border-pink-500' : ''}`}
                        disabled={disabled}
                        onClick={() => {
                          setShowCouponModal(false);
                          applyPromoCode(c.code);
                        }}
                      >
                        <span className="font-mono font-semibold text-pink-600">{c.code}</span>
                        <span className="text-xs text-gray-500 ml-2">{c.type === 'percentage' ? `${c.value}%` : `${c.value.toLocaleString('vi-VN')}₫`}</span>
                        {badge && <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">{badge}</span>}
                      </button>
                    );
                  })
                )}
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCouponModal(false)}>Đóng</Button>
              </div>
            </div>
          </div>
        </Dialog>
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
          <RadioGroup value={payment} onValueChange={setPayment} className="space-y-4">
            <div className={`flex items-center p-5 border rounded-2xl cursor-pointer transition-all ${payment === 'cod' ? 'border-bray-500 bg-blue-50 shadow' : 'hover:border-gray-300'}`}>
              <RadioGroupItem value="cod" id="cod" className="mr-5 w-5 h-5 border-2 border-gray-500 data-[state=checked]:border-bray-500 data-[state=checked]:ring-2 data-[state=checked]:ring-blue-300" />
              <CreditCard className="h-5 w-5 text-gray-500" />
              <label htmlFor="cod" className="text-base font-medium cursor-pointer ml-3">Thanh toán khi nhận hàng (COD)</label>
            </div>
            <div className={`flex items-center p-5 border rounded-2xl cursor-pointer transition-all ${payment === 'vnpay' ? 'border-bray-500 bg-blue-50 shadow' : 'hover:border-gray-300'}`}>
              <RadioGroupItem value="vnpay" id="vnpay" className="mr-5 w-5 h-5 border-2 border-gray-500 data-[state=checked]:border-bray-500 data-[state=checked]:ring-2 data-[state=checked]:ring-blue-300" />
              <QrCode className="h-5 w-5 text-blue-500" />
              <label htmlFor="vnpay" className="text-base font-medium cursor-pointer ml-3">VNPay (QR/ATM/Internet Banking)</label>
            </div>
            <div className={`flex items-center p-5 border rounded-2xl cursor-pointer transition-all ${payment === 'momo' ? 'border-bray-500 bg-blue-50 shadow' : 'hover:border-gray-300'}`}>
              <RadioGroupItem value="momo" id="momo" className="mr-5 w-5 h-5 border-2 border-gray-500 data-[state=checked]:border-bray-500 data-[state=checked]:ring-2 data-[state=checked]:ring-blue-300" />
              <Wallet2 className="h-5 w-5 text-pink-500" />
              <label htmlFor="momo" className="text-base font-medium cursor-pointer ml-3">MoMo (QR/Ứng dụng MoMo)</label>
            </div>
          </RadioGroup>
        </div>
        {/* Tổng tiền, giảm giá, cần thanh toán nằm ngay trên nút xác nhận */}
        <div className="flex flex-col items-end text-lg font-bold mt-4 space-y-1">
          <div className="flex gap-2">
            <span className="font-bold">Tổng cộng:</span>
            <span className="text-pink-600">{total.toLocaleString('vi-VN')}₫</span>
          </div>
          {promoApplied && promoAmount > 0 && (
            <div className="flex gap-2">
              <span className="font-bold text-green-600">Giảm giá:</span>
              <span className="text-green-600">-{promoAmount.toLocaleString('vi-VN')}₫</span>
            </div>
          )}
          <div className="flex gap-2">
            <span className="font-bold">Cần thanh toán:</span>
            <span className="text-pink-600">{finalTotal.toLocaleString('vi-VN')}₫</span>
          </div>
        </div>
        <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-lg" disabled={loading || items.length === 0}>
          {loading ? "Đang xử lý..." : `Xác nhận thanh toán`}
        </Button>
      </form>
      {/* Xóa phần tổng tiền ở dưới cùng */}
    </div>
  )
} 