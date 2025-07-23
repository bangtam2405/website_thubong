"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AddToCartButton } from "@/components/AddToCartButton"
import { Product } from "@/types/product"
import { Heart } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"

interface ProductListPageProps {
  params: {
    type: string
  }
}

export default function ProductListPage({ params }: ProductListPageProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const handleAddToWishlist = async (product: Product) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error("Bạn cần đăng nhập để thêm vào danh sách yêu thích!")
        return
      }

      await axios.post("http://localhost:5000/api/wishlist", {
        productId: product._id
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      toast.success("Đã thêm vào danh sách yêu thích!")
    } catch (error) {
      console.error("Lỗi khi thêm vào wishlist:", error)
      toast.error("Có lỗi xảy ra khi thêm vào danh sách yêu thích!")
    }
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Map frontend type to backend type
        const typeMap: { [key: string]: string } = {
          custom: "collection", // Map custom to collection since backend doesn't have custom type
          collection: "collection",
          accessories: "accessory", // Map accessories to accessory
          new: "new",
          teddy: "teddy"
        }

        const backendType = typeMap[params.type] || params.type
        console.log("Fetching products with type:", backendType)
        
        const response = await fetch(`http://localhost:5000/api/products?type=${backendType}`)
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const data = await response.json()
        console.log("Fetched products:", data)
        setProducts(data)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [params.type])

  if (!isClient) {
    return <div className="container mx-auto py-12">Đang tải...</div>
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-8">
          {params.type === "custom"
            ? "Thú Bông Đã Thiết Kế"
            : params.type === "collection"
            ? "Bộ Sưu Tập"
            : params.type === "accessories"
            ? "Phụ Kiện"
            : params.type === "new"
            ? "Hàng Mới"
            : params.type === "teddy"
            ? "Teddy Đồ"
            : "Sản Phẩm"}
        </h1>
        <div className="text-center py-12">
          <p className="text-gray-500">Không có sản phẩm nào trong danh mục này.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">
        {params.type === "custom"
          ? "Thú Bông Đã Thiết Kế"
          : params.type === "collection"
          ? "Bộ Sưu Tập"
          : params.type === "accessories"
          ? "Phụ Kiện"
          : params.type === "new"
          ? "Hàng Mới"
          : params.type === "teddy"
          ? "Teddy Đồ"
          : "Sản Phẩm"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product._id} className="overflow-hidden">
            <Link href={`/products/${product._id}`}>
              <CardHeader className="p-0">
                <div className="relative aspect-square">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </CardHeader>
            </Link>
            <CardContent className="p-4">
              <Link href={`/products/${product._id}`}>
                <CardTitle className="text-lg font-semibold mb-2 hover:text-pink-500 transition-colors">
                  {product.name}
                </CardTitle>
              </Link>
              <p className="text-gray-500 text-xs mb-1">🛒 Đã bán: {product.sold || 0} lượt</p>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
              <p className="text-lg font-bold text-pink-500">{Number(product.price).toLocaleString('vi-VN')}₫</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <div className="flex gap-2 w-full">
                <Link href={`/products/${product._id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Chi tiết
                  </Button>
                </Link>
                <AddToCartButton product={product} className="flex-1" />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault()
                    handleAddToWishlist(product)
                  }}
                  className="flex-shrink-0"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
} 