"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import axios from "axios"
import Image from "next/image"
import { formatDateVN } from "@/lib/utils";
import { FileDown, ArrowLeft } from "lucide-react";

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

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`http://localhost:5000/api/orders/detail/${id}`)
      .then(res => setOrder(res.data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8 text-center">Đang tải...</div>
  if (!order) return <div className="p-8 text-center">Không tìm thấy đơn hàng.</div>

  const paymentStatusVN = (status: string) => {
    if (status === 'success') return 'Thành công';
    if (status === 'failed') return 'Thất bại';
    return 'Chờ thanh toán';
  };

  const handleExportPDF = async () => {
    if (typeof window === "undefined" || !order) return;
    const pdfMakeModule = await import("pdfmake/build/pdfmake");
    const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
    const pdfMake = pdfMakeModule.default || pdfMakeModule.pdfMake || pdfMakeModule;
    const pdfFonts = pdfFontsModule.default || pdfFontsModule.pdfMake || pdfFontsModule;
    pdfMake.vfs = (pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) || pdfFonts.vfs;
    // Tính tổng tiền sản phẩm và số tiền giảm
    const totalProductPrice = order.products.reduce(
      (sum: number, item: any) => sum + (item.product?.price || 0) * item.quantity,
      0
    );
    const discount = totalProductPrice - (order.totalPrice - (order.shippingFee || 0));
    const docDefinition = {
      content: [
        {
          columns: [
            { text: 'GẤU XINH', style: 'shopName', alignment: 'left' },
            { text: `Mã đơn: ${order._id.slice(-6).toUpperCase()}`, alignment: 'right', margin: [0, 4, 0, 0] }
          ]
        },
        { text: 'CHI TIẾT ĐƠN HÀNG', style: 'header', alignment: 'center', margin: [0, 0, 0, 12] },
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'Thông tin khách hàng', style: 'subheader', margin: [0, 0, 0, 4] },
                { text: `Họ tên: ${order.name || order.user?.username || order.user?.email}` },
                { text: `Email: ${order.user?.email || ''}` },
                { text: `SĐT: ${order.phone}` },
                { text: `Địa chỉ: ${order.address}` },
              ],
              margin: [0, 0, 8, 0],
              style: 'infoBox',
            },
            {
              width: '50%',
              stack: [
                { text: 'Thông tin đơn hàng', style: 'subheader', margin: [0, 0, 0, 4] },
                { text: `Ngày đặt: ${formatDateVN(order.createdAt)}` },
                order.coupon ? { text: `Mã giảm giá: ${order.coupon}` } : null,
                { text: `Trạng thái: ${order.status}` },
                { text: `Phương thức: ${order.paymentMethod || '---'}` },
                { text: `Thanh toán: ${paymentStatusVN(order.paymentStatus)}` },
                order.transactionId ? { text: `Mã giao dịch: ${order.transactionId}` } : null,
                order.paymentStatus === 'success' && order.updatedAt ? { text: `Thời gian thanh toán: ${formatDateVN(order.updatedAt)}` } : null,
              ].filter(Boolean),
              style: 'infoBox',
            }
          ],
          columnGap: 16,
          margin: [0, 0, 0, 12]
        },
        {
          text: 'Danh sách sản phẩm',
          style: 'subheader',
          margin: [0, 0, 0, 6]
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 40, 80, 80],
            body: [
              [
                { text: 'Tên sản phẩm', style: 'tableHeader' },
                { text: 'SL', style: 'tableHeader', alignment: 'center' },
                { text: 'Đơn giá', style: 'tableHeader', alignment: 'right' },
                { text: 'Thành tiền', style: 'tableHeader', alignment: 'right' },
              ],
              ...order.products.map((item: any) => [
                item.product?.name || '',
                { text: item.quantity.toString(), alignment: 'center' },
                { text: (item.product?.price || 0).toLocaleString() + '₫', alignment: 'right' },
                { text: ((item.product?.price || 0) * item.quantity).toLocaleString() + '₫', alignment: 'right' },
              ]),
              // Tổng tiền sản phẩm (trước giảm)
              (totalProductPrice !== (order.totalPrice - (order.shippingFee || 0))) ? [
                { text: 'TỔNG TIỀN SẢN PHẨM', colSpan: 3, alignment: 'right', bold: true }, {}, {},
                { text: totalProductPrice.toLocaleString() + '₫', alignment: 'right', bold: true }
              ] : null,
              // Số tiền giảm
              (discount > 0) ? [
                { text: 'GIẢM GIÁ', colSpan: 3, alignment: 'right', bold: true }, {}, {},
                { text: '-' + discount.toLocaleString() + '₫', alignment: 'right', bold: true, color: '#e3497a' }
              ] : null,
              // Tổng tiền sau giảm (trước phí ship)
              (discount > 0) ? [
                { text: 'TỔNG TIỀN SAU GIẢM', colSpan: 3, alignment: 'right', bold: true }, {}, {},
                { text: (totalProductPrice - discount).toLocaleString() + '₫', alignment: 'right', bold: true }
              ] : null,
              // Phí vận chuyển
              order.shippingFee && order.shippingFee > 0 ? [
                { text: 'PHÍ VẬN CHUYỂN', colSpan: 3, alignment: 'right', bold: true }, {}, {},
                { text: order.shippingFee.toLocaleString() + '₫', alignment: 'right', bold: true, color: '#2563eb' }
              ] : null,
              // Tổng cộng cuối cùng
              [
                { text: 'TỔNG CỘNG', colSpan: 3, alignment: 'right', bold: true }, {}, {},
                { text: order.totalPrice?.toLocaleString() + '₫', alignment: 'right', bold: true }
              ]
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => rowIndex === 0 ? '#fce7f3' : null,
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#e5e7eb',
            vLineColor: () => '#e5e7eb',
          },
          margin: [0, 0, 0, 12]
        },
        { text: 'Cảm ơn bạn đã mua hàng tại Shop Gấu Bông! Mọi thắc mắc vui lòng liên hệ hotline: 079 398 0972.', style: 'footer', alignment: 'center', margin: [0, 16, 0, 0] }
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          color: '#e3497a',
          margin: [0, 0, 0, 8]
        },
        shopName: {
          fontSize: 16,
          bold: true,
          color: '#e3497a',
        },
        subheader: {
          fontSize: 13,
          bold: true,
          color: '#e3497a',
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: '#e3497a',
        },
        infoBox: {
          margin: [0, 0, 0, 0],
        },
        footer: {
          fontSize: 11,
          italics: true,
          color: '#888',
        }
      },
      defaultStyle: {
        font: 'Roboto',
        fontSize: 12,
      }
    };
    pdfMake.createPdf(docDefinition).download(`donhang_${order._id.slice(-6).toUpperCase()}.pdf`);
  };

  return (
    <div className="container max-w-7xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-pink-600 flex items-center gap-4 justify-between">
        <span>Chi Tiết Đơn Hàng (Admin)</span>
        <Button
          onClick={handleExportPDF}
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-3 text-base rounded-lg shadow-md flex items-center gap-2"
        >
          <img src="/pdf2.gif" alt="PDF" className="w-8 h-8" />
          Xuất PDF
        </Button>
      </h1>
      <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Thông tin đơn hàng */}
          <div className="flex flex-col gap-4 border-r md:pr-8">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base">Mã đơn:</span>
              <span className="text-xl font-bold tracking-widest">{order._id.slice(-6).toUpperCase()}</span>
              <span className={`ml-auto px-3 py-1 rounded-full text-sm font-semibold ${statusColor(order.status)}`}>{order.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Ngày đặt:</span>
              <span>{formatDateVN(order.createdAt)}</span>
            </div>
            {/* Hiển thị giảm giá nếu có */}
            {(() => {
              const totalProductPrice = order.products.reduce(
                (sum: number, item: any) => sum + (item.product?.price || 0) * item.quantity,
                0
              );
              const discount = totalProductPrice - (order.totalPrice - (order.shippingFee || 0));
              if (discount > 0) {
                return (
                  <div className="flex flex-col gap-1 ml-2 mt-1">
                    <div className="text-sm text-gray-500">Tổng tiền trước giảm: <span className="font-semibold">{totalProductPrice.toLocaleString()}₫</span></div>
                    <div className="text-sm text-pink-500">Số tiền giảm: <span className="font-semibold">{discount.toLocaleString()}₫</span></div>
                    <div className="text-sm text-pink-600">Tổng tiền sau giảm: <span className="font-semibold">{(totalProductPrice - discount).toLocaleString()}₫</span></div>
                  </div>
                );
              }
              return null;
            })()}
            
            {/* Phí vận chuyển */}
            {order.shippingFee && order.shippingFee > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">Phí vận chuyển:</span>
                <span className="text-blue-600 font-semibold">{order.shippingFee?.toLocaleString()}₫</span>
              </div>
            )}
            
            {/* Tổng tiền cuối cùng */}
            <div className="flex items-center gap-2">
              <span className="font-semibold">Tổng tiền:</span>
              <span className="text-pink-600 text-xl font-extrabold">{order.totalPrice?.toLocaleString()}₫</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold">Trạng thái thanh toán:</span>
              <Badge className={`ml-2 px-3 py-1 text-base ${order.paymentStatus === 'success' ? 'bg-green-100 text-green-700' : order.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {order.paymentStatus === 'success' ? 'Thành công' : order.paymentStatus === 'failed' ? 'Thất bại' : 'Chờ thanh toán'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Phương thức:</span>
              <span>{order.paymentMethod || '---'}</span>
            </div>
            {order.transactionId && <div><b>Mã giao dịch:</b> {order.transactionId}</div>}
            {order.paymentStatus === 'success' && order.updatedAt && (
              <div><b>Thời gian thanh toán:</b> {formatDateVN(order.updatedAt)}</div>
            )}
          </div>
          {/* Thông tin khách hàng & nhận hàng */}
          <div className="flex flex-col gap-4 md:pl-8">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Khách hàng:</span>
              <span>{order.user?.username || order.user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Email:</span>
              <span>{order.user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">User ID:</span>
              <span>{order.user?._id}</span>
            </div>
            <div className="border-t pt-4 mt-2">
              <div className="font-semibold mb-2 text-base">Thông tin nhận hàng</div>
              <div className="flex flex-col gap-1 text-gray-700">
                <div><b>Họ tên:</b> {order.name}</div>
                <div><b>SĐT:</b> {order.phone}</div>
                <div><b>Địa chỉ:</b> {order.address}</div>
              </div>
            </div>
          </div>
        </div>
        {/* Danh sách sản phẩm */}
        <div className="bg-gray-50 rounded-xl p-6 border">
          <div className="font-semibold mb-4 text-lg text-pink-600">Sản phẩm trong đơn</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-base">
              <thead>
                <tr className="bg-pink-50">
                  <th className="py-3 px-4 text-left font-bold">Sản phẩm</th>
                  <th className="py-3 px-4 text-center font-bold">Kích thước</th>
                  <th className="py-3 px-4 text-center font-bold">Số lượng</th>
                  <th className="py-3 px-4 text-right font-bold">Đơn giá</th>
                  <th className="py-3 px-4 text-right font-bold">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {order.products.map((item: any) => (
                  <tr key={item.product?._id} className="border-b last:border-0">
                    <td className="py-3 px-4 flex items-center gap-3">
                      {item.product?.image ? (
                        <Image src={item.product.image} alt={item.product.name} width={60} height={60} className="rounded-lg object-cover w-16 h-16 border" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">?</div>
                      )}
                      <span className="font-semibold">{item.product?.name || '---'}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.product?.specifications?.size
                        ? item.product.specifications.size === 'small' ? 'Nhỏ' : item.product.specifications.size === 'large' ? 'Lớn' : 'Vừa'
                        : item.product?.size
                        ? item.product.size === 'small' ? 'Nhỏ' : item.product.size === 'large' ? 'Lớn' : 'Vừa'
                        : '--'}
                    </td>
                    <td className="py-3 px-4 text-center">{item.quantity}</td>
                    <td className="py-3 px-4 text-right">{item.product?.price?.toLocaleString()}₫</td>
                    <td className="py-3 px-4 text-right font-bold text-pink-600">{item.product?.price ? (item.product.price * item.quantity).toLocaleString() + '₫' : '--'}</td>
                  </tr>
                ))}
                {order.shippingFee && order.shippingFee > 0 && (
                  <tr>
                    <td colSpan={4} className="py-3 px-4 text-right font-bold text-lg text-blue-600">Phí vận chuyển</td>
                    <td className="py-3 px-4 text-right font-bold text-lg text-blue-600">{order.shippingFee?.toLocaleString()}₫</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={4} className="py-3 px-4 text-right font-bold text-lg">Tổng cộng</td>
                  <td className="py-3 px-4 text-right font-extrabold text-xl text-pink-700">{order.totalPrice?.toLocaleString()}₫</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Button
        className="mt-10 mx-auto block border-2 border-gray-400 text-gray-700 font-semibold text-base px-8 py-3 rounded-lg hover:bg-gray-100 flex items-center gap-2"
        variant="outline"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-5 h-5" />
        Quay lại
      </Button>
    </div>
  )
} 