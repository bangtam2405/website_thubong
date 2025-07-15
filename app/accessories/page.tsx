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

export default function AccessoriesPage() {
  const [accessoriesItems, setAccessoriesItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get("http://localhost:5000/api/products?type=accessory")
      .then(res => setAccessoriesItems(res.data))
      .catch(() => setAccessoriesItems([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Phụ Kiện Thú Nhồi Bông</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Khám phá bộ sưu tập phụ kiện đáng yêu cho thú nhồi bông của bạn. Từ quần áo, nơ, vòng cổ đến các phụ kiện trang trí khác, giúp thú nhồi bông của bạn thêm nổi bật và độc đáo!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading && (
          <div className="col-span-full text-center text-gray-400">Đang tải dữ liệu...</div>
        )}
        {!loading && accessoriesItems.length === 0 && (
          <div className="col-span-full text-center text-gray-400">Chưa có sản phẩm phụ kiện nào.</div>
        )}
        {accessoriesItems.map((item) => (
          <CardProduct key={item._id} product={item} />
        ))}
      </div>
    </div>
  )
} 