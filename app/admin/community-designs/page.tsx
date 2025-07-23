"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trash2, EyeOff } from "lucide-react";
import DesignTabs from "@/components/DesignTabs";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function AdminCommunityDesignsPage() {
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

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
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-pink-600">Bảng điều khiển quản trị</h1>
      <DesignTabs />
      <h1 className="text-2xl font-bold mb-4">Quản lý thiết kế cộng đồng</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? <div className="col-span-full text-center text-gray-400">Đang tải...</div> : designs.length === 0 ? <div className="col-span-full text-center text-gray-400">Chưa có thiết kế cộng đồng nào.</div> : designs.map((d) => (
          <div key={d._id} className="overflow-hidden group bg-gray-50 rounded-xl border shadow-sm flex flex-col">
            <div className="relative">
              <div className="aspect-square overflow-hidden rounded-t-xl">
                <Image
                  src={d.previewImage || "/placeholder.svg"}
                  alt={d.designName}
                  width={300}
                  height={300}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold text-lg mb-1">{d.designName}</h3>
              <p className="text-sm text-gray-500 mb-2 line-clamp-2">{d.description}</p>
              <div className="mt-auto flex gap-2">
                <Button size="icon" variant="ghost" onClick={() => handleHide(d._id)} disabled={actionId===d._id} title="Ẩn khỏi cộng đồng">
                  <EyeOff />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="ml-2 border border-pink-200 text-pink-500 hover:bg-pink-50 rounded-full"
                      onClick={() => setConfirmId(d._id)}
                      title="Xóa thiết kế"
                      disabled={actionId === d._id}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-pink-600">Xác nhận xóa thiết kế cộng đồng</AlertDialogTitle>
                      <AlertDialogDescription>Bạn có chắc chắn muốn xóa thiết kế này? Hành động này không thể hoàn tác.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-pink-200 text-pink-500 hover:bg-pink-50" onClick={() => setConfirmId(null)}>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-pink-500 hover:bg-pink-600 text-white"
                        onClick={async () => {
                          setActionId(d._id);
                          try {
                            await fetch(`http://localhost:5000/api/designs/${d._id}`, { method: "DELETE" });
                            fetchDesigns();
                            toast.success("Đã xóa thiết kế!");
                          } catch {
                            toast.error("Xóa thiết kế thất bại!");
                          } finally {
                            setActionId(null);
                            setConfirmId(null);
                          }
                        }}
                        disabled={actionId === d._id}
                      >
                        {actionId === d._id ? "Đang xóa..." : "Xóa"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <a href={`/shared-designs/${d._id}`} target="_blank" rel="noopener noreferrer">
                  <Button size="icon" variant="outline">Xem</Button>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 