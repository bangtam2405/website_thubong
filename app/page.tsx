
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Gift, Palette, ShoppingBag, Star } from "lucide-react"
import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import ReviewSection from "@/components/ReviewSection";
import ChatBox from "../components/ChatBox";
import HomeHeroSection from "@/components/HomeHeroSection";
import HomeFeaturedSection from "@/components/HomeFeaturedSection";
import HomeFeaturesSection from "@/components/HomeFeaturesSection";

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
      <HomeHeroSection />
      <HomeFeaturedSection featuredProducts={featuredProducts} />
      <HomeFeaturesSection />
      <ReviewSection />
      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-pink-100">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Sẵn Sàng Tạo Ra Thú Nhồi Bông Độc Đáo Của Bạn?</h2>
          <Link href="/customize">
            <Button size="lg" className="bg-pink-500 hover:bg-pink-600 animate-pulse shadow-pink-200 shadow-lg">
              Bắt Đầu Thiết Kế Ngay
            </Button>
          </Link>
        </div>
      </section>
      <ChatBox />
    </div>
  )
}