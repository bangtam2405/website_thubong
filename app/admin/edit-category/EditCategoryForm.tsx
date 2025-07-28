"use client"
import { useEffect, useState } from "react"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import ImageUpload from "@/components/ImageUpload"

export default function EditCategoryForm({ id, onCancel }: { id: string, onCancel: () => void }) {
  const [category, setCategory] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [imported, setImported] = useState("")
  const [sold, setSold] = useState("")
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
          setImported(categoryData.imported ? String(categoryData.imported) : "0");
          setSold(categoryData.sold ? String(categoryData.sold) : "0");
          setImage(categoryData.image || "");
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
      imported: imported ? Number(imported) : 0,
      sold: sold ? Number(sold) : 0,
      image,
    };
    try {
      await axios.put(`http://localhost:5000/api/categories/${id}`, updatedData);
      toast.success("Cập nhật thành công!");
      if (onCancel) onCancel();
    } catch (err) {
      toast.error("Cập nhật thất bại!");
    }
  };

  // Tính toán tồn kho
  const currentStock = (Number(imported) || 0) - (Number(sold) || 0);

  if (loading) return <div className="p-8 text-center">Đang tải...</div>
  if (!category) return <div className="p-8 text-center">Không tìm thấy mục cần sửa.</div>

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Tên</Label>
        <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Tên bộ phận/phụ kiện" required />
      </div>
      <div>
        <Label htmlFor="price">Giá</Label>
        <Input id="price" value={price} onChange={e => setPrice(e.target.value)} placeholder="Giá (nếu có)" type="number" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="imported">Tổng nhập</Label>
          <Input 
            id="imported" 
            value={imported} 
            onChange={e => setImported(e.target.value)} 
            placeholder="0" 
            type="number" 
            min="0"
          />
        </div>
        <div>
          <Label htmlFor="sold">Đã bán</Label>
          <Input 
            id="sold" 
            value={sold} 
            onChange={e => setSold(e.target.value)} 
            placeholder="0" 
            type="number" 
            min="0"
          />
        </div>
        <div>
          <Label htmlFor="stock">Tồn kho (tự động)</Label>
          <Input 
            id="stock" 
            value={currentStock} 
            placeholder="0" 
            type="number" 
            disabled
            className="bg-gray-100"
          />
        </div>
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
      <div className="pt-4 flex gap-2">
        <button
          type="submit"
          className="bg-black hover:bg-gray-900 text-white font-semibold px-6 py-2 rounded-lg shadow"
        >
          Lưu thay đổi
        </button>
        <button
          type="button"
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-lg shadow"
          onClick={onCancel}
        >
          Hủy
        </button>
      </div>
    </form>
  );
} 