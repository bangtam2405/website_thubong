"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Star, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDateVN } from "@/lib/utils";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

export default function AdminReviewPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/reviews", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(res => setReviews(res.data))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này?")) return;
    setDeleting(id);
    try {
      await axios.delete(`http://localhost:5000/api/reviews/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setReviews(reviews => reviews.filter(r => r._id !== id));
      toast.success("Đã xóa đánh giá!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xóa đánh giá thất bại hoặc API chưa hỗ trợ!");
    } finally {
      setDeleting(null);
    }
  };

  const filteredReviews = reviews.filter(r => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return (
      (r.productName && r.productName.toLowerCase().includes(s)) ||
      (r.userName && r.userName.toLowerCase().includes(s)) ||
      (r.comment && r.comment.toLowerCase().includes(s)) ||
      (r.rating && r.rating.toString().includes(s))
    );
  });

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-pink-600">Quản Lý Đánh Giá Sản Phẩm</h1>
      <div className="flex items-center gap-2 mb-4">
        <div className="relative w-full max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-200 outline-none w-full"
            placeholder="Tìm kiếm sản phẩm, user, nội dung đánh giá"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-16"><span className="text-gray-400">Đang tải...</span></div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow border bg-white">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-pink-50">
                <TableHead className="py-3 px-4">Sản phẩm</TableHead>
                <TableHead className="py-3 px-4">Khách hàng</TableHead>
                <TableHead className="py-3 px-4 text-center">Số sao</TableHead>
                <TableHead className="py-3 px-4">Nhận xét</TableHead>
                <TableHead className="py-3 px-4 text-center">Ngày</TableHead>
                <TableHead className="py-3 px-4 text-center">Ảnh</TableHead>
                <TableHead className="py-3 px-4 text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map(r => (
                <TableRow key={r._id} className="hover:bg-pink-50 transition">
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {r.product?.image && <img src={r.product.image} alt={r.product?.name} className="w-10 h-10 object-cover rounded border shadow" />}
                      <span className="font-semibold">
                        {r.product?.name
                          ? r.product.name
                          : r.product?._id
                            ? `#${r.product._id.slice(-6)}`
                            : typeof r.product === 'string'
                              ? `#${r.product.slice(-6)}`
                              : "Không xác định"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {r.user?.avatar && <img src={r.user.avatar} alt={r.user?.username || r.user?.email} className="w-8 h-8 rounded-full border" />}
                      <span>{r.user?.username || r.user?.email || r.user}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4 text-center">
                    <div className="flex gap-1 justify-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4 line-clamp-2 max-w-xs">{r.comment}</TableCell>
                  <TableCell className="py-3 px-4 text-center">{formatDateVN(r.createdAt)}</TableCell>
                  <TableCell className="py-3 px-4 text-center">
                    {r.media && r.media.length > 0 ? (
                      <img src={r.media[0]} alt="Ảnh review" className="w-12 h-12 object-cover rounded border cursor-pointer" onClick={() => setSelected(r)} />
                    ) : <span className="text-gray-400 text-xs">Không có</span>}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-center">
                    <Button size="icon" variant="ghost" onClick={() => setSelected(r)} title="Xem chi tiết">
                      <Star className="w-4 h-4 text-pink-400" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => handleDelete(r._id)} disabled={deleting === r._id} title="Xóa đánh giá">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {/* Popup xem chi tiết review */}
      <Dialog open={!!selected} onOpenChange={v => !v && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết đánh giá</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {selected.user?.avatar && <img src={selected.user.avatar} alt={selected.user?.username || selected.user?.email} className="w-10 h-10 rounded-full border" />}
                <div>
                  <div className="font-semibold">{selected.user?.username || selected.user?.email || selected.user}</div>
                  <div className="text-xs text-gray-400">{formatDateVN(selected.createdAt)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selected.product?.image && <img src={selected.product.image} alt={selected.product?.name} className="w-12 h-12 object-cover rounded border" />}
                <span className="font-semibold">
                  {selected.product?.name
                    ? selected.product.name
                    : selected.product?._id
                      ? `#${selected.product._id.slice(-6)}`
                      : typeof selected.product === 'string'
                        ? `#${selected.product.slice(-6)}`
                        : "Sản phẩm không xác định"}
                </span>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < selected.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                ))}
              </div>
              <div className="text-gray-700 whitespace-pre-line">{selected.comment}</div>
              {selected.media && selected.media.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {selected.media.map((img: string, idx: number) => (
                    <img key={idx} src={img} alt="Ảnh review" className="w-24 h-24 object-cover rounded border" />
                  ))}
                </div>
              )}
              <div className="pt-2">
                <Button
                  type="button"
                  className="bg-pink-100 text-pink-600 hover:bg-pink-200 font-semibold"
                  onClick={() => window.open(`/product/${selected.product?._id || selected.product}#reviews`, "_blank")}
                >
                  Xem trên trang sản phẩm
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 