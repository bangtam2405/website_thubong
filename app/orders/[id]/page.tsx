"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import axios from "axios"
import Image from "next/image"
import { Dialog } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

const statusColor = (status: string) => {
  switch (status) {
    case "Chờ xác nhận": return "bg-yellow-100 text-yellow-700";
    case "Đã xác nhận": return "bg-blue-100 text-blue-700";
    case "Đang xử lý": return "bg-purple-100 text-purple-700";
    case "Đang giao hàng": return "bg-orange-100 text-orange-700";
    case "Đã giao hàng": return "bg-green-100 text-green-700";
    case "Đã hủy": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [canceling, setCanceling] = useState(false)
  const [editInfo, setEditInfo] = useState(false)
  const [form, setForm] = useState({ phone: "", address: "" })
  const [saving, setSaving] = useState(false)
  const [cancelMsg, setCancelMsg] = useState("")
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelNote, setCancelNote] = useState("")
  const cancelReasons = [
    "Tôi đổi ý không muốn mua nữa",
    "Tôi đặt nhầm sản phẩm",
    "Tìm được giá tốt hơn ở nơi khác",
    "Thời gian giao hàng quá lâu",
    "Khác..."
  ]

  useEffect(() => {
    axios.get(`http://localhost:5000/api/orders/detail/${id}`)
      .then(res => {
        setOrder(res.data)
        setForm({
          phone: res.data.phone || "",
          address: res.data.address || ""
        })
      })
      .finally(() => setLoading(false))
  }, [id])

  const canEditInfo = order && order.status === "Chờ xác nhận"

  const handleSaveInfo = async () => {
    setSaving(true)
    try {
      await axios.put(`http://localhost:5000/api/orders/${id}/update-info`, form)
      setEditInfo(false)
      router.refresh()
    } catch (err: any) {
      alert(err?.response?.data?.message || "Cập nhật thông tin thất bại!")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async () => {
    setCanceling(true)
    setCancelMsg("")
    try {
      await axios.put(`http://localhost:5000/api/orders/${id}/cancel`, {
        cancelReason,
        cancelNote
      })
      setShowCancelModal(false)
      setCancelMsg("Đã hủy đơn hàng thành công!")
      router.refresh()
    } catch (err: any) {
      setCancelMsg(err?.response?.data?.message || "Hủy đơn thất bại!")
    } finally {
      setCanceling(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Đang tải...</div>
  if (!order) return <div className="p-8 text-center">Không tìm thấy đơn hàng.</div>

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-pink-600">Chi Tiết Đơn Hàng</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Thông tin đơn hàng & người nhận */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Mã đơn:</span>
            <span className="text-lg">{order._id.slice(-6).toUpperCase()}</span>
            <span className={`ml-auto px-3 py-1 rounded-full text-sm font-semibold ${statusColor(order.status)}`}>{order.status}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Ngày đặt:</span>
            <span>{new Date(order.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Tổng tiền:</span>
            <span className="text-pink-600 text-lg font-bold">{order.totalPrice?.toLocaleString()}₫</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Khách hàng:</span>
            <span>{order.user?.username || order.user?.email}</span>
          </div>
          <div className="border-t pt-4 mt-2">
            <div className="font-semibold mb-1">Thông tin nhận hàng</div>
            <div className="flex flex-col gap-1 text-gray-700">
              <div><b>Họ tên:</b> {order.name}</div>
              {editInfo ? (
                <>
                  <div className="flex items-center gap-2 mt-1">
                    <b>SĐT:</b>
                    <input className="border rounded px-2 py-1 flex-1" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="Số điện thoại" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <b>Địa chỉ:</b>
                    <input className="border rounded px-2 py-1 flex-1" value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} placeholder="Địa chỉ" />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" onClick={handleSaveInfo} disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditInfo(false)}>Hủy</Button>
                  </div>
                </>
              ) : (
                <>
                  <div><b>SĐT:</b> {order.phone}</div>
                  <div><b>Địa chỉ:</b> {order.address}</div>
                  {canEditInfo && <Button size="sm" variant="outline" className="mt-2 w-fit" onClick={() => setEditInfo(true)}>Chỉnh sửa</Button>}
                </>
              )}
            </div>
          </div>
          {order.status === 'Chờ xác nhận' && (
            <>
              <Button className="mt-4 bg-red-500 hover:bg-red-600 w-fit" onClick={() => setShowCancelModal(true)}>
                Hủy đơn hàng
              </Button>
              <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
                <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center">
                  <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md z-50">
                    <h2 className="text-lg font-bold mb-4">Lý do hủy đơn hàng</h2>
                    <RadioGroup value={cancelReason} onValueChange={setCancelReason} className="mb-4">
                      {cancelReasons.map(r => (
                        <div key={r} className="flex items-center gap-2 mb-2">
                          <RadioGroupItem value={r} id={r} />
                          <label htmlFor={r}>{r}</label>
                        </div>
                      ))}
                    </RadioGroup>
                    <Textarea
                      className="mb-4"
                      placeholder="Ghi chú thêm (không bắt buộc)"
                      value={cancelNote}
                      onChange={e => setCancelNote(e.target.value)}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowCancelModal(false)}>Hủy</Button>
                      <Button onClick={handleCancel} disabled={canceling || !cancelReason} className="bg-red-500 hover:bg-red-600 text-white">
                        {canceling ? "Đang hủy..." : "Xác nhận hủy"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Dialog>
            </>
          )}
          {cancelMsg && <div className="text-red-600 font-semibold mt-2">{cancelMsg}</div>}
        </div>
        {/* Danh sách sản phẩm */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="font-semibold mb-3 text-lg">Sản phẩm trong đơn</div>
          <div className="divide-y">
            {order.products.map((item: any) => (
              <div key={item.product?._id} className="flex items-center gap-4 py-4">
                <div className="w-20 h-20 flex-shrink-0">
                  {item.product?.image ? (
                    <Image src={item.product.image} alt={item.product.name} width={80} height={80} className="rounded-lg object-cover w-20 h-20" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400">?</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-base">{item.product?.name || '---'}</div>
                  <div className="text-sm text-gray-500">x{item.quantity}</div>
                </div>
                <div className="font-bold text-pink-600 text-lg">{item.product?.price ? (item.product.price * item.quantity).toLocaleString() + '₫' : '--'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 