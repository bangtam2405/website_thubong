"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2 } from "lucide-react"
import ImageUpload from "@/components/ImageUpload"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export default function GiftBoxesPage() {
  const [giftBoxes, setGiftBoxes] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editGiftBox, setEditGiftBox] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGiftBoxes();
  }, []);

  async function fetchGiftBoxes() {
    setLoading(true);
    const res = await fetch("http://localhost:5000/api/giftboxes");
    const data = await res.json();
    setGiftBoxes(data);
    setLoading(false);
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Quản Lý Hộp Quà</CardTitle>
            <CardDescription>Thêm, sửa, xóa hộp quà tặng cho khách hàng.</CardDescription>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" /> Thêm Hộp Quà
          </Button>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <GiftBoxForm
              onSuccess={() => {
                setShowAddForm(false);
                fetchGiftBoxes();
              }}
              onCancel={() => setShowAddForm(false)}
            />
          )}
          {showEditForm && editGiftBox && (
            <GiftBoxForm
              giftBox={editGiftBox}
              onSuccess={() => {
                setShowEditForm(false);
                setEditGiftBox(null);
                fetchGiftBoxes();
              }}
              onCancel={() => {
                setShowEditForm(false);
                setEditGiftBox(null);
              }}
            />
          )}
          <GiftBoxTable
            giftBoxes={giftBoxes}
            onEdit={(giftBox: any) => {
              setEditGiftBox(giftBox);
              setShowEditForm(true);
            }}
            onDelete={async (id: string) => {
              if (window.confirm("Bạn có chắc chắn muốn xóa hộp quà này?")) {
                await fetch(`http://localhost:5000/api/giftboxes/${id}`, { method: "DELETE" });
                fetchGiftBoxes();
              }
            }}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function GiftBoxForm({ giftBox, onSuccess, onCancel }: { giftBox?: any, onSuccess: () => void, onCancel: () => void }) {
  const [form, setForm] = useState<any>({
    name: giftBox?.name || "",
    image: giftBox?.image || "",
    price: giftBox?.price || 0,
    quantity: giftBox?.quantity || 0,
    description: giftBox?.description || "",
    _id: giftBox?._id,
  });
  const isEdit = !!giftBox;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      await fetch(`http://localhost:5000/api/giftboxes/${giftBox._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("http://localhost:5000/api/giftboxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    onSuccess();
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6 bg-yellow-50 p-4 rounded-xl shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input name="name" value={form.name} onChange={handleChange} placeholder="Tên hộp quà" required />
        <Input name="price" value={form.price} onChange={handleChange} placeholder="Giá" type="number" required />
      </div>
      <Input name="quantity" value={form.quantity} onChange={handleChange} placeholder="Tồn kho" type="number" min={0} required />
      <ImageUpload
        onImageUploaded={url => setForm({ ...form, image: url })}
        currentImage={form.image}
        folder="giftboxes"
      />
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Mô tả" className="border rounded px-2 py-2 w-full" />
      <div className="flex gap-2 mt-2">
        <Button type="submit">{isEdit ? "Cập nhật" : "Thêm mới"}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Hủy</Button>
      </div>
    </form>
  );
}

function GiftBoxTable({ giftBoxes, onEdit, onDelete, loading }: { giftBoxes: any[], onEdit: (giftBox: any) => void, onDelete: (id: string) => void, loading: boolean }) {
  return (
    <div className="overflow-x-auto">
      <Table className="mt-4 bg-white rounded-xl shadow">
        <TableHeader>
          <TableRow>
            <TableHead>Tên</TableHead>
            <TableHead>Giá</TableHead>
            <TableHead>Tồn kho</TableHead>
            <TableHead>Ảnh</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={6} className="text-center">Đang tải...</TableCell></TableRow>
          ) : giftBoxes.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="text-center">Không có hộp quà nào.</TableCell></TableRow>
          ) : giftBoxes.map((g) => (
            <TableRow key={g._id}>
              <TableCell className="font-medium">{g.name}</TableCell>
              <TableCell>{g.price}₫</TableCell>
              <TableCell>{g.quantity}</TableCell>
              <TableCell><img src={g.image} alt={g.name} className="rounded shadow" width={60} height={60} style={{objectFit:'cover'}} /></TableCell>
              <TableCell>{g.description}</TableCell>
              <TableCell>
                <Button size="icon" variant="ghost" onClick={() => onEdit(g)}><Edit /></Button>
                <Button size="icon" variant="ghost" onClick={() => onDelete(g._id)}><Trash2 /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 