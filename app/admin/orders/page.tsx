"use client"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import axios from "axios"
import { useRouter } from "next/navigation"

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const router = useRouter()
  const orderStatusList = [
    'Chờ xác nhận',
    'Đã xác nhận',
    'Đang xử lý',
    'Đang giao hàng',
    'Đã giao hàng',
    'Đã hủy'
  ]

  const fetchOrders = async () => {
    const res = await axios.get("http://localhost:5000/api/orders/admin/all")
    setOrders(res.data)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-pink-600">Quản Lý Đơn Hàng</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã Đơn</TableHead>
            <TableHead>Khách Hàng</TableHead>
            <TableHead>Ngày</TableHead>
            <TableHead>Trạng Thái</TableHead>
            <TableHead>Tổng</TableHead>
            <TableHead>Thao Tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order._id}>
              <TableCell>{order._id.slice(-6).toUpperCase()}</TableCell>
              <TableCell>{order.user?.username || order.user?.email || 'Ẩn danh'}</TableCell>
              <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Select
                  value={order.status}
                  onValueChange={async (value) => {
                    setUpdatingOrderId(order._id)
                    await axios.put(`http://localhost:5000/api/orders/admin/${order._id}/status`, { status: value })
                    fetchOrders()
                    setUpdatingOrderId(null)
                  }}
                  disabled={updatingOrderId === order._id}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatusList.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{order.totalPrice?.toLocaleString()}₫</TableCell>
              <TableCell>
                <Button size="icon" variant="ghost" onClick={() => router.push(`/admin/orders/${order._id}`)}>
                  <Eye />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 