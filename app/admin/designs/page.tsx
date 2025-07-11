"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/ImageUpload";
import { Plus, Edit, Trash2, Eye } from "lucide-react";

export default function AdminDesignTemplatesPage() {
  const [designs, setDesigns] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editDesign, setEditDesign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDesigns();
  }, []);

  async function fetchDesigns() {
    setLoading(true);
    const res = await fetch("http://localhost:5000/api/designs?userId=admin");
    let data = await res.json();
    // Không lọc isPublic nữa, chỉ lấy userId === 'admin'
    setDesigns(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (window.confirm("Bạn có chắc chắn muốn xóa mẫu thiết kế này?")) {
      await fetch(`http://localhost:5000/api/designs/${id}`, { method: "DELETE" });
      fetchDesigns();
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Quản lý mẫu thiết kế sẵn</CardTitle>
            <CardDescription>Thêm, sửa, xóa, upload ảnh, mô tả, đặt public cho mẫu thiết kế sẵn.</CardDescription>
          </div>
          <Button onClick={() => { setEditDesign(null); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Thêm mẫu thiết kế
          </Button>
        </CardHeader>
        <CardContent>
          {showForm && (
            <DesignTemplateForm
              design={editDesign}
              onSuccess={() => { setShowForm(false); fetchDesigns(); }}
              onCancel={() => setShowForm(false)}
            />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {loading ? <div>Đang tải...</div> : designs.length === 0 ? <div>Chưa có mẫu thiết kế nào.</div> : designs.map((d) => (
              <div key={d._id} className="bg-white rounded-xl shadow p-4 flex flex-col">
                <img src={d.previewImage || "/placeholder.svg"} alt={d.designName} className="rounded mb-2 w-full h-40 object-cover" />
                <div className="font-bold text-lg mb-1">{d.designName}</div>
                <div className="text-gray-500 text-sm mb-2 line-clamp-2">{d.description}</div>
                <div className="flex gap-2 mt-auto">
                  <a href={`/customize?edit=${d._id}&type=design&adminEdit=1`} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="ghost"><Edit /></Button>
                  </a>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(d._id)}><Trash2 /></Button>
                  <a href={`/customize?templateId=${d._id}`} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="outline"><Eye /></Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DesignTemplateForm({ design, onSuccess, onCancel }: { design?: any, onSuccess: () => void, onCancel: () => void }) {
  const [form, setForm] = useState<any>({
    designName: design?.designName || "",
    description: design?.description || "",
    previewImage: design?.previewImage || "",
    canvasJSON: design?.canvasJSON || {},
    parts: design?.parts || {},
    userId: design?.userId || "admin", // hoặc lấy từ context nếu có auth
    _id: design?._id,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUploaded = (url: string) => {
    setForm({ ...form, previewImage: url });
  };

  // TODO: Thêm UI nhập/lấy canvasJSON (tạm thời nhập JSON thô)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const method = form._id ? "PUT" : "POST";
    const url = form._id ? "http://localhost:5000/api/designs" : "http://localhost:5000/api/designs";
    const body = { ...form, isPublic: false };
    if (method === "PUT") body.id = form._id;
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6 bg-pink-50 p-4 rounded-xl shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input name="designName" value={form.designName} onChange={handleChange} placeholder="Tên mẫu thiết kế" required />
        <Input name="description" value={form.description} onChange={handleChange} placeholder="Mô tả ngắn" />
      </div>
      <ImageUpload onImageUploaded={handleImageUploaded} currentImage={form.previewImage} folder="designs" />
      <Textarea name="canvasJSON" value={typeof form.canvasJSON === 'string' ? form.canvasJSON : JSON.stringify(form.canvasJSON, null, 2)} onChange={e => setForm({ ...form, canvasJSON: e.target.value })} placeholder="Dán JSON canvas thiết kế ở đây" rows={6} />
      <div className="flex gap-2 mt-2">
        <Button type="submit" disabled={saving}>{saving ? "Đang lưu..." : (form._id ? "Cập nhật" : "Thêm mới")}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Hủy</Button>
      </div>
    </form>
  );
} 