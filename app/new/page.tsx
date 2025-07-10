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

export default function NewProductsPage() {
  const [designTemplates, setDesignTemplates] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/designs?isPublic=true")
      .then(res => res.json())
      .then(data => setDesignTemplates(data))
      .catch(() => setDesignTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Hàng Mẫu Thiết Kế Sẵn</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Tham khảo các mẫu thiết kế sẵn do admin tạo. Bạn có thể nhấn "Tùy chỉnh" để sáng tạo lại theo ý mình!
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
            </CardContent>
            <CardFooter className="p-4 pt-0 flex flex-col gap-2">
              <Link href={`/customize?templateId=${item._id}`} className="w-full">
                <Button variant="outline" className="w-full">
                  Tùy chỉnh
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
} 