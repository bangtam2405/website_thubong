"use client"

import React, { useRef } from "react";

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  folder?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUploaded, currentImage, folder }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        onImageUploaded(data.url); // Cập nhật avatar
      } else {
        alert('Upload ảnh thất bại!');
      }
    } catch (err) {
      alert('Lỗi upload ảnh!');
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Không hiển thị avatar ở đây nữa */}
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
    </div>
  );
};

export default ImageUpload; 