"use client"

import { useState, useEffect, useContext } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Eye, Plus, Edit, Trash2, LineChart, Users, ShoppingCart, DollarSign, Package } from "lucide-react"
import Image from "next/image"
import instance from "@/lib/axiosConfig"
import { useRouter } from "next/navigation"
import ImageUpload from "@/components/ImageUpload"
import { AdminTabContext } from "./layout"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
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
  // Mặc định: từ ngày này tháng trước đến ngày hiện tại
  function getDefaultFromDate() {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  }
  function getDefaultToDate() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }
  const [fromDate, setFromDate] = useState<string>(getDefaultFromDate());
  const [toDate, setToDate] = useState<string>(getDefaultToDate());

  const fetchStats = () => {
    setLoading(true);
    instance.get("/api/admin/stats", {
      params: {
        from: fromDate || undefined,
        to: toDate || undefined
      }
    })
      .then(res => {
        const now = toDate ? new Date(toDate) : new Date();
        const months: MonthRevenue[] = [];
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          months.push({
            name: `Thg ${d.getMonth() + 1}/${d.getFullYear()}`,
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            total: 0,
          });
        }
        (res.data.monthlyRevenue as { _id: { year: number, month: number }, total: number }[]).forEach((item) => {
          const idx = months.findIndex(
            m => m.year === item._id.year && m.month === item._id.month
          );
          if (idx !== -1) months[idx].total = item.total;
        });
        setStats({ ...res.data, monthlyRevenue: months });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line
  }, []);

  if (loading) return <div>Đang tải dữ liệu thống kê...</div>;
  if (!stats) return <div>Không có dữ liệu.</div>;

  return (
    <div className="space-y-8">
      <div className="flex gap-4 mb-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Từ ngày</label>
          <input type="date" value={fromDate || getDefaultFromDate()} onChange={e => setFromDate(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Đến ngày</label>
          <input type="date" value={toDate || getDefaultToDate()} onChange={e => setToDate(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <Button onClick={fetchStats} className="h-10">Lọc</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Doanh Thu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()}₫</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Khách Hàng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.totalCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Đơn Hàng</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Sản Phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Doanh Thu 12 Tháng Gần Nhất</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats.monthlyRevenue}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value as number) / 1000}k`} />
                <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Đơn Hàng Gần Đây</CardTitle>
            <CardDescription>
              5 đơn hàng mới nhất.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Khách Hàng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Tổng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentOrders.map((order: any) => (
                    <TableRow key={order._id}>
                      <TableCell>
                        <div className="font-medium">{order.user?.username || 'N/A'}</div>
                        <div className="hidden text-sm text-muted-foreground md:inline">
                          {order.user?.email}
                        </div>
                      </TableCell>
                      <TableCell><Badge>{order.status}</Badge></TableCell>
                      <TableCell>{order.totalPrice.toLocaleString()}₫</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </CardContent>
        </Card>
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