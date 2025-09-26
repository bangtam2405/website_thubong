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
import AddressSelector from "@/components/AddressSelector";
import ShippingCalculator from "@/components/ShippingCalculator";
import OrderSuccessModal from "@/components/OrderSuccessModal";

interface CartItem {
  _id: string
  name: string
  price: number
  image: string
  quantity: number
  type: string
  designName?: string
  description?: string
  previewImage?: string
  specifications?: any
  size?: string
  material?: string
}

function SuccessModal({ onContinue, orderId }: { onContinue: () => void; orderId: string | null }) {
  const handleContinue = () => {
    // Xóa checkoutItems khỏi sessionStorage khi tiếp tục mua sắm
    sessionStorage.removeItem('checkoutItems');
    onContinue();
  };

  return (
    <OrderSuccessModal 
      isOpen={true}
      onClose={handleContinue}
      orderId={orderId || undefined}
    />
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
  const [selectedAddress, setSelectedAddress] = useState({
    province: "",
    ward: "",
    detail: "",
    fullAddress: ""
  })
  const [payment, setPayment] = useState("cod")
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
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
  const [selectedCouponId, setSelectedCouponId] = useState<string>("");
  const [couponSearch, setCouponSearch] = useState("");
  const [shippingFee, setShippingFee] = useState(0);
  const [customerNote, setCustomerNote] = useState("");


  useEffect(() => {
    // Lấy items từ sessionStorage thay vì searchParams
    const checkoutItems = sessionStorage.getItem('checkoutItems');
    if (checkoutItems) {
      try {
        setItems(JSON.parse(checkoutItems));
      } catch {
        setItems([]);
      }
    } else {
      // Fallback: thử lấy từ searchParams nếu không có trong sessionStorage
      const itemsParam = searchParams.get("items");
      if (itemsParam) {
        try {
          setItems(JSON.parse(decodeURIComponent(itemsParam)));
        } catch {
          setItems([]);
        }
      }
    }
    // Lấy thông tin user từ localStorage nếu có
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.fullName) setName(user.fullName);
        if (user.phone) setPhone(user.phone);
        
        // Ưu tiên lấy địa chỉ từ localStorage (đã được cập nhật từ profile)
        const savedAddress = localStorage.getItem("selectedAddress");
        if (savedAddress) {
          try {
            const addressData = JSON.parse(savedAddress);
            setAddress(addressData.fullAddress || "");
            setSelectedAddress(addressData);
          } catch (error) {
            // Fallback: lấy từ user.addresses nếu localStorage lỗi
            if (user.addresses && user.addresses[0]) {
              const userAddress = user.addresses[0];
              setAddress(userAddress.address || "");
              setSelectedAddress({
                province: userAddress.province || "",
                ward: userAddress.ward || "",
                detail: userAddress.detail || "",
                fullAddress: userAddress.address || ""
              });
            }
          }
        } else {
          // Fallback: lấy từ user.addresses nếu không có trong localStorage
          if (user.addresses && user.addresses[0]) {
            const userAddress = user.addresses[0];
            setAddress(userAddress.address || "");
            setSelectedAddress({
              province: userAddress.province || "",
              ward: userAddress.ward || "",
              detail: userAddress.detail || "",
              fullAddress: userAddress.address || ""
            });
          }
        }
      } catch {}
    }
    // Đánh dấu trang đã load xong
    setPageLoading(false);
  }, [searchParams]);

  useEffect(() => {
    if (!user?.userId) return;
    fetchUserCoupons(user.userId).then(setUserCoupons).catch(() => setUserCoupons([]));
  }, [user?.userId]);

  // Lắng nghe thay đổi địa chỉ từ profile
  useEffect(() => {
    const handleStorageChange = () => {
      const savedAddress = localStorage.getItem("selectedAddress");
      if (savedAddress) {
        try {
          const addressData = JSON.parse(savedAddress);
          setAddress(addressData.fullAddress || "");
          setSelectedAddress(addressData);
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('user-updated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-updated', handleStorageChange);
    };
  }, []);

  // Lưu selectedAddress vào localStorage khi thay đổi (giống profile page)
  useEffect(() => {
    if (selectedAddress.province && selectedAddress.ward) {
      const currentSaved = localStorage.getItem("selectedAddress");
      const currentSavedObj = currentSaved ? JSON.parse(currentSaved) : null;
      
      // Chỉ lưu nếu khác với dữ liệu đã lưu trước đó
      if (!currentSavedObj || 
          currentSavedObj.province !== selectedAddress.province ||
          currentSavedObj.ward !== selectedAddress.ward ||
          currentSavedObj.detail !== selectedAddress.detail) {
        localStorage.setItem("selectedAddress", JSON.stringify(selectedAddress));
        // Trigger event để profile biết có thay đổi
        window.dispatchEvent(new Event('user-updated'));
      }
    }
  }, [selectedAddress]);

  // Nhận mã từ query (?coupon=)
  useEffect(() => {
    const couponParam = searchParams.get('coupon');
    if (couponParam) setPromoCode(couponParam);
  }, [searchParams]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalTotal = total + shippingFee - (promoApplied ? promoAmount : 0);

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
      setSelectedCouponId(data.couponId || ""); // Lưu coupon ID
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
    setSelectedCouponId("");
  };



  // Tính trọng lượng tổng
  const totalWeight = items.reduce((sum, item) => sum + (item.quantity * 0.5), 0); // Giả sử mỗi sản phẩm 0.5kg

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation đầy đủ thông tin
    if (!name.trim()) {
      toast.error("Vui lòng nhập họ và tên!");
      return;
    }
    
    if (!phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại!");
      return;
    }
    
    if (!selectedAddress.province || !selectedAddress.ward) {
      toast.error("Vui lòng chọn địa chỉ nhận hàng!");
      return;
    }
    
    if (items.length === 0) {
      toast.error("Giỏ hàng trống!");
      router.push("/cart");
      return;
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
              quantity: item.quantity,
              price: item.price,
              name: item.name,
              designName: item.designName,
              description: item.description,
              image: item.image,
              previewImage: item.previewImage,
              specifications: item.specifications,
              size: item.size || item.specifications?.sizeName,
              material: item.material || item.specifications?.material
            })),
            user: userId,
            name,
            phone,
            address,
            customerNote,
            shippingFee,
            coupon: selectedCouponId,
            discountAmount: promoAmount,
          })
        });
      const data = await res.json();
      if (data.paymentUrl) {
        // Xóa checkoutItems khỏi sessionStorage trước khi chuyển hướng
        sessionStorage.removeItem('checkoutItems');
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
            notifyUrl: `${window.location.origin}/api/payment/momo-notify`,
            customerNote,
          })
        });
      const data = await res.json();
      if (data.paymentUrl) {
        // Xóa checkoutItems khỏi sessionStorage trước khi chuyển hướng
        sessionStorage.removeItem('checkoutItems');
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
            quantity: item.quantity,
            price: item.price,
            name: item.name,
            designName: item.designName,
            description: item.description,
            image: item.image,
            previewImage: item.previewImage,
            specifications: item.specifications,
            size: item.size || item.specifications?.sizeName,
            material: item.material || item.specifications?.material
          })),
          totalPrice: finalTotal,
          name,
          phone,
          address,
          paymentMethod: 'COD', // Đảm bảo đúng enum backend
          coupon: selectedCouponId, // Thêm coupon ID
          discountAmount: promoAmount, // Thêm số tiền giảm giá
          shippingFee: shippingFee, // Thêm phí ship
          customerNote: customerNote // Thêm ghi chú khách hàng
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
        // Xóa checkoutItems khỏi sessionStorage
        sessionStorage.removeItem('checkoutItems');
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

  // Nếu không có sản phẩm nào, chuyển về trang giỏ hàng
  useEffect(() => {
    if (items.length === 0 && !loading && !pageLoading) {
      // Chỉ chuyển hướng nếu đã load xong và thực sự không có sản phẩm
      const checkoutItems = sessionStorage.getItem('checkoutItems');
      if (!checkoutItems) {
        toast.error("Không có sản phẩm nào để thanh toán!");
        router.push("/cart");
      }
    }
  }, [items.length, loading, pageLoading, router]);

  // Hiển thị loading khi trang đang load
  if (pageLoading) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {showSuccessModal && (
        <SuccessModal onContinue={() => router.push("/")} orderId={lastOrderId} />
      )}
      <h1 className="text-3xl font-bold mb-8 text-center text-[#E3497A]">Thanh Toán Đơn Hàng</h1>
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
                  {(item.size || item.material || item.specifications?.size || item.specifications?.material || item.description) && (
                    <div className="text-sm text-gray-600 mt-1">
                      {(() => {
                        // Fallback từ description nếu thiếu size/material
                        const descText = typeof item.description === 'string' ? item.description : '';
                        const sizeFromDesc = /Kích thước\s*:\s*([^;]+)/i.exec(descText)?.[1]?.trim();
                        const materialFromDesc = /Chất liệu\s*:\s*([^;]+)/i.exec(descText)?.[1]?.trim();

                        let sizeRaw: any = item.size || item.specifications?.sizeName || item.specifications?.size || sizeFromDesc;
                        // Nếu bắt trúng ObjectId, fallback về sizeFromDesc (nếu có)
                        if (typeof sizeRaw === 'string' && /^[a-f\d]{24}$/i.test(sizeRaw)) {
                          sizeRaw = sizeFromDesc || '';
                        }
                        // Map giá trị chuẩn
                        const size = sizeRaw === 'small' ? 'Nhỏ' : sizeRaw === 'medium' ? 'Vừa' : sizeRaw === 'large' ? 'Lớn' : sizeRaw || '';
                        const material = item.material || item.specifications?.material || materialFromDesc || '';
                        const parts: string[] = [];
                        if (size) parts.push(`Kích thước: ${size}`);
                        if (material) parts.push(`Chất liệu: ${material}`);
                        return parts.join(' · ');
                      })()}
                    </div>
                  )}
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
        
        {/* Địa chỉ nhận hàng */}
        <div>
          <h3 className="font-semibold mb-4">Địa chỉ nhận hàng</h3>
          <AddressSelector 
            onAddressChange={(addressData) => {
              setSelectedAddress(addressData)
              setAddress(addressData.fullAddress)
            }}
            defaultProvince={selectedAddress.province}
            defaultWard={selectedAddress.ward}
            defaultDetail={selectedAddress.detail}
            disableLocalStorage={false}
          />

        </div>

        {/* Tính phí ship */}
        <div>
          <h3 className="font-semibold mb-4">Phí vận chuyển</h3>
          <ShippingCalculator 
            selectedProvince={selectedAddress.province}
            selectedWard={selectedAddress.ward}
            subtotal={total}
            onShippingFeeChange={setShippingFee}
          />
        </div>
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
        {/* Tổng tiền, giảm giá, phí vận chuyển, cần thanh toán */}
        <div className="flex flex-col items-end text-lg font-bold mt-4 space-y-1">
          <div className="flex gap-2">
            <span className="font-bold">Tổng cộng:</span>
            <span className="text-pink-600">{total.toLocaleString('vi-VN')}₫</span>
          </div>
          
          {shippingFee > 0 && (
            <div className="flex gap-2">
              <span className="font-bold text-blue-600">Phí vận chuyển:</span>
              <span className="text-blue-600">+{shippingFee.toLocaleString('vi-VN')}₫</span>
            </div>
          )}
          
          {promoApplied && promoAmount > 0 && (
            <div className="flex gap-2">
              <span className="font-bold text-green-600">Giảm giá:</span>
              <span className="text-green-600">-{promoAmount.toLocaleString('vi-VN')}₫</span>
            </div>
          )}
          
          <div className="flex gap-2 border-t pt-2">
            <span className="font-bold">Cần thanh toán:</span>
            <span className="text-pink-600">{finalTotal.toLocaleString('vi-VN')}₫</span>
          </div>
        </div>
        {/* Ghi chú đơn hàng */}
        <div>
          <h3 className="font-semibold mb-4">Ghi chú đơn hàng (không bắt buộc)</h3>
          <textarea
            placeholder="Ghi chú về đơn hàng, yêu cầu đặc biệt, hoặc hướng dẫn giao hàng..."
            value={customerNote}
            onChange={e => setCustomerNote(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            rows={3}
          />
        </div>

        <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-lg" disabled={loading || items.length === 0}>
          {loading ? "Đang xử lý..." : `Xác nhận thanh toán`}
        </Button>
      </form>
      {/* Xóa phần tổng tiền ở dưới cùng */}
    </div>
  )
} 