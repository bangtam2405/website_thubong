"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function BulkUpdatePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRenameTaiToMieng = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn đổi tất cả danh mục 'tai' thành 'miệng'?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put("http://localhost:5000/api/categories/bulk/rename-tai-to-mieng");
      setResult(response.data);
      toast.success(response.data.message);
      
      // Reload trang sau 2 giây
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      toast.error("Lỗi khi cập nhật danh mục");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Cập nhật hàng loạt danh mục</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Đổi tên danh mục "tai" thành "miệng"</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Cảnh báo:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Tất cả danh mục có tên chứa "tai" sẽ được đổi thành "miệng"</li>
                <li>• Type sẽ được cập nhật thành "mouth"</li>
                <li>• Hành động này không thể hoàn tác</li>
                <li>• Trang sẽ tự động reload sau khi hoàn thành</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleRenameTaiToMieng}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {loading ? "Đang cập nhật..." : "Đổi tất cả 'tai' thành 'miệng'"}
            </Button>
            
            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800">✅ Kết quả:</h3>
                <p className="text-green-700">{result.message}</p>
                <p className="text-sm text-green-600">Số danh mục đã cập nhật: {result.modifiedCount}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/admin'}
          >
            Quay lại trang admin
          </Button>
        </div>
      </div>
    </div>
  );
} 