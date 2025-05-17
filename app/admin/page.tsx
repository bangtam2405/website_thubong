"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Eye, Download, Plus, Search, Trash2, Edit, BarChart3, ShoppingBag, Users, Settings } from "lucide-react"
import Image from "next/image"

// Dữ liệu mẫu cho đơn hàng
const orders = [
  {
    id: "ORD-001",
    customer: "Nguyễn Văn A",
    date: "15/05/2023",
    status: "processing",
    total: 42.99,
    items: 1,
  },
  {
    id: "ORD-002",
    customer: "Trần Thị B",
    date: "14/05/2023",
    status: "shipped",
    total: 89.98,
    items: 2,
  },
  {
    id: "ORD-003",
    customer: "Lê Văn C",
    date: "13/05/2023",
    status: "delivered",
    total: 129.97,
    items: 3,
  },
  {
    id: "ORD-004",
    customer: "Phạm Thị D",
    date: "12/05/2023",
    status: "pending",
    total: 45.99,
    items: 1,
  },
  {
    id: "ORD-005",
    customer: "Hoàng Văn E",
    date: "11/05/2023",
    status: "processing",
    total: 67.5,
    items: 2,
  },
]

// Dữ liệu mẫu cho phụ kiện
const accessories = [
  {
    id: "ACC-001",
    name: "Nơ Cổ",
    category: "Phụ Kiện",
    price: 3.99,
    stock: 45,
    image: "/placeholder.svg?height=50&width=50",
  },
  {
    id: "ACC-002",
    name: "Kính",
    category: "Phụ Kiện",
    price: 4.99,
    stock: 32,
    image: "/placeholder.svg?height=50&width=50",
  },
  {
    id: "ACC-003",
    name: "Mũ",
    category: "Phụ Kiện",
    price: 5.99,
    stock: 28,
    image: "/placeholder.svg?height=50&width=50",
  },
  {
    id: "BODY-001",
    name: "Thân Gấu Truyền Thống",
    category: "Thân",
    price: 12.99,
    stock: 50,
    image: "/placeholder.svg?height=50&width=50",
  },
  {
    id: "BODY-002",
    name: "Thân Thỏ",
    category: "Thân",
    price: 14.99,
    stock: 35,
    image: "/placeholder.svg?height=50&width=50",
  },
]

export default function AdminDashboard() {
  const [searchOrders, setSearchOrders] = useState("")
  const [searchAccessories, setSearchAccessories] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Lọc đơn hàng dựa trên tìm kiếm và trạng thái
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchOrders.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchOrders.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Lọc phụ kiện dựa trên tìm kiếm
  const filteredAccessories = accessories.filter(
    (accessory) =>
      accessory.name.toLowerCase().includes(searchAccessories.toLowerCase()) ||
      accessory.category.toLowerCase().includes(searchAccessories.toLowerCase()),
  )

  // Chuyển đổi trạng thái sang tiếng Việt
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ Xử Lý"
      case "processing":
        return "Đang Xử Lý"
      case "shipped":
        return "Đã Gửi"
      case "delivered":
        return "Đã Giao"
      default:
        return status
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Bảng Điều Khiển Quản Trị</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="bg-pink-100 p-3 rounded-full mb-4">
              <ShoppingBag className="h-8 w-8 text-pink-500" />
            </div>
            <CardTitle className="text-xl mb-1">Đơn Hàng</CardTitle>
            <p className="text-3xl font-bold">{orders.length}</p>
            <p className="text-sm text-gray-500">Tổng Đơn Hàng</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="bg-blue-100 p-3 rounded-full mb-4">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <CardTitle className="text-xl mb-1">Khách Hàng</CardTitle>
            <p className="text-3xl font-bold">120</p>
            <p className="text-sm text-gray-500">Người Dùng Đã Đăng Ký</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="bg-green-100 p-3 rounded-full mb-4">
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-xl mb-1">Doanh Thu</CardTitle>
            <p className="text-3xl font-bold">4,289$</p>
            <p className="text-sm text-gray-500">Tháng Này</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="bg-yellow-100 p-3 rounded-full mb-4">
              <Settings className="h-8 w-8 text-yellow-500" />
            </div>
            <CardTitle className="text-xl mb-1">Kho Hàng</CardTitle>
            <p className="text-3xl font-bold">{accessories.length}</p>
            <p className="text-sm text-gray-500">Mặt Hàng Trong Kho</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders">
        <TabsList className="mb-6">
          <TabsTrigger value="orders">Đơn Hàng</TabsTrigger>
          <TabsTrigger value="inventory">Kho Hàng</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Quản Lý Đơn Hàng</CardTitle>
              <CardDescription>Xem và quản lý đơn hàng của khách hàng</CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Tìm kiếm đơn hàng..."
                    className="pl-8"
                    value={searchOrders}
                    onChange={(e) => setSearchOrders(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Lọc theo trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất Cả Trạng Thái</SelectItem>
                    <SelectItem value="pending">Chờ Xử Lý</SelectItem>
                    <SelectItem value="processing">Đang Xử Lý</SelectItem>
                    <SelectItem value="shipped">Đã Gửi</SelectItem>
                    <SelectItem value="delivered">Đã Giao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã Đơn Hàng</TableHead>
                    <TableHead>Khách Hàng</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Trạng Thái</TableHead>
                    <TableHead>Số Lượng</TableHead>
                    <TableHead className="text-right">Tổng Tiền</TableHead>
                    <TableHead className="text-right">Thao Tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            order.status === "delivered"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : order.status === "shipped"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                : order.status === "processing"
                                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                          }
                        >
                          {getStatusText(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.items}</TableCell>
                      <TableCell className="text-right">{order.total.toFixed(2)}$</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Quản Lý Kho Hàng</CardTitle>
              <CardDescription>Quản lý phụ kiện, thân và các thành phần khác</CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Tìm kiếm kho hàng..."
                    className="pl-8"
                    value={searchAccessories}
                    onChange={(e) => setSearchAccessories(e.target.value)}
                  />
                </div>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm Mặt Hàng Mới
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hình Ảnh</TableHead>
                    <TableHead>Mã</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead>Danh Mục</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Tồn Kho</TableHead>
                    <TableHead className="text-right">Thao Tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccessories.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="rounded-md"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.price.toFixed(2)}$</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            item.stock > 30
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : item.stock > 10
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                : "bg-red-100 text-red-800 hover:bg-red-100"
                          }
                        >
                          {item.stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
