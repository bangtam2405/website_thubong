"use client"
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faStar } from '@fortawesome/free-solid-svg-icons';
import { AddToCartButton } from "@/components/AddToCartButton";

function formatSold(sold: number) {
  if (sold >= 10000) return `${(sold / 1000).toFixed(0)}k+`;
  if (sold >= 1000) return `${(sold / 1000).toFixed(1)}k`;
  return sold.toString();
}

interface CardProductProps {
  product: {
    _id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    type?: "teddy" | "accessory" | "collection" | "new" | "custom";
    rating?: number;
    reviews?: number;
    sold?: number;
    stock?: number;
    featured?: boolean;
    specifications?: {
      body?: string;
      ears?: string;
      eyes?: string;
      furColor?: string;
      clothing?: string | null;
      accessories?: string[];
      size?: string;
    };
    createdAt?: string;
    updatedAt?: string;
    categoryId?: string;
  };
}

const CardProduct: React.FC<CardProductProps> = ({ product }) => {
  return (
    <div className="overflow-hidden group cursor-pointer transition-shadow hover:shadow-lg rounded-xl bg-white border">
      <Link href={`/product/${product._id}`} className="block">
        <div className="relative">
          <div className="aspect-square overflow-hidden">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              width={300}
              height={300}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 hover:text-pink-600 transition-colors text-center">{product.name}</h3>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="flex items-center gap-1 text-yellow-500 font-semibold">
              <FontAwesomeIcon icon={faStar} className="h-4 w-4" />
              {product.rating?.toFixed(1) || '5.0'}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-xs text-gray-600">Đã bán {formatSold(product.sold || 0)}</span>
          </div>
          <div className="text-lg font-semibold text-pink-600 text-center">
            {Number(product.price).toLocaleString('vi-VN')}₫
          </div>
        </div>
      </Link>
      <div className="p-4 pt-0 flex flex-col gap-2">
        <AddToCartButton product={{
          _id: product._id,
          name: product.name,
          description: product.description || "",
          price: product.price,
          image: product.image || "/placeholder.svg",
          type: product.type || "teddy",
          rating: typeof product.rating === "number" ? product.rating : 5,
          reviews: typeof product.reviews === "number" ? product.reviews : 0,
          sold: typeof product.sold === "number" ? product.sold : 0,
          stock: typeof product.stock === "number" ? product.stock : 99,
          featured: !!product.featured,
          specifications: product.specifications,
          createdAt: product.createdAt || new Date().toISOString(),
          updatedAt: product.updatedAt || new Date().toISOString(),
          categoryId: product.categoryId,
        }} className="w-full bg-pink-500 hover:bg-pink-600 text-white" />
      </div>
    </div>
  );
};

export default CardProduct; 