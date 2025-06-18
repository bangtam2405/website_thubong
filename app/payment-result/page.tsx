"use client"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function PaymentResultPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<string | null>(null)
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    // VNPay: vnp_ResponseCode === '00' là thành công
    // MoMo: resultCode === 0 là thành công
    const vnpCode = searchParams.get('vnp_ResponseCode')
    const momoCode = searchParams.get('resultCode')
    if (vnpCode) {
      if (vnpCode === '00') {
        setStatus('success')
        setMessage('Thanh toán VNPay thành công!')
      } else {
        setStatus('fail')
        setMessage('Thanh toán VNPay thất bại!')
      }
    } else if (momoCode) {
      if (momoCode === '0') {
        setStatus('success')
        setMessage('Thanh toán MoMo thành công!')
      } else {
        setStatus('fail')
        setMessage('Thanh toán MoMo thất bại!')
      }
    } else {
      setStatus('unknown')
      setMessage('Không xác định được trạng thái thanh toán.')
    }
  }, [searchParams])

  return (
    <div className="container mx-auto py-20 px-4 max-w-lg text-center">
      <h1 className="text-3xl font-bold mb-6">Kết Quả Thanh Toán</h1>
      <div className={`mb-8 text-xl font-semibold ${status === 'success' ? 'text-green-600' : status === 'fail' ? 'text-red-600' : 'text-gray-600'}`}>{message}</div>
      <Button className="bg-pink-600 hover:bg-pink-700" onClick={() => router.push("/")}>Về trang chủ</Button>
    </div>
  )
} 