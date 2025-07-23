"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast } from "sonner"
import { Heart, ShoppingCart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface Product {
  _id: string
  name: string
  description: string
  price: number
  image: string
  type: string
  rating: number
  reviews: number
  sold: number
  stock: number
  featured: boolean
  specifications?: any
  isCustom?: boolean
  customData?: any
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchWishlist()
  }, [router])

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get("http://localhost:5000/api/wishlist", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.data.products) {
        setWishlist(response.data.products)
      } else {
        setWishlist([])
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách yêu thích:", error)
      toast.error("Không thể tải danh sách yêu thích!")
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (productId: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete("http://localhost:5000/api/wishlist", {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        data: { productId }
      })
      
      setWishlist(prev => prev.filter(product => product._id !== productId))
      toast.success("Đã xóa khỏi danh sách yêu thích!")
    } catch (error) {
      console.error("Lỗi khi xóa khỏi wishlist:", error)
      toast.error("Không thể xóa khỏi danh sách yêu thích!")
    }
  }

  const addToCart = async (product: Product) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post("http://localhost:5000/api/cart/add", {
        productId: product._id,
        quantity: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      toast.success("Đã thêm vào giỏ hàng!")
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error)
      toast.error("Không thể thêm vào giỏ hàng!")
    }
  }

  const editCustomProduct = (product: Product) => {
    if (product.isCustom && product.customData) {
      router.push(`/customize?edit=${product._id}&type=product`)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Đang tải danh sách yêu thích...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-2 mb-8">
        <Heart className="h-8 w-8 text-red-500" />
        <h1 className="text-3xl font-bold">Danh Sách Yêu Thích</h1>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Danh sách yêu thích trống</h2>
          <p className="text-gray-500 mb-6">Bạn chưa có sản phẩm nào trong danh sách yêu thích</p>
          <Button onClick={() => router.push('/products')}>
            Khám phá sản phẩm
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                {product.isCustom && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                    Tùy chỉnh
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  onClick={() => removeFromWishlist(product._id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-gray-500 text-xs mb-1">🛒 Đã bán: {product.sold || 0} lượt</p>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-pink-600">
                    {Number(product.price).toLocaleString('vi-VN')}₫
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm text-gray-600">{product.rating}</span>
                    <span className="text-sm text-gray-500">({product.reviews})</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-pink-500 hover:bg-pink-600"
                    onClick={() => addToCart(product)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Thêm vào giỏ
                  </Button>
                  
                  {product.isCustom && (
                    <Button 
                      variant="outline"
                      onClick={() => editCustomProduct(product)}
                    >
                      Chỉnh sửa
                    </Button>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full mt-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                  onClick={() => removeFromWishlist(product._id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa khỏi danh sách yêu thích
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 