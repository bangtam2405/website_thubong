"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ImageUpload from "@/components/ImageUpload";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Category = {
  _id: string;
  name: string;
  type: 'body' | 'feature' | 'accessory';
};

export default function AddPartForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; image?: string; category?: string; price?: string }>({});

  useEffect(() => {
    axios.get('http://localhost:5000/api/categories')
      .then(res => setCategories(res.data))
      .catch(err => {
        console.error('Lỗi lấy danh mục:', err);
        toast.error("Không thể tải danh mục sản phẩm!");
      });
  }, []);

  // Validation functions
  const validateName = (name: string) => {
    if (!name.trim()) return "Tên sản phẩm là bắt buộc";
    if (name.trim().length < 2) return "Tên sản phẩm phải có ít nhất 2 ký tự";
    return "";
  };

  const validatePrice = (price: string) => {
    if (!price.trim()) return "Giá sản phẩm là bắt buộc";
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) return "Giá sản phẩm phải là số dương";
    return "";
  };

  const validateImage = (image: string) => {
    if (!image.trim()) return "Hình ảnh sản phẩm là bắt buộc";
    return "";
  };

  const validateCategory = (category: string) => {
    if (!category.trim()) return "Danh mục sản phẩm là bắt buộc";
    return "";
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    const error = validateName(value);
    setErrors(prev => ({ ...prev, name: error }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrice(value);
    const error = validatePrice(value);
    setErrors(prev => ({ ...prev, price: error }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
    const error = validateCategory(value);
    setErrors(prev => ({ ...prev, category: error }));
  };

  const handleImageUploaded = (imageUrl: string) => {
    setImage(imageUrl);
    const error = validateImage(imageUrl);
    setErrors(prev => ({ ...prev, image: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validation đầy đủ
    const nameError = validateName(name);
    const priceError = validatePrice(price);
    const imageError = validateImage(image);
    const categoryError = validateCategory(selectedCategory);

    if (nameError || priceError || imageError || categoryError) {
      setErrors({
        name: nameError,
        price: priceError,
        image: imageError,
        category: categoryError
      });
      setLoading(false);
      return;
    }

    try {
      const partData = {
        name: name.trim(),
        image,
        category: selectedCategory,
        price: parseFloat(price)
      };

      await axios.post('/api/admin/part', partData);
      toast.success("Thêm sản phẩm thành công!");

      // Reset form
      setName('');
      setImage('');
      setSelectedCategory('');
      setPrice('');
      setErrors({});
    } catch (error: any) {
      console.error('Lỗi khi thêm sản phẩm:', error);
      
      // Xử lý các trường hợp lỗi cụ thể
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.message || error.response?.data?.msg || "Dữ liệu không hợp lệ";
        if (errorMsg.includes("tên") && errorMsg.includes("tồn tại")) {
          setErrors({ name: "Sản phẩm đã tồn tại" });
        } else if (errorMsg.includes("hình ảnh")) {
          setErrors({ image: "Định dạng hình ảnh không hợp lệ" });
        } else if (errorMsg.includes("giá")) {
          setErrors({ price: "Giá sản phẩm không hợp lệ" });
        } else {
          toast.error(errorMsg);
        }
      } else if (error.response?.status === 401) {
        toast.error("Bạn không có quyền thêm sản phẩm!");
      } else {
        toast.error("Có lỗi xảy ra khi thêm sản phẩm!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-pink-600">
            Thêm Sản Phẩm Mới
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Tên sản phẩm</Label>
              <Input
                id="name"
                type="text"
                placeholder="Tên sản phẩm (VD: Tai thỏ, Mắt tròn...)"
                value={name}
                onChange={handleNameChange}
                onBlur={handleNameChange}
                className={errors.name ? "border-red-500" : ""}
                required
              />
              {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
            </div>

            <div>
              <Label htmlFor="price">Giá sản phẩm (VNĐ)</Label>
              <Input
                id="price"
                type="number"
                placeholder="Nhập giá sản phẩm"
                value={price}
                onChange={handlePriceChange}
                onBlur={handlePriceChange}
                className={errors.price ? "border-red-500" : ""}
                min="0"
                step="1000"
                required
              />
              {errors.price && <div className="text-red-500 text-xs mt-1">{errors.price}</div>}
            </div>

            <div>
              <Label>Hình ảnh sản phẩm</Label>
              <ImageUpload 
                onImageUploaded={handleImageUploaded}
                currentImage={image}
                folder="parts"
              />
              {errors.image && <div className="text-red-500 text-xs mt-1">{errors.image}</div>}
              <div className="text-xs text-gray-500 mt-1">
                Chỉ chấp nhận file ảnh (JPG, PNG, GIF)
              </div>
            </div>

            <div>
              <Label htmlFor="category">Danh mục sản phẩm</Label>
              <select
                id="category"
                value={selectedCategory}
                onChange={handleCategoryChange}
                onBlur={handleCategoryChange}
                className={`w-full px-3 py-2 border rounded ${errors.category ? "border-red-500" : ""}`}
                required
              >
                <option value="">Chọn danh mục</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name} ({cat.type})
                  </option>
                ))}
              </select>
              {errors.category && <div className="text-red-500 text-xs mt-1">{errors.category}</div>}
            </div>

            <Button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-lg"
              disabled={loading}
            >
              {loading ? "Đang thêm sản phẩm..." : "Thêm Sản Phẩm"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
