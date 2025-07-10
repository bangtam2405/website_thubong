"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminReviewPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/reviews/all", {
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

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-pink-600">Quản Lý Đánh Giá Sản Phẩm</h1>
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Số sao</TableHead>
                <TableHead>Nhận xét</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map(r => (
                <TableRow key={r._id}>
                  <TableCell>
                    <div className="font-semibold">{r.product?.name || r.product}</div>
                  </TableCell>
                  <TableCell>{r.user?.username || r.user?.email || r.user}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{r.comment}</TableCell>
                  <TableCell>{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="icon" variant="destructive" onClick={() => handleDelete(r._id)} disabled={deleting === r._id}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 