"use client";
import { useEffect, useState, useRef } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import useEmblaCarousel from 'embla-carousel-react';

export default function ReviewSection() {
  const [topReviews, setTopReviews] = useState<any[] | null>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/reviews?rating=5&limit=10")
      .then(res => res.json())
      .then(data => setTopReviews(Array.isArray(data) ? data : []))
      .catch(() => setTopReviews([]));
  }, []);

  // Auto-play thủ công
  useEffect(() => {
    if (!emblaApi) return;
    function play() {
      if (emblaApi) emblaApi.scrollNext();
    }
    intervalRef.current = setInterval(play, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [emblaApi]);

  // Dừng auto-play khi hover
  function handleMouseEnter() {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }
  function handleMouseLeave() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (emblaApi) intervalRef.current = setInterval(() => emblaApi.scrollNext(), 3000);
  }

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
          <div ref={emblaRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <Carousel className="w-full max-w-2xl mx-auto">
              <CarouselContent>
                {topReviews.map((r, i) => (
                  <CarouselItem key={i} className="px-2">
                    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center transition-transform duration-300 hover:scale-105 group">
                      <img src={r.avatar || "/placeholder-user.jpg"} alt={r.name || r.user?.username || r.user?.email || r.user} className="w-14 h-14 rounded-full mx-auto mb-2 border-2 border-pink-200 object-cover" />
                      <div className="flex gap-1 mb-1">
                        {[...Array(5)].map((_, idx) => (
                          <span key={idx} className="text-yellow-400 text-lg">★</span>
                        ))}
                      </div>
                      <p className="italic text-gray-700 mb-2 line-clamp-3">"{r.comment || r.review}"</p>
                      <span className="font-semibold text-pink-500">{r.name || r.user?.username || r.user?.email || r.user}</span>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        )}
      </div>
    </section>
  );
} 