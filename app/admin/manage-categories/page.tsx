"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Save, X, Plus, Eye } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "@/components/ImageUpload";

interface Category {
  _id: string;
  name: string;
  parent: string | null;
  type: string;
  image?: string;
  price?: number;
  children?: Category[];
}

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Category>>({});
  const [loading, setLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/categories");
      setCategories(response.data);
    } catch (error) {
      toast.error("Lỗi khi tải danh mục");
      console.error(error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category._id);
    setEditForm({
      name: category.name,
      type: category.type,
      image: category.image,
      price: category.price,
    });
  };

  const handleSave = async () => {
    if (!editingId) return;

    setLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/categories/${editingId}`, editForm);
      toast.success("Cập nhật danh mục thành công!");
      setEditingId(null);
      setEditForm({});
      fetchCategories();
    } catch (error) {
      toast.error("Lỗi khi cập nhật danh mục");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;

    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/categories/${id}`);
      toast.success("Xóa danh mục thành công!");
      fetchCategories();
    } catch (error) {
      toast.error("Lỗi khi xóa danh mục");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUploaded = (imageUrl: string) => {
    setEditForm(prev => ({ ...prev, image: imageUrl }));
  };

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Lấy danh mục gốc (không có parent)
  const rootCategories = categories.filter(cat => cat.parent === null);

  // Lấy danh mục con của một danh mục
  const getChildren = (parentId: string) => {
    return categories.filter(cat => cat.parent === parentId);
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const children = getChildren(category._id);
    const isEditing = editingId === category._id;
    const isExpanded = expandedCategories.has(category._id);
    const hasChildren = children.length > 0;

    return (
      <div key={category._id} className={`${level > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
        <Card className="mb-4">
          <CardContent className="p-4">
            {isEditing ? (
              // Form chỉnh sửa
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Tên danh mục"
                    className="flex-1"
                  />
                  <select
                    value={editForm.type || 'body'}
                    onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                    className="border rounded px-3 py-2"
                  >
                    <option value="body">Body</option>
                    <option value="ear">Ear</option>
                    <option value="eye">Eye</option>
                    <option value="nose">Nose</option>
                    <option value="mouth">Mouth</option>
                    <option value="clothing">Clothing</option>
                    <option value="accessory">Accessory</option>
                    <option value="option">Option</option>
                  </select>
                </div>
                
                {/* Chỉ hiển thị ImageUpload và Price cho cấp 3 (không có con) */}
                {!hasChildren && (
                  <>
                    <ImageUpload
                      onImageUploaded={handleImageUploaded}
                      currentImage={editForm.image}
                      folder="categories"
                    />
                    
                    <Input
                      type="number"
                      value={editForm.price || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                      placeholder="Giá (nếu có)"
                    />
                  </>
                )}
                
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={loading} size="sm">
                    <Save className="h-4 w-4 mr-1" />
                    Lưu
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-1" />
                    Hủy
                  </Button>
                </div>
              </div>
            ) : (
              // Hiển thị thông tin
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {category.image && (
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-gray-500">
                      Loại: {category.type} 
                      {category.price && ` • Giá: ${category.price}₫`}
                      {level === 0 && " (Danh mục gốc)"}
                      {level === 1 && hasChildren && " (Danh mục cha)"}
                      {level === 1 && !hasChildren && " (Danh mục con)"}
                      {level === 2 && " (Danh mục cháu)"}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {hasChildren && (
                    <Button 
                      onClick={() => toggleExpanded(category._id)} 
                      variant="outline" 
                      size="sm"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {isExpanded ? 'Ẩn con' : 'Xem con'}
                    </Button>
                  )}
                  <Button 
                    onClick={() => handleEdit(category)} 
                    variant="outline" 
                    size="sm"
                    disabled={loading}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Sửa
                  </Button>
                  <Button 
                    onClick={() => handleDelete(category._id)} 
                    variant="destructive" 
                    size="sm"
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Xóa
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Hiển thị danh mục con nếu được mở rộng */}
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {children.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Quản lý danh mục chi tiết</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.href = '/admin/bulk-update'}>
              Cập nhật hàng loạt
            </Button>
            <Button onClick={() => window.location.href = '/admin/category'}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm danh mục mới
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            {rootCategories.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Chưa có danh mục nào. Hãy thêm danh mục đầu tiên!
              </div>
            ) : (
              <div className="space-y-4">
                {rootCategories.map(category => renderCategory(category))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 