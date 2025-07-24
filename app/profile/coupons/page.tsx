'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const fetchUserCoupons = async (userId: string) => {
  const res = await fetch(`http://localhost:5000/api/admin/coupons/user/${userId}`);
  if (!res.ok) throw new Error('Lỗi khi lấy mã giảm giá');
  return res.json();
};

function formatDate(dateStr?: string) {
  if (!dateStr) return 'Không giới hạn';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

function getCouponTypeLabel(type: string) {
  if (type === 'percentage') return 'Giảm %';
  if (type === 'fixed') return 'Giảm tiền';
  return type;
}

export default function MyCouponsPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string>('');

  useEffect(() => {
    if (!user?.userId) return;
    setLoading(true);
    fetchUserCoupons(user.userId)
      .then(setCoupons)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [user?.userId]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(''), 1500);
  };

  const handleUseNow = (code: string) => {
    router.push(`/checkout?coupon=${code}`);
  };

  if (!user?.userId) return <div className="p-8 text-center">Vui lòng đăng nhập để xem ưu đãi của bạn.</div>;
  if (loading) return <div className="p-8 text-center">Đang tải mã giảm giá...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-pink-600">Ưu đãi của tôi</h1>
      {coupons.length === 0 ? (
        <div className="text-center text-gray-500">Bạn chưa có mã giảm giá nào.</div>
      ) : (
        <div className="space-y-4">
          {coupons.map((c) => {
            const isExpired = c.validUntil && new Date() > new Date(c.validUntil);
            const isUsedUp = c.usageLimit && c.usedCount >= c.usageLimit;
            const isInactive = !c.isActive;
            const disabled = isExpired || isUsedUp || isInactive;
            let badge = '';
            if (isExpired) badge = 'Hết hạn';
            else if (isUsedUp) badge = 'Đã sử dụng';
            else if (isInactive) badge = 'Ngừng hoạt động';
            return (
              <Card key={c._id} className={`border-2 relative ${disabled ? 'opacity-50 border-gray-300' : 'border-pink-500'} shadow-sm`}>
                {badge && (
                  <span className="absolute top-2 right-2 bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded font-semibold z-10">
                    {badge}
                  </span>
                )}
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-mono tracking-widest text-pink-600">{c.code}</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleCopy(c.code)} disabled={disabled}>
                      {copied === c.code ? 'Đã sao chép!' : 'Sao chép mã'}
                    </Button>
                    <Button size="sm" onClick={() => handleUseNow(c.code)} disabled={disabled}>
                      Dùng ngay
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div><span className="font-semibold">Loại:</span> {getCouponTypeLabel(c.type)}</div>
                  <div><span className="font-semibold">Giá trị:</span> {c.type === 'percentage' ? `${c.value}%` : `${c.value.toLocaleString('vi-VN')}₫`}</div>
                  <div><span className="font-semibold">Đơn tối thiểu:</span> {c.minOrderAmount ? `${c.minOrderAmount.toLocaleString('vi-VN')}₫` : 'Không'}</div>
                  <div><span className="font-semibold">Tối đa:</span> {c.maxDiscountAmount ? `${c.maxDiscountAmount.toLocaleString('vi-VN')}₫` : 'Không giới hạn'}</div>
                  <div><span className="font-semibold">Hạn dùng:</span> {formatDate(c.validUntil)}</div>
                  <div><span className="font-semibold">Trạng thái:</span> {c.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}</div>
                  <div><span className="font-semibold">Số lần dùng:</span> {c.usageLimit ? `${c.usedCount || 0}/${c.usageLimit}` : 'Không giới hạn'}</div>
                  <div><span className="font-semibold">Mã cá nhân:</span> {c.userId ? 'Có' : 'Toàn bộ khách hàng'}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 