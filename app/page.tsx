import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Gift, Palette, ShoppingBag, Star } from "lucide-react"
import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import ReviewSection from "@/components/ReviewSection";

// Hàm fetch sản phẩm nổi bật từ backend
async function getFeaturedProducts() {
  // Đổi URL này cho đúng backend của bạn nếu cần
  const res = await fetch("http://localhost:5000/api/products?featured=true", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-pink-50 to-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-pink-900">
                Thiết Kế <span className="text-pink-500">Một Cái Ôm</span> Của Riêng Bạn
              </h1>
              <p className="text-lg text-gray-600">
                Tạo ra một chú thú nhồi bông độc đáo và đặc biệt như chính bạn. Lựa chọn từng chi tiết từ tai đến trang
                phục và biến trí tưởng tượng của bạn thành hiện thực!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-pink-500 hover:bg-pink-600">
                  Bắt Đầu Thiết Kế <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-pink-200 text-pink-500 hover:bg-pink-50">
                  Xem Bộ Sưu Tập
                </Button>
              </div>
              {/* Nút dẫn tới cộng đồng thiết kế */}
              <div className="mt-2">
                <Link href="/community-designs">
                  <Button size="sm" variant="ghost" className="text-pink-600 hover:bg-pink-100">
                    <Palette className="mr-2 h-4 w-4" /> Cộng đồng thiết kế
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-pink-200 border-2 border-white flex items-center justify-center text-xs font-medium text-pink-500"
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  <span className="font-bold text-pink-500">2,000+</span> khách hàng hài lòng
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="relative h-[400px] w-full flex items-center justify-center">
                <img 
                  src="/dethuong.jpg" 
                  alt="Avatar của tôi" 
                  width={400} 
                  height={400} 
                  className="rounded-3xl shadow-2xl border-8 border-white object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                </div>
                <p className="text-sm font-medium mt-1">"Con gái tôi rất thích chú gấu tùy chỉnh này!"</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sản phẩm nổi bật */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Sản Phẩm Nổi Bật</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {featuredProducts.length === 0 ? (
              <p className="col-span-3 text-center text-gray-500">Chưa có sản phẩm nổi bật.</p>
            ) : (
              featuredProducts.map((product: any) => (
                <div key={product._id} className="bg-pink-50 rounded-xl p-6 text-center shadow hover:shadow-lg transition">
                  <Image
                    src={product.image || "/placeholder.jpg"}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="mx-auto rounded-lg object-cover"
                  />
                  <h3 className="text-xl font-bold text-gray-900 mt-4">{product.name}</h3>
                  <p className="text-pink-500 font-semibold mt-2">{product.price?.toLocaleString()}₫</p>
                  <Link href={`/product/${product._id}`}>
                    <Button size="sm" className="mt-4 bg-pink-500 hover:bg-pink-600">Xem Chi Tiết</Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Cách Thức Hoạt Động</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Tạo ra thú nhồi bông hoàn hảo của bạn thật dễ dàng và thú vị với quy trình đơn giản của chúng tôi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Palette className="h-10 w-10 text-pink-500" />,
                title: "Thiết Kế",
                description:
                  "Lựa chọn từng chi tiết từ tai đến trang phục trong công cụ thiết kế tương tác của chúng tôi",
              },
              {
                icon: <ShoppingBag className="h-10 w-10 text-pink-500" />,
                title: "Đặt Hàng",
                description: "Xem lại thiết kế của bạn và đặt hàng với thanh toán an toàn",
              },
              {
                icon: <Gift className="h-10 w-10 text-pink-500" />,
                title: "Tận Hưởng",
                description: "Nhận thú nhồi bông thủ công được làm chính xác theo yêu cầu của bạn",
              },
            ].map((feature, index) => (
              <div key={index} className="bg-pink-50 rounded-xl p-8 text-center">
                <div className="mx-auto w-16 h-16 flex items-center justify-center bg-white rounded-full mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Review Section */}
      <ReviewSection />

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-pink-100">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Sẵn Sàng Tạo Ra Thú Nhồi Bông Độc Đáo Của Bạn?</h2>
          <Link href="/customize">
            <Button size="lg" className="bg-pink-500 hover:bg-pink-600">
              Bắt Đầu Thiết Kế Ngay
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
