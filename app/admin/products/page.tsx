"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Search } from "lucide-react"
import instance from "@/lib/axiosConfig"
import ImageUpload from "@/components/ImageUpload"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editProduct, setEditProduct] = useState<any>(null)
  const router = useRouter()
  const [search, setSearch] = useState("");
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    const res = await instance.get("http://localhost:5000/api/products")
    setProducts(res.data)
  }

  const filteredProducts = products.filter(p => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return (
      (p.name && p.name.toLowerCase().includes(s)) ||
      (p.type && p.type.toLowerCase().includes(s)) ||
      (p.description && p.description.toLowerCase().includes(s))
    );
  });

  // Tính toán thống kê
  const stats = {
    totalProducts: filteredProducts.length,
    totalStock: filteredProducts.reduce((sum, p) => sum + (p.stock || 0), 0),
    totalSold: filteredProducts.reduce((sum, p) => sum + (p.sold || 0), 0),
    lowStock: filteredProducts.filter(p => (p.stock || 0) <= 5).length,
    outOfStock: filteredProducts.filter(p => (p.stock || 0) === 0).length
  };

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
          {/* Thống kê tổng quan */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{stats.totalProducts}</div>
              <div className="text-sm text-blue-600">Tổng sản phẩm</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{stats.totalStock}</div>
              <div className="text-sm text-green-600">Tồn kho</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{stats.totalSold}</div>
              <div className="text-sm text-purple-600">Đã bán</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
              <div className="text-sm text-yellow-600">Sắp hết</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
              <div className="text-sm text-red-600">Hết hàng</div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="relative w-full max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-200 outline-none w-full"
                placeholder="Tìm kiếm tên, loại sản phẩm"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
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
            products={filteredProducts}
            onEdit={(product: any) => {
              setEditProduct(product)
              setShowEditForm(true)
            }}
            onDelete={async (id: string) => {
              setDeleteProductId(id);
              setShowDeleteConfirm(true);
            }}
          />
        </CardContent>
      </Card>
      
      {/* Modal xác nhận xóa sản phẩm */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Xóa sản phẩm"
        description="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={async () => {
          if (!deleteProductId) return;
          
          const token = localStorage.getItem("token");
          const headers = { Authorization: `Bearer ${token}` };
          
          try {
            await instance.delete(`http://localhost:5000/api/products/${deleteProductId}`, { headers });
            await fetchProducts();
            toast.success("Đã xóa sản phẩm thành công!");
          } catch (err: any) {
            toast.error("Xóa sản phẩm thất bại!");
          } finally {
            setShowDeleteConfirm(false);
            setDeleteProductId(null);
          }
        }}
        variant="destructive"
      />
    </div>
  )
}

function ProductForm({ product, onSuccess, onCancel }: { product?: any, onSuccess: () => void, onCancel: () => void }) {
  const [productCategories, setProductCategories] = useState<any[]>([]);
  useEffect(() => {
    // Lấy danh mục sản phẩm từ API mới
    instance.get("http://localhost:5000/api/product-categories/admin")
      .then(res => setProductCategories(res.data))
      .catch(err => {
        console.error("Lỗi khi tải danh mục sản phẩm:", err);
        // Fallback về danh mục cũ nếu API mới chưa có
        setProductCategories([
          { name: "Teddy", type: "teddy" },
          { name: "Phụ Kiện", type: "accessory" },
          { name: "Bộ Sưu Tập", type: "collection" },
          { name: "Hàng Mới", type: "new" },
          { name: "Hộp Quà", type: "giftbox" }
        ]);
      });
  }, []);
  const [form, setForm] = useState<any>({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    image: product?.image || "",
    type: product?.type || "teddy",
    stock: product?.stock || 0,
    size: product?.specifications?.size || "28cm",
    color: product?.specifications?.color || "Hồng",
    customizeLink: product?.customizeLink || "",
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
    // Ép kiểu stock về number, truyền specifications.size và color
    const submitForm = {
      ...form,
      stock: Number(form.stock),
      specifications: { size: form.size, color: form.color },
    };
    if (isEdit) {
      await instance.put(`http://localhost:5000/api/products/${product!._id}`, submitForm, { headers });
    } else {
      await instance.post("http://localhost:5000/api/products", submitForm, { headers });
    }
    onSuccess();
  };
  const [imageError, setImageError] = useState("");

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6 bg-pink-50 p-4 rounded-xl shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input name="name" value={form.name} onChange={handleChange} placeholder="Tên sản phẩm" required />
        <Input name="price" value={form.price} onChange={handleChange} placeholder="Giá" type="number" required />
      </div>
      <Input name="description" value={form.description} onChange={handleChange} placeholder="Mô tả" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input name="stock" value={form.stock} onChange={handleChange} placeholder="Tồn kho" type="number" min={0} required />
        <div className="flex gap-2">
          <select name="size" value={form.size} onChange={handleChange} className="border rounded px-2 py-2 w-1/2">
            <option value="28cm">28cm</option>
            <option value="40cm">40cm</option>
            <option value="60cm">60cm</option>
            <option value="80cm">80cm</option>
          </select>
          <select name="color" value={form.color} onChange={handleChange} className="border rounded px-2 py-2 w-1/2">
            <option value="Hồng">Hồng</option>
            <option value="Xanh">Xanh</option>
            <option value="Xanh bơ">Xanh bơ</option>
            <option value="Xám">Xám</option>
            <option value="Trắng">Trắng</option>
            <option value="Nâu">Nâu</option>
            <option value="Đen">Đen</option>
            <option value="Trắng Đen">Trắng Đen</option>
            <option value="Cam">Cam</option>
            <option value="Vàng">Vàng</option>
            <option value="Đỏ">Đỏ</option>
            <option value="Tím">Tím</option>
          </select>
        </div>
      </div>
      <ImageUpload 
        onImageUploaded={handleImageUploaded}
        currentImage={form.image}
        folder="products"
        onError={setImageError}
      />
      {imageError && (
        <div className="text-red-600 text-sm mt-1">{imageError}</div>
      )}
      {form.image && (
        <div className="text-green-600 text-sm mt-1">
          Ảnh đã chọn: {form.image.split('/').pop()}
        </div>
      )}
      <select name="type" value={form.type} onChange={handleChange} className="border rounded px-2 py-2 w-full">
        {productCategories.length > 0 ? (
          productCategories.map(category => (
            <option key={category._id} value={category.type}>{category.name}</option>
          ))
        ) : (
          <option value="">Không có danh mục nào</option>
        )}
      </select>
      {productCategories.length === 0 && (
        <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
          💡 Chưa có danh mục sản phẩm. Vui lòng tạo danh mục tại 
          <a href="/admin/product-categories" className="text-blue-600 underline ml-1">
            Quản lý danh mục sản phẩm
          </a>
        </div>
      )}
      <Input 
        name="customizeLink" 
        value={form.customizeLink} 
        onChange={handleChange} 
        placeholder="Link mẫu thiết kế (VD: /customize?edit=68874d8c490eca1da4d7aacb)" 
      />
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
          <TableRow className="bg-gray-50">
            <TableHead className="w-48 font-semibold">Tên sản phẩm</TableHead>
            <TableHead className="font-semibold">Loại</TableHead>
            <TableHead className="font-semibold">Giá</TableHead>
            <TableHead className="text-center font-semibold">Nhập về</TableHead>
            <TableHead className="text-center font-semibold">Đã bán</TableHead>
            <TableHead className="text-center font-semibold">Còn lại</TableHead>
            <TableHead className="font-semibold">Ảnh</TableHead>
            <TableHead className="font-semibold">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => {
            const totalImported = p.stock + (p.sold || 0);
            const remaining = p.stock;
            const sold = p.sold || 0;
            
            // Xác định trạng thái tồn kho
            let stockStatus = '';
            let stockColor = '';
            if (remaining === 0) {
              stockStatus = 'Hết hàng';
              stockColor = 'bg-red-100 text-red-800';
            } else if (remaining <= 5) {
              stockStatus = 'Sắp hết';
              stockColor = 'bg-orange-100 text-orange-800';
            } else if (remaining <= 10) {
              stockStatus = 'Còn ít';
              stockColor = 'bg-yellow-100 text-yellow-800';
            } else {
              stockStatus = 'Còn nhiều';
              stockColor = 'bg-green-100 text-green-800';
            }
            
            return (
              <TableRow key={p._id} className="hover:bg-gray-50">
                <TableCell className="font-medium max-w-48 truncate" title={p.name}>
                  <div className="flex flex-col">
                    <span className="truncate">{p.name}</span>
                    {p.specifications && (
                      <span className="text-xs text-gray-500">
                        {p.specifications.size} - {p.specifications.color}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    p.type === "teddy" ? "bg-pink-100 text-pink-800" :
                    p.type === "accessory" ? "bg-blue-100 text-blue-800" :
                    p.type === "new" ? "bg-green-100 text-green-800" :
                    p.type === "giftbox" ? "bg-purple-100 text-purple-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {p.type === "teddy" ? "Teddy" : 
                     p.type === "accessory" ? "Phụ kiện" : 
                     p.type === "new" ? "Mới" : 
                     p.type === "giftbox" ? "Hộp quà" :
                     "Bộ sưu tập"}
                  </span>
                </TableCell>
                <TableCell className="font-semibold">{Number(p.price).toLocaleString('vi-VN')}₫</TableCell>
                <TableCell className="text-center">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium" title="Tổng số lượng đã nhập">
                    {totalImported}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium" title="Số lượng đã bán">
                    {sold}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${stockColor}`} title={stockStatus}>
                    {remaining}
                  </span>
                </TableCell>
                <TableCell>
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="rounded shadow border-2 border-green-400" width={60} height={60} style={{objectFit:'cover'}} />
                  ) : (
                    <span className="text-gray-400 italic text-sm">Chưa có ảnh</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => onEdit(p)} title="Chỉnh sửa">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => onDelete(p._id!)} title="Xóa">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {products.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Không có sản phẩm nào được tìm thấy
        </div>
      )}
    </div>
  );
} 