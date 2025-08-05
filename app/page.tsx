
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Gift, Palette, ShoppingBag, Star } from "lucide-react"
import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

import ChatBox from "../components/ChatBox";
import HomeHeroSection from "@/components/HomeHeroSection";
import HomeFeaturedSection from "@/components/HomeFeaturedSection";
import HomeFeaturesSection from "@/components/HomeFeaturesSection";
import ReviewSection from "@/components/ReviewSection";

// Hàm fetch sản phẩm nổi bật từ backend
async function getFeaturedProducts() {
  // Đổi URL này cho đúng backend của bạn nếu cần
  const res = await fetch("http://localhost:5000/api/products?featured=true", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

// Hàm fetch ngẫu nhiên mẫu thiết kế
async function getRandomDesigns(count: number) {
  const res = await fetch("http://localhost:5000/api/designs?userId=admin", { cache: "no-store" });
  if (!res.ok) return [];
  const designs = await res.json();
  return designs.sort(() => 0.5 - Math.random()).slice(0, count);
}

// Hàm fetch ngẫu nhiên sản phẩm theo loại
async function getRandomProductsByType(type: string, count: number) {
  const res = await fetch(`http://localhost:5000/api/products?type=${type}`, { cache: "no-store" });
  if (!res.ok) return [];
  const products = await res.json();
  // Lấy ngẫu nhiên count sản phẩm
  return products.sort(() => 0.5 - Math.random()).slice(0, count);
}



export default async function Home() {
  const [collections, teddies, accessories, designs] = await Promise.all([
    getRandomProductsByType("collection", 2),
    getRandomProductsByType("teddy", 2),
    getRandomProductsByType("accessory", 2),
    getRandomDesigns(3),
  ]);
  const featuredProducts = [
    ...designs.map((d: any) => ({
      _id: d._id,
      name: d.designName,
      image: d.previewImage,
      price: d.price || 0,
      type: "design",
      sold: 0,
    })),
    ...collections,
    ...teddies,
    ...accessories,
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <HomeHeroSection />
      <HomeFeaturedSection featuredProducts={featuredProducts} />
      <HomeFeaturesSection />
      <ReviewSection />
      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-pink-100">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6" style={{color: '#e3497a'}}>Sẵn Sàng Tạo Ra Thú Nhồi Bông Độc Đáo Của Bạn?</h2>
                      <Link href="/customize">
              <Button size="lg" className="bg-pink-500 hover:bg-pink-600 text-white animate-pulse shadow-lg font-semibold">
                Bắt Đầu Thiết Kế Ngay
              </Button>
            </Link>
        </div>
      </section>
      <ChatBox />
    </div>
  );
}