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

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editProduct, setEditProduct] = useState<any>(null)
  const router = useRouter()
  const [search, setSearch] = useState("");

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
    size: product?.specifications?.size || "28cm",
    color: product?.specifications?.color || "Hồng",
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
            <TableHead>Đã bán</TableHead>
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
              <TableCell>{Number(p.price).toLocaleString('vi-VN')}₫</TableCell>
              <TableCell>{p.stock}</TableCell>
              <TableCell>
                {p.image ? (
                  <img src={p.image} alt={p.name} className="rounded shadow border-2 border-green-400" width={60} height={60} style={{objectFit:'cover'}} />
                ) : (
                  <span className="text-gray-400 italic">Chưa có ảnh</span>
                )}
              </TableCell>
              <TableCell>{p.sold || 0}</TableCell>
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