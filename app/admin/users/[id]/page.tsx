"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import axios from "@/lib/axiosConfig"

export default function UserDetailPage() {
  const { id } = useParams()
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [wishlist, setWishlist] = useState<any[]>([])
  const [note, setNote] = useState("")
  const [savingNote, setSavingNote] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return;
    Promise.all([
      axios.get(`/api/auth/users/${id}`),
      axios.get(`/api/orders/${id}`),
      axios.get(`/api/wishlist/admin/${id}`)
    ]).then(([u, o, w]) => {
      setUser(u.data)
      setOrders(o.data)
      setWishlist(w.data.products || [])
      setNote(u.data.note || "")
    }).finally(() => setLoading(false))
  }, [id])

  const totalValue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0)
  const lastOrder = orders.length > 0 ? orders[0] : null

  const handleSaveNote = async () => {
    setSavingNote(true)
    await axios.put(`/api/auth/users/${id}/note`, { note })
    setSavingNote(false)
  }

  if (loading) return <div className="p-8 text-center">Đang tải...</div>
  if (!user) return <div className="p-8 text-center">Không tìm thấy khách hàng.</div>

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-pink-600">Chi Tiết Khách Hàng</h1>
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-3">
          <div className="font-semibold text-lg mb-2">Thông tin cá nhân</div>
          <div><b>Họ tên:</b> {user.fullName || user.username}</div>
          <div><b>Email:</b> {user.email}</div>
          <div><b>SĐT:</b> {user.phone}</div>
          <div><b>Ngày sinh:</b> {user.dob ? new Date(user.dob).toLocaleDateString() : '--'}</div>
          <div><b>Trạng thái:</b> <Badge>{user.status === 'active' ? 'Hoạt động' : user.status === 'locked' ? 'Bị khóa' : 'Chờ xác thực'}</Badge></div>
          <div><b>Phân loại:</b> <Badge>{user.type === 'vip' ? 'VIP' : user.type === 'regular' ? 'Thân thiết' : 'Mới'}</Badge></div>
          <div className="mt-2">
            <b>Địa chỉ:</b>
            <ul className="list-disc ml-6">
              {user.addresses && user.addresses.length > 0 ? user.addresses.map((a: any) => (
                <li key={a._id}>{a.label}: {a.address} {a.isDefault && <span className="text-xs text-green-600">(Mặc định)</span>}</li>
              )) : <li>Chưa có địa chỉ</li>}
            </ul>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-3">
          <div className="font-semibold text-lg mb-2">Lịch sử mua hàng</div>
          <div><b>Tổng số đơn:</b> {orders.length}</div>
          <div><b>Tổng chi tiêu:</b> {totalValue.toLocaleString()}₫</div>
          <div><b>Đơn gần nhất:</b> {lastOrder ? new Date(lastOrder.createdAt).toLocaleDateString() : '--'}</div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="font-semibold mb-2">Ghi chú admin</div>
        <textarea className="border rounded w-full p-2 mb-2" rows={3} value={note} onChange={e => setNote(e.target.value)} />
        <Button size="sm" onClick={handleSaveNote} disabled={savingNote}>{savingNote ? 'Đang lưu...' : 'Lưu ghi chú'}</Button>
      </div>
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="font-semibold mb-2">Wishlist</div>
        <ul className="list-disc ml-6">
          {wishlist.length === 0 ? <li>Chưa có sản phẩm yêu thích</li> : wishlist.map((p: any) => (
            <li key={p._id}>{p.name}</li>
          ))}
        </ul>
      </div>
      {/* Có thể bổ sung tab/section cho reviews, tickets, lịch sử liên hệ... */}
    </div>
  )
} 