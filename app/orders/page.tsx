"use client"
import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/CartContext"

const ORDER_TABS = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ xác nhận", value: "Chờ xác nhận" },
  { label: "Đã xác nhận", value: "Đã xác nhận" },
  { label: "Đang xử lý", value: "Đang xử lý" },
  { label: "Đang giao hàng", value: "Đang giao hàng" },
  { label: "Đã giao hàng", value: "Đã giao hàng" },
  { label: "Đã hủy", value: "Đã hủy" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [userId, setUserId] = useState("")
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const router = useRouter()
  const { addToCart } = useCart();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const uid = localStorage.getItem("userId") || ""
      setUserId(uid)
      if (uid) {
        axios.get(`http://localhost:5000/api/orders/${uid}`)
          .then(res => setOrders(res.data))
      }
    }
  }, [])

  // Lọc đơn hàng theo tab và search
  const filteredOrders = orders.filter(order => {
    let matchTab = true;
    if (activeTab !== "all") {
      matchTab = order.status === activeTab;
    }
    let matchSearch = true;
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      matchSearch = order._id.toLowerCase().includes(s) ||
        (order.products && order.products.some((p: any) => p.product?.name?.toLowerCase().includes(s)))
    }
    return matchTab && matchSearch;
  });

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow p-4">
        {/* Tabs */}
        <div className="flex border-b mb-4 overflow-x-auto scrollbar-hide bg-gray-50 rounded-t-lg">
          {ORDER_TABS.map(tab => (
            <button
              key={tab.value}
              className={`px-6 py-3 font-medium text-base transition-colors whitespace-nowrap rounded-t-lg focus:outline-none
                ${activeTab === tab.value
                  ? "bg-white border-b-2 border-pink-500 text-pink-500 shadow-sm z-10"
                  : "text-gray-700 hover:text-pink-500 hover:bg-pink-100 border-b-2 border-transparent"}
              `}
              style={{ minWidth: 120 }}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Search */}
        <div className="mb-4 flex items-center bg-gray-100 rounded px-4 py-2">
          <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            type="text"
            className="bg-transparent outline-none flex-1 text-gray-700"
            placeholder="Bạn có thể tìm kiếm theo Mã đơn hàng"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* Table */}
        <div className="space-y-6">
          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-400">Không có đơn hàng nào.</div>
          )}
          {filteredOrders.map(order => (
            <div key={order._id} className="bg-white rounded-xl shadow p-4 flex flex-col gap-4 border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Mã đơn:</span>
                  <span className="text-pink-500 font-bold">{order._id.slice(-6).toUpperCase()}</span>
                  <span className="text-gray-400 text-sm ml-4">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-pink-50 text-pink-500 border border-pink-200">{order.status}</span>
              </div>
              <div className="divide-y">
                {order.products.map((item: any, idx: number) => (
                  <div key={item._id || idx} className="flex flex-col md:flex-row gap-4 py-4 first:pt-0 last:pb-0 items-center">
                    <img
                      src={item.product?.image || "/placeholder.jpg"}
                      alt={item.product?.name}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base text-pink-600 hover:underline cursor-pointer" onClick={() => router.push(`/orders/${order._id}`)}>
                        {item.product?.name}
                      </div>
                      <div className="text-gray-500 text-sm mt-1">
                        {item.product?.description && <span>{item.product.description}</span>}
                        {item.product?.type && <span className="ml-2">Loại: {item.product.type}</span>}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">Số lượng: x{item.quantity}</div>
                    </div>
                    <div className="flex flex-col items-end min-w-[100px]">
                      {item.product?.price && (
                        <span className="text-base font-bold text-pink-500">{item.product.price.toLocaleString()}₫</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 pt-2 border-t">
                <div className="text-right md:text-left">
                  <span className="text-gray-500 mr-2">Thành tiền:</span>
                  <span className="text-xl font-bold text-pink-600">{order.totalPrice?.toLocaleString()}₫</span>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Thêm tất cả sản phẩm của đơn vào giỏ hàng
                      order.products.forEach((item: any) => {
                        if (item.product) {
                          addToCart(item.product, item.quantity);
                        }
                      });
                      window.location.href = "/cart";
                    }}
                  >
                    Mua lại
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open("https://www.facebook.com/yourfanpage", "_blank")}
                  >
                    Liên hệ người bán
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Thêm CSS ẩn thanh cuộn ngang cho tab bar */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
} 