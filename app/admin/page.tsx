"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Eye, Download, Plus, Search, Trash2, Edit, BarChart3, ShoppingBag, Users, Settings } from "lucide-react"
import Image from "next/image"
import axios from "axios"
import { useRouter } from "next/navigation"
import ImageUpload from "@/components/ImageUpload"

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
    id: "BODY-002",
    name: "Thân Thỏ",
    category: "Thân",
    price: 14.99,
    stock: 35,
    image: "/placeholder.svg?height=50&width=50",
  },
]

// Hàm lấy tất cả _id con/cháu của 1 danh mục cha
function getAllDescendantIds(categories: any[], parentId: any): any[] {
  const directChildren = categories.filter((cat: any) => cat.parent === parentId);
  let all = directChildren.map((cat: any) => cat._id);
  for (const child of directChildren) {
    all = all.concat(getAllDescendantIds(categories, child._id));
  }
  return all;
}

// Hàm lấy các con trực tiếp của 1 parent
function getChildren(categories: any[], parentId: any): any[] {
  return categories.filter((cat: any) => cat.parent === parentId);
}

type Product = {
  _id?: string;
  name: string;
  description?: string;
  price: number | string;
  image?: string;
  type: string;
};

type ProductFormProps = {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
};

type ProductTableProps = {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
};

export default function AdminDashboard() {
  const [categories, setCategories] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)

  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:5000/api/products")
    setProducts(res.data)
  }

  useEffect(() => {
    axios.get("http://localhost:5000/api/categories").then(res => setCategories(res.data))
    axios.get("http://localhost:5000/api/orders").then(res => setOrders(res.data))
    fetchProducts()
  }, [])

  const mainCategories = categories.filter(cat => cat.parent === null)
  const options = categories.filter(cat => cat.parent && cat.parent !== null)

  let filteredOptions = options;
  if (categoryFilter !== "all") {
    const descendantIds = getAllDescendantIds(categories, categoryFilter);
    filteredOptions = options.filter(opt =>
      (descendantIds.includes(opt.parent) || opt.parent === categoryFilter) &&
      (opt.name?.toLowerCase().includes(search.toLowerCase()))
    );
  } else {
    filteredOptions = options.filter(opt =>
      opt.name?.toLowerCase().includes(search.toLowerCase())
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Bảng Điều Khiển Quản Trị</h1>
      <Tabs defaultValue="inventory">
        <TabsList className="mb-6 flex gap-2">
          <TabsTrigger value="orders">Đơn Hàng</TabsTrigger>
          <TabsTrigger value="inventory">Kho Hàng</TabsTrigger>
          <TabsTrigger value="products">Sản Phẩm</TabsTrigger>
          <TabsTrigger value="categories">Danh Mục</TabsTrigger>
        </TabsList>

        {/* Đơn Hàng */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Quản Lý Đơn Hàng</CardTitle>
              <CardDescription>Xem, cập nhật trạng thái, xem chi tiết thiết kế</CardDescription>
            </CardHeader>
            <CardContent>
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
                      <TableCell>{order.code}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>
                        <Badge>{order.status}</Badge>
                      </TableCell>
                      <TableCell>{order.total}$</TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" onClick={() => {/* Xem chi tiết */}}><Edit /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Kho Hàng */}
        <TabsContent value="inventory">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Kho Hàng</CardTitle>
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
                  {mainCategories.map(cat => (
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
                .filter(cat => categoryFilter === "all" || cat._id === categoryFilter)
                .map(parent => (
                  <div key={parent._id} className="mb-10 bg-white rounded-xl shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-pink-600">{parent.name}</h2>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => router.push(`/admin/edit-product/${parent._id}`)}>
                          <Edit />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={async () => {
                            if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục gốc "${parent.name}" và tất cả danh mục con của nó?`)) {
                              await axios.delete(`http://localhost:5000/api/categories/${parent._id}`)
                              const res = await axios.get("http://localhost:5000/api/categories")
                              setCategories(res.data)
                            }
                          }}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                    {/* Lặp qua các con trực tiếp của parent */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {getChildren(categories, parent._id).map(child => (
                        <div key={child._id} className="bg-pink-50 rounded-lg p-4 shadow flex flex-col">
                          <div className="font-semibold text-lg mb-2 text-pink-700">{child.name}</div>
                          {/* Nếu child lại có con, lặp tiếp */}
                          {getChildren(categories, child._id).length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                              {/* Thêm nút xóa cho child (cấp 2) ngay cả khi có con */}
                              <div className="flex items-center gap-3 border rounded p-2 bg-yellow-50">
                                <Image src={child.image || '/placeholder.svg'} alt={child.name} width={48} height={48} className="rounded" />
                                <div className="flex-1">
                                  <div className="font-medium">{child.name} (Danh mục cha)</div>
                                  <div className="text-xs text-gray-500">Giá: {child.price ? child.price + '$' : '---'}</div>
                                </div>
                                <Button size="icon" variant="ghost" onClick={() => router.push(`/admin/edit-product/${child._id}`)}><Edit /></Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={async () => {
                                    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${child.name}" và tất cả danh mục con của nó?`)) {
                                      await axios.delete(`http://localhost:5000/api/categories/${child._id}`)
                                      const res = await axios.get("http://localhost:5000/api/categories")
                                      setCategories(res.data)
                                    }
                                  }}
                                >
                                  <Trash2 />
                                </Button>
                              </div>
                              
                              {/* Hiển thị các danh mục con (cấp 3) */}
                              {getChildren(categories, child._id).map(grandchild => (
                                <div key={grandchild._id} className="flex items-center gap-3 border rounded p-2 bg-white">
                                  <Image src={grandchild.image || '/placeholder.svg'} alt={grandchild.name} width={48} height={48} className="rounded" />
                                  <div className="flex-1">
                                    <div className="font-medium">{grandchild.name}</div>
                                    <div className="text-xs text-gray-500">Giá: {grandchild.price ? grandchild.price + '$' : '---'}</div>
                                  </div>
                                  <Button size="icon" variant="ghost" onClick={() => router.push(`/admin/edit-product/${grandchild._id}`)}><Edit /></Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={async () => {
                                      if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
                                        await axios.delete(`http://localhost:5000/api/categories/${grandchild._id}`)
                                        const res = await axios.get("http://localhost:5000/api/categories")
                                        setCategories(res.data)
                                      }
                                    }}
                                  >
                                    <Trash2 />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 border rounded p-2 bg-white">
                              <Image src={child.image || '/placeholder.svg'} alt={child.name} width={48} height={48} className="rounded" />
                              <div className="flex-1">
                                <div className="font-medium">{child.name}</div>
                                <div className="text-xs text-gray-500">Giá: {child.price ? child.price + '$' : '---'}</div>
                              </div>
                              <Button size="icon" variant="ghost" onClick={() => router.push(`/admin/edit-product/${child._id}`)}><Edit /></Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={async () => {
                                  if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
                                    await axios.delete(`http://localhost:5000/api/categories/${child._id}`)
                                    const res = await axios.get("http://localhost:5000/api/categories")
                                    setCategories(res.data)
                                  }
                                }}
                              >
                                <Trash2 />
                              </Button>
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
        </TabsContent>

        {/* Sản Phẩm */}
        <TabsContent value="products">
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
                    setShowAddForm(false)
                    fetchProducts()
                  }}
                  onCancel={() => setShowAddForm(false)}
                />
              )}
              {showEditForm && editProduct && (
                <ProductForm
                  product={editProduct}
                  onSuccess={() => {
                    setShowEditForm(false)
                    setEditProduct(null)
                    fetchProducts()
                  }}
                  onCancel={() => {
                    setShowEditForm(false)
                    setEditProduct(null)
                  }}
                />
              )}
              <ProductTable
                products={products}
                onEdit={(product: Product) => {
                  setEditProduct(product)
                  setShowEditForm(true)
                }}
                onDelete={async (id: string) => {
                  const token = localStorage.getItem("token");
                  const headers = { Authorization: `Bearer ${token}` };
                  if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
                    await axios.delete(`http://localhost:5000/api/products/${id}`, { headers });
                    fetchProducts();
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danh Mục */}
        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Quản Lý Danh Mục</CardTitle>
                <CardDescription>Thêm, sửa, xóa danh mục (Body, Ears, Eyes, Clothing, Accessory...)</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.push('/admin/bulk-update')}>
                  Cập nhật hàng loạt
                </Button>
                <Button onClick={() => router.push('/admin/category')}>
                  <Plus className="w-4 h-4 mr-2" /> Thêm Danh Mục
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Danh mục content */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [form, setForm] = useState<Product>({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    image: product?.image || "",
    type: product?.type || "teddy",
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
      await axios.put(`http://localhost:5000/api/products/${product!._id}`, form, { headers });
    } else {
      await axios.post("http://localhost:5000/api/products", form, { headers });
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
      </select>
      <div className="flex gap-2 mt-2">
        <Button type="submit">{isEdit ? "Cập nhật" : "Thêm mới"}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Hủy</Button>
      </div>
    </form>
  );
}

function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table className="mt-4 bg-white rounded-xl shadow">
        <TableHeader>
          <TableRow>
            <TableHead>Tên</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Giá</TableHead>
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
                 "Bộ sưu tập"}
              </TableCell>
              <TableCell>{p.price}₫</TableCell>
              <TableCell>
                <img src={p.image} alt={p.name} className="rounded shadow" width={60} height={60} style={{objectFit:'cover'}} />
              </TableCell>
              <TableCell>
                <Button size="icon" variant="ghost" onClick={() => onEdit(p)}><Edit /></Button>
                <Button size="icon" variant="ghost" onClick={() => onDelete(p._id!)}><Trash2 /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
