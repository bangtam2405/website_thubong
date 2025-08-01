"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faStar } from '@fortawesome/free-solid-svg-icons';
import { Heart, Palette } from 'lucide-react';
import { AddToCartButton } from "@/components/AddToCartButton";
import { formatDateVN } from "@/lib/utils";
import axios from 'axios';
import { toast } from 'sonner';

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
    customizeLink?: string; // Thêm trường này
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
  showCustomizeButton?: boolean; // Thêm prop này
}

const CardProduct: React.FC<CardProductProps> = ({ product, showCustomizeButton = true }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      setLoadingWishlist(true);
      try {
        const res = await axios.get('http://localhost:5000/api/wishlist', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.data.products) {
          setWishlist(res.data.products.map((p: any) => p._id));
        }
      } catch (e) {
        // ignore
      } finally {
        setLoadingWishlist(false);
      }
    };
    fetchWishlist();
  }, []);

  const isWishlisted = wishlist.includes(product._id);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Bạn cần đăng nhập để thêm vào danh sách yêu thích!');
        return;
      }

      if (isWishlisted) {
        // Xóa khỏi wishlist
        await axios.delete('http://localhost:5000/api/wishlist', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          data: { productId: product._id }
        });
        setWishlist(prev => prev.filter(id => id !== product._id));
        toast.success('Đã xóa khỏi danh sách yêu thích!');
      } else {
        // Thêm vào wishlist
        await axios.post('http://localhost:5000/api/wishlist', {
          productId: product._id
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setWishlist(prev => [...prev, product._id]);
        toast.success('Đã thêm vào danh sách yêu thích!');
      }
    } catch (error) {
      console.error('Lỗi khi thao tác wishlist:', error);
      toast.error('Có lỗi xảy ra khi thao tác danh sách yêu thích!');
    }
  };

  const handleCustomize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Sử dụng customizeLink từ sản phẩm nếu có, nếu không thì dùng link mặc định
    const customizeUrl = product.customizeLink || `/customize?edit=68874d8c490eca1da4d7aacb`;
    window.location.href = customizeUrl;
  };
  return (
    <div className="overflow-hidden group cursor-pointer transition-shadow hover:shadow-lg rounded-xl bg-white border">
      <Link href={`/product/${product._id}`} className="block">
        <div className="relative">
          {/* Icon trái tim ở góc trên phải */}
          <button
            className="absolute top-2 right-2 z-10 bg-white/80 rounded-full p-2 shadow hover:bg-pink-100 transition-colors"
            title={isWishlisted ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
            onClick={handleToggleWishlist}
            disabled={loadingWishlist}
          >
            <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? 'fill-pink-500 text-pink-500' : 'text-pink-400'}`} />
          </button>
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
        <div className="flex gap-2">
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
          }} className={showCustomizeButton ? "flex-1 bg-pink-500 hover:bg-pink-600 text-white" : "w-full bg-pink-500 hover:bg-pink-600 text-white"} />
          {showCustomizeButton && (
            <button
              onClick={handleCustomize}
              className="px-3 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-md transition-colors flex items-center justify-center"
              title="Tùy chỉnh sản phẩm"
            >
              <Palette className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardProduct; 