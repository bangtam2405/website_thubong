"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import axios from "axios"

export default function UserListPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 