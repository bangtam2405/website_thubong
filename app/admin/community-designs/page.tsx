"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trash2, EyeOff } from "lucide-react";

export default function AdminCommunityDesignsPage() {
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    fetchDesigns();
  }, []);

  async function fetchDesigns() {
    setLoading(true);
    const res = await fetch("http://localhost:5000/api/designs/public");
    let data = await res.json();
    // Lọc bỏ thiết kế mẫu admin
    data = data.filter((d: any) => d.userId !== 'admin');
    setDesigns(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thiết kế này?")) return;
    setActionId(id);
    await fetch(`http://localhost:5000/api/designs/${id}`, { method: "DELETE" });
    fetchDesigns();
    setActionId(null);
  }

  async function handleHide(id: string) {
    if (!window.confirm("Ẩn thiết kế này khỏi cộng đồng?")) return;
    setActionId(id);
    await fetch(`http://localhost:5000/api/designs`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isPublic: false }),
    });
    fetchDesigns();
    setActionId(null);
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Menu chuyển đổi */}
      <div className="flex gap-4 mb-6">
        <Link href="/admin/designs">
          <Button variant="outline">Quản lý mẫu thiết kế</Button>
        </Link>
        <Button variant="default" disabled>Quản lý thiết kế cộng đồng</Button>
      </div>
      <h1 className="text-2xl font-bold mb-4">Quản lý thiết kế cộng đồng</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? <div>Đang tải...</div> : designs.length === 0 ? <div>Chưa có thiết kế cộng đồng nào.</div> : designs.map((d) => (
          <div key={d._id} className="bg-white rounded-xl shadow p-4 flex flex-col">
            <img src={d.previewImage || "/placeholder.jpg"} alt={d.designName} className="rounded mb-2 w-full h-40 object-cover" />
            <div className="font-bold text-lg mb-1">{d.designName}</div>
            <div className="text-gray-500 text-sm mb-2 line-clamp-2">{d.description}</div>
            <div className="flex gap-2 mt-auto">
              <Button size="icon" variant="ghost" onClick={() => handleHide(d._id)} disabled={actionId===d._id} title="Ẩn khỏi cộng đồng">
                <EyeOff />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleDelete(d._id)} disabled={actionId===d._id} title="Xóa thiết kế">
                <Trash2 />
              </Button>
              <a href={`/shared-designs/${d._id}`} target="_blank" rel="noopener noreferrer">
                <Button size="icon" variant="outline">Xem</Button>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 