"use client"

import { useState, useEffect, useContext } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Eye, Plus, Edit, Trash2 } from "lucide-react"
import Image from "next/image"
import instance from "@/lib/axiosConfig"
import { useRouter } from "next/navigation"
import ImageUpload from "@/components/ImageUpload"
import { AdminTabContext } from "./layout"

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
              <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
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
              <TableCell>{user.dob ? new Date(user.dob).toLocaleDateString() : ''}</TableCell>
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
  const [products, setProducts] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editProduct, setEditProduct] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    const res = await instance.get("http://localhost:5000/api/products")
    setProducts(res.data)
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
            onEdit={(product: any) => {
              setEditProduct(product)
              setShowEditForm(true)
            }}
            onDelete={async (id: string) => {
              const token = localStorage.getItem("token");
              const headers = { Authorization: `Bearer ${token}` };
              if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
                await instance.delete(`http://localhost:5000/api/products/${id}`, { headers });
                fetchProducts();
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
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
      </select>
      <div className="flex gap-2 mt-2">
        <Button type="submit">{isEdit ? "Cập nhật" : "Thêm mới"}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Hủy</Button>
      </div>
    </form>
  );
}

function ProductTable({ products, onEdit, onDelete }: { products: any[], onEdit: (product: any) => void, onDelete: (id: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <Table className="mt-4 bg-white rounded-xl shadow">
        <TableHeader>
          <TableRow>
            <TableHead>Tên</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Giá</TableHead>
            <TableHead>Tồn kho</TableHead>
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
              <TableCell>{p.stock}</TableCell>
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

// Danh mục (Kho hàng)
function CategoriesTab() {
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    instance.get("http://localhost:5000/api/categories").then(res => setCategories(res.data)).finally(() => setLoading(false))
  }, [])

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

  const mainCategories = categories.filter((cat: any) => cat.parent === null)
  const options = categories.filter((cat: any) => cat.parent && cat.parent !== null)

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
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={async () => {
                        if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục gốc "${parent.name}" và tất cả danh mục con của nó?`)) {
                          await instance.delete(`http://localhost:5000/api/categories/${parent._id}`)
                          const res = await instance.get("http://localhost:5000/api/categories")
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
                  {getChildren(categories, parent._id).map((child: any) => (
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
                            <Button size="icon" variant="ghost" onClick={() => router.push(`/admin/edit-category/${child._id}`)}><Edit /></Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={async () => {
                                if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${child.name}" và tất cả danh mục con của nó?`)) {
                                  await instance.delete(`http://localhost:5000/api/categories/${child._id}`)
                                  const res = await instance.get("http://localhost:5000/api/categories")
                                  setCategories(res.data)
                                }
                              }}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                          {/* Hiển thị các danh mục con (cấp 3) */}
                          {getChildren(categories, child._id).map((grandchild: any) => (
                            <div key={grandchild._id} className="flex items-center gap-3 border rounded p-2 bg-white">
                              <Image src={grandchild.image || '/placeholder.svg'} alt={grandchild.name} width={48} height={48} className="rounded" />
                              <div className="flex-1">
                                <div className="font-medium">{grandchild.name}</div>
                                <div className="text-xs text-gray-500">Giá: {grandchild.price ? grandchild.price + '$' : '---'}</div>
                              </div>
                              <Button size="icon" variant="ghost" onClick={() => router.push(`/admin/edit-category/${grandchild._id}`)}><Edit /></Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={async () => {
                                  if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
                                    await instance.delete(`http://localhost:5000/api/categories/${grandchild._id}`)
                                    const res = await instance.get("http://localhost:5000/api/categories")
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
                          <Button size="icon" variant="ghost" onClick={() => router.push(`/admin/edit-category/${child._id}`)}><Edit /></Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={async () => {
                              if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
                                await instance.delete(`http://localhost:5000/api/categories/${child._id}`)
                                const res = await instance.get("http://localhost:5000/api/categories")
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
    </div>
  )
}

export default function AdminPage() {
  const { tab } = useContext(AdminTabContext);
  return (
    <>
      {tab === "orders" && <OrdersTab />}
      {tab === "users" && <UsersTab />}
      {tab === "products" && <ProductsTab />}
      {tab === "categories" && <CategoriesTab />}
    </>
  );
}