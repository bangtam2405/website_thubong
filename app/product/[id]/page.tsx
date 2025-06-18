"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, Share2, Truck, Shield, RefreshCw, ShoppingCart } from "lucide-react"
import axios from "axios"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/contexts/CartContext"
import { toast } from "sonner"
import type { Product } from "@/types/product"

type Review = {
  _id: string
  user: string
  rating: number
  comment: string
  date: string
}

type CartItem = {
  _id: string
  name: string
  price: number
  image: string
  quantity: number
  type: "teddy" | "accessory" | "collection" | "new" | "custom"
}

export default function ProductDetail() {
  const params = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState("")
  const [quantity, setQuantity] = useState<number>(1)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${params.id}`)
        setProduct(res.data)
        setSelectedImage(res.data.image)
        // Giả lập dữ liệu đánh giá
        setReviews([
          {
            _id: "1",
            user: "Nguyễn Văn A",
            rating: 5,
            comment: "Sản phẩm rất đẹp, chất lượng tốt, giao hàng nhanh!",
            date: "2024-03-15"
          },
          {
            _id: "2",
            user: "Trần Thị B",
            rating: 4,
            comment: "Thú nhồi bông dễ thương, con bé nhà mình rất thích!",
            date: "2024-03-14"
          }
        ])
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity)
      toast.success("Đã thêm vào giỏ hàng!")
    }
  }

  const handleAddToWishlist = async () => {
    if (!product) return

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

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Không tìm thấy sản phẩm</h1>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Phần hình ảnh */}
        <div className="space-y-4">
          <div className="aspect-square relative rounded-lg overflow-hidden">
            <Image
              src={selectedImage || product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div 
              className="aspect-square relative rounded-lg overflow-hidden cursor-pointer border-2 border-pink-500"
              onClick={() => setSelectedImage(product.image)}
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            {/* Thêm các hình ảnh khác nếu có */}
          </div>
        </div>

        {/* Phần thông tin */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-gray-600">({product.reviews} đánh giá)</span>
              </div>
              <span className="text-gray-600">Đã bán {product.sold}</span>
            </div>
            <div className="text-3xl font-bold text-pink-600 mb-4">
              {product.price.toLocaleString('vi-VN')}₫
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Số lượng:</span>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3"
                >
                  -
                </Button>
                <span className="px-4">{quantity}</span>
                <Button
                  variant="ghost"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3"
                >
                  +
                </Button>
              </div>
              <span className="text-gray-600">({product.stock} sản phẩm có sẵn)</span>
            </div>

            <div className="flex gap-4">
              <Button 
                className="flex-1 bg-pink-600 hover:bg-pink-700"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Thêm vào giỏ
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleAddToWishlist}>
                <Heart className="mr-2 h-5 w-5" />
                Yêu thích
              </Button>
              <Button variant="outline">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600">Miễn phí vận chuyển</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600">Bảo hành chính hãng</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600">Đổi trả trong 30 ngày</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phần mô tả và đánh giá */}
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList className="mb-8">
            <TabsTrigger value="description">Mô tả sản phẩm</TabsTrigger>
            <TabsTrigger value="reviews">Đánh giá ({reviews.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="space-y-4">
            <div className="prose max-w-none">
              <p>{product.description}</p>
              <h3 className="text-xl font-semibold mt-6 mb-4">Thông số kỹ thuật</h3>
              <ul className="space-y-2">
                <li className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Loại sản phẩm</span>
                  <span>{product.type}</span>
                </li>
                <li className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Chất liệu</span>
                  <span>Bông cao cấp</span>
                </li>
                <li className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Kích thước</span>
                  <span>30cm x 20cm</span>
                </li>
                <li className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Trọng lượng</span>
                  <span>500g</span>
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="flex items-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-pink-600">{product.rating}</div>
                <div className="flex justify-center my-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-600">{product.reviews} đánh giá</div>
              </div>
            </div>

            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review._id} className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {review.user[0]}
                    </div>
                    <div>
                      <div className="font-semibold">{review.user}</div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 