'use client';

import React, { useState } from 'react';

export default function AddProductPage() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate dữ liệu đơn giản
    if (!name || !price || !category) {
      setMessage('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          price: Number(price),
          category,
          description,
        }),
      });

      if (res.ok) {
        setMessage('Thêm sản phẩm thành công');
        setName('');
        setPrice('');
        setCategory('');
        setDescription('');
      } else {
        const data = await res.json();
        setMessage('Lỗi: ' + data.message);
      }
    } catch (error) {
      setMessage('Lỗi khi gọi API');
      console.error(error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Thêm sản phẩm mới</h1>

      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Tên sản phẩm:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label>Giá:</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div>
          <label>Danh mục:</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <div>
          <label>Mô tả:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button type="submit">Thêm sản phẩm</button>
      </form>
    </div>
  );
}
