"use client"
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDateVN } from "@/lib/utils";
import { Copy, Edit, Share2, Trash2 } from 'lucide-react';

export default function MyDesignsPage() {
  const [designs, setDesigns] = useState<any[]>([]);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserId(localStorage.getItem("userId"));
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    axios.get(`http://localhost:5000/api/designs?userId=${userId}`).then(res => setDesigns(res.data));
  }, [userId]);

  useEffect(() => { setIsClient(true); }, []);

  const handleCopy = async (d: any) => {
    await axios.post("http://localhost:5000/api/designs", { ...d, designName: d.designName + " (Copy)", createdAt: undefined, updatedAt: undefined });
    window.location.reload();
  };
  const handleShare = async (designId: string) => {
    setSharingId(designId);
    if (!userId) return;
    await axios.put(`http://localhost:5000/api/designs/${designId}/share`, { userId });
    window.location.reload();
  };
  const handleDelete = async (d: any) => {
    await axios.delete(`http://localhost:5000/api/designs/${d._id}`);
    setDesigns(prev => prev.filter(item => item._id !== d._id));
  };

  const router = useRouter();

  // Đồng bộ logic tùy chỉnh: clone rồi chuyển hướng
  const handleCustomize = async (id: string) => {
    if (!userId) {
      alert("Vui lòng đăng nhập để tùy chỉnh thiết kế này!");
      return;
    }
    setSharingId(id);
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
      setSharingId(null);
    }
  };
  return (
    <div className="container mx-auto py-8">
              <h1 className="text-3xl font-bold mb-8 text-[#E3497A] text-center drop-shadow">Thiết Kế Của Tôi</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {designs.map(d => (
          <div key={d._id} className="bg-white rounded-2xl shadow-lg border border-pink-100 flex flex-col h-full">
            {d.previewImage && (
              <div className="w-full h-48 bg-gray-100 rounded-t-2xl overflow-hidden flex items-center justify-center">
                <img src={d.previewImage} alt={d.designName} className="object-contain h-full w-full" />
              </div>
            )}
            <div className="flex-1 flex flex-col p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-lg text-pink-600 truncate">{d.designName}</span>
                {d.isPublic && <span className="ml-2 px-2 py-0.5 text-xs rounded bg-pink-100 text-pink-600 font-medium">Đã chia sẻ</span>}
              </div>
              <div className="text-xs text-gray-500 mb-4">Cập nhật: {d.updatedAt ? (isClient ? formatDateVN(d.updatedAt) : d.updatedAt) : ""}</div>
              <div className="flex gap-2 mt-auto flex-wrap">
                <button
                  className="w-10 h-10 flex items-center justify-center bg-pink-100 hover:bg-pink-200 text-pink-600 rounded-full transition"
                  onClick={() => handleCopy(d)}
                  title="Sao chép"
                  aria-label="Sao chép"
                >
                  <Copy className="w-5 h-5" />
                </button>
                <button
                  className="w-10 h-10 flex items-center justify-center bg-pink-500 hover:bg-pink-600 text-white rounded-full transition"
                  onClick={() => handleCustomize(d._id)}
                  disabled={sharingId === d._id}
                  title="Tùy chỉnh"
                  aria-label="Tùy chỉnh"
                >
                  <Edit className="w-5 h-5" />
                </button>
                {!d.isPublic ? (
                  <button
                    className="w-10 h-10 flex items-center justify-center bg-pink-100 hover:bg-pink-200 text-pink-600 rounded-full transition"
                    onClick={() => handleShare(d._id)}
                    disabled={sharingId === d._id}
                    title="Chia sẻ"
                    aria-label="Chia sẻ"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                ) : null}
                <button
                  className="w-10 h-10 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition"
                  onClick={() => handleDelete(d)}
                  title="Xóa"
                  aria-label="Xóa"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {designs.length === 0 && (
        <div className="text-center text-gray-400 mt-16 text-lg">Bạn chưa có thiết kế nào.</div>
      )}
    </div>
  );
} 