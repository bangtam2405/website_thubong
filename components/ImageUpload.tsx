"use client"

import React, { useRef, useState } from "react";
import ImageUploadLoader from "./ui/ImageUploadLoader";

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  folder?: string;
  onError?: (msg: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUploaded, currentImage, folder, onError }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);

    try {
      setLoading(true);
      setUploaded(false);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        onImageUploaded(data.url); // Cập nhật avatar
        setUploaded(true);
        if (onError) onError(""); // Xóa lỗi cũ nếu có
      } else {
        if (onError) onError('Upload ảnh thất bại!');
      }
      setLoading(false);
    } catch (err) {
      if (onError) onError('Lỗi upload ảnh!');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {loading ? (
        <div className="my-4"><ImageUploadLoader /></div>
      ) : (
      <>
      {currentImage && (
        <img
          src={currentImage}
          alt="Ảnh hiện tại"
          className="w-20 h-20 rounded-full border mb-2 object-cover"
        />
      )}
      <button
        type="button"
        className="px-4 py-2 rounded border border-gray-300 bg-white hover:bg-pink-50 text-gray-700 font-medium mb-2"
        onClick={() => fileInputRef.current?.click()}
      >
        Chọn Ảnh
      </button>
      <input
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <div className="text-xs text-gray-400 text-center mt-1">
        Dung lượng file tối đa 1 MB<br />
        Định dạng: .JPEG, .PNG
      </div>
      </>
      )}
    </div>
  );
};

export default ImageUpload; 