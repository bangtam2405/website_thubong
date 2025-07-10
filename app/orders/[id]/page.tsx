"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import axios from "axios"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import ReviewModal from "@/components/ReviewModal";

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
  const [reviewingProduct, setReviewingProduct] = useState<string | null>(null);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Lấy danh sách review của user cho các sản phẩm trong đơn
  useEffect(() => {
    if (!order) return;
    setReviewLoading(true);
    axios.get("http://localhost:5000/api/reviews/user", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(res => setUserReviews(res.data))
      .finally(() => setReviewLoading(false));
  }, [order]);

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

  // Phân loại sản phẩm đã đánh giá và chưa đánh giá
  const reviewedItems = order.products.filter((item: any) => userReviews.some(r => r.product && (r.product._id === item.product?._id) && r.orderItem === item._id));
  const unreviewedItems = order.products.filter((item: any) => !userReviews.some(r => r.product && (r.product._id === item.product?._id) && r.orderItem === item._id));

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
            <div className="font-semibold mb-2 text-base">Thông tin thanh toán</div>
            <div className="flex flex-col gap-1 text-gray-700">
              <div><b>Phương thức:</b> {order.paymentMethod}</div>
              <div>
                <b>Trạng thái:</b>
                <Badge 
                  className={`ml-2 ${order.paymentStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                >
                  {order.paymentStatus === 'success' ? 'Thành công' : 'Chờ thanh toán'}
                </Badge>
              </div>
              {order.transactionId && <div><b>Mã giao dịch:</b> {order.transactionId}</div>}
              {order.paymentStatus === 'success' && order.updatedAt && (
                <div><b>Thời gian thanh toán:</b> {new Date(order.updatedAt).toLocaleString()}</div>
              )}
            </div>
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mt-4 bg-red-500 hover:bg-red-600 w-fit">
                    Hủy đơn hàng
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Lý do hủy đơn hàng</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
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
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Hủy</Button>
                    </DialogClose>
                    <Button onClick={handleCancel} disabled={canceling || !cancelReason} className="bg-red-500 hover:bg-red-600 text-white">
                      {canceling ? "Đang hủy..." : "Xác nhận hủy"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
          {cancelMsg && <div className="text-red-600 font-semibold mt-2">{cancelMsg}</div>}
        </div>
        {/* Danh sách sản phẩm */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="font-semibold mb-3 text-lg">Sản phẩm trong đơn</div>
          <div className="divide-y">
            {/* Sản phẩm chưa đánh giá */}
            {unreviewedItems.length > 0 && (
              <div className="mb-4">
                <div className="font-semibold text-pink-600 mb-2 flex items-center gap-2 text-base">
                  <span>Chưa đánh giá</span>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">{unreviewedItems.length}</span>
                </div>
                {unreviewedItems.map((item: any) => (
                  <div key={item._id} className="flex items-center gap-4 py-4 border rounded-lg mb-2 bg-yellow-50">
                    <div className="w-20 h-20 flex-shrink-0">
                      {item.product?.image ? (
                        <Image src={item.product.image} alt={item.product.name} width={80} height={80} className="rounded-lg object-cover w-20 h-20" />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400">?</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-base">{item.product?.name || '---'}</div>
                      {item.product?.specifications?.size && (
                        <div className="text-xs text-gray-500 mt-1">Kích thước: {item.product.specifications.size === 'small' ? 'Nhỏ' : item.product.specifications.size === 'large' ? 'Lớn' : 'Vừa'}</div>
                      )}
                      {!item.product?.specifications?.size && item.product?.size && (
                        <div className="text-xs text-gray-500 mt-1">Kích thước: {item.product.size === 'small' ? 'Nhỏ' : item.product.size === 'large' ? 'Lớn' : 'Vừa'}</div>
                      )}
                      <div className="text-sm text-gray-500">x{item.quantity}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="font-bold text-pink-600 text-lg">{item.product?.price ? (item.product.price * item.quantity).toLocaleString() + '₫' : '--'}</div>
                      {order.status === 'Đã giao hàng' && (
                        <Button size="sm" className="bg-pink-500 hover:bg-pink-600 text-white font-semibold shadow" onClick={() => setReviewingProduct(item._id)} disabled={reviewLoading}>
                          Đánh giá
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Sản phẩm đã đánh giá */}
            {reviewedItems.length > 0 && (
              <div>
                <div className="font-semibold text-green-700 mb-2 flex items-center gap-2 text-base">
                  <span>Đã đánh giá</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{reviewedItems.length}</span>
                </div>
                {reviewedItems.map((item: any) => (
                  <div key={item._id} className="flex items-center gap-4 py-4 border rounded-lg mb-2 bg-green-50">
                    <div className="w-20 h-20 flex-shrink-0">
                      {item.product?.image ? (
                        <Image src={item.product.image} alt={item.product.name} width={80} height={80} className="rounded-lg object-cover w-20 h-20" />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400">?</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-base">{item.product?.name || '---'}</div>
                      {item.product?.specifications?.size && (
                        <div className="text-xs text-gray-500 mt-1">Kích thước: {item.product.specifications.size === 'small' ? 'Nhỏ' : item.product.specifications.size === 'large' ? 'Lớn' : 'Vừa'}</div>
                      )}
                      {!item.product?.specifications?.size && item.product?.size && (
                        <div className="text-xs text-gray-500 mt-1">Kích thước: {item.product.size === 'small' ? 'Nhỏ' : item.product.size === 'large' ? 'Lớn' : 'Vừa'}</div>
                      )}
                      <div className="text-sm text-gray-500">x{item.quantity}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="font-bold text-pink-600 text-lg">{item.product?.price ? (item.product.price * item.quantity).toLocaleString() + '₫' : '--'}</div>
                      <span className="flex items-center gap-1 text-green-700 font-semibold text-sm bg-green-100 px-2 py-1 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Đã đánh giá
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <ReviewModal
            open={!!reviewingProduct}
            onClose={() => setReviewingProduct(null)}
            productId={reviewingProduct ? (order.products.find((item: any) => item._id === reviewingProduct)?.product?._id || "") : ""}
            orderItemId={reviewingProduct || ""}
            onSubmitted={() => {
              setReviewingProduct(null);
              // Refresh lại review
              axios.get("http://localhost:5000/api/reviews/user", {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              })
                .then(res => setUserReviews(res.data));
            }}
          />
        </div>
      </div>
    </div>
  )
} 