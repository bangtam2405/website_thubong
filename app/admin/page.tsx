"use client"

import { useState, useEffect, useContext } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Eye, Plus, Edit, Trash2, LineChart as LineChartIcon, Users, ShoppingCart, DollarSign, Package, BarChart as BarChartIcon, TrendingUp, FileDown, FileSpreadsheet } from "lucide-react"
import Image from "next/image"
import instance from "@/lib/axiosConfig"
import { useRouter } from "next/navigation"
import ImageUpload from "@/components/ImageUpload"
import { AdminTabContext } from "./layout"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, LineChart, Line } from "recharts"
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
import { cn } from "@/lib/utils";
import CountUp from 'react-countup';
import { formatDateVN } from "@/lib/utils";
import * as XLSX from "xlsx";

// Định nghĩa kiểu cho một tháng doanh thu
type MonthRevenue = {
  name: string;
  year: number;
  month: number;
  total: number;
};

// Thống kê
function StatsTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statType, setStatType] = useState<'revenue' | 'top-products'>('revenue');
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loadingTop, setLoadingTop] = useState(false);
  const [groupBy, setGroupBy] = useState<'day' | 'month' | 'year'>('day');
  const [productCategories, setProductCategories] = useState<any[]>([]);
  // Filter state động
  const today = new Date();
  const defaultYear = today.getFullYear();
  const defaultMonth = (today.getMonth() + 1).toString().padStart(2, '0');
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState<string>(() => today.toISOString().slice(0, 10));
  const [fromMonth, setFromMonth] = useState<string>(`${defaultYear}-${defaultMonth}`);
  const [toMonth, setToMonth] = useState<string>(`${defaultYear}-${defaultMonth}`);
  const [fromYear, setFromYear] = useState<number>(defaultYear - 1);
  const [toYear, setToYear] = useState<number>(defaultYear);

  // Reset filter khi đổi groupBy
  useEffect(() => {
    if (groupBy === 'day') {
      const d = new Date(); d.setMonth(d.getMonth() - 1);
      setFromDate(d.toISOString().slice(0, 10));
      setToDate(today.toISOString().slice(0, 10));
    } else if (groupBy === 'month') {
      setFromMonth(`${defaultYear}-${(today.getMonth() + 1).toString().padStart(2, '0')}`);
      setToMonth(`${defaultYear}-${(today.getMonth() + 1).toString().padStart(2, '0')}`);
    } else {
      setFromYear(defaultYear - 1);
      setToYear(defaultYear);
    }
  }, [groupBy]);

  const fetchStats = () => {
    setLoading(true);
    let params: any = { groupBy };
    if (groupBy === 'day') {
      params.from = fromDate;
      params.to = toDate;
    } else if (groupBy === 'month') {
      params.from = fromMonth + '-01';
      params.to = toMonth + '-28'; // lấy hết tháng
    } else {
      params.from = `${fromYear}-01-01`;
      params.to = `${toYear}-12-31`;
    }
    instance.get("/api/admin/stats", { params })
      .then(res => {
        setStats(res.data);
      })
      .finally(() => setLoading(false));
  };

  // Lấy top sản phẩm bán chạy khi cần
  useEffect(() => {
    if (statType === 'top-products' && topProducts.length === 0) {
      setLoadingTop(true);
      instance.get('/api/admin/top-products?limit=7').then(res => setTopProducts(res.data)).finally(() => setLoadingTop(false));
    }
    // eslint-disable-next-line
  }, [statType]);

  useEffect(() => {
    fetchStats();
  }, [groupBy, fromDate, toDate, fromMonth, toMonth, fromYear, toYear]);

  // Fetch danh mục sản phẩm
  useEffect(() => {
    instance.get("http://localhost:5000/api/product-categories/admin")
      .then(res => setProductCategories(res.data))
      .catch(err => {
        console.error("Lỗi khi tải danh mục sản phẩm:", err);
        // Nếu API chưa tồn tại, hiển thị thông báo lỗi
        setProductCategories([]);
      });
  }, []);

  if (loading) return <div>Đang tải dữ liệu thống kê...</div>;
  if (!stats) return <div>Không có dữ liệu.</div>;

  // Badge màu cho trạng thái đơn hàng
  const statusColor = {
    'Chờ xác nhận': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Đã xác nhận': 'bg-blue-100 text-blue-800 border-blue-200',
    'Đang xử lý': 'bg-orange-100 text-orange-800 border-orange-200',
    'Đang giao hàng': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'Đã giao hàng': 'bg-green-100 text-green-800 border-green-200',
    'Đã hủy': 'bg-red-100 text-red-700 border-red-200',
  };

  // Xuất Excel doanh thu
  const handleExportExcel = () => {
    if (!stats?.monthlyRevenue) return;
    const data = stats.monthlyRevenue.map((item: any) => ({
      "Tháng/Năm": item.name,
      "Tổng doanh thu": item.total?.toLocaleString() + '₫',
      "Số đơn hàng": item.orderCount ?? 0,
      "Số khách hàng": item.customerCount ?? 0,
      "Sản phẩm bán ra": item.totalProductSold ?? 0,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DoanhThu");
    XLSX.writeFile(wb, `doanhthu_${new Date().getTime()}.xlsx`);
  };
  // Xuất PDF doanh thu
  const handleExportPDF = async () => {
    if (!stats?.monthlyRevenue) return;
    const pdfMakeModule = await import("pdfmake/build/pdfmake");
    const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
    const pdfMake = pdfMakeModule.default || pdfMakeModule.pdfMake || pdfMakeModule;
    const pdfFonts = pdfFontsModule.default || pdfFontsModule.pdfMake || pdfFontsModule;
    pdfMake.vfs = (pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) || pdfFonts.vfs;
    const body = [
      [
        { text: 'Tháng/Năm', style: 'tableHeader' },
        { text: 'Tổng doanh thu', style: 'tableHeader' },
        { text: 'Số đơn hàng', style: 'tableHeader' },
        { text: 'Số khách hàng', style: 'tableHeader' },
        { text: 'Sản phẩm bán ra', style: 'tableHeader' },
      ],
      ...stats.monthlyRevenue.map((item: any) => [
        item.name,
        item.total?.toLocaleString() + '₫',
        item.orderCount ?? 0,
        item.customerCount ?? 0,
        item.totalProductSold ?? 0,
      ])
    ];
    const docDefinition = {
      content: [
        { text: 'BÁO CÁO DOANH THU THEO THÁNG', style: 'header', alignment: 'center', margin: [0,0,0,12] },
        {
          table: {
            headerRows: 1,
            widths: [80, 120, 60, 60, 60],
            body
          },
          layout: {
            fillColor: (rowIndex: number) => rowIndex === 0 ? '#fce7f3' : null,
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#e5e7eb',
            vLineColor: () => '#e5e7eb',
          },
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          color: '#e3497a',
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: '#e3497a',
        },
      },
      defaultStyle: {
        font: 'Roboto',
        fontSize: 11,
      }
    };
    pdfMake.createPdf(docDefinition).download(`baocao_doanhthu_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="space-y-8">
      {/* Card số liệu luôn hiển thị phía trên */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-pink-100 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Doanh Thu</CardTitle>
            <DollarSign className="h-7 w-7 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-pink-600">
              <CountUp end={stats.totalRevenue} duration={1.2} separator="," />₫
            </div>
            <div className="text-xs text-gray-400 mt-1">Tổng doanh thu đã hoàn thành</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-100 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Khách Hàng</CardTitle>
            <Users className="h-7 w-7 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-blue-600">
              +<CountUp end={stats.totalCustomers} duration={1.2} separator="," />
            </div>
            <div className="text-xs text-gray-400 mt-1">Khách đã đăng ký</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-100 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Đơn Hàng</CardTitle>
            <ShoppingCart className="h-7 w-7 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-green-600">
              +<CountUp end={stats.totalOrders} duration={1.2} separator="," />
            </div>
            <div className="text-xs text-gray-400 mt-1">Tất cả trạng thái</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-0 bg-gradient-to-br from-yellow-100 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Sản Phẩm</CardTitle>
            <Package className="h-7 w-7 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-yellow-600">
              <CountUp end={stats.totalProducts} duration={1.2} separator="," />
            </div>
            <div className="text-xs text-gray-400 mt-1">Đang kinh doanh</div>
          </CardContent>
        </Card>
      </div>

      {/* Thống kê danh mục sản phẩm */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        {productCategories.map((category, index) => (
          <Card key={category._id || index} className="shadow-md border-0 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
              <div className="text-lg">{category.icon || '📦'}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                <CountUp end={category.productCount || 0} duration={1} separator="," />
              </div>
              <div className="text-xs text-gray-500 mt-1">Sản phẩm</div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Chọn loại thống kê và biểu đồ bên dưới */}
      <div className="space-y-8">
        <div className="flex gap-4 mb-4 items-end flex-wrap">
          <div className="flex gap-2 flex-wrap items-end">
            <Button
              variant={statType === 'revenue' ? 'default' : 'outline'}
              className={statType === 'revenue' ? 'bg-pink-500 text-white' : ''}
              onClick={() => setStatType('revenue')}
              size="sm"
            >
              <TrendingUp className="w-4 h-4 mr-1" /> Doanh thu
            </Button>
            <Button
              variant={statType === 'top-products' ? 'default' : 'outline'}
              className={statType === 'top-products' ? 'bg-[#38bdf8] text-white' : ''}
              onClick={() => setStatType('top-products')}
              size="sm"
            >
              <BarChartIcon className="w-4 h-4 mr-1" /> Sản phẩm bán chạy
            </Button>
            {statType === 'revenue' && (
              <>
                <Button
                  onClick={handleExportExcel}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-lg shadow flex items-center gap-2"
                  size="sm"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Xuất Excel
                </Button>
                <Button
                  onClick={handleExportPDF}
                  className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-4 py-2 rounded-lg shadow flex items-center gap-2"
                  size="sm"
                >
                  <FileDown className="w-4 h-4" />
                  Xuất PDF
                </Button>
              </>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Kiểu thống kê</label>
              <select
                value={groupBy}
                onChange={e => setGroupBy(e.target.value as 'day' | 'month' | 'year')}
                className="border rounded px-2 py-1"
              >
                <option value="day">Theo ngày</option>
                <option value="month">Theo tháng</option>
                <option value="year">Theo năm</option>
              </select>
            </div>
            {groupBy === 'day' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Từ ngày</label>
                  <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="border rounded px-2 py-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Đến ngày</label>
                  <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="border rounded px-2 py-1" />
                </div>
              </>
            )}
            {groupBy === 'month' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Từ tháng</label>
                  <input type="month" value={fromMonth} onChange={e => setFromMonth(e.target.value)} className="border rounded px-2 py-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Đến tháng</label>
                  <input type="month" value={toMonth} onChange={e => setToMonth(e.target.value)} className="border rounded px-2 py-1" />
                </div>
              </>
            )}
            {groupBy === 'year' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Từ năm</label>
                  <input type="number" value={fromYear} min={2000} max={2100} onChange={e => setFromYear(Number(e.target.value))} className="border rounded px-2 py-1 w-24" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Đến năm</label>
                  <input type="number" value={toYear} min={2000} max={2100} onChange={e => setToYear(Number(e.target.value))} className="border rounded px-2 py-1 w-24" />
                </div>
              </>
            )}
            <Button onClick={fetchStats} className="h-10 bg-pink-500 hover:bg-pink-600 text-white ml-2">Lọc</Button>
          </div>
        </div>
        {/* Main chart area: 2 columns, BarChart left, LineChart right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {/* Biểu đồ cột */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>{statType === 'revenue' ? 'Biểu Đồ Cột Doanh Thu' : 'Biểu Đồ Cột Sản Phẩm Bán Chạy'}</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              {statType === 'revenue' ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.monthlyRevenue} margin={{ top: 50, right: 30, left: 30, bottom: 30 }}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value as number) / 1000}k`} />
                    <Bar dataKey="total" fill="#ec4899" radius={[4, 4, 0, 0]} label={{ position: "top", fill: "#ec4899", fontWeight: 600, formatter: (v: number) => v.toLocaleString() }} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                loadingTop ? (
                  <div className="flex justify-center items-center h-72 text-gray-400">Đang tải...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topProducts} margin={{ top: 50, right: 30, left: 30, bottom: 30 }} layout="vertical">
                      <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#888888" fontSize={13} tickLine={false} axisLine={false} width={120} />
                      <Bar dataKey="sold" fill="#38bdf8" radius={[0, 4, 4, 0]} label={{ position: "right", fill: "#38bdf8", fontWeight: 600, formatter: (v: number) => v.toLocaleString() }} />
                    </BarChart>
                  </ResponsiveContainer>
                )
              )}
            </CardContent>
          </Card>
          {/* Biểu đồ đường */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>{statType === 'revenue' ? 'Biểu Đồ Đường Doanh Thu' : 'Biểu Đồ Đường Sản Phẩm Bán Chạy'}</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              {statType === 'revenue' ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.monthlyRevenue} margin={{ top: 50, right: 30, left: 30, bottom: 30 }}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value as number) / 1000}k`} />
                    <Line type="monotone" dataKey="total" stroke="#38bdf8" strokeWidth={3} dot={{ r: 5, fill: '#38bdf8' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                loadingTop ? (
                  <div className="flex justify-center items-center h-72 text-gray-400">Đang tải...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={topProducts} margin={{ top: 50, right: 30, left: 30, bottom: 30 }} layout="vertical">
                      <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#888888" fontSize={13} tickLine={false} axisLine={false} width={120} />
                      <Line type="monotone" dataKey="sold" stroke="#38bdf8" strokeWidth={3} dot={{ r: 5, fill: '#38bdf8' }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Đơn hàng
function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([])
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const router = useRouter()
  const orderStatusList = [
    'Chờ xác nhận',
    'Đã xác nhận',
    'Đang xử lý',
    'Đang giao hàng',
    'Đã giao hàng',
    'Đã hủy'
  ]
  useEffect(() => {
    instance.get("http://localhost:5000/api/orders/admin/all").then(res => setOrders(res.data))
  }, [])
  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-pink-600">Quản Lý Đơn Hàng</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã Đơn</TableHead>
            <TableHead>Khách Hàng</TableHead>
            <TableHead>Ngày</TableHead>
            <TableHead>Trạng Thái</TableHead>
            <TableHead>Tổng</TableHead>
            <TableHead>Thao Tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order._id}>
              <TableCell>{order._id.slice(-6).toUpperCase()}</TableCell>
              <TableCell>{order.user?.username || order.user?.email || 'Ẩn danh'}</TableCell>
              <TableCell>{formatDateVN(order.createdAt)}</TableCell>
              <TableCell>
                <Select
                  value={order.status}
                  onValueChange={async (value) => {
                    setUpdatingOrderId(order._id)
                    await instance.put(`http://localhost:5000/api/orders/admin/${order._id}/status`, { status: value })
                    const res = await instance.get("http://localhost:5000/api/orders/admin/all")
                    setOrders(res.data)
                    setUpdatingOrderId(null)
                  }}
                  disabled={updatingOrderId === order._id}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatusList.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{order.totalPrice?.toLocaleString()}₫</TableCell>
              <TableCell>
                <Button size="icon" variant="ghost" onClick={() => router.push(`/admin/orders/${order._id}`)}>
                  <Eye />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// Khách hàng
function UsersTab() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  useEffect(() => {
    instance.get("http://localhost:5000/api/auth/users").then(res => setUsers(res.data)).finally(() => setLoading(false))
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
            <TableHead>Ngày sinh</TableHead>
            <TableHead>Giới tính</TableHead>
            <TableHead>Địa chỉ</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Phân loại</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={9} className="text-center">Đang tải...</TableCell></TableRow>
          ) : users.length === 0 ? (
            <TableRow><TableCell colSpan={9} className="text-center">Không có khách hàng nào.</TableCell></TableRow>
          ) : users.map(user => (
            <TableRow key={user._id}>
              <TableCell>{user.fullName || user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>{user.dob ? formatDateVN(user.dob) : ''}</TableCell>
              <TableCell>{user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : 'Khác'}</TableCell>
              <TableCell>{user.addresses && user.addresses.length > 0 ? user.addresses[0].address : ''}</TableCell>
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

// Sản phẩm
function ProductsTab() {
  const [products, setProducts] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const res = await instance.get("http://localhost:5000/api/products");
    setProducts(res.data);
  }

  async function handleDelete(id: string) {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    setDeletingId(id);
    await instance.delete(`http://localhost:5000/api/products/${id}`, { headers });
    await fetchProducts();
    setDeletingId(null);
    setConfirmId(null);
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Quản Lý Sản Phẩm</CardTitle>
            <CardDescription>Thêm, sửa, xóa sản phẩm (Teddy, phụ kiện, bộ sưu tập...)</CardDescription>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" /> Thêm Sản Phẩm
          </Button>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <ProductForm
              onSuccess={() => {
                setShowAddForm(false);
                fetchProducts();
              }}
              onCancel={() => setShowAddForm(false)}
            />
          )}
          {showEditForm && editProduct && (
            <ProductForm
              product={editProduct}
              onSuccess={() => {
                setShowEditForm(false);
                setEditProduct(null);
                fetchProducts();
              }}
              onCancel={() => {
                setShowEditForm(false);
                setEditProduct(null);
              }}
            />
          )}
          <ProductTable
            products={products}
            onEdit={(product: any) => {
              setEditProduct(product);
              setShowEditForm(true);
            }}
            confirmId={confirmId}
            setConfirmId={setConfirmId}
            deletingId={deletingId}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ProductForm({ product, onSuccess, onCancel }: { product?: any, onSuccess: () => void, onCancel: () => void }) {
  const [categories, setCategories] = useState<any[]>([]);
  useEffect(() => {
    instance.get("http://localhost:5000/api/categories").then(res => setCategories(res.data));
  }, []);
  const [form, setForm] = useState<any>({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    image: product?.image || "",
    type: product?.type || "teddy",
    stock: product?.stock || 0,
    categoryId: product?.categoryId || "",
    _id: product?._id,
  });
  const isEdit = !!product;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleImageUploaded = (imageUrl: string) => {
    setForm({ ...form, image: imageUrl });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    if (isEdit) {
      await instance.put(`http://localhost:5000/api/products/${product!._id}`, form, { headers });
    } else {
      await instance.post("http://localhost:5000/api/products", form, { headers });
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6 bg-pink-50 p-4 rounded-xl shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input name="name" value={form.name} onChange={handleChange} placeholder="Tên sản phẩm" required />
        <Input name="price" value={form.price} onChange={handleChange} placeholder="Giá" type="number" required />
      </div>
      <Input name="description" value={form.description} onChange={handleChange} placeholder="Mô tả" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input name="stock" value={form.stock} onChange={handleChange} placeholder="Tồn kho" type="number" min={0} required />
        <select name="categoryId" value={form.categoryId} onChange={handleChange} className="border rounded px-2 py-2 w-full">
          <option value="">Chọn danh mục nhỏ nhất</option>
          {categories.filter((cat:any)=>cat.quantity!==undefined).map((cat:any)=>(
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <ImageUpload 
        onImageUploaded={handleImageUploaded}
        currentImage={form.image}
        folder="products"
      />
      <select name="type" value={form.type} onChange={handleChange} className="border rounded px-2 py-2 w-full">
        <option value="teddy">Teddy</option>
        <option value="accessory">Phụ Kiện</option>
        <option value="collection">Bộ Sưu Tập</option>
        <option value="new">Mới</option>
        <option value="giftbox">Hộp Quà</option>
      </select>
      <div className="flex gap-2 mt-2">
        <Button type="submit">{isEdit ? "Cập nhật" : "Thêm mới"}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Hủy</Button>
      </div>
    </form>
  );
}

function ProductTable({ products, onEdit, onDelete, confirmId, setConfirmId, deletingId }: { products: any[], onEdit: (product: any) => void, onDelete: (id: string) => void, confirmId: string | null, setConfirmId: (id: string | null) => void, deletingId: string | null }) {
  return (
    <div className="overflow-x-auto">
      <Table className="mt-4 bg-white rounded-xl shadow">
        <TableHeader>
          <TableRow>
            <TableHead>Tên</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Giá</TableHead>
            <TableHead>Tồn kho</TableHead>
            <TableHead>Đã bán</TableHead>
            <TableHead>Ảnh</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p._id}>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell>
                {p.type === "teddy" ? "Teddy" : 
                 p.type === "accessory" ? "Phụ kiện" : 
                 p.type === "new" ? "Mới" : 
                 p.type === "giftbox" ? "Hộp quà" :
                 "Bộ sưu tập"}
              </TableCell>
              <TableCell>{p.price}₫</TableCell>
              <TableCell>{p.stock}</TableCell>
              <TableCell>{p.sold || 0}</TableCell>
              <TableCell>
                <img src={p.image} alt={p.name} className="rounded shadow" width={60} height={60} style={{objectFit:'cover'}} />
              </TableCell>
              <TableCell>
                <Button size="icon" variant="ghost" onClick={() => onEdit(p)}><Edit /></Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="ml-2 border border-pink-200 text-pink-500 hover:bg-pink-50 rounded-full"
                      onClick={() => setConfirmId(p._id)}
                      title="Xóa sản phẩm"
                      disabled={deletingId === p._id}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Bạn có chắc chắn muốn xóa sản phẩm này?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Hành động này sẽ xóa sản phẩm vĩnh viễn và không thể khôi phục.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setConfirmId(null)} className="border border-pink-200 text-pink-500 hover:bg-pink-50 rounded px-6 py-2 font-semibold">Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-pink-500 hover:bg-pink-600 text-white rounded px-6 py-2 font-semibold"
                        onClick={() => onDelete(p._id)}
                        disabled={deletingId === p._id}
                      >Xóa</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Danh mục (Kho hàng)
function CategoriesTab() {
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const res = await instance.get("http://localhost:5000/api/categories");
      setCategories(res.data);
      setLoading(false);
    })();
  }, []);

  function getAllDescendantIds(categories: any[], parentId: any): any[] {
    const directChildren = categories.filter((cat: any) => cat.parent === parentId);
    let all = directChildren.map((cat: any) => cat._id);
    for (const child of directChildren) {
      all = all.concat(getAllDescendantIds(categories, child._id));
    }
    return all;
  }
  function getChildren(categories: any[], parentId: any): any[] {
    return categories.filter((cat: any) => cat.parent === parentId);
  }

  const mainCategories = categories.filter((cat: any) => cat.parent === null);
  const options = categories.filter((cat: any) => cat.parent && cat.parent !== null);

  let filteredOptions = options;
  if (categoryFilter !== "all") {
    const descendantIds = getAllDescendantIds(categories, categoryFilter);
    filteredOptions = options.filter((opt: any) =>
      (descendantIds.includes(opt.parent) || opt.parent === categoryFilter) &&
      (opt.name?.toLowerCase().includes(search.toLowerCase()))
    );
  } else {
    filteredOptions = options.filter((opt: any) =>
      opt.name?.toLowerCase().includes(search.toLowerCase())
    );
  }

  async function handleDeleteCategory(id: string) {
    setDeletingId(id);
    await instance.delete(`http://localhost:5000/api/categories/${id}`);
    const res = await instance.get("http://localhost:5000/api/categories");
    setCategories(res.data);
    setDeletingId(null);
    setConfirmId(null);
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Kho phụ kiện</CardTitle>
            <CardDescription>Quản lý toàn bộ phụ kiện, bộ phận, tồn kho, giá, hình ảnh...</CardDescription>
          </div>
          <div className="flex flex-wrap gap-4 mb-4">
            <Input placeholder="Tìm kiếm sản phẩm..." value={search} onChange={e => setSearch(e.target.value)} />
            <select
              className="border rounded px-2 py-1"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="all">Tất cả danh mục</option>
              {mainCategories.map((cat: any) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => router.push('/admin/bulk-update')}>
                Cập nhật hàng loạt
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin/manage-categories')}>
                Quản lý chi tiết
              </Button>
              <Button onClick={() => router.push("/admin/category")}> 
                <Plus className="w-4 h-4 mr-2" /> Thêm danh mục 
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Hiển thị dạng group phân cấp */}
          {mainCategories
            .filter((cat: any) => categoryFilter === "all" || cat._id === categoryFilter)
            .map((parent: any) => (
              <div key={parent._id} className="mb-10 bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-pink-600">{parent.name}</h2>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => router.push(`/admin/edit-product/${parent._id}`)}>
                      <Edit />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="ml-2 border border-pink-200 text-pink-500 hover:bg-pink-50 rounded-full"
                          onClick={() => setConfirmId(parent._id)}
                          title="Xóa danh mục gốc"
                          disabled={deletingId === parent._id}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Bạn có chắc chắn muốn xóa danh mục gốc này?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Hành động này sẽ xóa danh mục gốc và tất cả danh mục con của nó vĩnh viễn.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setConfirmId(null)} className="border border-pink-200 text-pink-500 hover:bg-pink-50 rounded px-6 py-2 font-semibold">Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-pink-500 hover:bg-pink-600 text-white rounded px-6 py-2 font-semibold"
                            onClick={() => handleDeleteCategory(parent._id)}
                            disabled={deletingId === parent._id}
                          >Xóa</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                {/* Lặp qua các con trực tiếp của parent */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {getChildren(categories, parent._id).map((child: any) => (
                    <div key={child._id} className="bg-pink-50 rounded-lg p-4 shadow flex flex-col">
                      <div className="font-semibold text-lg mb-2 text-pink-700">{child.name}</div>
                      {/* Nếu child lại có con, lặp tiếp */}
                      {getChildren(categories, child._id).length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                          {/* Thêm nút xóa cho child (cấp 2) ngay cả khi có con */}
                          <div className="flex items-center gap-3 border rounded p-2 bg-yellow-50">
                            {(child.color || child.hex || child.code || (child.meta && (child.meta.color || child.meta.hex))) ? (
                              <div
                                className="w-10 h-10 rounded-full border shadow"
                                style={{ background: child.color || child.hex || child.code || (child.meta && (child.meta.color || child.meta.hex)) }}
                                title={child.color || child.hex || child.code || (child.meta && (child.meta.color || child.meta.hex))}
                              />
                            ) : (
                              <Image src={child.image || '/placeholder.svg'} alt={child.name} width={48} height={48} className="rounded" />
                            )}
                            <div className="flex-1">
                              <div className="font-medium">{child.name} (Danh mục cha)</div>
                              <div className="text-xs text-gray-500">Giá: {child.price ? child.price + '$' : '---'}</div>
                            </div>
                            <Button size="icon" variant="ghost" onClick={() => router.push(`/admin/edit-category/${child._id}`)}><Edit /></Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="ml-2 border border-pink-200 text-pink-500 hover:bg-pink-50 rounded-full"
                                  onClick={() => setConfirmId(child._id)}
                                  title="Xóa danh mục"
                                  disabled={deletingId === child._id}
                                >
                                  <Trash2 size={18} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Bạn có chắc chắn muốn xóa danh mục này?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Hành động này sẽ xóa danh mục này và tất cả danh mục con của nó vĩnh viễn.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setConfirmId(null)} className="border border-pink-200 text-pink-500 hover:bg-pink-50 rounded px-6 py-2 font-semibold">Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-pink-500 hover:bg-pink-600 text-white rounded px-6 py-2 font-semibold"
                                    onClick={() => handleDeleteCategory(child._id)}
                                    disabled={deletingId === child._id}
                                  >Xóa</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                          {/* Hiển thị các danh mục con (cấp 3) */}
                          {getChildren(categories, child._id).map((grandchild: any) => (
                            <div key={grandchild._id} className="flex items-center gap-3 border rounded p-2 bg-white">
                              {(grandchild.color || grandchild.hex || grandchild.code || (grandchild.meta && (grandchild.meta.color || grandchild.meta.hex))) ? (
                                <div
                                  className="w-10 h-10 rounded-full border shadow"
                                  style={{ background: grandchild.color || grandchild.hex || grandchild.code || (grandchild.meta && (grandchild.meta.color || grandchild.meta.hex)) }}
                                  title={grandchild.color || grandchild.hex || grandchild.code || (grandchild.meta && (grandchild.meta.color || grandchild.meta.hex))}
                                />
                              ) : (
                                <Image src={grandchild.image || '/placeholder.svg'} alt={grandchild.name} width={48} height={48} className="rounded" />
                              )}
                              <div className="flex-1">
                                <div className="font-medium">{grandchild.name}</div>
                                <div className="text-xs text-gray-500">Giá: {grandchild.price ? grandchild.price + '$' : '---'}</div>
                              </div>
                              <Button size="icon" variant="ghost" onClick={() => router.push(`/admin/edit-category/${grandchild._id}`)}><Edit /></Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="ml-2 border border-pink-200 text-pink-500 hover:bg-pink-50 rounded-full"
                                    onClick={() => setConfirmId(grandchild._id)}
                                    title="Xóa danh mục"
                                    disabled={deletingId === grandchild._id}
                                  >
                                    <Trash2 size={18} />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Bạn có chắc chắn muốn xóa danh mục này?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Hành động này sẽ xóa danh mục này vĩnh viễn.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setConfirmId(null)} className="border border-pink-200 text-pink-500 hover:bg-pink-50 rounded px-6 py-2 font-semibold">Hủy</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-pink-500 hover:bg-pink-600 text-white rounded px-6 py-2 font-semibold"
                                      onClick={() => handleDeleteCategory(grandchild._id)}
                                      disabled={deletingId === grandchild._id}
                                    >Xóa</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 border rounded p-2 bg-white">
                          {(child.color || child.hex || child.code || (child.meta && (child.meta.color || child.meta.hex))) ? (
                            <div
                              className="w-10 h-10 rounded-full border shadow"
                              style={{ background: child.color || child.hex || child.code || (child.meta && (child.meta.color || child.meta.hex)) }}
                              title={child.color || child.hex || child.code || (child.meta && (child.meta.color || child.meta.hex))}
                            />
                          ) : (
                            <Image src={child.image || '/placeholder.svg'} alt={child.name} width={48} height={48} className="rounded" />
                          )}
                          <div className="flex-1">
                            <div className="font-medium">{child.name}</div>
                            <div className="text-xs text-gray-500">Giá: {child.price ? child.price + '$' : '---'}</div>
                          </div>
                          <Button size="icon" variant="ghost" onClick={() => router.push(`/admin/edit-category/${child._id}`)}><Edit /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="ml-2 border border-pink-200 text-pink-500 hover:bg-pink-50 rounded-full"
                                onClick={() => setConfirmId(child._id)}
                                title="Xóa danh mục"
                                disabled={deletingId === child._id}
                              >
                                <Trash2 size={18} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Bạn có chắc chắn muốn xóa danh mục này?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Hành động này sẽ xóa danh mục này vĩnh viễn.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setConfirmId(null)} className="border border-pink-200 text-pink-500 hover:bg-pink-50 rounded px-6 py-2 font-semibold">Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-pink-500 hover:bg-pink-600 text-white rounded px-6 py-2 font-semibold"
                                  onClick={() => handleDeleteCategory(child._id)}
                                  disabled={deletingId === child._id}
                                >Xóa</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          {/* Nếu không có danh mục */}
          {mainCategories.length === 0 && (
            <div className="text-center text-gray-500 mt-8">Không có danh mục nào hoặc chưa có dữ liệu.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// GiftBoxTab: Quản lý hộp quà
function GiftBoxTab() {
  const [giftBoxes, setGiftBoxes] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editGiftBox, setEditGiftBox] = useState<any>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGiftBoxes();
  }, []);

  async function fetchGiftBoxes() {
    setLoading(true);
    const res = await fetch("http://localhost:5000/api/giftboxes");
    const data = await res.json();
    setGiftBoxes(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch(`http://localhost:5000/api/giftboxes/${id}`, { method: "DELETE" });
    await fetchGiftBoxes();
    setDeletingId(null);
    setConfirmId(null);
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Quản Lý Hộp Quà</CardTitle>
            <CardDescription>Thêm, sửa, xóa hộp quà tặng cho khách hàng.</CardDescription>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" /> Thêm Hộp Quà
          </Button>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <GiftBoxForm
              onSuccess={() => {
                setShowAddForm(false);
                fetchGiftBoxes();
              }}
              onCancel={() => setShowAddForm(false)}
            />
          )}
          {showEditForm && editGiftBox && (
            <GiftBoxForm
              giftBox={editGiftBox}
              onSuccess={() => {
                setShowEditForm(false);
                setEditGiftBox(null);
                fetchGiftBoxes();
              }}
              onCancel={() => {
                setShowEditForm(false);
                setEditGiftBox(null);
              }}
            />
          )}
          <GiftBoxTable
            giftBoxes={giftBoxes}
            onEdit={(giftBox: any) => {
              setEditGiftBox(giftBox);
              setShowEditForm(true);
            }}
            confirmId={confirmId}
            setConfirmId={setConfirmId}
            deletingId={deletingId}
            onDelete={handleDelete}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function GiftBoxForm({ giftBox, onSuccess, onCancel }: { giftBox?: any, onSuccess: () => void, onCancel: () => void }) {
  const [form, setForm] = useState<any>({
    name: giftBox?.name || "",
    image: giftBox?.image || "",
    price: giftBox?.price || 0,
    quantity: giftBox?.quantity || 0,
    description: giftBox?.description || "",
    _id: giftBox?._id,
  });
  const isEdit = !!giftBox;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      await fetch(`http://localhost:5000/api/giftboxes/${giftBox._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("http://localhost:5000/api/giftboxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    onSuccess();
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6 bg-yellow-50 p-4 rounded-xl shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input name="name" value={form.name} onChange={handleChange} placeholder="Tên hộp quà" required />
        <Input name="price" value={form.price} onChange={handleChange} placeholder="Giá" type="number" required />
      </div>
      <Input name="quantity" value={form.quantity} onChange={handleChange} placeholder="Tồn kho" type="number" min={0} required />
      <ImageUpload
        onImageUploaded={url => setForm({ ...form, image: url })}
        currentImage={form.image}
        folder="giftboxes"
      />
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Mô tả" className="border rounded px-2 py-2 w-full" />
      <div className="flex gap-2 mt-2">
        <Button type="submit">{isEdit ? "Cập nhật" : "Thêm mới"}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Hủy</Button>
      </div>
    </form>
  );
}

function GiftBoxTable({ giftBoxes, onEdit, onDelete, loading, confirmId, setConfirmId, deletingId }: { giftBoxes: any[], onEdit: (giftBox: any) => void, onDelete: (id: string) => void, loading: boolean, confirmId: string | null, setConfirmId: (id: string | null) => void, deletingId: string | null }) {
  return (
    <div className="overflow-x-auto">
      <Table className="mt-4 bg-white rounded-xl shadow">
        <TableHeader>
          <TableRow>
            <TableHead>Tên</TableHead>
            <TableHead>Giá</TableHead>
            <TableHead>Tồn kho</TableHead>
            <TableHead>Ảnh</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={6} className="text-center">Đang tải...</TableCell></TableRow>
          ) : giftBoxes.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="text-center">Không có hộp quà nào.</TableCell></TableRow>
          ) : giftBoxes.map((g) => (
            <TableRow key={g._id}>
              <TableCell className="font-medium">{g.name}</TableCell>
              <TableCell>{g.price}₫</TableCell>
              <TableCell>{g.quantity}</TableCell>
              <TableCell><img src={g.image} alt={g.name} className="rounded shadow" width={60} height={60} style={{ objectFit: 'cover' }} /></TableCell>
              <TableCell>{g.description}</TableCell>
              <TableCell>
                <Button size="icon" variant="ghost" onClick={() => onEdit(g)}><Edit /></Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="ml-2 border border-pink-200 text-pink-500 hover:bg-pink-50 rounded-full"
                      onClick={() => setConfirmId(g._id)}
                      title="Xóa hộp quà"
                      disabled={deletingId === g._id}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Bạn có chắc chắn muốn xóa hộp quà này?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Hành động này sẽ xóa hộp quà vĩnh viễn và không thể khôi phục.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setConfirmId(null)} className="border border-pink-200 text-pink-500 hover:bg-pink-50 rounded px-6 py-2 font-semibold">Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-pink-500 hover:bg-pink-600 text-white rounded px-6 py-2 font-semibold"
                        onClick={() => onDelete(g._id)}
                        disabled={deletingId === g._id}
                      >Xóa</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function AdminPage() {
  const { tab, setTab } = useContext(AdminTabContext)

  const renderTab = () => {
    switch (tab) {
      case "stats":
        return <StatsTab />
      case "orders":
        return <OrdersTab />
      case "users":
        return <UsersTab />
      case "products":
        return <ProductsTab />
      case "categories":
        return <CategoriesTab />
      case "giftboxes":
        return <GiftBoxTab />
      default:
        return <StatsTab />
    }
  }

  return (
    <>
      {renderTab()}
    </>
  );
}