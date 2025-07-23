"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, Copy, Eye, Loader2 } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

export default function CommunityDesignsPage() {
  const [designs, setDesigns] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/designs/public')
      .then(res => res.json())
      .then(setDesigns);
    if (typeof window !== 'undefined') {
      setUserId(localStorage.getItem('userId'));
    }
  }, []);

  const handleClone = async (id: string) => {
    if (!userId) {
      alert("Vui lòng đăng nhập để sao chép và chỉnh sửa thiết kế này!");
      return;
    }
    setLoadingId(id);
    try {
      const res = await fetch(`/api/designs/${id}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = `/customize?edit=${data.id}`;
      } else {
        alert(data.message || "Tạo bản sao thất bại.");
      }
    } catch (error) {
      alert("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">Khám Phá Sáng Tạo</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Nơi cộng đồng chia sẻ những mẫu gấu bông độc đáo. Hãy tìm cảm hứng và tự tay tùy chỉnh thiết kế của riêng bạn!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {designs.map((design, i) => (
          <motion.div
            key={design._id}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card className="group overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
              <CardHeader className="p-0 relative">
                <Link href={`/shared-designs/${design._id}`} className="block overflow-hidden">
                  <Image
                    src={design.previewImage || '/placeholder.jpg'}
                    alt={design.designName}
                    width={400}
                    height={400}
                    className="object-cover w-full h-64 group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>{design.likes ?? 0}</span>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="text-lg font-bold truncate">{design.designName}</CardTitle>
                <CardDescription className="text-sm text-gray-500 mt-1 truncate">
                  {design.description || "Một thiết kế tuyệt vời từ cộng đồng."}
                </CardDescription>
                
                <div className="flex items-center gap-2 mt-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={design.user?.avatar || '/placeholder-user.jpg'} alt={design.user?.fullName} />
                    <AvatarFallback>{design.user?.fullName?.[0] || 'A'}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-800">{design.user?.fullName || 'Người dùng ẩn danh'}</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 bg-gray-50/50">
                <div className="w-full flex justify-between items-center gap-2">
                   <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link href={`/shared-designs/${design._id}`}>
                          <Eye className="mr-2 h-4 w-4"/> Xem chi tiết
                      </Link>
                   </Button>
                  <Button onClick={() => handleClone(design._id)} disabled={loadingId === design._id} size="sm" className="flex-1 bg-pink-500 hover:bg-pink-600">
                    {loadingId === design._id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    Tùy chỉnh
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 