"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import axios from "axios"
import Image from "next/image"
import { formatDateVN } from "@/lib/utils";
import CustomPartsDisplay from "@/components/CustomPartsDisplay"
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
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get(`http://localhost:5000/api/orders/detail/${id}`),
      axios.get(`http://localhost:5000/api/categories`)
    ]).then(([orderRes, categoriesRes]) => {
      console.log('Order data received:', orderRes.data);
      console.log('Products:', orderRes.data.products);
      setOrder(orderRes.data);
      setCategories(categoriesRes.data);
    }).finally(() => setLoading(false))
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
      (sum: number, item: any) => sum + (item.product?.price || item.productInfo?.price || 0) * item.quantity,
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
            widths: ['*', 60, 60, 40, 80, 80],
            body: [
              [
                { text: 'Tên sản phẩm', style: 'tableHeader' },
                { text: 'Kích thước', style: 'tableHeader', alignment: 'center' },
                { text: 'Chất liệu', style: 'tableHeader', alignment: 'center' },
                { text: 'SL', style: 'tableHeader', alignment: 'center' },
                { text: 'Đơn giá', style: 'tableHeader', alignment: 'right' },
                { text: 'Thành tiền', style: 'tableHeader', alignment: 'right' },
              ],
              ...order.products.map((item: any) => [
                item.product?.name || item.productInfo?.name || 'Sản phẩm tùy chỉnh',
                { text: (() => {
                  // Lấy kích thước từ nhiều nguồn
                  let size = item.productInfo?.sizeText || item.product?.sizeText || '';
                  if (!size) {
                    const specs = item.product?.specifications || item.productInfo?.specifications;
                    size = specs?.sizeName || specs?.size || '';
                  }
                  if (!size && item.product?.description) {
                    const sizeFromDesc = /Kích thước\s*:\s*([^;]+)/i.exec(item.product.description)?.[1]?.trim();
                    size = sizeFromDesc || '';
                  }
                  return size || '--';
                })(), alignment: 'center' },
                { text: (() => {
                  // Lấy chất liệu từ nhiều nguồn
                  let material = item.productInfo?.materialText || item.product?.materialText || '';
                  if (!material) {
                    const specs = item.product?.specifications || item.productInfo?.specifications;
                    material = specs?.material || '';
                  }
                  if (!material && item.product?.description) {
                    const materialFromDesc = /Chất liệu\s*:\s*([^;]+)/i.exec(item.product.description)?.[1]?.trim();
                    material = materialFromDesc || '';
                  }
                  return material || '--';
                })(), alignment: 'center' },
                { text: item.quantity.toString(), alignment: 'center' },
                { text: (item.product?.price || item.productInfo?.price || 0).toLocaleString() + '₫', alignment: 'right' },
                { text: ((item.product?.price || item.productInfo?.price || 0) * item.quantity).toLocaleString() + '₫', alignment: 'right' },
              ]),
              // Tổng tiền sản phẩm (trước giảm)
              ...(totalProductPrice !== (order.totalPrice - (order.shippingFee || 0)) ? [[
                { text: 'TỔNG TIỀN SẢN PHẨM', colSpan: 5, alignment: 'right', bold: true }, {}, {}, {}, {},
                { text: totalProductPrice.toLocaleString() + '₫', alignment: 'right', bold: true }
              ]] : []),
              // Số tiền giảm
              ...(discount > 0 ? [[
                { text: 'GIẢM GIÁ', colSpan: 5, alignment: 'right', bold: true }, {}, {}, {}, {},
                { text: '-' + discount.toLocaleString() + '₫', alignment: 'right', bold: true, color: '#e3497a' }
              ]] : []),
              // Tổng tiền sau giảm (trước phí ship)
              ...(discount > 0 ? [[
                { text: 'TỔNG TIỀN SAU GIẢM', colSpan: 5, alignment: 'right', bold: true }, {}, {}, {}, {},
                { text: (totalProductPrice - discount).toLocaleString() + '₫', alignment: 'right', bold: true }
              ]] : []),
              // Phí vận chuyển
              ...(order.shippingFee && order.shippingFee > 0 ? [[
                { text: 'PHÍ VẬN CHUYỂN', colSpan: 5, alignment: 'right', bold: true }, {}, {}, {}, {},
                { text: order.shippingFee.toLocaleString() + '₫', alignment: 'right', bold: true, color: '#2563eb' }
              ]] : []),
              // Tổng cộng cuối cùng
              [
                { text: 'TỔNG CỘNG', colSpan: 5, alignment: 'right', bold: true }, {}, {}, {}, {},
                { text: order.totalPrice?.toLocaleString() + '₫', alignment: 'right', bold: true }
              ]
            ].filter(row => row !== null) // Loại bỏ các row null
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
        
        // Thêm thông tin chi tiết bộ phận tùy chỉnh nếu có
        ...(order.products.some((item: any) => 
          item.product?.type === 'custom' || 
          item.product?.isCustom || 
          item.productInfo?.type === 'custom' ||
          item.productInfo?.isCustom ||
          item.product?.customData ||
          item.productInfo?.customData
        ) ? [
          { text: '🎨 CHI TIẾT BỘ PHẬN TÙY CHỈNH', style: 'subheader', margin: [0, 16, 0, 8] },
          ...order.products.map((item: any, index: number) => {
            const isCustom = item.product?.type === 'custom' || 
                            item.product?.isCustom || 
                            item.productInfo?.type === 'custom' ||
                            item.productInfo?.isCustom ||
                            item.product?.customData ||
                            item.productInfo?.customData;
            
            if (!isCustom) return null;
            
            const parts = item.product?.customData?.parts || 
                         item.productInfo?.customData?.parts ||
                         item.product?.specifications ||
                         item.productInfo?.specifications ||
                         {};
            
            const size = item.productInfo?.sizeText || 
                        item.product?.sizeText || 
                        item.product?.size || 
                        item.productInfo?.size ||
                        parts.size;
            
            const material = item.productInfo?.materialText || 
                            item.product?.materialText || 
                            item.product?.material || 
                            item.productInfo?.material ||
                            parts.material;
            
            // Hàm lấy tên bộ phận từ ID
            const getPartName = (partId: string) => {
              if (!partId) return 'Chưa chọn';
              const category = categories.find(cat => cat._id === partId);
              return category ? category.name : 'Không xác định';
            };
            
            // Hàm xử lý accessories
            const getAccessoriesText = () => {
              if (!parts.accessories) return 'Không có';
              if (Array.isArray(parts.accessories)) {
                return parts.accessories.map((accId: string) => getPartName(accId)).join(', ');
              } else if (typeof parts.accessories === 'object') {
                return Object.entries(parts.accessories)
                  .map(([accId, quantity]) => `${getPartName(accId as string)} (x${quantity})`)
                  .join(', ');
              }
              return 'Không có';
            };
            
            return [
              { text: `Sản phẩm ${index + 1}: ${item.product?.name || item.productInfo?.name || 'Sản phẩm tùy chỉnh'}`, style: 'subheader', margin: [0, 8, 0, 4] },
              { text: `Kích thước: ${size === 'small' ? 'Nhỏ' : size === 'medium' ? 'Vừa' : size === 'large' ? 'Lớn' : size || '--'}`, margin: [16, 2, 0, 0] },
              { text: `Chất liệu: ${material === 'cotton' ? 'Bông' : material === 'wool' ? 'Len' : material === 'silk' ? 'Tơ' : material === 'leather' ? 'Da' : material || '--'}`, margin: [16, 2, 0, 0] },
              { text: `Thân: ${getPartName(parts.body)}`, margin: [16, 2, 0, 0] },
              { text: `Tai: ${getPartName(parts.ears)}`, margin: [16, 2, 0, 0] },
              { text: `Mắt: ${getPartName(parts.eyes)}`, margin: [16, 2, 0, 0] },
              ...(parts.nose ? [{ text: `Mũi: ${getPartName(parts.nose)}`, margin: [16, 2, 0, 0] }] : []),
              ...(parts.mouth ? [{ text: `Miệng: ${getPartName(parts.mouth)}`, margin: [16, 2, 0, 0] }] : []),
              ...(parts.furColor ? [{ text: `Màu lông: ${getPartName(parts.furColor)}`, margin: [16, 2, 0, 0] }] : []),
              ...(parts.clothing ? [{ text: `Quần áo: ${getPartName(parts.clothing)}`, margin: [16, 2, 0, 0] }] : []),
              { text: `Phụ kiện: ${getAccessoriesText()}`, margin: [16, 2, 0, 0] },
              { text: 'Ghi chú: Đây là sản phẩm tùy chỉnh theo yêu cầu khách hàng. Vui lòng sử dụng đúng các bộ phận đã được chọn.', margin: [16, 8, 0, 8], italics: true, color: '#e3497a' }
            ];
          }).filter(Boolean).flat()
        ] : []),
        
        // Ghi chú khách hàng nếu có
        ...(order.customerNote ? [
          { text: 'GHI CHÚ TỪ KHÁCH HÀNG', style: 'subheader', margin: [0, 16, 0, 8] },
          { text: order.customerNote, margin: [16, 0, 0, 16], italics: true, color: '#2563eb' }
        ] : []),
        
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
                (sum: number, item: any) => sum + (item.product?.price || item.productInfo?.price || 0) * item.quantity,
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
            <div className="flex items-center gap-2">
              <span className="font-semibold">Phí vận chuyển:</span>
              <span className={`${Number(order.shippingFee) > 0 ? 'text-blue-600' : 'text-gray-600'} font-semibold`}>{(order.shippingFee || 0).toLocaleString()}₫</span>
            </div>
            
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
                  <th className="py-3 px-4 text-center font-bold">Chất liệu</th>
                  <th className="py-3 px-4 text-center font-bold">Số lượng</th>
                  <th className="py-3 px-4 text-right font-bold">Đơn giá</th>
                  <th className="py-3 px-4 text-right font-bold">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const rows = [];
                  
                  // Add product rows
                  order.products.forEach((item: any, index: number) => {
                    rows.push(
                      <tr key={item.product?._id || item.product || `product-${index}`} className="border-b last:border-0">
                        <td className="py-3 px-4 flex items-center gap-3">
                          {(() => {
                            const src = (item.product?.image || item.product?.previewImage || item.productInfo?.image || item.productInfo?.previewImage || '/placeholder.jpg') as string;
                            return (
                              <Image src={src} alt={(item.product?.name || item.productInfo?.name || 'Sản phẩm') as string} width={60} height={60} className="rounded-lg object-cover w-16 h-16 border" unoptimized={true} />
                            );
                          })()}
                          <div className="flex flex-col">
                            <span className="font-semibold text-base">{item.product?.name || item.productInfo?.name || 'Sản phẩm tùy chỉnh'}</span>
                            {/* Hiển thị thông tin bổ sung nếu có */}
                            {(() => {
                              const specs = item.product?.specifications || item.productInfo?.specifications;
                              // Chỉ hiển thị thông tin khác ngoài size và material
                              const otherInfo = [];
                              
                              // Thêm thông tin hộp quà nếu có
                              if (specs?.giftBox?.name) {
                                otherInfo.push(`Hộp quà: ${specs.giftBox.name}`);
                              }
                              
                              // Thêm thông tin màu sắc nếu có
                              if (specs?.color) {
                                otherInfo.push(`Màu: ${specs.color}`);
                              }
                              
                              // Thêm thông tin khác từ description nếu không phải size/material
                              const descText = (item.product?.description || item.productInfo?.description || '') as string;
                              if (descText && !descText.includes('Kích thước:') && !descText.includes('Chất liệu:')) {
                                otherInfo.push(descText);
                              }
                              
                              return otherInfo.length > 0 ? (
                                <span className="text-sm text-gray-600 mt-0.5">{otherInfo.join(' · ')}</span>
                              ) : null;
                            })()}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {(() => {
                            // Ưu tiên lấy từ sizeText đã được xử lý
                            let size = item.productInfo?.sizeText || item.product?.sizeText || '';
                            
                            // Nếu không có sizeText, lấy từ các trường trực tiếp
                            if (!size) {
                              size = item.product?.size || item.productInfo?.size || '';
                            }
                            
                            // Nếu không có, lấy từ specifications
                            if (!size) {
                              const specs = item.product?.specifications || item.productInfo?.specifications;
                              size = specs?.size || specs?.sizeName || '';
                            }
                            
                            // Fallback từ description nếu thiếu
                            if (!size) {
                              const descText = (item.product?.description || item.productInfo?.description || '') as string;
                              const sizeFromDesc = /Kích thước\s*:\s*([^;]+)/i.exec(descText)?.[1]?.trim();
                              if (sizeFromDesc) {
                                size = sizeFromDesc;
                              }
                            }
                            
                            // Xử lý giá trị size
                            if (typeof size === 'string' && /^[a-f\d]{24}$/i.test(size)) {
                              // Nếu là ObjectId, hiển thị --
                              size = '--';
                            } else if (size === 'small') {
                              size = 'Nhỏ';
                            } else if (size === 'medium') {
                              size = 'Vừa';
                            } else if (size === 'large') {
                              size = 'Lớn';
                            }
                            
                            return size || '--';
                          })()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {(() => {
                            // Ưu tiên lấy từ materialText đã được xử lý
                            let material = item.productInfo?.materialText || item.product?.materialText || '';
                            
                            // Nếu không có materialText, lấy từ các trường trực tiếp
                            if (!material) {
                              material = item.product?.material || item.productInfo?.material || '';
                            }
                            
                            // Nếu không có, lấy từ specifications
                            if (!material) {
                              const specs = item.product?.specifications || item.productInfo?.specifications;
                              material = specs?.material || specs?.materialName || '';
                            }
                            
                            // Fallback từ description nếu thiếu
                            if (!material) {
                              const descText = (item.product?.description || item.productInfo?.description || '') as string;
                              const materialFromDesc = /Chất liệu\s*:\s*([^;]+)/i.exec(descText)?.[1]?.trim();
                              if (materialFromDesc) {
                                material = materialFromDesc;
                              }
                            }
                            
                            // Xử lý giá trị material
                            if (typeof material === 'string' && /^[a-f\d]{24}$/i.test(material)) {
                              // Nếu là ObjectId, hiển thị --
                              material = '--';
                            } else if (material === 'cotton') {
                              material = 'Bông';
                            } else if (material === 'wool') {
                              material = 'Len';
                            } else if (material === 'silk') {
                              material = 'Tơ';
                            } else if (material === 'leather') {
                              material = 'Da';
                            } else if (material === 'cotton-wool') {
                              material = 'Bông Len';
                            } else if (material === 'cotton-silk') {
                              material = 'Bông Tơ';
                            } else if (material === 'wool-silk') {
                              material = 'Len Tơ';
                            } else if (material === 'cotton-wool-silk') {
                              material = 'Bông Len Tơ';
                            }
                            
                            return material || '--';
                          })()}
                        </td>
                        <td className="py-3 px-4 text-center">{item.quantity}</td>
                        <td className="py-3 px-4 text-right">
                          {(() => {
                            const base = (item.product?.price ?? item.productInfo?.price ?? 0);
                            const unit = base > 0
                              ? base
                              : (order.products.length === 1
                                  ? Math.max((order.totalPrice - (order.shippingFee || 0)) / (item.quantity || 1), 0)
                                  : 0);
                            return unit.toLocaleString() + '₫';
                          })()}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-pink-600">
                          {(() => {
                            const base = (item.product?.price ?? item.productInfo?.price ?? 0);
                            const unit = base > 0
                              ? base
                              : (order.products.length === 1
                                  ? Math.max((order.totalPrice - (order.shippingFee || 0)) / (item.quantity || 1), 0)
                                  : 0);
                            return (unit * item.quantity).toLocaleString() + '₫';
                          })()}
                        </td>
                      </tr>
                    );
                  });
                  
                  // Add shipping fee row if exists
                  // Luôn hiển thị phí ship, kể cả 0₫
                  rows.push(
                    <tr key="shipping-fee">
                      <td colSpan={5} className={`py-3 px-4 text-right font-bold text-lg ${Number(order.shippingFee) > 0 ? 'text-blue-600' : 'text-gray-600'}`}>Phí vận chuyển</td>
                      <td className={`py-3 px-4 text-right font-bold text-lg ${Number(order.shippingFee) > 0 ? 'text-blue-600' : 'text-gray-600'}`}>{(order.shippingFee || 0).toLocaleString()}₫</td>
                    </tr>
                  );
                  
                  // Add total row
                  rows.push(
                    <tr key="total">
                      <td colSpan={5} className="py-3 px-4 text-right font-bold text-lg">Tổng cộng</td>
                      <td className="py-3 px-4 text-right font-extrabold text-xl text-pink-700">{order.totalPrice?.toLocaleString()}₫</td>
                    </tr>
                  );
                  
                  return rows;
                })()}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Ghi chú khách hàng */}
        {order.customerNote && (
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mt-6">
            <div className="font-semibold mb-3 text-lg text-blue-700 flex items-center gap-2">
              <span>💬</span>
              Ghi chú từ khách hàng
            </div>
            <div className="text-gray-700 bg-white p-4 rounded-lg border border-blue-100">
              {order.customerNote}
            </div>
          </div>
        )}
      </div>

      {/* Hiển thị chi tiết bộ phận tùy chỉnh cho các sản phẩm custom */}
      {order.products.some((item: any) => 
        item.product?.type === 'custom' || 
        item.product?.isCustom || 
        item.productInfo?.type === 'custom' ||
        item.productInfo?.isCustom ||
        item.product?.customData ||
        item.productInfo?.customData
      ) && (
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold mb-6 text-pink-600 flex items-center gap-3">
            <span className="text-3xl">🎨</span>
            Chi tiết bộ phận tùy chỉnh
          </h2>
          <div className="space-y-8">
            {order.products.map((item: any, index: number) => {
              // Kiểm tra xem sản phẩm có phải là custom không
              const isCustom = item.product?.type === 'custom' || 
                              item.product?.isCustom || 
                              item.productInfo?.type === 'custom' ||
                              item.productInfo?.isCustom ||
                              item.product?.customData ||
                              item.productInfo?.customData;
              
              if (!isCustom) return null;
              
              // Lấy thông tin parts từ nhiều nguồn khác nhau
              const parts = item.product?.customData?.parts || 
                           item.productInfo?.customData?.parts ||
                           item.product?.specifications ||
                           item.productInfo?.specifications ||
                           {};
              
              // Lấy size và material
              const size = item.productInfo?.sizeText || 
                          item.product?.sizeText || 
                          item.product?.size || 
                          item.productInfo?.size ||
                          parts.size;
              
              const material = item.productInfo?.materialText || 
                              item.product?.materialText || 
                              item.product?.material || 
                              item.productInfo?.material ||
                              parts.material;
              
              return (
                <div key={`custom-${index}`} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200">
                  {/* Header sản phẩm */}
                  <div className="flex items-center gap-4 mb-6 p-4 bg-white rounded-lg border border-pink-100">
                    <img 
                      src={item.product?.image || item.product?.previewImage || item.productInfo?.image || item.productInfo?.previewImage || '/placeholder.jpg'} 
                      alt={item.product?.name || item.productInfo?.name || 'Sản phẩm tùy chỉnh'}
                      className="w-20 h-20 object-cover rounded-xl border-2 border-pink-200 shadow-md"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {item.product?.name || item.productInfo?.name || 'Sản phẩm tùy chỉnh'}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full font-medium">
                          Số lượng: {item.quantity}
                        </span>
                        {size && (
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                            Kích thước: {size}
                          </span>
                        )}
                        {material && (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                            Chất liệu: {material}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Chi tiết bộ phận */}
                  <div className="bg-white rounded-lg p-6 border border-pink-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="text-pink-500">🔧</span>
                      Các bộ phận đã chọn
                    </h4>
                    <CustomPartsDisplay 
                      parts={parts}
                      categories={categories}
                      size={size}
                      material={material}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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