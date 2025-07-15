"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart } from "lucide-react"
import axios from "axios"
import { AddToCartButton } from "@/components/AddToCartButton"
import { Product } from "@/types/product"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faStar } from '@fortawesome/free-solid-svg-icons';
import CardProduct from "@/components/CardProduct";

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
          <CardProduct key={item._id} product={item} />
        ))}
      </div>
    </div>
  )
}
