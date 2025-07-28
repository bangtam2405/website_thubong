"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Star, ShoppingCart } from "lucide-react"
import axios from "axios"
import { AddToCartButton } from "@/components/AddToCartButton"
import { Product } from "@/types/product"
import { Design } from "@/types/design";
import { useRouter } from "next/navigation";

function calculateDesignPrice(item: any): number | null {
  if (item.parts && Array.isArray(item.parts) && item.parts.length > 0) {
    const total = item.parts.reduce((sum: number, part: any) => sum + (typeof part.price === 'number' ? part.price : 0), 0);
    if (total > 0) return total;
  }
  if (typeof item.price === 'number' && item.price > 0) return item.price;
  return null;
}

export default function NewProductsPage() {
  const [designTemplates, setDesignTemplates] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserId(localStorage.getItem('userId'));
    }
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/designs?userId=admin")
      .then(res => res.json())
      .then(data => setDesignTemplates(data))
      .catch(() => setDesignTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  const handleClone = async (id: string) => {
    if (!userId) {
      alert("Vui lòng đăng nhập để sao chép và chỉnh sửa thiết kế này!");
      return;
    }
    setLoadingId(id);
    try {
      const res = await fetch(`/api/designs/${id}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = `/customize?edit=${data.id}`;
      } else {
        alert(data.message || "Tạo bản sao thất bại.");
      }
    } catch (error) {
      alert("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Mẫu Thiết Kế</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Hãy cùng tham khảo các mẫu thiết có sẳn để thỏa thích sáng tạo
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading && (
          <div className="col-span-full text-center text-gray-400">Đang tải dữ liệu...</div>
        )}
        {!loading && designTemplates.length === 0 && (
          <div className="col-span-full text-center text-gray-400">Chưa có mẫu thiết kế sẵn nào.</div>
        )}
        {designTemplates.map((item) => (
          <Card key={item._id} className="overflow-hidden group">
            <div className="relative">
              <div className="aspect-square overflow-hidden">
                <Image
                  src={item.previewImage || "/placeholder.svg"}
                  alt={item.designName}
                  width={300}
                  height={300}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-1">{item.designName}</h3>
              <p className="text-sm text-gray-500 mb-2 line-clamp-2">{item.description}</p>
              <div className="text-lg font-semibold text-pink-600 text-center mb-2">
                {(() => {
                  const price = calculateDesignPrice(item);
                  return price === null ? 'Liên hệ' : price.toLocaleString('vi-VN') + '₫';
                })()}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex flex-col gap-2">
              <AddToCartButton product={{
                _id: item._id,
                name: item.designName,
                description: item.description || "",
                price: calculateDesignPrice(item) || 0,
                image: item.previewImage || "/placeholder.svg",
                type: "custom",
                rating: 5,
                reviews: 0,
                sold: 0,
                stock: 99,
                featured: false,
                specifications: item.specifications,
                createdAt: item.createdAt || new Date().toISOString(),
                updatedAt: item.updatedAt || new Date().toISOString(),
                categoryId: item.categoryId,
              }} className="w-full bg-pink-500 hover:bg-pink-600 text-white" />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleClone(item._id)}
                disabled={loadingId === item._id}
              >
                {loadingId === item._id ? "Đang tạo bản sao..." : "Tùy chỉnh"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
} 