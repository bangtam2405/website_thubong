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

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get("http://localhost:5000/api/products?type=collection")
      .then(res => setGalleryItems(res.data))
      .catch(() => setGalleryItems([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Bộ Sưu Tập Mẫu</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Khám phá bộ sưu tập thú nhồi bông được thiết kế sẵn để lấy cảm hứng hoặc đặt hàng nhanh. Bạn có thể tùy chỉnh bất kỳ mẫu nào để tạo ra sản phẩm độc đáo của riêng mình!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading && (
          <div className="col-span-full text-center text-gray-400">Đang tải dữ liệu...</div>
        )}
        {!loading && galleryItems.length === 0 && (
          <div className="col-span-full text-center text-gray-400">Chưa có sản phẩm bộ sưu tập nào.</div>
        )}
        {galleryItems.map((item) => (
          <Card key={item._id} className="overflow-hidden group">
            <div className="relative">
              <div className="aspect-square overflow-hidden">
                <Link href={`/product/${item._id}`}>
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    width={300}
                    height={300}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full"
              >
                <Heart className="h-5 w-5 text-pink-500" />
              </Button>
              {item.featured && (
                <Badge className="absolute top-2 left-2 bg-pink-500 text-white">Nổi Bật</Badge>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
              <p className="text-sm text-gray-500 mb-2 line-clamp-2">{item.description}</p>
              <div className="flex items-center gap-1 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(item.rating || 0)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({item.reviews || 0})</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-lg font-semibold text-pink-600">
                  {item.price.toLocaleString('vi-VN')}₫
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-pink-600 hover:text-pink-700"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Thêm vào giỏ
                </Button>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex flex-col gap-2">
              <AddToCartButton product={item} className="w-full bg-pink-500 hover:bg-pink-600" />
              <Link href={`/customize?template=${item._id}`} className="w-full">
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
