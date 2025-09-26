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
                <h3 className="font-semibold text-lg flex items-center">
                  <Ruler className="mr-2 h-5 w-5 text-pink-500"/>
                  Các bộ phận đã dùng
                </h3>
                
                                 {/* Hiển thị chi tiết từng bộ phận */}
                 <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                   <div>Thân: {design.parts?.body?.name || 'Chưa chọn'}</div>
                   <div>Tai: {design.parts?.ears?.name || 'Chưa chọn'}</div>
                   <div>Mắt: {design.parts?.eyes?.name || 'Chưa chọn'}</div>
                   <div>Mũi: {design.parts?.nose?.name || 'Chưa chọn'}</div>
                   <div>Miệng: {design.parts?.mouth?.name || 'Chưa chọn'}</div>
                   <div>Kích thước: {design.parts?.size?.name || 'Chưa chọn'}</div>
                 </div>

                                 {/* Hiển thị badges cho các bộ phận */}
                 <div className="flex flex-wrap gap-2">
                   {design.parts && Object.entries(design.parts).map(([key, part]: [string, any]) => {
                     // Chỉ hiển thị các part có thông tin và không phải accessories
                     if (part && key !== 'accessories' && typeof part === 'object' && part.name) {
                       return (
                         <div key={`${key}-${part._id}`} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                           {part.image && (
                             <img 
                               src={part.image} 
                               alt={part.name} 
                               className="w-8 h-8 rounded object-cover"
                             />
                           )}
                           <span className="text-sm font-medium">{part.name}</span>
                           {part.price && part.price > 0 && (
                             <Badge variant="outline" className="text-xs">
                               +{part.price.toLocaleString('vi-VN')}đ
                             </Badge>
                           )}
                         </div>
                       );
                     }
                     return null;
                   })}
                   {(!design.parts || Object.values(design.parts).filter(part => part && typeof part === 'object' && 'name' in part).length === 0) && 
                     <p className="text-sm text-gray-500">Không có thông tin bộ phận.</p>
                   }
                 </div>

                                 {/* Hiển thị accessories nếu có */}
                 {design.parts?.accessories && Array.isArray(design.parts.accessories) && design.parts.accessories.length > 0 && (
                   <>
                     <h4 className="font-medium text-base flex items-center mt-3">
                       <span className="mr-2">🎁</span>Phụ kiện
                     </h4>
                     <div className="flex flex-wrap gap-2">
                       {design.parts.accessories.map((accessory: any) => (
                         <div key={`accessory-${accessory._id}`} className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2 border border-blue-200">
                           {accessory.image && (
                             <img 
                               src={accessory.image} 
                               alt={accessory.name} 
                               className="w-8 h-8 rounded object-cover"
                             />
                           )}
                           <span className="text-sm font-medium">{accessory.name}</span>
                           {accessory.price && accessory.price > 0 && (
                             <Badge variant="outline" className="text-xs">
                               +{accessory.price.toLocaleString('vi-VN')}đ
                             </Badge>
                           )}
                         </div>
                       ))}
                     </div>
                   </>
                 )}

                <h3 className="font-semibold text-lg flex items-center pt-4">
                  <Palette className="mr-2 h-5 w-5 text-pink-500"/>
                  Màu sắc & Vật liệu
                </h3>
                <div className="space-y-3">
                                     {design.parts?.furColor && typeof design.parts.furColor === 'object' && 'color' in design.parts.furColor && (design.parts.furColor as any).color && (
                     <div className="flex items-center gap-3">
                       <span className="text-sm text-gray-600">Màu lông:</span>
                       <div 
                         style={{backgroundColor: (design.parts.furColor as any).color}} 
                         className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-lg"
                         title={(design.parts.furColor as any).color}
                       ></div>
                       <div className="flex flex-col">
                         <span className="text-sm font-medium">{(design.parts.furColor as any).name}</span>
                         <span className="text-xs text-gray-500 font-mono">{(design.parts.furColor as any).color}</span>
                       </div>
                     </div>
                   )}
                   {design.parts?.furColor && typeof design.parts.furColor === 'object' && (!('color' in design.parts.furColor) || !(design.parts.furColor as any).color) && (
                     <div className="flex items-center gap-3">
                       <span className="text-sm text-gray-600">Màu lông:</span>
                       <span className="text-sm font-medium">{(design.parts.furColor as any).name}</span>
                     </div>
                   )}
                  {design.parts?.material && typeof design.parts.material === 'object' && 'name' in design.parts.material && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">Vật liệu:</span>
                      <span className="text-sm font-medium">{(design.parts.material as any).name}</span>
                    </div>
                  )}
                  {design.parts?.clothing && typeof design.parts.clothing === 'object' && 'name' in design.parts.clothing && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">Trang phục:</span>
                      <span className="text-sm font-medium">{(design.parts.clothing as any).name}</span>
                    </div>
                  )}
                  {(!design.parts?.furColor && !design.parts?.material && !design.parts?.clothing) && (
                    <p className="text-sm text-gray-500">Không có thông tin màu sắc và vật liệu.</p>
                  )}
                </div>

                {/* Hiển thị giá nếu có */}
                {design.price && typeof design.price === 'number' && design.price > 0 && (
                  <div className="pt-4">
                    <h3 className="font-semibold text-lg flex items-center text-green-600">
                      <span className="mr-2">💰</span>Giá thiết kế
                    </h3>
                    <p className="text-2xl font-bold text-green-600">{design.price.toLocaleString('vi-VN')} VNĐ</p>
                  </div>
                )}
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