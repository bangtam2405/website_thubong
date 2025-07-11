"use client";
import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

export default function ReviewCarousel() {
  const [topReviews, setTopReviews] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/reviews?rating=5&limit=10")
      .then(res => res.json())
      .then(data => setTopReviews(Array.isArray(data) ? data : []))
      .catch(() => setTopReviews([]));
  }, []);

  if (topReviews === null) {
    // Đang loading, render skeleton hoặc placeholder
    return (
      <div className="h-40 flex items-center justify-center">
        <span className="text-gray-400">Đang tải đánh giá...</span>
      </div>
    );
  }

  if (topReviews.length === 0) {
    // Không có review 5★
    return (
      <div className="h-40 flex items-center justify-center">
        <span className="text-gray-400 italic">Chưa có đánh giá 5★ nào.</span>
      </div>
    );
  }

  return (
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
  );
} 