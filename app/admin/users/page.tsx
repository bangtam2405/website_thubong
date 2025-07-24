"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
import { CheckCircle, XCircle, Clock, Star, User as UserIcon, Search } from "lucide-react";

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

  return (
    <div className="container max-w-5xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-pink-600">Quản Lý Khách Hàng</h1>
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
            <TableRow className="bg-pink-50">
              <TableHead className="py-3 px-4">Họ tên</TableHead>
              <TableHead className="py-3 px-4">Email</TableHead>
              <TableHead className="py-3 px-4">SĐT</TableHead>
              <TableHead className="py-3 px-4">Trạng thái</TableHead>
              <TableHead className="py-3 px-4">Phân loại</TableHead>
              <TableHead className="py-3 px-4">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Đang tải...</TableCell></TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Không có khách hàng nào.</TableCell></TableRow>
            ) : filteredUsers.map(user => (
              <TableRow key={user._id} className="hover:bg-pink-50 transition">
                <TableCell className="py-3 px-4 font-semibold flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-pink-400" />
                  {user.fullName || user.username}
                </TableCell>
                <TableCell className="py-3 px-4">{user.email}</TableCell>
                <TableCell className="py-3 px-4">{user.phone}</TableCell>
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
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                      <Clock className="w-4 h-4" /> Chờ xác thực
                    </span>
                  )}
                </TableCell>
                <TableCell className="py-3 px-4">
                  {user.type === 'vip' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-pink-100 text-pink-700 border border-pink-200">
                      <Star className="w-4 h-4" /> VIP
                    </span>
                  )}
                  {user.type === 'regular' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                      <UserIcon className="w-4 h-4" /> Thân thiết
                    </span>
                  )}
                  {(!user.type || user.type === 'new') && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                      <Clock className="w-4 h-4" /> Mới
                    </span>
                  )}
                </TableCell>
                <TableCell className="py-3 px-4">
                  <Button size="sm" variant="outline" onClick={() => router.push(`/admin/users/${user._id}`)}>
                    Xem chi tiết
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="ml-2 border border-pink-200 text-pink-500 hover:bg-pink-50 rounded-full"
                        onClick={() => setConfirmId(user._id)}
                        title="Xóa khách hàng"
                        disabled={deletingId === user._id}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa khách hàng</AlertDialogTitle>
                        <AlertDialogDescription>Bạn có chắc chắn muốn xóa khách hàng này? Hành động này không thể hoàn tác.</AlertDialogDescription>
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
                            setDeletingId(user._id);
                            try {
                              await axios.delete(`http://localhost:5000/api/auth/users/${user._id}`);
                              setUsers(users => users.filter(u => u._id !== user._id));
                              toast.success("Đã xóa khách hàng!");
                            } catch (err: any) {
                              toast.error("Xóa khách hàng thất bại!");
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 