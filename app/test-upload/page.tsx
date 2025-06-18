"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TestUploadPage() {
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError('');

    try {
      console.log('Selected file:', file.name, file.size, file.type);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'test');

      console.log('Sending request to /api/upload...');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setUploadedImage(data.url);
        alert('Upload thành công!');
      } else {
        setError(data.error || 'Upload thất bại');
        alert('Upload thất bại: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      alert('Upload thất bại: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Test Cloudinary Upload</h1>
      
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Chọn file hình ảnh</Label>
              <Input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </div>
            
            {isLoading && (
              <div className="text-blue-600">Đang upload...</div>
            )}
            
            {error && (
              <div className="text-red-600 bg-red-50 p-3 rounded">
                Lỗi: {error}
              </div>
            )}
          </CardContent>
        </Card>

        {uploadedImage && (
          <Card>
            <CardHeader>
              <CardTitle>Kết quả upload</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded" 
                  className="w-full max-w-md mx-auto rounded-lg shadow"
                />
                <div className="bg-gray-100 p-3 rounded">
                  <p className="text-sm font-mono break-all">{uploadedImage}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Hướng dẫn debug</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Mở Developer Tools (F12)</li>
              <li>Vào tab Console</li>
              <li>Chọn file hình ảnh để upload</li>
              <li>Xem log để debug lỗi</li>
              <li>Kiểm tra Network tab để xem request/response</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 