"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

type Category = {
  _id: string;
  name: string;
  type: "body" | "feature" | "accessory";
};

type Part = {
  _id: string;
  name: string;
  image: string;
  category: Category | null;
};

export default function PartList() {
  const [parts, setParts] = useState<Part[]>([]);

  useEffect(() => {
    axios
      .get("/api/parts")
      .then((res) => setParts(res.data))
      .catch((err) => console.error("Lỗi lấy parts:", err));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Danh sách các Part</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {parts.map((part) => (
          <div
            key={part._id}
            className="border rounded-lg p-4 shadow flex items-center space-x-4"
          >
            <img
              src={part.image}
              alt={part.name}
              className="w-24 h-24 object-contain rounded border"
            />
            <div>
              <h3 className="text-lg font-semibold">{part.name}</h3>
              <p className="text-sm text-gray-600">
                Danh mục:{" "}
                {part.category
                  ? `${part.category.name} (${part.category.type})`
                  : "Không có"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
