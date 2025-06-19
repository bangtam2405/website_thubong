"use client"
import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [userId, setUserId] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const uid = localStorage.getItem("userId") || ""
      setUserId(uid)
      if (uid) {
        axios.get(`http://localhost:5000/api/orders/${uid}`)
          .then(res => setOrders(res.data))
      }
    }
  }, [])

  return (
    <div className="container max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Đơn Hàng Của Tôi</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã Đơn</TableHead>
            <TableHead>Ngày</TableHead>
            <TableHead>Trạng Thái</TableHead>
            <TableHead>Tổng</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center">Bạn chưa có đơn hàng nào.</TableCell>
            </TableRow>
          )}
          {orders.map(order => (
            <TableRow key={order._id}>
              <TableCell>{order._id.slice(-6).toUpperCase()}</TableCell>
              <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
              <TableCell><Badge>{order.status}</Badge></TableCell>
              <TableCell>{order.totalPrice?.toLocaleString()}₫</TableCell>
              <TableCell>
                <Button size="sm" variant="outline" onClick={() => router.push(`/orders/${order._id}`)}>
                  Xem chi tiết
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 