"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // State for form fields
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [image, setImage] = useState("")
  const [stock, setStock] = useState("")

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5000/api/products/${id}`)
        .then(res => {
          const productData = res.data;
          setProduct(productData);
          // Set initial form state
          setName(productData.name || "");
          setDescription(productData.description || "");
          setPrice(productData.price ? String(productData.price) : "");
          setImage(productData.image || "");
          setStock(productData.stock ? String(productData.stock) : "");
        })
        .catch(err => {
          console.error("Failed to fetch product:", err);
          toast.error("Không tìm thấy sản phẩm!");
          setProduct(null);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const updatedData = {
      name,
      description,
      price: price ? Number(price) : undefined,
      image,
      stock: stock ? Number(stock) : undefined,
    };

    try {
      await axios.put(`http://localhost:5000/api/products/${id}`, updatedData);
      toast.success("Cập nhật sản phẩm thành công!");
      router.push("/admin/products");
      router.refresh(); // Làm mới trang admin để thấy thay đổi
    } catch (err) {
      console.error("Failed to update product:", err);
      toast.error("Cập nhật sản phẩm thất bại!");
    }
  };

  if (loading) return <div className="p-8 text-center">Đang tải thông tin sản phẩm...</div>
  if (!product) return <div className="p-8 text-center">Không tìm thấy thông tin sản phẩm.</div>

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Chỉnh Sửa Sản Phẩm</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
        <div>
          <Label htmlFor="name">Tên sản phẩm</Label>
          <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Tên sản phẩm" required />
        </div>
        <div>
          <Label htmlFor="description">Mô tả</Label>
          <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Mô tả chi tiết về sản phẩm" />
        </div>
        <div>
          <Label htmlFor="price">Giá</Label>
          <Input id="price" value={price} onChange={e => setPrice(e.target.value)} placeholder="Giá sản phẩm" type="number" />
        </div>
        <div>
          <Label htmlFor="stock">Tồn kho</Label>
          <Input id="stock" value={stock} onChange={e => setStock(e.target.value)} placeholder="Số lượng tồn kho" type="number" />
        </div>
        <div>
          <Label htmlFor="image">Link ảnh</Label>
          <Input id="image" value={image} onChange={e => setImage(e.target.value)} placeholder="URL hình ảnh sản phẩm" />
          {image && <img src={image} alt="Xem trước" className="mt-4 rounded-md w-32 h-32 object-cover" />}
        </div>
        <div className="flex gap-4 mt-6">
          <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white">Lưu thay đổi</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Hủy</Button>
        </div>
      </form>
    </div>
  )
} 