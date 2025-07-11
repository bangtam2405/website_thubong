"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

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
    if (!userId) return;
    setLoadingId(id);
    const res = await fetch(`/api/designs/${id}/clone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.success) {
      window.location.href = `/customize?edit=${data.id}`;
    }
    setLoadingId(null);
  };

  return (
    <div>
      <h1>Cộng đồng thiết kế</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {designs.map(design => (
          <div key={design._id} style={{ border: '1px solid #ccc', padding: 16, width: 300 }}>
            <img src={design.previewImage || '/placeholder.jpg'} alt={design.designName} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
            <h3>{design.designName}</h3>
            <p>{design.description}</p>
            <Link href={`/shared-designs/${design._id}`}>Xem</Link>
            {userId ? (
              <button style={{marginLeft:8}} onClick={() => handleClone(design._id)} disabled={loadingId===design._id}>
                {loadingId===design._id ? 'Đang tạo bản sao...' : 'Chỉnh sửa thiết kế này'}
              </button>
            ) : (
              <div style={{color:'orange',marginTop:8}}>Đăng nhập để chỉnh sửa hoặc sao chép thiết kế này.</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 