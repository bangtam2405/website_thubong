"use client";

import { useEffect, useState } from "react";
import instance from "@/lib/axiosConfig";
import ImageUpload from "@/components/ImageUpload";

interface Category {
  _id: string;
  name: string;
  parent: string | null;
  image?: string;
  price?: number;
  children?: Category[];
}

export default function CategoryForm({ onCancel }: { onCancel?: () => void }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [level1, setLevel1] = useState<string>("");
  const [level2, setLevel2] = useState<string>("");
  const [level3, setLevel3] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [type, setType] = useState<string>("body");
  const [quantity, setQuantity] = useState<string>("");

  useEffect(() => {
    instance.get("http://localhost:5000/api/categories")
      .then(res => setCategories(res.data))
      .catch(err => console.error("Lỗi khi tải danh mục:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parent = level3 || level2 || level1 || null;
    try {
      await instance.post("http://localhost:5000/api/categories", {
        name,
        parent,
        type: parent ? "option" : type,
        image,
        price: price ? Number(price) : undefined,
        quantity: quantity ? Number(quantity) : undefined,
      });
      alert("Đã thêm danh mục");
      setName("");
      setImage("");
      setPrice("");
      setLevel1("");
      setLevel2("");
      setLevel3("");
      setType("body");
      const res = await instance.get("http://localhost:5000/api/categories");
      setCategories(res.data);
    } catch (error) {
      alert("Lỗi khi thêm danh mục");
      console.error(error);
    }
  };

  const handleImageUploaded = (imageUrl: string) => {
    setImage(imageUrl);
  };

  // Lấy các danh mục từng cấp
  const rootOptions = categories.filter(cat => cat.parent === null);
  const level2Options = categories.filter(cat => cat.parent === level1);
  const level2Children = categories.filter(cat => cat.parent === level2);
  const level2IsLeaf = level2 && level2Children.length === 0;

  // Tìm tên của category cha (level 2) đang được chọn
  const selectedLevel2Category = categories.find(cat => cat._id === level2);
  const isFurColorCategory = selectedLevel2Category?.name === "Màu Lông";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <h2 className="text-xl font-semibold text-gray-800">Thêm danh mục (nhiều cấp, chỉ cho chọn nhóm)</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cấp 1: Danh mục gốc</label>
          <select
            value={level1}
            onChange={e => { setLevel1(e.target.value); setLevel2(""); }}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            <option value="">Chọn</option>
            {rootOptions.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
        {level1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cấp 2: Danh mục con</label>
            <select
              value={level2}
              onChange={e => setLevel2(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="">Chọn</option>
              {level2Options.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}
        {/* Nếu level2 được chọn và nó có con, chỉ hiển thị danh sách các con, không cho chọn tiếp */}
        {level2 && !level2IsLeaf && level2Children.length > 0 && (
          <div className="mt-2 col-span-3">
            <div className="font-semibold">Các danh mục con hiện có:</div>
            <ul className="list-disc list-inside text-gray-600">
              {level2Children.map(cat => <li key={cat._id}>{cat.name}</li>)}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <input
          type="text"
          placeholder="Tên danh mục"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2"
          required
        />
        {isFurColorCategory ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mã màu (Hex)</label>
            <input
              type="text"
              placeholder="#FFD700"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
          </div>
        ) : (
          <ImageUpload
            onImageUploaded={handleImageUploaded}
            currentImage={image}
            folder="categories"
          />
        )}
        <input
          type="number"
          placeholder="Giá (nếu có)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2"
        />
        <input
          type="number"
          placeholder="Số lượng (nếu có)"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2"
        />
      </div>

      <div className="pt-4 flex gap-2">
        <button
          type="submit"
          className="bg-black hover:bg-gray-900 text-white font-semibold px-6 py-2 rounded-lg shadow"
        >
          Thêm mới
        </button>
        {onCancel && (
          <button
            type="button"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-lg shadow"
            onClick={onCancel}
          >
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}
