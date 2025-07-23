"use client"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Trash2 } from "lucide-react"
import axios from "axios"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="ml-2 border border-pink-200 text-pink-500 hover:bg-pink-50 rounded-full"
                      onClick={() => setConfirmId(order._id)}
                      title="Xóa đơn hàng"
                      disabled={deletingId === order._id}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận xóa đơn hàng</AlertDialogTitle>
                      <AlertDialogDescription>Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        className="border border-pink-200 text-pink-500 hover:bg-pink-50 rounded px-6 py-2 font-semibold"
                        onClick={() => setConfirmId(null)}
                      >
                        Hủy
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-pink-500 hover:bg-pink-600 text-white rounded px-6 py-2 font-semibold"
                        onClick={async () => {
                          setDeletingId(order._id);
                          try {
                            await axios.delete(`http://localhost:5000/api/orders/admin/${order._id}`);
                            setOrders(orders => orders.filter(o => o._id !== order._id));
                            toast.success("Đã xóa đơn hàng!");
                          } catch (err: any) {
                            toast.error("Xóa đơn hàng thất bại!");
                          } finally {
                            setDeletingId(null);
                            setConfirmId(null);
                          }
                        }}
                        disabled={deletingId === order._id}
                      >
                        {deletingId === order._id ? "Đang xóa..." : "Xóa"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 