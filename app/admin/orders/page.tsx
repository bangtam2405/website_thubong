"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Truck, Package, XCircle, Eye as EyeIcon, Trash2, Search, FileDown, FileSpreadsheet, DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";
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
import { formatDateVN } from "@/lib/utils";
import * as XLSX from "xlsx";

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

  // Tính toán thống kê
  const stats = {
    totalOrders: filteredOrders.length,
    totalRevenue: filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0),
    pendingOrders: filteredOrders.filter(order => order.status === 'Chờ xác nhận').length,
    completedOrders: filteredOrders.filter(order => order.status === 'Đã giao hàng').length,
    cancelledOrders: filteredOrders.filter(order => order.status === 'Đã hủy').length,
    uniqueCustomers: new Set(filteredOrders.map(order => order.user?._id || order.user?.email)).size
  };

  // Xuất Excel
  const handleExportExcel = () => {
    const data = filteredOrders.map(order => ({
      "Mã đơn": order._id.slice(-6).toUpperCase(),
      "Ngày đặt": formatDateVN(order.createdAt),
      "Khách hàng": order.user?.username || order.user?.email || 'Ẩn danh',
      "Email": order.user?.email || '',
      "Tổng tiền": order.totalPrice?.toLocaleString() + '₫',
      "Trạng thái đơn": order.status,
      "Trạng thái thanh toán": order.paymentStatus === 'success' ? 'Thành công' : order.paymentStatus === 'failed' ? 'Thất bại' : 'Chờ thanh toán',
      "Phương thức": order.paymentMethod || '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DonHang");
    XLSX.writeFile(wb, `donhang_${new Date().getTime()}.xlsx`);
  };

  // Xuất PDF
  const handleExportPDF = async () => {
    const pdfMakeModule = await import("pdfmake/build/pdfmake");
    const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
    const pdfMake = pdfMakeModule.default || pdfMakeModule.pdfMake || pdfMakeModule;
    const pdfFonts = pdfFontsModule.default || pdfFontsModule.pdfMake || pdfFontsModule;
    pdfMake.vfs = (pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) || pdfFonts.vfs;
    const body = [
      [
        { text: 'Mã đơn', style: 'tableHeader' },
        { text: 'Ngày đặt', style: 'tableHeader' },
        { text: 'Khách hàng', style: 'tableHeader' },
        { text: 'Email', style: 'tableHeader' },
        { text: 'Tổng tiền', style: 'tableHeader' },
        { text: 'Trạng thái đơn', style: 'tableHeader' },
        { text: 'Thanh toán', style: 'tableHeader' },
        { text: 'Phương thức', style: 'tableHeader' },
      ],
      ...filteredOrders.map(order => [
        order._id.slice(-6).toUpperCase(),
        formatDateVN(order.createdAt),
        order.name || order.user?.username || 'Ẩn danh',
        order.user?.email || '',
        order.totalPrice?.toLocaleString() + '₫',
        order.status,
        order.paymentStatus === 'success' ? 'Thành công' : order.paymentStatus === 'failed' ? 'Thất bại' : 'Chờ thanh toán',
        order.paymentMethod || '',
      ])
    ];
    const docDefinition = {
      content: [
        { text: 'BÁO CÁO DANH SÁCH ĐƠN HÀNG', style: 'header', alignment: 'center', margin: [0,0,0,12] },
        {
          table: {
            headerRows: 1,
            widths: [30, 70, 80, 100, 70, 70, 70, 70],
            body
          },
          layout: {
            fillColor: (rowIndex: number) => rowIndex === 0 ? '#fce7f3' : null,
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#e5e7eb',
            vLineColor: () => '#e5e7eb',
          },
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          color: '#e3497a',
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: '#e3497a',
        },
      },
      defaultStyle: {
        font: 'Roboto',
        fontSize: 11,
      }
    };
    pdfMake.createPdf(docDefinition).download(`baocao_donhang_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Quản Lý Đơn Hàng</CardTitle>
            <CardDescription>Theo dõi và quản lý tất cả đơn hàng từ khách hàng</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExportExcel}
              className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-lg shadow flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Xuất Excel
            </Button>
            <Button
              onClick={handleExportPDF}
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-4 py-2 rounded-lg shadow flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              Xuất PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Thống kê tổng quan */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">{stats.totalOrders}</div>
              </div>
              <div className="text-sm text-blue-600">Tổng đơn hàng</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div className="text-2xl font-bold text-green-600">{stats.totalRevenue.toLocaleString('vi-VN')}₫</div>
              </div>
              <div className="text-sm text-green-600">Tổng doanh thu</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">{stats.uniqueCustomers}</div>
              </div>
              <div className="text-sm text-purple-600">Khách hàng</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
              </div>
              <div className="text-sm text-yellow-600">Chờ xác nhận</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <div className="text-2xl font-bold text-red-600">{stats.cancelledOrders}</div>
              </div>
              <div className="text-sm text-red-600">Đã hủy</div>
            </div>
          </div>

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
                <TableRow className="bg-gray-50">
                  <TableHead className="py-3 px-4 text-center font-semibold">Mã Đơn</TableHead>
                  <TableHead className="py-3 px-4 font-semibold">Khách Hàng</TableHead>
                  <TableHead className="py-3 px-4 text-center font-semibold">Ngày Đặt</TableHead>
                  <TableHead className="py-3 px-4 text-center font-semibold">Trạng Thái</TableHead>
                  <TableHead className="py-3 px-4 text-center font-semibold">Thanh Toán</TableHead>
                  <TableHead className="py-3 px-4 text-right font-semibold">Tổng Tiền</TableHead>
                  <TableHead className="py-3 px-4 text-center font-semibold">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map(order => {
                  const status: keyof typeof statusColor = order.status;
                  return (
                    <TableRow key={order._id} className="hover:bg-gray-50 transition">
                      <TableCell className="py-3 px-4 text-center font-mono font-semibold text-blue-600">
                        {order._id.slice(-6).toUpperCase()}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{order.name || order.user?.username || 'Ẩn danh'}</span>
                          <span className="text-xs text-gray-500">{order.user?.email || ''}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center text-sm">
                        {formatDateVN(order.createdAt)}
                      </TableCell>
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
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${statusColor[status]?.bg} ${statusColor[status]?.text} ${statusColor[status]?.border}`}>
                              {statusColor[status]?.icon} {order.status}
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {orderStatusList.map(status => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.paymentStatus === 'success' ? 'bg-green-100 text-green-800' :
                          order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.paymentStatus === 'success' ? 'Thành công' : 
                           order.paymentStatus === 'failed' ? 'Thất bại' : 'Chờ thanh toán'}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-right font-bold text-green-600">
                        {order.totalPrice?.toLocaleString('vi-VN')}₫
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center">
                        <div className="flex gap-1 justify-center">
                          <Button size="icon" variant="ghost" onClick={() => router.push(`/admin/orders/${order._id}`)} title="Xem chi tiết">
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="border border-red-200 text-red-500 hover:bg-red-50 rounded-full"
                                onClick={() => setConfirmId(order._id)}
                                title="Xóa đơn hàng"
                                disabled={deletingId === order._id}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Xác nhận xóa đơn hàng</AlertDialogTitle>
                                <AlertDialogDescription>Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  className="border border-gray-200 text-gray-500 hover:bg-gray-50 rounded px-6 py-2 font-semibold"
                                  onClick={() => setConfirmId(null)}
                                >
                                  Hủy
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-600 text-white rounded px-6 py-2 font-semibold"
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
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Không có đơn hàng nào được tìm thấy
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 