"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DesignTabs from "@/components/DesignTabs";
import { Design } from "@/types/design";
import { Trash2 } from "lucide-react";
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

export default function AdminDesignsPage() {
  const [designTemplates, setDesignTemplates] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/designs?userId=admin")
      .then(res => res.json())
      .then(data => setDesignTemplates(data))
      .catch(() => setDesignTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mẫu thiết kế này?")) return;
    setDeletingId(id);
    await fetch(`http://localhost:5000/api/designs/${id}`, { method: "DELETE" });
    setDesignTemplates(prev => prev.filter(item => item._id !== id));
    setDeletingId(null);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-pink-600">Bảng điều khiển quản trị</h1>
      <DesignTabs />
      <div className="bg-white rounded-xl shadow p-8">
        <h2 className="text-xl font-bold mb-4 text-pink-500">Quản lý mẫu thiết kế</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading && (
            <div className="col-span-full text-center text-gray-400">Đang tải dữ liệu...</div>
          )}
          {!loading && designTemplates.length === 0 && (
            <div className="col-span-full text-center text-gray-400">Chưa có mẫu thiết kế sẵn nào.</div>
          )}
          {designTemplates.map((item) => (
            <div key={item._id} className="overflow-hidden group bg-gray-50 rounded-xl border shadow-sm flex flex-col">
              <div className="relative">
                <div className="aspect-square overflow-hidden rounded-t-xl">
                  <Image
                    src={item.previewImage || "/placeholder.svg"}
                    alt={item.designName}
                    width={300}
                    height={300}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-lg mb-1">{item.designName}</h3>
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{item.description}</p>
                <div className="mt-auto flex gap-2">
                  <Link href={`/customize?templateId=${item._id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      Tùy chỉnh
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="ml-2 border border-pink-200 text-pink-500 hover:bg-pink-50 rounded-full"
                        onClick={() => setConfirmId(item._id)}
                        title="Xóa thiết kế"
                        disabled={deletingId === item._id}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-pink-600">Xác nhận xóa mẫu thiết kế</AlertDialogTitle>
                        <AlertDialogDescription>Bạn có chắc chắn muốn xóa mẫu thiết kế này? Hành động này không thể hoàn tác.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-pink-200 text-pink-500 hover:bg-pink-50" onClick={() => setConfirmId(null)}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-pink-500 hover:bg-pink-600 text-white"
                          onClick={async () => {
                            setDeletingId(item._id);
                            try {
                              await fetch(`http://localhost:5000/api/designs/${item._id}`, { method: "DELETE" });
                              setDesignTemplates(prev => prev.filter(d => d._id !== item._id));
                              toast.success("Đã xóa mẫu thiết kế!");
                            } catch {
                              toast.error("Xóa mẫu thiết kế thất bại!");
                            } finally {
                              setDeletingId(null);
                              setConfirmId(null);
                            }
                          }}
                          disabled={deletingId === item._id}
                        >
                          {deletingId === item._id ? "Đang xóa..." : "Xóa"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 