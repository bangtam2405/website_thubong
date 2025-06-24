"use client"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useEffect, useState, Suspense } from "react"
import axios from "@/lib/axiosConfig"

function PaymentResult() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const vnp_Amount = searchParams.get("vnp_Amount")
  const vnp_BankCode = searchParams.get("vnp_BankCode")
  const vnp_OrderInfo = searchParams.get("vnp_OrderInfo")
  const vnp_PayDate = searchParams.get("vnp_PayDate")
  const vnp_TransactionNo = searchParams.get("vnp_TransactionNo")
  const vnp_TxnRef = searchParams.get("vnp_TxnRef")


  useEffect(() => {
    const verifyPayment = async () => {
      const queryString = window.location.search
      try {
        const response = await axios.get(`/api/payment/vnpay-return${queryString}`)
        if (response.data.code === "00") {
          setIsSuccess(true)
        } else {
          setError(response.data.message || "Xác thực thanh toán thất bại")
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Lỗi kết nối đến máy chủ")
      } finally {
        setLoading(false)
      }
    }
    verifyPayment()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-10">
        <Loader2 className="w-20 h-20 text-pink-500 animate-spin mb-4" />
        <h1 className="text-3xl font-bold text-gray-700">Đang xác thực giao dịch...</h1>
        <p className="text-lg text-gray-600">Vui lòng chờ trong giây lát.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-10 bg-gray-50">
      <style>{`
        .icon-animate {
          animation: pop-bounce 0.7s cubic-bezier(.36,1.7,.45,.97);
        }
        @keyframes pop-bounce {
          0% { transform: scale(0.2); opacity: 0; }
          60% { transform: scale(1.2); opacity: 1; }
          80% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      {isSuccess ? (
        <>
          <CheckCircle className="w-20 h-20 text-green-500 mb-4 icon-animate" />
          <h1 className="text-3xl font-bold text-green-600 mb-2">Thanh toán thành công!</h1>
          <p className="mb-6 text-lg text-gray-700">Cảm ơn bạn đã mua hàng. Đơn hàng đã được xác nhận.</p>
        </>
      ) : (
        <>
          <XCircle className="w-20 h-20 text-red-500 mb-4 icon-animate" />
          <h1 className="text-3xl font-bold text-red-600 mb-2">Thanh toán thất bại!</h1>
          <p className="mb-6 text-lg text-gray-700">{error || "Có lỗi xảy ra trong quá trình thanh toán."}</p>
        </>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md mb-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Thông tin giao dịch</h2>
        <div className="space-y-2 text-gray-700">
          <div><b>Mã đơn hàng:</b> {vnp_TxnRef}</div>
          <div><b>Số tiền:</b> {vnp_Amount ? (Number(vnp_Amount) / 100).toLocaleString("vi-VN") + "₫" : ""}</div>
          <div><b>Ngân hàng:</b> {vnp_BankCode}</div>
          <div><b>Thời gian:</b> {vnp_PayDate}</div>
          <div><b>Nội dung:</b> {vnp_OrderInfo}</div>
          { vnp_TransactionNo && <div><b>Mã giao dịch (VNPay):</b> {vnp_TransactionNo}</div>}
        </div>
      </div>

      <button
        className="px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-transform transform hover:scale-105"
        onClick={() => router.push("/")}
      >
        Về trang chủ
      </button>
    </div>
  )
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentResult />
    </Suspense>
  )
} 