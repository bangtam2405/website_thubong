"use client"

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface MultipleImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  currentImages?: string[];
  folder?: string;
  maxImages?: number;
  className?: string;
}

export default function MultipleImageUpload({ 
  onImagesUploaded, 
  currentImages = [], 
  folder = 'website_thubong',
  maxImages = 5,
  className = '' 
}: MultipleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<string[]>(currentImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Kiểm tra số lượng ảnh
    if (images.length + files.length > maxImages) {
      toast.error(`Chỉ có thể upload tối đa ${maxImages} ảnh`);
      return;
    }

    // Kiểm tra từng file
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file hình ảnh');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
        return;
      }
    }

    // Upload từng file
    uploadFiles(files);
  };

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);
    
    try {
      const newUrls: string[] = [];
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          newUrls.push(data.url);
        } else {
          throw new Error(data.error || 'Upload thất bại');
        }
      }

      const updatedImages = [...images, ...newUrls];
      setImages(updatedImages);
      onImagesUploaded(updatedImages);
      toast.success(`Upload ${newUrls.length} hình ảnh thành công!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload hình ảnh thất bại. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesUploaded(updatedImages);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      const input = fileInputRef.current;
      if (input) {
        input.files = event.dataTransfer.files;
        handleFileSelect({ target: { files: event.dataTransfer.files } } as any);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label>Hình ảnh ({images.length}/{maxImages})</Label>
      
      {/* Hiển thị ảnh đã upload */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={imageUrl}
                alt={`Image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Khu vực upload */}
      {images.length < maxImages && (
        <Card 
          className={`border-2 border-dashed transition-colors ${
            isUploading ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <CardContent className="p-6">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                {isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
                ) : (
                  <Plus className="h-6 w-6 text-gray-600" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {isUploading ? 'Đang upload...' : 'Kéo thả hình ảnh vào đây hoặc click để chọn'}
              </p>
              <p className="text-xs text-gray-500">
                Hỗ trợ: JPG, PNG, GIF (Tối đa 5MB mỗi ảnh)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {images.length < maxImages && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Đang upload...' : 'Thêm hình ảnh'}
        </Button>
      )}
    </div>
  );
} 