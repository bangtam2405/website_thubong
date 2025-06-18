"use client"

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  folder?: string;
  className?: string;
}

export default function ImageUpload({ 
  onImageUploaded, 
  currentImage, 
  folder = 'website_thubong',
  className = '' 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Kiểm tra loại file
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
      return;
    }

    // Tạo preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onImageUploaded(data.url);
        toast.success('Upload hình ảnh thành công!');
      } else {
        throw new Error(data.error || 'Upload thất bại');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload hình ảnh thất bại. Vui lòng thử lại.');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
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

  const removeImage = () => {
    setPreviewUrl(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label htmlFor="image-upload">Hình ảnh</Label>
      
      <Card 
        className={`border-2 border-dashed transition-colors ${
          previewUrl ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <CardContent className="p-6">
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={removeImage}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                {isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-gray-600" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {isUploading ? 'Đang upload...' : 'Kéo thả hình ảnh vào đây hoặc click để chọn'}
              </p>
              <p className="text-xs text-gray-500">
                Hỗ trợ: JPG, PNG, GIF (Tối đa 5MB)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Input
        ref={fileInputRef}
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full"
      >
        <Upload className="h-4 w-4 mr-2" />
        {isUploading ? 'Đang upload...' : 'Chọn hình ảnh'}
      </Button>
    </div>
  );
} 