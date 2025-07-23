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

export default function UserListPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/auth/users").then(res => setUsers(res.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="container max-w-5xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-pink-600">Quản Lý Khách Hàng</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Họ tên</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>SĐT</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Phân loại</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={6} className="text-center">Đang tải...</TableCell></TableRow>
          ) : users.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="text-center">Không có khách hàng nào.</TableCell></TableRow>
          ) : users.map(user => (
            <TableRow key={user._id}>
              <TableCell>{user.fullName || user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell><Badge>{user.status === 'active' ? 'Hoạt động' : user.status === 'locked' ? 'Bị khóa' : 'Chờ xác thực'}</Badge></TableCell>
              <TableCell><Badge>{user.type === 'vip' ? 'VIP' : user.type === 'regular' ? 'Thân thiết' : 'Mới'}</Badge></TableCell>
              <TableCell>
                <Button size="sm" variant="outline" onClick={() => router.push(`/admin/users/${user._id}`)}>Xem chi tiết</Button>
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
  )
} 