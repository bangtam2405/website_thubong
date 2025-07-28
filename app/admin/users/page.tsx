"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { Trash2 } from "lucide-react";
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
import { CheckCircle, XCircle, Clock, Star, User as UserIcon, Search, Lock, Unlock, FileDown, FileSpreadsheet, Users, Crown, Shield, TrendingUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import * as XLSX from "xlsx";
import { formatDateVN } from "@/lib/utils";

export default function UserListPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/auth/users").then(res => setUsers(res.data)).finally(() => setLoading(false))
  }, [])

  const filteredUsers = users.filter(user => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return (
      (user.fullName && user.fullName.toLowerCase().includes(s)) ||
      (user.email && user.email.toLowerCase().includes(s)) ||
      (user.phone && user.phone.toLowerCase().includes(s)) ||
      (user.status && user.status.toLowerCase().includes(s)) ||
      (user.type && user.type.toLowerCase().includes(s))
    );
  });

  // Tính toán thống kê
  const stats = {
    totalUsers: filteredUsers.length,
    activeUsers: filteredUsers.filter(user => user.status === 'active').length,
    lockedUsers: filteredUsers.filter(user => user.status === 'locked').length,
    vipUsers: filteredUsers.filter(user => user.type === 'vip').length,
    regularUsers: filteredUsers.filter(user => user.type === 'regular').length,
    newUsers: filteredUsers.filter(user => !user.type || user.type === 'new').length
  };

  // Xuất Excel
  const handleExportExcel = () => {
    const data = filteredUsers.map(user => ({
      "Họ tên": user.fullName || user.username,
      "Email": user.email,
      "SĐT": user.phone,
      "Ngày đăng ký": user.createdAt ? formatDateVN(user.createdAt) : '',
      "Trạng thái": user.status === 'active' ? 'Hoạt động' : user.status === 'locked' ? 'Bị khóa' : user.status,
      "Phân loại": user.type === 'vip' ? 'VIP' : user.type === 'regular' ? 'Thân thiết' : 'Mới',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "KhachHang");
    XLSX.writeFile(wb, `khachhang_${new Date().getTime()}.xlsx`);
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
        { text: 'Họ tên', style: 'tableHeader' },
        { text: 'Email', style: 'tableHeader' },
        { text: 'SĐT', style: 'tableHeader' },
        { text: 'Ngày đăng ký', style: 'tableHeader' },
        { text: 'Trạng thái', style: 'tableHeader' },
        { text: 'Phân loại', style: 'tableHeader' },
      ],
      ...filteredUsers.map(user => [
        user.fullName || user.username,
        user.email,
        user.phone,
        user.createdAt ? formatDateVN(user.createdAt) : '',
        user.status === 'active' ? 'Hoạt động' : user.status === 'locked' ? 'Bị khóa' : user.status,
        user.type === 'vip' ? 'VIP' : user.type === 'regular' ? 'Thân thiết' : 'Mới',
      ])
    ];
    const docDefinition = {
      content: [
        { text: 'BÁO CÁO DANH SÁCH KHÁCH HÀNG', style: 'header', alignment: 'center', margin: [0,0,0,12] },
        {
          table: {
            headerRows: 1,
            widths: [80, 100, 60, 70, 60, 60],
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
    pdfMake.createPdf(docDefinition).download(`baocao_khachhang_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Quản Lý Khách Hàng</CardTitle>
            <CardDescription>Quản lý thông tin và trạng thái tài khoản khách hàng</CardDescription>
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
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
              </div>
              <div className="text-sm text-blue-600">Tổng khách hàng</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
              </div>
              <div className="text-sm text-green-600">Đang hoạt động</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-red-600" />
                <div className="text-2xl font-bold text-red-600">{stats.lockedUsers}</div>
              </div>
              <div className="text-sm text-red-600">Bị khóa</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">{stats.vipUsers}</div>
              </div>
              <div className="text-sm text-purple-600">Khách VIP</div>
            </div>
            <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-cyan-600" />
                <div className="text-2xl font-bold text-cyan-600">{stats.regularUsers}</div>
              </div>
              <div className="text-sm text-cyan-600">Thân thiết</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-gray-600" />
                <div className="text-2xl font-bold text-gray-600">{stats.newUsers}</div>
              </div>
              <div className="text-sm text-gray-600">Khách mới</div>
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
                placeholder="Tìm kiếm tên, email, SĐT, trạng thái, loại..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl shadow border bg-white">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="py-3 px-4 font-semibold">Họ tên</TableHead>
                  <TableHead className="py-3 px-4 font-semibold">Email</TableHead>
                  <TableHead className="py-3 px-4 font-semibold">SĐT</TableHead>
                  <TableHead className="py-3 px-4 font-semibold">Ngày đăng ký</TableHead>
                  <TableHead className="py-3 px-4 font-semibold">Trạng thái</TableHead>
                  <TableHead className="py-3 px-4 font-semibold">Phân loại</TableHead>
                  <TableHead className="py-3 px-4 font-semibold">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8">Đang tải...</TableCell></TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">Không có khách hàng nào được tìm thấy</TableCell></TableRow>
                ) : filteredUsers.map(user => (
                  <TableRow key={user._id} className="hover:bg-gray-50 transition">
                    <TableCell className="py-3 px-4 font-semibold flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-blue-400" />
                      <div className="flex flex-col">
                        <span>{user.fullName || user.username}</span>
                        <span className="text-xs text-gray-500">ID: {user._id.slice(-6)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4">{user.email}</TableCell>
                    <TableCell className="py-3 px-4">{user.phone || 'Chưa có'}</TableCell>
                    <TableCell className="py-3 px-4 text-sm">
                      {user.createdAt ? formatDateVN(user.createdAt) : 'Chưa có'}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      {user.status === 'active' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                          <CheckCircle className="w-4 h-4" /> Hoạt động
                        </span>
                      )}
                      {user.status === 'locked' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                          <XCircle className="w-4 h-4" /> Bị khóa
                        </span>
                      )}
                      {user.status !== 'active' && user.status !== 'locked' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
                          <Clock className="w-4 h-4" /> {user.status}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      {user.type === 'vip' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                          <Crown className="w-4 h-4" /> VIP
                        </span>
                      )}
                      {user.type === 'regular' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-700 border border-cyan-200">
                          <Shield className="w-4 h-4" /> Thân thiết
                        </span>
                      )}
                      {(!user.type || user.type === 'new') && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                          <TrendingUp className="w-4 h-4" /> Mới
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="flex gap-1 items-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={async () => {
                                  try {
                                    const newStatus = user.status === 'active' ? 'locked' : 'active';
                                    await axios.put(`http://localhost:5000/api/auth/users/${user._id}/status`, { status: newStatus });
                                    setUsers(users => users.map(u => u._id === user._id ? { ...u, status: newStatus } : u));
                                    toast.success(newStatus === 'locked' ? 'Đã khóa tài khoản!' : 'Đã mở khóa tài khoản!');
                                  } catch (err) {
                                    toast.error('Lỗi khi cập nhật trạng thái tài khoản!');
                                  }
                                }}
                                title={user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                              >
                                {user.status === 'active' ? <Lock className="w-4 h-4 text-red-500" /> : <Unlock className="w-4 h-4 text-green-500" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admin/users/${user._id}`)}
                          title="Xem chi tiết"
                        >
                          Chi tiết
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="border border-red-200 text-red-500 hover:bg-red-50 rounded-full"
                              onClick={() => setConfirmId(user._id)}
                              title="Xóa tài khoản"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa tài khoản</AlertDialogTitle>
                              <AlertDialogDescription>Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác.</AlertDialogDescription>
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
                                  setDeletingId(user._id);
                                  try {
                                    await axios.delete(`http://localhost:5000/api/auth/users/${user._id}`);
                                    setUsers(users => users.filter(u => u._id !== user._id));
                                    toast.success("Đã xóa tài khoản!");
                                  } catch (err: any) {
                                    toast.error("Xóa tài khoản thất bại!");
                                  } finally {
                                    setDeletingId(null);
                                    setConfirmId(null);
                                  }
                                }}
                                disabled={deletingId === user._id}
                              >
                                {deletingId === user._id ? "Đang xóa..." : "Xóa"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 