"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import axios from "@/lib/axiosConfig"
import { formatDateVN } from "@/lib/utils";
import { Heart, User as UserIcon, Mail, Phone, Calendar, MapPin, Star } from 'lucide-react';

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
    <div className="container max-w-5xl mx-auto py-10">
      {/* Header: Avatar, tên, email, trạng thái, phân loại */}
      <div className="flex flex-col items-center bg-white rounded-2xl shadow-lg p-8 mb-8 relative">
        <div className="absolute top-4 right-4">
          <Badge className={user.type === 'vip' ? 'bg-yellow-400 text-white' : user.type === 'regular' ? 'bg-blue-400 text-white' : 'bg-gray-300 text-gray-700'}>
            {user.type === 'vip' ? 'VIP' : user.type === 'regular' ? 'Thân thiết' : 'Mới'}
          </Badge>
        </div>
        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-pink-200 mb-4 bg-pink-50 flex items-center justify-center">
          {user.avatar ? (
            <img src={user.avatar} alt={user.fullName || user.username} className="object-cover w-full h-full" />
          ) : (
            <UserIcon className="w-16 h-16 text-pink-300" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-pink-700 mb-1">{user.fullName || user.username}</h2>
        <div className="flex items-center gap-2 text-gray-500 mb-1">
          <Mail className="w-4 h-4" />
          <span>{user.email}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 mb-1">
          <Phone className="w-4 h-4" />
          <span>{user.phone || '--'}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 mb-1">
          <Calendar className="w-4 h-4" />
          <span>{user.dob ? formatDateVN(user.dob) : '--'}</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge className={user.status === 'active' ? 'bg-green-100 text-green-700' : user.status === 'locked' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
            {user.status === 'active' ? 'Hoạt động' : user.status === 'locked' ? 'Bị khóa' : 'Chờ xác thực'}
          </Badge>
        </div>
      </div>
      {/* Main grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Thông tin cá nhân + địa chỉ + ghi chú admin */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="font-semibold text-lg mb-3 flex items-center gap-2"><UserIcon className="w-5 h-5 text-pink-400" /> Thông tin cá nhân</div>
            <div className="mb-2"><b>Họ tên:</b> {user.fullName || user.username}</div>
            <div className="mb-2"><b>Email:</b> {user.email}</div>
            <div className="mb-2"><b>SĐT:</b> {user.phone || '--'}</div>
            <div className="mb-2"><b>Ngày sinh:</b> {user.dob ? formatDateVN(user.dob) : '--'}</div>
            <div className="mb-2"><b>Trạng thái:</b> <Badge>{user.status === 'active' ? 'Hoạt động' : user.status === 'locked' ? 'Bị khóa' : 'Chờ xác thực'}</Badge></div>
            <div className="mb-2"><b>Phân loại:</b> <Badge>{user.type === 'vip' ? 'VIP' : user.type === 'regular' ? 'Thân thiết' : 'Mới'}</Badge></div>
            <div className="mt-2">
              <b>Địa chỉ:</b>
              <ul className="list-disc ml-6">
                {user.addresses && user.addresses.length > 0 ? user.addresses.map((a: any) => (
                  <li key={a._id}><MapPin className="inline w-4 h-4 text-pink-400 mr-1" />{a.label}: {a.address} {a.isDefault && <span className="text-xs text-green-600">(Mặc định)</span>}</li>
                )) : <li>Chưa có địa chỉ</li>}
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="font-semibold mb-2">Ghi chú admin</div>
            <textarea className="border rounded w-full p-2 mb-2" rows={3} value={note} onChange={e => setNote(e.target.value)} />
            <Button size="sm" className="bg-pink-500 hover:bg-pink-600 text-white" onClick={handleSaveNote} disabled={savingNote}>{savingNote ? 'Đang lưu...' : 'Lưu ghi chú'}</Button>
          </div>
        </div>
        {/* Lịch sử mua hàng + wishlist */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="font-semibold text-lg mb-3 flex items-center gap-2"><Star className="w-5 h-5 text-yellow-400" /> Lịch sử mua hàng</div>
            <div className="mb-2"><b>Tổng số đơn:</b> {orders.length}</div>
            <div className="mb-2"><b>Tổng chi tiêu:</b> {totalValue.toLocaleString()}₫</div>
            <div className="mb-2"><b>Đơn gần nhất:</b> {lastOrder ? formatDateVN(lastOrder.createdAt) : '--'}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="font-semibold text-lg mb-3 flex items-center gap-2"><Heart className="w-5 h-5 text-pink-400" /> Wishlist</div>
            {wishlist.length === 0 ? (
              <div className="flex flex-col items-center py-6">
                <Heart className="h-12 w-12 text-gray-300 mb-2" />
                <div className="text-gray-400">Chưa có sản phẩm yêu thích</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {wishlist.map((p: any) => (
                  <a key={p._id} href={`/product/${p._id}`} className="flex items-center gap-3 hover:bg-pink-50 rounded-lg p-2 transition">
                    <img src={p.image || '/placeholder.svg'} alt={p.name} className="w-14 h-14 object-cover rounded-lg border" />
                    <div className="flex-1">
                      <div className="font-semibold text-pink-700 line-clamp-1">{p.name}</div>
                      <div className="text-xs text-gray-500">{Number(p.price).toLocaleString()}₫</div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 