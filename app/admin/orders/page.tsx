"use client"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Truck, Package, XCircle, Eye as EyeIcon, Trash2, Search } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const router = useRouter()
  const orderStatusList = [
    'Chờ xác nhận',
    'Đã xác nhận',
    'Đang xử lý',
    'Đang giao hàng',
    'Đã giao hàng',
    'Đã hủy'
  ]

  const statusColor = {
    'Chờ xác nhận': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: <Clock className="w-4 h-4" /> },
    'Đã xác nhận': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', icon: <CheckCircle className="w-4 h-4" /> },
    'Đang xử lý': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', icon: <Package className="w-4 h-4" /> },
    'Đang giao hàng': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200', icon: <Truck className="w-4 h-4" /> },
    'Đã giao hàng': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: <CheckCircle className="w-4 h-4" /> },
    'Đã hủy': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: <XCircle className="w-4 h-4" /> },
  };

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  }

  const fetchOrders = async () => {
    const res = await axios.get("http://localhost:5000/api/orders/admin/all")
    setOrders(res.data)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const filteredOrders = orders.filter(order => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return (
      order._id.toLowerCase().includes(s) ||
      (order.user?.username && order.user.username.toLowerCase().includes(s)) ||
      (order.user?.email && order.user.email.toLowerCase().includes(s)) ||
      (order.status && order.status.toLowerCase().includes(s))
    );
  });

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-pink-600">Quản Lý Đơn Hàng</h1>
      <div className="flex items-center gap-2 mb-4">
        <div className="relative w-full max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-200 outline-none w-full"
            placeholder="Tìm kiếm đơn hàng, khách, email của khách hàng"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl shadow border bg-white">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-pink-50">
              <TableHead className="py-3 px-4 text-center">Mã Đơn</TableHead>
              <TableHead className="py-3 px-4">Khách Hàng</TableHead>
              <TableHead className="py-3 px-4 text-center">Ngày</TableHead>
              <TableHead className="py-3 px-4 text-center">Trạng Thái</TableHead>
              <TableHead className="py-3 px-4 text-right">Tổng</TableHead>
              <TableHead className="py-3 px-4 text-center">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map(order => {
              const status: keyof typeof statusColor = order.status;
              return (
                <TableRow key={order._id} className="hover:bg-pink-50 transition">
                  <TableCell className="py-3 px-4 text-center font-mono font-semibold">{order._id.slice(-6).toUpperCase()}</TableCell>
                  <TableCell className="py-3 px-4">{order.user?.username || order.user?.email || 'Ẩn danh'}</TableCell>
                  <TableCell className="py-3 px-4 text-center">{formatDate(order.createdAt)}</TableCell>
                  <TableCell className="py-3 px-4 text-center">
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
                      <SelectTrigger className="w-44">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${statusColor[status]?.bg} ${statusColor[status]?.text} ${statusColor[status]?.border}`}>{statusColor[status]?.icon} {order.status}</div>
                      </SelectTrigger>
                      <SelectContent>
                        {orderStatusList.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-right font-bold text-pink-600">{order.totalPrice?.toLocaleString()}₫</TableCell>
                  <TableCell className="py-3 px-4 text-center">
                    <Button size="icon" variant="ghost" onClick={() => router.push(`/admin/orders/${order._id}`)} title="Xem chi tiết">
                      <EyeIcon />
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
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 