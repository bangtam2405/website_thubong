"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Copy, Ruler, Palette, User, Info } from 'lucide-react';

export default function SharedDesignPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const [design, setDesign] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    if (id) {
      fetch(`/api/designs/${id}`)
        .then(res => res.json())
        .then(data => {
          // Sửa lại điều kiện kiểm tra lỗi:
          if (data === null || data.error) {
            setDesign(null);
          } else {
            setDesign(data);
          }
        })
        .catch(() => setDesign(null))
        .finally(() => setLoading(false));
    }
    if (typeof window !== 'undefined') {
      setUserId(localStorage.getItem('userId'));
    }
  }, [id]);

  const handleClone = async () => {
    if (!userId) {
      alert("Vui lòng đăng nhập để sao chép và chỉnh sửa thiết kế này!");
      return;
    }
    setIsCloning(true);
    try {
      const res = await fetch(`/api/designs/${id}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/customize?edit=${data.id}`);
      } else {
        alert(data.message || "Tạo bản sao thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      alert("Đã xảy ra lỗi khi tạo bản sao.");
    } finally {
      setIsCloning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="h-16 w-16 animate-spin text-pink-500" />
      </div>
    );
  }

  if (design === null) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-red-600">Không tìm thấy thiết kế</h1>
        <p className="text-gray-500 mt-2">Thiết kế bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Button onClick={() => router.push('/community-designs')} className="mt-6">
          Quay lại trang cộng đồng
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Cột hình ảnh */}
        <div className="sticky top-24">
          <Card className="overflow-hidden shadow-lg">
            <CardContent className="p-0">
              <Image
                src={design.previewImage || '/placeholder.jpg'}
                alt={design.designName}
                width={800}
                height={800}
                className="object-contain w-full h-full"
              />
            </CardContent>
          </Card>
        </div>

        {/* Cột thông tin */}
        <div className="space-y-8">
          {/* Thông tin người thiết kế */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-pink-200">
                <AvatarImage src={design.user?.avatar || '/placeholder-user.jpg'} alt={design.user?.fullName} />
                <AvatarFallback className="text-lg">{design.user?.fullName?.[0] || 'A'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-gray-500">Thiết kế bởi</p>
                <p className="text-xl font-bold text-gray-900">{design.user?.fullName || 'Người dùng ẩn danh'}</p>
              </div>
            </CardHeader>
          </Card>
        
          {/* Thông tin thiết kế */}
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">{design.designName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">{design.description || 'Chưa có mô tả cho thiết kế này.'}</p>
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center"><Ruler className="mr-2 h-5 w-5 text-pink-500"/>Các bộ phận đã dùng</h3>
                <div className="flex flex-wrap gap-2">
                  {design.parts && Object.values(design.parts).filter(Boolean).map((part: any) => (
                    part && <Badge key={part._id} variant="secondary" className="text-sm py-1 px-3">{part.name}</Badge>
                  ))}
                  {(!design.parts || Object.values(design.parts).filter(Boolean).length === 0) && <p className="text-sm text-gray-500">Không có thông tin bộ phận.</p>}
                </div>

                 <h3 className="font-semibold text-lg flex items-center pt-4"><Palette className="mr-2 h-5 w-5 text-pink-500"/>Màu sắc</h3>
                 <div className="flex items-center gap-2">
                    <div style={{backgroundColor: design.fabricColor}} className="w-8 h-8 rounded-full border shadow"></div>
                    <span>{design.fabricColor}</span>
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Nút hành động */}
          <div>
            {userId ? (
              <Button onClick={handleClone} disabled={isCloning} size="lg" className="w-full text-lg py-7 bg-pink-600 hover:bg-pink-700">
                {isCloning ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Copy className="mr-2 h-5 w-5" />
                )}
                Tùy chỉnh thiết kế này
              </Button>
            ) : (
              <Card className="text-center p-4 bg-yellow-50 border-yellow-200">
                <Info className="mx-auto h-8 w-8 text-yellow-500"/>
                <p className="mt-2 font-semibold">Vui lòng <a href="/login" className="underline hover:text-pink-600">đăng nhập</a> để sao chép và tùy chỉnh thiết kế này.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 