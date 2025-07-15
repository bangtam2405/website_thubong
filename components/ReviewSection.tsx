"use client";
import { useEffect, useState, useRef } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from 'embla-carousel-autoplay';

export default function ReviewSection() {
  const [topReviews, setTopReviews] = useState<any[] | null>(null);
  const [emblaApi, setEmblaApi] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  // Đảm bảo instance plugin chỉ tạo 1 lần
  const autoplay = useRef<any>(null);
  if (!autoplay.current) {
    autoplay.current = Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true });
  }

  useEffect(() => {
    fetch("http://localhost:5000/api/reviews?rating=5&limit=10")
      .then(res => res.json())
      .then(data => setTopReviews(Array.isArray(data) ? data : []))
      .catch(() => setTopReviews([]));
  }, []);

  // Chỉ update selectedIndex khi select
  useEffect(() => {
    if (!emblaApi) return;
    const select = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", select);
    return () => {
      emblaApi.off("select", select);
    };
  }, [emblaApi]);

  return (
    <section className="py-12 bg-pink-50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-6">Khách Hàng Nói Gì?</h2>
        {topReviews === null ? (
          <div className="h-40 flex items-center justify-center">
            <span className="text-gray-400">Đang tải đánh giá...</span>
          </div>
        ) : topReviews.length === 0 ? (
          <div className="h-40 flex items-center justify-center">
            <span className="text-gray-400 italic">Chưa có đánh giá 5★ nào.</span>
          </div>
        ) : (
          <div className="relative group">
            <Carousel
              className="w-full max-w-2xl mx-auto"
              setApi={setEmblaApi}
              opts={{ loop: true }}
              plugins={topReviews.length > 1 ? [autoplay.current] : []}
            >
              <CarouselContent>
                {topReviews.map((r, i) => (
                  <CarouselItem key={i} className="w-full flex-shrink-0 flex-grow-0 basis-full px-2 transition-transform duration-500">
                    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center transition-transform duration-300 hover:scale-105 group">
                      <img src={r.user?.avatar || "/placeholder-user.jpg"} alt={r.user?.fullName || r.user?.username || r.user?.email || "user"} className="w-14 h-14 rounded-full mx-auto mb-2 border-2 border-pink-200 object-cover" />
                      <div className="flex gap-1 mb-1">
                        {[...Array(5)].map((_, idx) => (
                          <span key={idx} className="text-yellow-400 text-lg">★</span>
                        ))}
                      </div>
                      <p className="italic text-gray-700 mb-2 line-clamp-3">"{r.comment || r.review}"</p>
                      <span className="font-semibold text-pink-500">{r.user?.fullName || r.user?.username || r.user?.email || "Ẩn danh"}</span>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {/* Nút điều hướng thẩm mỹ */}
              <CarouselPrevious
                className="-left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-pink-500 text-white shadow-lg hover:scale-110 hover:bg-pink-600 border-none outline-none focus:ring-2 focus:ring-pink-300 z-10"
              />
              <CarouselNext
                className="-right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-pink-500 text-white shadow-lg hover:scale-110 hover:bg-pink-600 border-none outline-none focus:ring-2 focus:ring-pink-300 z-10"
              />
            </Carousel>
            {/* Dot indicator */}
            <div className="flex justify-center gap-2 mt-4">
              {[0, 1, 2].map((dotIdx) => (
                <button
                  key={dotIdx}
                  className={`w-3 h-3 rounded-full border border-pink-300 transition-all duration-300 ${selectedIndex % 3 === dotIdx ? 'bg-pink-500' : 'bg-white'}`}
                  onClick={() => {
                    if (emblaApi && emblaApi.scrollTo) {
                      emblaApi.scrollTo(dotIdx, true);
                    }
                  }}
                  aria-label={`Chuyển đến đánh giá ${dotIdx + 1}`}
                  disabled={!emblaApi}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
} 