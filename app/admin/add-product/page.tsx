"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ImageUpload from "@/components/ImageUpload";

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

  useEffect(() => {
  axios.get('http://localhost:5000/api/categories') // đường dẫn đúng
    .then(res => setCategories(res.data))
    .catch(err => console.error('Lỗi lấy danh mục:', err))
}, [])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const partData = {
        name,
        image,
        category: selectedCategory,
      };

      await axios.post('/api/admin/part', partData); // endpoint đã dùng verifyToken + checkAdmin
      alert('Đã thêm part mới!');

      // Reset form
      setName('');
      setImage('');
      setSelectedCategory('');
    } catch (error) {
      alert('Lỗi khi thêm part!');
      console.error(error);
    }
  };

  const handleImageUploaded = (imageUrl: string) => {
    setImage(imageUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 border rounded shadow">
      <h2 className="text-xl font-semibold text-center mb-4">Thêm Part Mới</h2>

      <input
        type="text"
        placeholder="Tên part (VD: Tai thỏ, Mắt tròn...)"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        className="w-full px-3 py-2 border rounded"
      />

      <ImageUpload 
        onImageUploaded={handleImageUploaded}
        currentImage={image}
        folder="parts"
      />

      <select
        value={selectedCategory}
        onChange={e => setSelectedCategory(e.target.value)}
        required
        className="w-full px-3 py-2 border rounded"
      >
        <option value="">Chọn danh mục</option>
        {categories.map(cat => (
          <option key={cat._id} value={cat._id}>
            {cat.name} ({cat.type})
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700"
      >
        Thêm Part
      </button>
    </form>
  );
}
