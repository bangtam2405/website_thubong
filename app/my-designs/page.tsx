"use client"
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

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
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Thiết kế của tôi</h1>
      <ul className="space-y-4">
        {designs.map(d => (
          <li key={d._id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-semibold text-lg">{d.designName}</div>
              <div className="text-sm text-gray-500">
                Cập nhật: {d.updatedAt ? (isClient ? new Date(d.updatedAt).toLocaleString() : new Date(d.updatedAt).toISOString()) : ""}
              </div>
              {d.isPublic && <div className="text-xs text-pink-500">Đã chia sẻ: <Link href={`/design/${d._id}`} className="underline">Xem link</Link></div>}
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button className="px-3 py-1 bg-pink-500 text-white rounded" onClick={() => handleCopy(d)}>Sao chép</button>
              <Link href={`/customize?edit=${d._id}`} className="px-3 py-1 bg-blue-500 text-white rounded">Chỉnh sửa</Link>
              {d.isPublic ? (
                <div>
                  <span>Đã chia sẻ</span>
                  {origin && (
                    <input value={origin + '/shared-designs/' + d._id} readOnly className="ml-2 px-3 py-1 bg-green-500 text-white rounded" />
                  )}
                </div>
              ) : (
                <button className="px-3 py-1 bg-green-500 text-white rounded" onClick={() => handleShare(d._id)} disabled={sharingId === d._id}>
                  {sharingId === d._id ? 'Đang chia sẻ...' : 'Chia sẻ'}
                </button>
              )}
              <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={() => handleDelete(d)}>Xóa</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 