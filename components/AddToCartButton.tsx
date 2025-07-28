"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { toast } from "sonner"
import { Product } from "@/types/product"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import axios from "axios";

interface CategoryOption {
  _id: string;
  name: string;
  price?: number;
}

interface AddToCartButtonProps {
  product: Product
  variant?: "default" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function AddToCartButton({
  product,
  variant = "default",
  size = "default",
  className = "",
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [sizeOptions, setSizeOptions] = useState<CategoryOption[]>([]);
  const [materialOptions, setMaterialOptions] = useState<CategoryOption[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [sizePrice, setSizePrice] = useState(0);
  const [materialPrice, setMaterialPrice] = useState(0);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Lấy options khi mở modal
  const fetchOptions = async () => {
    setLoadingOptions(true);
    try {
      const res = await axios.get("http://localhost:5000/api/categories");
      const categories = res.data;
      // Lấy nhóm cha 'Thân'
      const thanParent = categories.find((cat: any) => cat.name === "Thân" && !cat.parent);
      const thanGroups = thanParent ? categories.filter((cat: any) => cat.parent === thanParent._id) : [];
      // Hàm lấy options theo tên nhóm
      const getOptionsByGroupName = (groupName: string) => {
        const group = thanGroups.find((g: any) => g.name.toLowerCase().includes(groupName.toLowerCase()));
        if (!group) return [];
        return categories.filter((cat: any) => cat.parent === group._id);
      };
      setSizeOptions(getOptionsByGroupName("Kích Thước"));
      setMaterialOptions(getOptionsByGroupName("Chất Liệu"));
    } catch (e) {
      setSizeOptions([]);
      setMaterialOptions([]);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.type === "custom") {
      setShowModal(true);
      fetchOptions();
      return;
    }
    try {
      setIsLoading(true);
      addToCart(product);
      toast.success("Đã thêm vào giỏ hàng!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng");
    } finally {
      setIsLoading(false);
    }
  };

  // Khi chọn size/material thì cập nhật giá
  const handleSelectSize = (id: string) => {
    setSelectedSize(id);
    const opt = sizeOptions.find(o => o._id === id);
    setSizePrice(opt?.price || 0);
  };
  const handleSelectMaterial = (id: string) => {
    setSelectedMaterial(id);
    const opt = materialOptions.find(o => o._id === id);
    setMaterialPrice(opt?.price || 0);
  };

  const handleConfirm = () => {
    if (!selectedSize || !selectedMaterial) {
      toast.error("Vui lòng chọn đầy đủ kích thước và chất liệu!");
      return;
    }
    setIsLoading(true);
    // Tính giá mới
    const newPrice = (product.price || 0) + sizePrice + materialPrice;
    // Lấy tên
    const sizeName = sizeOptions.find(o => o._id === selectedSize)?.name || "";
    const materialName = materialOptions.find(o => o._id === selectedMaterial)?.name || "";
    // Ghi chú vào description
    const desc = `${product.description ? product.description + "\n" : ""}Kích thước: ${sizeName}, Chất liệu: ${materialName}`;
    addToCart({ ...product, price: newPrice, description: desc, size: sizeName, material: materialName });
    setShowModal(false);
    setIsLoading(false);
    toast.success("Đã thêm vào giỏ hàng!");
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleAddToCart}
        disabled={isLoading}
        type="button"
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {isLoading ? "Đang thêm..." : "Thêm vào giỏ"}
      </Button>
      {/* Modal chọn kích thước/chất liệu */}
      {showModal && (
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chọn Kích Thước & Chất Liệu</DialogTitle>
            </DialogHeader>
            {loadingOptions ? (
              <div className="py-10 text-center text-gray-400">Đang tải dữ liệu...</div>
            ) : (
              <>
                {/* Kích Thước */}
                <div className="mb-4">
                  <Label className="block mb-2 font-semibold">Kích Thước</Label>
                  <RadioGroup
                    value={selectedSize}
                    onValueChange={handleSelectSize}
                    className="grid grid-cols-2 md:grid-cols-4 gap-3"
                  >
                    {sizeOptions.map(opt => (
                      <label
                        key={opt._id}
                        htmlFor={`size-${opt._id}`}
                        className={`cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center transition-all
                          ${selectedSize === opt._id ? "border-pink-500 bg-pink-50 shadow" : "border-gray-200 bg-white hover:border-pink-300"}
                        `}
                      >
                        <RadioGroupItem
                          value={opt._id}
                          id={`size-${opt._id}`}
                          className="w-5 h-5 mb-1 accent-pink-500"
                        />
                        <span className="font-medium">{opt.name}</span>
                        {opt.price ? (
                          <span className="text-xs text-gray-500">+{opt.price.toLocaleString('vi-VN')}₫</span>
                        ) : null}
                      </label>
                    ))}
                  </RadioGroup>
                </div>
                {/* Chất Liệu */}
                <div className="mb-4">
                  <Label className="block mb-2 font-semibold">Chất Liệu</Label>
                  <RadioGroup
                    value={selectedMaterial}
                    onValueChange={handleSelectMaterial}
                    className="grid grid-cols-2 md:grid-cols-3 gap-3"
                  >
                    {materialOptions.map(opt => (
                      <label
                        key={opt._id}
                        htmlFor={`material-${opt._id}`}
                        className={`cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center transition-all
                          ${selectedMaterial === opt._id ? "border-pink-500 bg-pink-50 shadow" : "border-gray-200 bg-white hover:border-pink-300"}
                        `}
                      >
                        <RadioGroupItem
                          value={opt._id}
                          id={`material-${opt._id}`}
                          className="w-5 h-5 mb-1 accent-pink-500"
                        />
                        <span className="font-medium">{opt.name}</span>
                        {opt.price ? (
                          <span className="text-xs text-gray-500">+{opt.price.toLocaleString('vi-VN')}₫</span>
                        ) : null}
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              </>
            )}
            <DialogFooter>
              <Button onClick={handleConfirm} className="w-full bg-pink-500 hover:bg-pink-600 text-white">Xác nhận</Button>
              <DialogClose asChild>
                <Button variant="outline" className="w-full mt-2">Huỷ</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
} 