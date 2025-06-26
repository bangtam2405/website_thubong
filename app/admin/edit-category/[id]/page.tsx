"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import ImageUpload from "@/components/ImageUpload"

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [category, setCategory] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // State for form fields
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [image, setImage] = useState("")
  const [parentCategory, setParentCategory] = useState<any>(null)

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5000/api/categories/${id}`)
        .then(async res => {
          const categoryData = res.data;
          setCategory(categoryData);
          setName(categoryData.name || "");
          setPrice(categoryData.price ? String(categoryData.price) : "");
          setImage(categoryData.image || "");
          // Nếu có parent thì fetch parent
          if (categoryData.parent) {
            try {
              const parentRes = await axios.get(`http://localhost:5000/api/categories/${categoryData.parent}`);
              setParentCategory(parentRes.data);
            } catch (err) {
              setParentCategory(null);
            }
          } else {
            setParentCategory(null);
          }
        })
        .catch(err => {
          console.error("Failed to fetch category:", err);
          toast.error("Không tìm thấy mục này!");
          setCategory(null);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleImageUploaded = (imageUrl: string) => {
    setImage(imageUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;

    const updatedData = {
      name,
      price: price ? Number(price) : undefined,
      image,
    };

    try {
      await axios.put(`http://localhost:5000/api/categories/${id}`, updatedData);
      toast.success("Cập nhật thành công!");
      router.push("/admin?tab=categories");
      router.refresh();
    } catch (err) {
      console.error("Failed to update category:", err);
      toast.error("Cập nhật thất bại!");
    }
  };

  if (loading) return <div className="p-8 text-center">Đang tải...</div>
  if (!category) return <div className="p-8 text-center">Không tìm thấy mục cần sửa.</div>

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Chỉnh Sửa Bộ phận / Phụ kiện</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
        <div>
          <Label htmlFor="name">Tên</Label>
          <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Tên bộ phận/phụ kiện" required />
        </div>
        <div>
          <Label htmlFor="price">Giá</Label>
          <Input id="price" value={price} onChange={e => setPrice(e.target.value)} placeholder="Giá (nếu có)" type="number" />
        </div>
        <div>
          {parentCategory && parentCategory.name === "Màu Lông" ? (
            <>
              <Label htmlFor="colorHex">Mã màu lông (Hex)</Label>
              <Input
                id="colorHex"
                value={image}
                onChange={e => setImage(e.target.value)}
                placeholder="#E6BEA5"
                maxLength={7}
              />
              <div className="w-10 h-10 mt-2 rounded border" style={{ background: image || '#fff' }} />
            </>
          ) : (
            <ImageUpload onImageUploaded={handleImageUploaded} currentImage={image} />
          )}
        </div>
        <div className="flex gap-4 mt-6">
          <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white">Lưu thay đổi</Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin?tab=categories')}>Hủy</Button>
        </div>
      </form>
    </div>
  )
}
