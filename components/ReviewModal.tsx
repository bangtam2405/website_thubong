import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";
import Image from "next/image";

const MAX_FILES = 5;
const MAX_VIDEO = 1;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 20 * 1024 * 1024;

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  orderItemId?: string;
  onSubmitted?: () => void;
}

export default function ReviewModal({ open, onClose, productId, orderItemId, onSubmitted }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // Xử lý chọn file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    let images = files.filter(f => f.type.startsWith("image/"));
    let videos = files.filter(f => f.type.startsWith("video/"));
    for (const file of selected) {
      if (file.type.startsWith("image/")) {
        if (images.length >= MAX_FILES) continue;
        if (file.size > MAX_IMAGE_SIZE) {
          toast.error(`Ảnh ${file.name} vượt quá 5MB!`);
          continue;
        }
        images.push(file);
      } else if (file.type === "video/mp4") {
        if (videos.length >= MAX_VIDEO) continue;
        if (file.size > MAX_VIDEO_SIZE) {
          toast.error(`Video ${file.name} vượt quá 20MB!`);
          continue;
        }
        videos.push(file);
      } else {
        toast.error(`File ${file.name} không đúng định dạng!`);
      }
    }
    setFiles([...images, ...videos]);
    e.target.value = "";
  };

  // Xóa file khỏi danh sách
  const handleRemoveFile = (idx: number) => {
    setFiles(files => files.filter((_, i) => i !== idx));
  };

  // Upload file lên API, trả về mảng URL
  const uploadAllFiles = async (): Promise<string[]> => {
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "review-media");
        const res = await axios.post("/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        urls.push(res.data.url);
      }
      return urls;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!rating) return toast.error("Vui lòng chọn số sao!");
    if (files.length > MAX_FILES + MAX_VIDEO) return toast.error("Chỉ được tải lên tối đa 5 ảnh và 1 video!");
    setLoading(true);
    try {
      let media: string[] = [];
      if (files.length > 0) {
        media = await uploadAllFiles();
      }
      // Thêm log để kiểm tra giá trị orderItemId
      console.log("Gửi review với orderItem:", orderItemId);
      await axios.post("http://localhost:5000/api/reviews", {
        productId,
        rating,
        comment,
        media,
        orderItem: orderItemId,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Đã gửi đánh giá thành công!");
      setComment("");
      setRating(5);
      setFiles([]);
      onClose();
      onSubmitted?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gửi đánh giá thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md" aria-describedby="review-dialog-desc">
        <DialogHeader>
          <DialogTitle>Đánh giá sản phẩm</DialogTitle>
        </DialogHeader>
        <p id="review-dialog-desc" className="sr-only">
          Hãy để lại đánh giá và nhận xét của bạn về sản phẩm này.
        </p>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-center gap-2">
            {[1,2,3,4,5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={star <= rating ? "text-yellow-400 text-2xl" : "text-gray-300 text-2xl"}
                aria-label={`Chọn ${star} sao`}
              >
                ★
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-500">{rating} sao</span>
          </div>
          <Textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Nhận xét của bạn về sản phẩm..."
            rows={4}
            className="resize-none"
          />
         {/* Upload media */}
         <div>
           <label className="block font-medium mb-1">Ảnh/Video đánh giá (tối đa 5 ảnh, 1 video):</label>
           <input
             type="file"
             accept="image/jpeg,image/png,video/mp4"
             multiple
             onChange={handleFileChange}
             disabled={files.length >= MAX_FILES + MAX_VIDEO || uploading || loading}
           />
           <div className="flex flex-wrap gap-2 mt-2">
             {files.map((file, idx) => file.type.startsWith("image/") ? (
               <div key={idx} className="relative w-20 h-20">
                 <Image
                   src={URL.createObjectURL(file)}
                   alt={file.name}
                   fill
                   className="object-cover rounded border"
                 />
                 <button
                   type="button"
                   className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center text-xs text-red-500"
                   onClick={() => handleRemoveFile(idx)}
                   aria-label="Xóa"
                 >×</button>
               </div>
             ) : file.type === "video/mp4" ? (
               <div key={idx} className="relative w-20 h-20">
                 <video src={URL.createObjectURL(file)} controls className="w-20 h-20 object-cover rounded border" />
                 <button
                   type="button"
                   className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full w-6 h-6 flex items-center justify-center text-xs text-red-500"
                   onClick={() => handleRemoveFile(idx)}
                   aria-label="Xóa"
                 >×</button>
               </div>
             ) : null)}
           </div>
         </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading || uploading} className="w-full bg-pink-500 hover:bg-pink-600">
            {loading || uploading ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 