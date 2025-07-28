"use client"
import { ArrowRight, Palette, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import TextType from "./TextType";
import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useRef } from 'react';
import { formatDateVN } from "@/lib/utils";

export default function HomeHeroSection() {
  const [review, setReview] = useState<{ rating: number, comment: string } | null>(null);
  const [banners, setBanners] = useState<any[]>([]);
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 2000 })]);

  useEffect(() => {
    fetch("http://localhost:5000/api/banner")
      .then(res => res.json())
      .then(data => {
        setBanners(Array.isArray(data) ? data.filter((b: any) => b.isActive).sort((a: any, b: any) => a.order - b.order) : []);
      });
    fetch("http://localhost:5000/api/reviews?limit=5")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const idx = Math.floor(Math.random() * data.length);
          setReview({ rating: data[idx].rating, comment: data[idx].comment });
        }
      });
  }, []);

  return (
    <motion.section
      className="relative bg-gradient-to-b from-pink-50 to-white py-20 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              <TextType
                text={["Thiết Kế Một Cái Ôm Của Riêng Bạn", "Từng Cái Ôm – Gói Trọn Yêu Thương"]}
                as="span"
                typingSpeed={120}
                pauseDuration={1200}
                className=""
                textColors={["#e3497a"]}
                showCursor={true}
                loop={true}
              />
            </h1>
            <p className="text-lg text-gray-600">
              Tạo ra một chú thú nhồi bông độc đáo và đặc biệt như chính bạn. Lựa chọn từng chi tiết từ tai đến trang phục và biến trí tưởng tượng của bạn thành hiện thực!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-pink-500 hover:bg-pink-600 shadow-pink-200 shadow-lg">
                Bắt Đầu Thiết Kế <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-pink-200 text-pink-500 hover:bg-pink-50">
                Xem Bộ Sưu Tập
              </Button>
            </div>
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
              {banners.length > 1 ? (
                <div ref={emblaRef} className="overflow-hidden w-full">
                  <div className="flex">
                    {banners.map((b, i) => (
                      <div key={b._id || i} className="min-w-0 shrink-0 grow-0 basis-full flex justify-center items-center">
                        <a href={b.link || undefined} target={b.link ? "_blank" : undefined} rel="noopener noreferrer">
                          <img
                            src={b.url}
                            alt={b.caption || `Banner ${i+1}`}
                            width={600}
                            height={400}
                            className="rounded-xl shadow-2xl object-cover w-full h-[400px]"
                          />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ) : banners.length === 1 ? (
                <a href={banners[0].link || undefined} target={banners[0].link ? "_blank" : undefined} rel="noopener noreferrer">
                  <img
                    src={banners[0].url}
                    alt={banners[0].caption || "Banner"}
                    width={600}
                    height={400}
                    className="rounded-xl shadow-2xl object-cover w-full h-[400px]"
                  />
                </a>
              ) : (
                <img
                  src="/dethuong.jpg"
                  alt="Avatar của tôi"
                  width={600}
                  height={400}
                  className="rounded-xl shadow-2xl object-cover w-full h-[400px]"
                />
              )}
            </div>
            {/* Đã xóa phần review trên banner */}
          </div>
        </div>
      </div>
    </motion.section>
  );
} 