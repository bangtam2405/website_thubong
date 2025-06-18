import { useState } from 'react';
import { toast } from 'sonner';

interface UseImageUploadReturn {
  isUploading: boolean;
  uploadImage: (file: File, folder?: string) => Promise<string | null>;
}

export const useImageUpload = (): UseImageUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File, folder: string = 'website_thubong'): Promise<string | null> => {
    setIsUploading(true);
    
    try {
      // Kiểm tra loại file
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file hình ảnh');
        return null;
      }

      // Kiểm tra kích thước file (tối đa 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
        return null;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Upload hình ảnh thành công!');
        return data.url;
      } else {
        throw new Error(data.error || 'Upload thất bại');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload hình ảnh thất bại. Vui lòng thử lại.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadImage,
  };
}; 