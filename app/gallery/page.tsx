import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Star } from "lucide-react"

// Dữ liệu mẫu cho bộ sưu tập
const galleryItems = [
  {
    id: "1",
    name: "Gấu Nâu Truyền Thống",
    description: "Gấu bông truyền thống với mắt nút và nơ đỏ",
    price: 39.99,
    rating: 4.8,
    reviews: 124,
    image: "/placeholder.svg?height=300&width=300",
    featured: true,
  },
  {
    id: "2",
    name: "Thỏ Hồng",
    description: "Thỏ bông mềm mại màu hồng với tai xệ và váy hoa",
    price: 42.99,
    rating: 4.6,
    reviews: 98,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: "3",
    name: "Voi Xanh",
    description: "Voi bông đáng yêu màu xanh với tai to và áo sọc",
    price: 44.99,
    rating: 4.9,
    reviews: 156,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: "4",
    name: "Gấu Trúc",
    description: "Gấu trúc đáng yêu với phụ kiện tre và khăn quàng xanh lá",
    price: 41.99,
    rating: 4.7,
    reviews: 112,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: "5",
    name: "Kỳ Lân Tím",
    description: "Kỳ lân ma thuật với bờm cầu vồng và sừng lấp lánh",
    price: 46.99,
    rating: 4.9,
    reviews: 203,
    image: "/placeholder.svg?height=300&width=300",
    featured: true,
  },
  {
    id: "6",
    name: "Vịt Vàng",
    description: "Vịt vui vẻ với mỏ cam và trang phục thủy thủ",
    price: 38.99,
    rating: 4.5,
    reviews: 87,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: "7",
    name: "Cáo Đỏ",
    description: "Cáo thông minh với đuôi xù và phụ kiện kính",
    price: 43.99,
    rating: 4.8,
    reviews: 134,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: "8",
    name: "Khủng Long Xanh Lá",
    description: "Khủng long thân thiện với gai lưng và biểu cảm vui vẻ",
    price: 45.99,
    rating: 4.7,
    reviews: 109,
    image: "/placeholder.svg?height=300&width=300",
  },
]

export default function GalleryPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Bộ Sưu Tập Mẫu</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Khám phá bộ sưu tập thú nhồi bông được thiết kế sẵn để lấy cảm hứng hoặc mua trực tiếp. Bạn cũng có thể tùy
          chỉnh bất kỳ thiết kế nào để tạo ra sản phẩm độc đáo của riêng mình.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {galleryItems.map((item) => (
          <Card key={item.id} className="overflow-hidden group">
            <div className="relative">
              <div className="aspect-square overflow-hidden">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={300}
                  height={300}
                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full"
              >
                <Heart className="h-5 w-5 text-pink-500" />
              </Button>
              {item.featured && <Badge className="absolute top-2 left-2 bg-pink-500">Nổi Bật</Badge>}
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
                        i < Math.floor(item.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({item.reviews})</span>
              </div>
              <p className="font-bold text-lg">{item.price.toFixed(2)}$</p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex gap-2">
              <Button className="w-full bg-pink-500 hover:bg-pink-600">Thêm Vào Giỏ</Button>
              <Link href={`/customize?template=${item.id}`} className="w-full">
                <Button variant="outline" className="w-full">
                  Tùy Chỉnh
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
