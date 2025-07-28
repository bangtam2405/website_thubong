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
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

type Review = {
  _id: string;
  user: {
    username?: string;
    email?: string;
    avatar?: string;
    fullName?: string;
  } | string;
  rating: number;
  comment: string;
  createdAt: string;
  media?: string[];
};

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
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [params.id])

  // Lấy đánh giá thực tế từ API
  useEffect(() => {
    if (!params.id) return;
    axios.get(`http://localhost:5000/api/reviews/product/${params.id}`)
      .then(res => setReviews(res.data))
      .catch(() => setReviews([]));
  }, [params.id]);

  // Tính điểm trung bình và tổng số đánh giá
  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) : 0;

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
    <div className="container mx-auto py-8 px-2 md:px-4">
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Cột trái: Ảnh sản phẩm */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-full aspect-square max-w-md rounded-xl overflow-hidden border-2 border-pink-100 shadow">
            <Zoom>
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                style={{ borderRadius: 'inherit' }}
              />
            </Zoom>
          </div>
        </div>
        {/* Cột phải: Thông tin sản phẩm */}
        <div className="flex flex-col gap-4 justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-pink-700 leading-tight">{product.name}</h1>
              <Badge className="bg-pink-100 text-pink-600 font-semibold">
                {product.type === "teddy"
                  ? "Teddy"
                  : product.type === "accessory"
                  ? "Phụ kiện"
                  : product.type === "collection"
                  ? "Bộ sưu tập"
                  : product.type === "custom"
                  ? "Tùy chỉnh"
                  : product.type}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < Math.round(avgRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                />
              ))}
              <span className="ml-2 text-gray-600 text-sm">({reviewCount} đánh giá)</span>
              {reviewCount > 0 && (
                <span className="ml-2 text-pink-600 font-semibold">{avgRating.toFixed(1)} / 5</span>
              )}
            </div>
            <div className="text-3xl font-bold text-pink-600 mb-2">
              {product.price.toLocaleString('vi-VN')}₫
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gray-600">Số lượng:</span>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3"
                >-</Button>
                <span className="px-4">{quantity}</span>
                <Button
                  variant="ghost"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3"
                  disabled={quantity >= product.stock}
                >+</Button>
              </div>
              <span className="ml-2 text-gray-500 text-xs">Còn lại: {product.stock}</span>
            </div>
            <div className="flex gap-3 mb-4">
              <Button className="flex-1 bg-pink-600 hover:bg-pink-700" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" />Mua ngay
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleAddToWishlist}>
                <Heart className="mr-2 h-5 w-5" />Yêu thích
              </Button>
              <Button variant="outline"><Share2 className="h-5 w-5" /></Button>
            </div>
            <div className="flex flex-wrap gap-4 mb-2">
              <div className="flex items-center gap-2"><Truck className="h-5 w-5 text-pink-400" /><span className="text-sm text-gray-600">Miễn phí vận chuyển</span></div>
              <div className="flex items-center gap-2"><Shield className="h-5 w-5 text-pink-400" /><span className="text-sm text-gray-600">Bảo hành chính hãng</span></div>
              <div className="flex items-center gap-2"><RefreshCw className="h-5 w-5 text-pink-400" /><span className="text-sm text-gray-600">Đổi trả 30 ngày</span></div>
            </div>
          </div>
        </div>
      </div>
      {/* Tabs mô tả và đánh giá */}
      <div className="mt-10 bg-white rounded-2xl shadow p-6">
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
                  <span>
                    {product.type === "teddy"
                      ? "Teddy"
                      : product.type === "accessory"
                      ? "Phụ kiện"
                      : product.type === "collection"
                      ? "Bộ sưu tập"
                      : product.type === "custom"
                      ? "Tùy chỉnh"
                      : product.type}
                  </span>
                </li>
                <li className="flex justify-between py-2 border-b"><span className="text-gray-600">Chất liệu</span><span>Bông cao cấp</span></li>
                <li className="flex justify-between py-2 border-b"><span className="text-gray-600">Màu sắc</span><span>{product.specifications?.color || "Hồng"}</span></li>
                <li className="flex justify-between py-2 border-b"><span className="text-gray-600">Kích thước</span><span>{product.specifications?.size || "28cm"}</span></li>
                {/* <li className="flex justify-between py-2 border-b"><span className="text-gray-600">Trọng lượng</span><span>500g</span></li> */}
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
                      className={`h-5 w-5 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
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
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {typeof review.user === 'object' && review.user.avatar ? (
                        <img src={review.user.avatar} alt="avatar" className="w-10 h-10 object-cover rounded-full" />
                      ) : (
                        <img src="/placeholder-user.jpg" alt="avatar" className="w-10 h-10 object-cover rounded-full" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold">
                        {typeof review.user === 'object'
                          ? (review.user.fullName || review.user.username || review.user.email)
                          : review.user}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2">{review.comment}</p>
                  {/* Hiển thị media nếu có */}
                  {Array.isArray(review.media) && review.media.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {review.media.map((url: string, idx: number) =>
                        url.match(/\.(jpg|jpeg|png)$/i) ? (
                          <div key={idx} className="relative w-24 h-24">
                            <Image src={url} alt={`media-${idx}`} fill className="object-cover rounded border" />
                          </div>
                        ) : url.match(/\.mp4$/i) ? (
                          <div key={idx} className="relative w-32 h-24">
                            <video src={url} controls className="w-32 h-24 object-cover rounded border" />
                          </div>
                        ) : null
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 