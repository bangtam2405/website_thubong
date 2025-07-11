"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SharedDesignPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params); // unwrap Promise
  const [design, setDesign] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/designs/${id}`)
        .then(res => res.json())
        .then(data => {
          if (!data || data.success === false) setDesign(null);
          else setDesign(data);
        });
    }
    if (typeof window !== 'undefined') {
      setUserId(localStorage.getItem('userId'));
    }
    setIsClient(true);
  }, [id]);

  const handleClone = async () => {
    if (!userId) return;
    setLoading(true);
    const res = await fetch(`/api/designs/${id}/clone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.success) {
      router.push(`/customize?edit=${data.id}`);
    }
    setLoading(false);
  };

  if (design === null) return <div style={{color:'red'}}>Không tìm thấy thiết kế hoặc thiết kế đã bị xóa.</div>;
  if (!design) return <div>Đang tải...</div>;

  return (
    <div>
      <h1>{design.designName}</h1>
      <img src={design.previewImage || '/placeholder.jpg'} alt={design.designName} style={{ width: 400, height: 400, objectFit: 'contain' }} />
      <p>{design.description}</p>
      {userId ? (
        <button onClick={handleClone} disabled={loading}>
          {loading ? 'Đang tạo bản sao...' : 'Chỉnh sửa thiết kế này'}
        </button>
      ) : (
        <div style={{color:'orange',marginTop:8}}>Đăng nhập để chỉnh sửa hoặc sao chép thiết kế này.</div>
      )}
    </div>
  );
} 