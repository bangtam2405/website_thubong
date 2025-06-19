"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import axios from "axios"
import Image from "next/image"

const statusColor = (status: string) => {
  switch (status) {
    case "Chờ xác nhận": return "bg-yellow-100 text-yellow-700";
    case "Đã xác nhận": return "bg-blue-100 text-blue-700";
    case "Đang xử lý": return "bg-purple-100 text-purple-700";
    case "Đang giao hàng": return "bg-orange-100 text-orange-700";
    case "Đã giao hàng": return "bg-green-100 text-green-700";
    case "Đã hủy": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`http://localhost:5000/api/orders/detail/${id}`)
      .then(res => setOrder(res.data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8 text-center">Đang tải...</div>
  if (!order) return <div className="p-8 text-center">Không tìm thấy đơn hàng.</div>

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-pink-600">Chi Tiết Đơn Hàng (Admin)</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Thông tin đơn hàng & người nhận */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Mã đơn:</span>
            <span className="text-lg">{order._id.slice(-6).toUpperCase()}</span>
            <span className={`ml-auto px-3 py-1 rounded-full text-sm font-semibold ${statusColor(order.status)}`}>{order.status}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Ngày đặt:</span>
            <span>{new Date(order.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Tổng tiền:</span>
            <span className="text-pink-600 text-lg font-bold">{order.totalPrice?.toLocaleString()}₫</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Khách hàng:</span>
            <span>{order.user?.username || order.user?.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Email:</span>
            <span>{order.user?.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">User ID:</span>
            <span>{order.user?._id}</span>
          </div>
          <div className="border-t pt-4 mt-2">
            <div className="font-semibold mb-1">Thông tin nhận hàng</div>
            <div className="flex flex-col gap-1 text-gray-700">
              <div><b>Họ tên:</b> {order.name}</div>
              <div><b>SĐT:</b> {order.phone}</div>
              <div><b>Địa chỉ:</b> {order.address}</div>
            </div>
          </div>
        </div>
        {/* Danh sách sản phẩm */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="font-semibold mb-3 text-lg">Sản phẩm trong đơn</div>
          <div className="divide-y">
            {order.products.map((item: any) => (
              <div key={item.product?._id} className="flex items-center gap-4 py-4">
                <div className="w-20 h-20 flex-shrink-0">
                  {item.product?.image ? (
                    <Image src={item.product.image} alt={item.product.name} width={80} height={80} className="rounded-lg object-cover w-20 h-20" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400">?</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-base">{item.product?.name || '---'}</div>
                  <div className="text-sm text-gray-500">x{item.quantity}</div>
                </div>
                <div className="font-bold text-pink-600 text-lg">{item.product?.price ? (item.product.price * item.quantity).toLocaleString() + '₫' : '--'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Button className="mt-8" variant="outline" onClick={() => router.back()}>
        Quay lại
      </Button>
    </div>
  )
} 