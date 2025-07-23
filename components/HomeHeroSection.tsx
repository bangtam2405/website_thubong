"use client"
import { ArrowRight, Palette, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import TextType from "./TextType";
import { useEffect, useState } from "react";

export default function HomeHeroSection() {
  const [review, setReview] = useState<{ rating: number, comment: string } | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/reviews?limit=5")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 1) {
          setReview({ rating: data[1].rating, comment: data[5].comment });
        } else if (Array.isArray(data) && data.length > 0) {
          setReview({ rating: data[0].rating, comment: data[0].comment });
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
                text={["Thiết Kế Một Cái Ôm Của Riêng Bạn", "Gửi Yêu Thương Vào Từng Cái Ôm Bạn Thiết Kế"]}
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
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < (review?.rating || 5) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                ))}
              </div>
              <p className="text-sm font-medium mt-1">{review?.comment || '"Con gái tôi rất thích chú gấu tùy chỉnh này!"'}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
} 