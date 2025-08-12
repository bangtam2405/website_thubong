"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Heart, Save, ShoppingCart, Undo, Redo, Camera, Trash2, Type, Copy } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import axios from "axios"
import CustomFabricCanvas from "@/components/CustomFabricCanvas"
import type { AxiosError } from "axios"
import { useSearchParams } from "next/navigation"
import { useCart } from "@/contexts/CartContext"
import { AddToCartButton } from "@/components/AddToCartButton"
import GiftBoxModal from '@/components/GiftBoxModal'
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import ImageUpload from "@/components/ImageUpload";
import { useRouter } from 'next/navigation';
import { formatDateVN } from "@/lib/utils";

interface Category {
  _id: string
  name: string
  parent: string | null
  type: string
  image?: string
  price?: number
  color?: string; // Thêm trường color cho màu lông
}

interface GiftBox {
  _id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  description?: string;
}

// Define the type for selectedOptions
type SelectedOptions = {
  body: string;
  ears: string;
  eyes: string;
  nose: string;
  mouth: string;
  furColor: string;
  material: string;
  clothing: string;
  accessories: { [key: string]: number }; // Thay đổi từ string[] thành object
  name: string;
  size: string;
  // Add index signature at the end
  [key: string]: any;
};

// Hàm merge robust để đảm bảo đủ key
function robustMergeOptions(defaults: SelectedOptions, loaded: any): SelectedOptions {
  const merged = { ...defaults };
  Object.keys(defaults).forEach(key => {
    if (key === 'accessories') {
      // Xử lý đặc biệt cho accessories
      if (Array.isArray(loaded[key])) {
        // Chuyển đổi từ array cũ sang object mới
        const accessoriesObj: { [key: string]: number } = {};
        loaded[key].forEach((item: any) => {
          const id = typeof item === 'object' && item !== null && item._id ? item._id : item;
          accessoriesObj[id] = (accessoriesObj[id] || 0) + 1;
        });
        merged[key] = accessoriesObj;
      } else if (typeof loaded[key] === 'object' && loaded[key] !== null) {
        // Nếu đã là object thì giữ nguyên
        merged[key] = loaded[key];
      } else {
        merged[key] = {};
      }
    } else if (Array.isArray(defaults[key])) {
      if (Array.isArray(loaded[key])) {
        merged[key] = loaded[key].map((item: any) =>
          typeof item === 'object' && item !== null && item._id ? item._id : item
        );
      } else {
        merged[key] = [];
      }
    } else if (typeof loaded[key] === 'object' && loaded[key] !== null && loaded[key]._id) {
      merged[key] = loaded[key]._id;
    } else if (loaded[key] !== null && loaded[key] !== undefined) {
      merged[key] = loaded[key];
    } else {
      merged[key] = defaults[key];
    }
  });
  return merged;
}

export default function CustomizePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const edit = searchParams.get('edit');
  const from = searchParams.get('from');
  const [design, setDesign] = useState<any>(null);

  useEffect(() => {
    if (edit) {
      fetch(`/api/designs/${edit}`)
        .then(res => res.json())
        .then(setDesign);
    }
  }, [edit]);

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("body")
  // Đảm bảo defaultSelectedOptions luôn có ở đầu file
  const defaultSelectedOptions: SelectedOptions = {
    body: "",
    ears: "",
    eyes: "",
    nose: "",
    mouth: "",
    furColor: "",
    material: "",
    clothing: "",
    accessories: {} as { [key: string]: number },
    name: "",
    size: "",
  };

  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({ ...defaultSelectedOptions });

  const [totalPrice, setTotalPrice] = useState(0) // Giá ban đầu là 0
  const [history, setHistory] = useState<any[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Danh sách màu lông
  const furColors = [
    { name: "Nâu", value: "#D2B48C" },
    { name: "Trắng", value: "#FFFFFF" },
    { name: "Hồng", value: "#FFC0CB" },
    { name: "Vàng", value: "#FFD700" },
    { name: "Xám", value: "#808080" },
    { name: "Be", value: "#F5F5DC" },
  ];

  const editId = searchParams.get("edit");
  const editType = searchParams.get("type"); // "product" hoặc "design"
  const templateId = searchParams.get("templateId");
  const adminEdit = searchParams.get("adminEdit");

  const { addToCart } = useCart();

  const [canvasJSON, setCanvasJSON] = useState<any>(null);
  const fabricRef = useRef<any>(null);
  const [loadedCanvasJSON, setLoadedCanvasJSON] = useState<any>(null);
  const [hasEditedAfterLoad, setHasEditedAfterLoad] = useState(false);

  const [bgImage, setBgImage] = useState<string | null>(null);
  const bgInputRef = useRef<HTMLInputElement | null>(null);

  // State cho text tool
  const [newText, setNewText] = useState("");
  const [newTextColor, setNewTextColor] = useState("#000000");
  const [newTextFont, setNewTextFont] = useState("Arial");
  const [newTextSize, setNewTextSize] = useState(32);
  const [activeTextProps, setActiveTextProps] = useState<{text: string, fill: string, fontSize: number, fontFamily: string} | null>(null);
  const fontOptions = ["Arial", "Times New Roman", "Comic Sans MS", "Courier New", "Georgia", "Tahoma", "Verdana"];

  const [customTexts, setCustomTexts] = useState<{ id: string, text: string, fill: string, fontSize: number, fontFamily: string, left: number, top: number }[]>([]);

  const [giftBoxModalOpen, setGiftBoxModalOpen] = useState(false);
  const [pendingGiftBox, setPendingGiftBox] = useState<any>(null);
  const [selectedGiftBox, setSelectedGiftBox] = useState<GiftBox | null>(null);
  const [giftBoxes, setGiftBoxes] = useState<GiftBox[]>([]);
  const [accessoriesPerPage, setAccessoriesPerPage] = useState(15); // Số phụ kiện hiển thị mỗi lần
  const [bodyPerPage, setBodyPerPage] = useState(9); // Số thân hiển thị mỗi lần
  const [featuresPerPage, setFeaturesPerPage] = useState(12); // Số đặc điểm hiển thị mỗi lần

  // Reset loadedCanvasJSON khi không edit
  useEffect(() => {
    if (!editId) {
      setLoadedCanvasJSON(null);
      console.log("Reset loadedCanvasJSON to null");
    }
  }, [editId]);

  // Reset designLoaded về false mỗi khi editId thay đổi
  useEffect(() => {
    setDesignLoaded(false);
  }, [editId]);

  // Reset designLoaded về false mỗi khi categories thay đổi
  useEffect(() => {
    setDesignLoaded(false);
  }, [categories]);

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log("User not logged in");
    } else {
      console.log("User is logged in, token length:", token.length);
      // Verify token validity
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/me", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log("Token is valid, user:", response.data);
    } catch (error) {
      console.log("Token is invalid or expired");
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      localStorage.removeItem('role');
    }
  };

  // Debug selectedOptions changes
  useEffect(() => {
    console.log("selectedOptions changed:", selectedOptions);
    console.log("Has any selection:", !!(selectedOptions.body || selectedOptions.ears || selectedOptions.eyes || selectedOptions.nose || selectedOptions.mouth || selectedOptions.furColor || selectedOptions.clothing || selectedOptions.accessories.length > 0));
  }, [selectedOptions]);

  // Khởi tạo selectedOptions động dựa trên dữ liệu fetch được
  useEffect(() => {
    if (!loading && categories.length > 0 && !editId) {
      // Không set giá trị mặc định nữa, để canvas trống
      console.log("Categories loaded, keeping canvas empty initially");
      console.log("Current selectedOptions:", selectedOptions);
    }
  }, [loading, categories, editId])

  // Tính tổng giá dựa trên lựa chọn
  useEffect(() => {
    // Nếu chưa chọn gì thì giá = 0
    const hasAnySelection = !!(
      selectedOptions.body ||
      selectedOptions.ears ||
      selectedOptions.eyes ||
      selectedOptions.nose ||
      selectedOptions.mouth ||
      selectedOptions.furColor ||
      selectedOptions.clothing ||
      Object.keys(selectedOptions.accessories).length > 0
    );
    if (!hasAnySelection) {
      setTotalPrice(0);
      return;
    }

    let price = 0; // Không còn giá cơ bản, chỉ cộng các phần đã chọn

    // Cộng giá loại thân nếu có
    if (selectedOptions.body) {
      const selectedBody = categories.find((item) => item._id === selectedOptions.body);
      if (typeof selectedBody?.price === 'number') {
        price += selectedBody.price;
      }
    }

    // Cộng giá mắt nếu có
    if (selectedOptions.eyes) {
      const selectedEyes = categories.find((item) => item._id === selectedOptions.eyes);
      if (typeof selectedEyes?.price === 'number') {
        price += selectedEyes.price;
      }
    }

    // Cộng giá kích thước nếu có
    if (selectedOptions.size) {
      const selectedSize = categories.find((item) => item._id === selectedOptions.size);
      if (typeof selectedSize?.price === 'number') {
        price += selectedSize.price;
      }
    }

    // Cộng giá chất liệu nếu có
    if (selectedOptions.material) {
      const selectedMaterial = categories.find((item) => item._id === selectedOptions.material);
      if (typeof selectedMaterial?.price === 'number') {
        price += selectedMaterial.price;
      }
    }

    // Cộng giá quần áo nếu được chọn
    if (selectedOptions.clothing) {
      const selectedClothing = categories.find((item) => item._id === selectedOptions.clothing)
      if (typeof selectedClothing?.price === 'number') {
        price += selectedClothing.price
      }
    }

    // Cộng giá phụ kiện
    Object.entries(selectedOptions.accessories).forEach(([accId, quantity]) => {
      const selectedAcc = categories.find((item) => item._id === accId)
      if (typeof selectedAcc?.price === 'number') {
        price += selectedAcc.price * quantity
      }
    })

    // Cộng giá mũi nếu được chọn
    if (selectedOptions.nose) {
      const selectedNose = categories.find((item) => item._id === selectedOptions.nose)
      if (typeof selectedNose?.price === 'number') {
        price += selectedNose.price
      }
    }

    // Cộng giá miệng nếu được chọn
    if (selectedOptions.mouth) {
      const selectedMouth = categories.find((item) => item._id === selectedOptions.mouth)
      if (typeof selectedMouth?.price === 'number') {
        price += selectedMouth.price
      }
    }

    setTotalPrice(price);
  }, [selectedOptions, categories]);

  // Thêm vào lịch sử khi lựa chọn thay đổi
  useEffect(() => {
    // Chỉ thêm vào lịch sử nếu không điều hướng qua lịch sử
    if (historyIndex === history.length - 1 || historyIndex === -1) {
      const newHistory = [...history.slice(0, historyIndex + 1), { ...selectedOptions }]
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
  }, [selectedOptions])

  const [designLoaded, setDesignLoaded] = useState(false);

  // Sửa useEffect setSelectedOptions từ thiết kế mẫu
  useEffect(() => {
    if (editId && categories.length > 0 && !loading && !designLoaded) {
      axios.get(`/api/designs/${editId}`)
        .then(res => {
          if (res.data) {
            let parts = res.data.parts;
            console.log('DEBUG API /api/designs/:id response parts:', parts);
            console.log('DEBUG parts.accessories:', parts.accessories);
            if (parts) {
              if (!parts.body) {
                console.warn('CẢNH BÁO: API trả về parts.body là rỗng! Thiết kế này đã bị lưu sai hoặc backend chưa sửa đúng.');
              }
              const merged = robustMergeOptions(defaultSelectedOptions, parts);
              console.log('DEBUG merged.accessories:', merged.accessories);
              setSelectedOptions(merged);
              // Thêm log để debug
              const bodyParent = categories.find(cat => cat.name === "Thân" && cat.parent === null);
              const bodyOptions = bodyParent
                ? categories.filter(cat => cat.parent === bodyParent._id)
                : [];
              console.log('DEBUG selectedOptions.body:', merged.body);
              console.log('DEBUG bodyOptions:', bodyOptions.map(o => ({_id: o._id, name: o.name})));
              setHasEditedAfterLoad(false);
            } else {
              setSelectedOptions({ ...defaultSelectedOptions });
              setHasEditedAfterLoad(false);
            }
            if (res.data.canvasJSON) {
              const canvasData = typeof res.data.canvasJSON === 'string'
                ? JSON.parse(res.data.canvasJSON)
                : res.data.canvasJSON;
              setLoadedCanvasJSON(canvasData);
            }
            setDesignLoaded(true);
          }
        })
        .catch(designError => {
          console.error("Không tìm thấy design:", designError);
        });
    }
  }, [editId, categories, loading, designLoaded]);

  // Debug: In ra selectedOptions và categories
  useEffect(() => {
    console.log("selectedOptions:", selectedOptions);
    console.log("selectedOptions.eyes:", selectedOptions.eyes);
    // Log các object mắt trong categories
    console.log("categories (eyes):", categories.filter(c => c.name && c.name.toLowerCase().includes("mắt")));
    // Log selectedOptions.mouth và các object miệng trong categories
    console.log("selectedOptions.mouth:", selectedOptions.mouth);
    console.log("categories (mouth):", categories.filter(c => c.name && c.name.toLowerCase().includes("miệng")));
    console.log("categories:", categories);
  }, [selectedOptions, categories]);

  // Load template nếu có templateId
  useEffect(() => {
    if (templateId) {
      // Thử load từ designs trước
      fetch(`http://localhost:5000/api/designs/${templateId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.canvasJSON) {
            setCanvasJSON(data.canvasJSON);
            setLoadedCanvasJSON(data.canvasJSON);
            // Nếu muốn set selectedOptions theo parts mẫu:
            if (data.parts) {
              setSelectedOptions(prev => robustMergeOptions({ ...defaultSelectedOptions, ...prev }, data.parts));
            }
          }
        })
        .catch(() => {
          // Nếu không tìm thấy design, thử load từ products
          fetch(`http://localhost:5000/api/products/${templateId}`)
            .then(res => res.json())
            .then(product => {
              if (product && product.customData && product.customData.canvasJSON) {
                setCanvasJSON(product.customData.canvasJSON);
                setLoadedCanvasJSON(product.customData.canvasJSON);
                if (product.customData.parts) {
                  setSelectedOptions(prev => robustMergeOptions({ ...defaultSelectedOptions, ...prev }, product.customData.parts));
                }
              } else if (product) {
                // Nếu sản phẩm không có customData, tạo template từ thông tin sản phẩm
                const templateParts = {
                  name: product.name,
                  size: product.specifications?.size || "",
                  // Có thể thêm các thông tin khác từ product.specifications
                };
                setSelectedOptions(prev => robustMergeOptions({ ...defaultSelectedOptions, ...prev }, templateParts));
              }
            })
            .catch(err => {
              console.error("Không thể load template:", err);
            });
        });
    }
  }, [templateId]);

  // Sửa handleOptionSelect: không reset loadedCanvasJSON nếu đã từng chỉnh sửa
  const handleOptionSelect = (category: string, optionId: string) => {
    // Kiểm tra nếu chưa chọn thân thú bông
    if (category !== "body" && !selectedOptions.body && !loadedCanvasJSON) {
      toast.error("Vui lòng chọn thân thú bông trước");
      return;
    }

    // Chỉ reset loadedCanvasJSON nếu chưa từng chỉnh sửa sau khi load
    if (loadedCanvasJSON && !hasEditedAfterLoad) {
      setLoadedCanvasJSON(null);
      setHasEditedAfterLoad(true);
    }
    setSelectedOptions(prev => {
      if (category === "accessories") {
        return {
          ...prev,
          accessories: {
            ...prev.accessories,
            [optionId]: (prev.accessories[optionId] || 0) + 1
          }
        };
      } else {
        return {
          ...prev,
          [category]: optionId,
        };
      }
    });
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (loadedCanvasJSON && !hasEditedAfterLoad) {
      setLoadedCanvasJSON(null);
      setHasEditedAfterLoad(true);
    }
    setSelectedOptions((prev) => ({ ...prev, name: e.target.value }))
  }

  const handleSizeChange = (value: string) => {
    if (loadedCanvasJSON && !hasEditedAfterLoad) {
      setLoadedCanvasJSON(null);
      setHasEditedAfterLoad(true);
    }
    setSelectedOptions((prev) => ({ ...prev, size: value }))
  }

  // Sửa: colorId là _id của category màu lông
  const handleColorChange = (colorId: string) => {
    if (loadedCanvasJSON && !hasEditedAfterLoad) {
      setLoadedCanvasJSON(null);
      setHasEditedAfterLoad(true);
    }
    setSelectedOptions((prev) => ({ ...prev, furColor: colorId }));
    // Lấy object màu lông từ categories
    const colorCat = categories.find((cat) => cat._id === colorId);
    // Nếu image là mã hex, truyền cho canvas
    if (fabricRef.current && colorCat?.image && /^#([0-9A-F]{3}){1,2}$/i.test(colorCat.image)) {
      fabricRef.current.updateFurColor(colorCat.image);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setSelectedOptions(history[historyIndex - 1])
      toast.success("Đã hoàn tác thao tác");
    } else {
      toast.info("Không có thao tác nào để hoàn tác");
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setSelectedOptions(history[historyIndex + 1])
      toast.success("Đã làm lại thao tác");
    } else {
      toast.info("Không có thao tác nào để làm lại");
    }
  }

  // 1. State cho modal lưu thiết kế
  const [showSaveDesignModal, setShowSaveDesignModal] = useState(false);
  const [saveDesignForm, setSaveDesignForm] = useState({
    designName: '',
    description: '',
    isPublic: false,
    previewImage: ''
  });
  const [savingDesign, setSavingDesign] = useState(false);

  const handleAddToCart = () => {
    // Kiểm tra xem đã chọn thân thú bông chưa
    if (!selectedOptions.body && !loadedCanvasJSON) {
      toast.error("Vui lòng chọn thân thú bông trước khi thêm vào giỏ hàng!");
      return;
    }

    if (!fabricRef.current) {
      toast.error("Không thể lấy hình ảnh thiết kế!");
      return;
    }
    const canvasImage = fabricRef.current.toDataURL({ format: 'png', quality: 0.8 });
    if (!canvasImage) {
      toast.error("Không thể lấy hình ảnh thiết kế!");
      return;
    }
    const selectedMaterial = selectedOptions.material ? categories.find((item) => item._id === selectedOptions.material) : null;
    const sizeName = categories.find((cat) => cat._id === selectedOptions.size)?.name || "";
    const materialName = selectedMaterial?.name || "";
    const customizedProduct = {
      _id: `custom-${Date.now()}`,
      name: selectedOptions.name || "Thú nhồi bông tùy chỉnh",
      description: `Kích thước: ${sizeName} ; Chất liệu: ${materialName}`,
      price: totalPrice + (selectedGiftBox?.price || 0),
      image: canvasImage,
      previewImage: canvasImage, // Thêm previewImage để tương thích với design
      type: "custom" as const,
      rating: 0,
      reviews: 0,
      sold: 0,
      stock: 1,
      featured: false,
      specifications: {
        body: bodyGroups.find((o) => o._id === selectedOptions.body)?.name || "",
        ears: categories.find((o) => o._id === selectedOptions.ears)?.name || "",
        eyes: categories.find((o) => o._id === selectedOptions.eyes)?.name || "",
        nose: categories.find((o) => o._id === selectedOptions.nose)?.name || "",
        mouth: categories.find((o) => o._id === selectedOptions.mouth)?.name || "",
        furColor: categories.find((o) => o._id === selectedOptions.furColor)?.name || "",
        clothing: selectedOptions.clothing ? categories.find((o) => o._id === selectedOptions.clothing)?.name || "" : null,
        accessories: Object.entries(selectedOptions.accessories)
          .map(([id, quantity]) => categories.find((o) => o._id === id)?.name)
          .filter((name): name is string => name !== undefined),
        size: selectedOptions.size,
        material: selectedMaterial?.name || "",
        materialPrice: selectedMaterial?.price || 0,
        giftBox: selectedGiftBox ? {
          id: selectedGiftBox._id,
          name: selectedGiftBox.name,
          price: selectedGiftBox.price,
          image: selectedGiftBox.image,
        } : null,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    addToCart(customizedProduct);
    toast.success("Đã thêm thú nhồi bông tùy chỉnh vào giỏ hàng!");
  };

  const handleGiftBoxSelect = (giftBox: GiftBox | null) => {
    setGiftBoxModalOpen(false);
    setSelectedGiftBox(giftBox);
  };

  const handleAddToWishlist = async () => {
    // Kiểm tra xem đã chọn thân thú bông chưa
    if (!selectedOptions.body && !loadedCanvasJSON) {
      toast.error("Vui lòng chọn thân thú bông trước khi thêm vào danh sách yêu thích!");
      return;
    }

    if (!fabricRef.current) {
      toast.error("Không thể lấy hình ảnh thiết kế!")
      return
    }

    // Kiểm tra token
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error("Vui lòng đăng nhập để thêm vào danh sách yêu thích!")
      return
    }

    // Lấy hình ảnh từ canvas dưới dạng base64
    const canvasImage = fabricRef.current.toDataURL({
      format: 'png',
      quality: 0.8
    })

    if (!canvasImage) {
      toast.error("Không thể lấy hình ảnh thiết kế!")
      return
    }

    // Tạo một sản phẩm tùy chỉnh từ các lựa chọn hiện tại
    const customizedProduct = {
      name: selectedOptions.name || "Thú nhồi bông tùy chỉnh",
      description: `Thú nhồi bông tùy chỉnh với ${selectedOptions.size} kích thước`,
      price: totalPrice,
      image: canvasImage, // Sử dụng hình ảnh từ canvas
      type: "custom",
      rating: 0,
      reviews: 0,
      sold: 0,
      stock: 1,
      featured: false,
      specifications: {
        body: bodyGroups.find((o) => o._id === selectedOptions.body)?.name || "",
        ears: categories.find((o) => o._id === selectedOptions.ears)?.name || "",
        eyes: categories.find((o) => o._id === selectedOptions.eyes)?.name || "",
        nose: categories.find((o) => o._id === selectedOptions.nose)?.name || "",
        mouth: categories.find((o) => o._id === selectedOptions.mouth)?.name || "",
        furColor: categories.find((o) => o._id === selectedOptions.furColor)?.name || "",
        clothing: selectedOptions.clothing ? categories.find((o) => o._id === selectedOptions.clothing)?.name || "" : null,
        accessories: Object.entries(selectedOptions.accessories)
          .map(([id, quantity]) => categories.find((o) => o._id === id)?.name)
          .filter((name): name is string => name !== undefined),
        size: selectedOptions.size
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    try {
      console.log("Token exists:", !!token)
      console.log("Token length:", token?.length)
      console.log("Customized product:", customizedProduct)
      
      // Chuyển đổi accessories từ object sang array để tương thích với backend
      const partsForSave = { ...selectedOptions };
      if (selectedOptions.accessories && typeof selectedOptions.accessories === 'object') {
        const accessoriesArray: string[] = [];
        Object.entries(selectedOptions.accessories).forEach(([accId, quantity]) => {
          for (let i = 0; i < quantity; i++) {
            accessoriesArray.push(accId);
          }
        });
        (partsForSave as any).accessories = accessoriesArray;
      }
      
      // Lưu sản phẩm tùy chỉnh vào database trước
      const productResponse = await axios.post("http://localhost:5000/api/products/custom", {
        ...customizedProduct,
        isCustom: true,
        customData: {
          parts: partsForSave,
          canvasJSON: fabricRef.current.toJSON()
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const savedProduct = productResponse.data;
      console.log("Product saved successfully:", savedProduct._id);

      // Thêm vào wishlist
      await axios.post("http://localhost:5000/api/wishlist", {
        productId: savedProduct._id
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      toast.success("Đã thêm thú nhồi bông tùy chỉnh vào danh sách yêu thích!");
    } catch (error: any) {
      console.error("Lỗi khi thêm vào wishlist:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error message:", error.message);
      
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        window.location.href = "/login";
      } else if (error.response?.status === 400) {
        toast.error(`Lỗi dữ liệu: ${error.response?.data?.error || error.response?.data?.message || 'Dữ liệu không hợp lệ'}`);
      } else {
        toast.error("Có lỗi xảy ra khi thêm vào danh sách yêu thích!");
      }
    }
  }

  const handleDownloadDesign = () => {
    // Kiểm tra xem đã chọn thân thú bông chưa
    if (!selectedOptions.body && !loadedCanvasJSON) {
      toast.error("Vui lòng chọn thân thú bông trước khi tải xuống!");
      return;
    }

    if (fabricRef.current && fabricRef.current.toDataURL) {
      try {
        const dataUrl = fabricRef.current.toDataURL({ format: 'png', quality: 1 });
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'thiet-ke-thu-bong.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Tải xuống thiết kế thành công!");
      } catch (e) {
        toast.error("Không thể tải xuống hình ảnh!");
      }
    } else {
      toast.error("Không thể tải xuống hình ảnh!");
    }
  }

  const handleTakeScreenshot = () => {
    // Kiểm tra xem đã chọn thân thú bông chưa
    if (!selectedOptions.body && !loadedCanvasJSON) {
      toast.error("Vui lòng chọn thân thú bông trước khi chụp ảnh!");
      return;
    }

    if (fabricRef.current && fabricRef.current.toDataURL) {
      try {
        const dataUrl = fabricRef.current.toDataURL({ format: 'png', quality: 1 });
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `screenshot-thu-bong-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Chụp ảnh màn hình thiết kế thành công!");
      } catch (e) {
        toast.error("Không thể chụp ảnh màn hình!");
      }
    } else {
      toast.error("Không thể chụp ảnh màn hình!");
    }
  }

  const handleDeleteElement = () => {
    if (!fabricRef.current) {
      toast.error("Không thể xóa phần tử!")
      return
    }

    const activeObject = fabricRef.current.getActiveObject()
    if (!activeObject) {
      toast.error("Vui lòng chọn phần tử cần xóa!")
      return
    }

    // Không cho phép xóa body
    if (activeObject.partType === 'body') {
      toast.error("Không thể xóa thân thú nhồi bông!")
      return
    }

    // Xóa khỏi canvas
    fabricRef.current.remove(activeObject)
    fabricRef.current.discardActiveObject()
    fabricRef.current.renderAll()

    // Cập nhật selectedOptions
    if (activeObject.partId) {
      setSelectedOptions(prev => {
        const next = { ...prev }
        
                  // Xóa khỏi accessories nếu là accessory
          if (activeObject.partType === 'accessory') {
            const accId = activeObject.partId;
            if (accId && next.accessories[accId] > 1) {
              next.accessories[accId]--;
            } else if (accId) {
              delete next.accessories[accId];
            }
          } else {
          // Xóa khỏi các trường khác
          const fieldMap: { [key: string]: string } = {
            'ears': 'ears',
            'eyes': 'eyes', 
            'nose': 'nose',
            'mouth': 'mouth',
            'furColor': 'furColor',
            'clothing': 'clothing'
          }
          
          const field = fieldMap[activeObject.partType]
          if (field) {
            (next as any)[field] = ""
          }
        }
        
        return next
      })
    }

    toast.success("Đã xóa phần tử!")
  }

  // Lấy nhóm con cho Đặc Điểm (Features)
  const featuresParent = categories.find(cat => cat.name === "Đặc Điểm" && cat.parent === null);
  const featureGroups = featuresParent
    ? categories.filter(cat => cat.parent === featuresParent._id)
    : [];
  // Lấy nhóm con cho Phụ kiện
  const accessoriesParent = categories.find(cat => cat.name === "Phụ kiện" && cat.parent === null);
  const accessoryGroups = accessoriesParent
    ? categories.filter(cat => cat.parent === accessoriesParent._id)
    : [];

  // Lấy nhóm con cho Thân (Body)
  const bodyParent = categories.find(cat => cat.name === "Thân" && cat.parent === null);
  const bodyGroups = bodyParent
    ? categories.filter(cat => cat.parent === bodyParent._id)
    : [];

  // Lấy nhóm con của 'Thân' (các nhóm: Loại Thân, Kích Thước, Chất Liệu, Màu Lông)
  const thanParent = categories.find(cat => cat.name === "Thân" && !cat.parent);
  const thanGroups = thanParent
    ? categories.filter(cat => cat.parent === thanParent._id)
    : [];

  // Hàm lấy các lựa chọn thực tế theo tên nhóm
  const getOptionsByGroupName = (groupName: string) => {
    const group = thanGroups.find(g => g.name.toLowerCase().includes(groupName.toLowerCase()));
    if (!group) return [];
    return categories.filter(cat => cat.parent === group._id);
  };

  const bodyOptions = getOptionsByGroupName("Loại Thân");
  const sizeOptions = getOptionsByGroupName("Kích Thước");
  const materialOptions = getOptionsByGroupName("Chất Liệu");
  const furColorOptions = getOptionsByGroupName("Màu Lông");

  function mapGroupToOptionKey(group: any) {
    // Ưu tiên type nếu đúng chuẩn
    if (group.type === "accessory") return "accessories";
    if (group.type === "body") return "body";
    if (group.type === "ear") return "ears";
    if (group.type === "eye") return "eyes";
    if (group.type === "nose") return "nose";
    if (group.type === "mouth") return "mouth";
    if (group.type === "furColor") return "furColor";
    if (group.type === "clothing") return "clothing";
    // Nếu type không chuẩn, so sánh tên không dấu
    const name = group.name?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '').toLowerCase() || '';
    if (name.includes("phukien")) return "accessories";
    if (name.includes("loaithan") || name === "than") return "body";
    if (name.includes("tai")) return "ears";
    if (name.includes("mat")) return "eyes";
    if (name.includes("mui")) return "nose";
    if (name.includes("mieng")) return "mouth";
    if (name.includes("maulong")) return "furColor";
    if (name.includes("quanao")) return "clothing";
    return group.type;
  }

  useEffect(() => {
    axios.get("http://localhost:5000/api/categories")
      .then(res => {
        console.log("API categories data:", res.data)
        // Nếu trả về object có field categories thì lấy đúng field đó
        if (Array.isArray(res.data)) {
          setCategories(res.data)
        } else if (Array.isArray(res.data.categories)) {
          setCategories(res.data.categories)
        } else {
          setCategories([])
          console.error("API trả về không đúng định dạng:", res.data)
        }
      })
      .catch(err => {
        console.error("Lỗi khi tải danh mục:", err)
        setCategories([])
      })
      .finally(() => setLoading(false))
  }, [])

  const [userId, setUserId] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string>("");
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserId(localStorage.getItem('userId'));
      setOrigin(window.location.origin);
    }
  }, []);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    console.log("accessories:", selectedOptions.accessories);
  }, [selectedOptions.accessories]);

  // Sau khi render CustomFabricCanvas, lắng nghe sự kiện chọn object để hiển thị UI chỉnh sửa text
  useEffect(() => {
    if (!fabricRef.current?.getCanvas) return;
    const canvas = fabricRef.current.getCanvas();
    if (!canvas) return;
    const handleSelection = () => {
      const active = canvas.getActiveObject();
      if (active && active.type === 'textbox') {
        setActiveTextProps({
          text: (active as any).text,
          fill: (active as any).fill,
          fontSize: (active as any).fontSize,
          fontFamily: (active as any).fontFamily,
        });
      } else {
        setActiveTextProps(null);
      }
    };
    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', handleSelection);
    // Khi mount, nếu đang có object được chọn thì cũng cập nhật luôn
    handleSelection();
    return () => {
      canvas.off('selection:created', handleSelection);
      canvas.off('selection:updated', handleSelection);
      canvas.off('selection:cleared', handleSelection);
    };
  }, [fabricRef.current?.getCanvas, fabricRef.current, bgImage, selectedOptions]);

  // Hàm đồng bộ toàn bộ textbox hiện tại trên canvas về customTexts
  const syncAllTextsFromCanvas = () => {
    const canvas = fabricRef.current?.getCanvas?.();
    if (!canvas) return [];
    return canvas.getObjects()
      .filter((obj: any) => obj.type === 'textbox')
      .map((obj: any) => ({
        id: obj.customId,
        text: obj.text,
        fill: obj.fill,
        fontSize: obj.fontSize,
        fontFamily: obj.fontFamily,
        left: obj.left,
        top: obj.top,
      }));
  };

  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateForm, setTemplateForm] = useState({ name: "", description: "", previewImage: "" });
  const [savingTemplate, setSavingTemplate] = useState(false);
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('role') === 'admin';

  // Thêm hàm để thêm phụ kiện vào selectedOptions
  const handleAccessoryAdd = (accId: string) => {
    console.log("handleAccessoryAdd - accId:", accId);
    setSelectedOptions(prev => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        [accId]: (prev.accessories[accId] || 0) + 1
      }
    }));
  };

  if (loading) return <div>Đang tải dữ liệu...</div>

  return (
    <div className="container mx-auto py-8 px-4">
              {/* <h1 className="text-3xl font-bold text-center mb-8 text-[#E3497A]">Thiết Kế Thú Nhồi Bông Tùy Chỉnh Của Bạn</h1> */}

      {/* Nút lưu mẫu thiết kế sẵn cho admin, đặt phía trên canvas */}
      {/* XÓA: Nút và modal Lưu thành mẫu thiết kế sẵn (chỉ admin) */}
      {/* Tìm và xoá đoạn:
      {isAdmin && (
        <div className="flex justify-end mb-2">
          <Button
            variant="outline"
            className="border-pink-500 text-pink-600 hover:bg-pink-50"
            onClick={() => {
              // Tự động lấy ảnh canvas hiện tại làm preview khi mở modal
              let preview = "";
              if (fabricRef.current && fabricRef.current.toDataURL) {
                try {
                  preview = fabricRef.current.toDataURL({ format: 'png', quality: 0.8 });
                } catch (e) { preview = ""; }
              }
              setTemplateForm(f => ({ ...f, previewImage: preview }));
              setShowSaveTemplate(true);
            }}
            title="Lưu thành mẫu thiết kế sẵn (chỉ admin)"
          >
            <Save className="mr-2 h-4 w-4" />
            Lưu thành mẫu thiết kế sẵn
          </Button>
        </div>
      )}
      */}

      {from === 'shared' && <div className="bg-yellow-100 p-2 mb-2">Bạn đang chỉnh sửa bản sao từ thiết kế chia sẻ</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Phần Xem Trước */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <div className="bg-white rounded-xl shadow-lg p-6 h-full">
            <div className="mb-4 flex items-center gap-4">
              <label className="font-medium">Nền tuỳ chỉnh:</label>
              <button
                type="button"
                className="px-4 py-2 rounded border border-gray-300 bg-white hover:bg-pink-50 text-gray-700 font-medium"
                onClick={() => bgInputRef.current?.click()}
              >
                Chọn ảnh nền
              </button>
              <input
                type="file"
                accept="image/*"
                ref={bgInputRef}
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setBgImage(URL.createObjectURL(file));
                  }
                }}
              />
              {bgImage && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="ml-2 flex items-center gap-1 px-2 py-1 h-7 text-xs"
                  onClick={() => {
                    setBgImage(null);
                    if (bgInputRef.current) bgInputRef.current.value = "";
                  }}
                  type="button"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Xoá nền
                </Button>
              )}
            </div>
            <div className="flex justify-between mb-4">
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" onClick={handleUndo} disabled={historyIndex <= 0}>
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" onClick={handleTakeScreenshot}>
                  <Camera className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleDownloadDesign}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleDeleteElement}
                  className="bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>

            <div className="relative h-[650px] w-[500px] mx-auto bg-pink-50 rounded-lg flex items-center justify-center mb-6 overflow-hidden">
              {/* Gấu bông luôn ở trên */}
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <CustomFabricCanvas 
                  ref={fabricRef} 
                  selectedOptions={selectedOptions} 
                  categories={categories} 
                  canvasJSON={loadedCanvasJSON}
                  backgroundImage={bgImage || undefined}
                  customTexts={customTexts}
                  onCustomTextsChange={setCustomTexts}
                  onAccessoryAdd={handleAccessoryAdd}
                />
              </div>
              <div className="absolute bottom-2 left-0 right-0 text-center z-20">
                <p className="mt-4 text-gray-500">Xem Trước Trực Tiếp</p>
                {selectedOptions.name && <p className="mt-2 text-pink-500 font-medium">Tên: {selectedOptions.name}</p>}
              </div>
              {!selectedOptions.body && !loadedCanvasJSON && (
                <div className="absolute inset-0 flex items-center justify-center bg-pink-50 bg-opacity-90 z-30">
                  <div className="text-center text-gray-500">
                    <p className="text-lg font-medium mb-2">Bắt đầu thiết kế</p>
                    <p className="text-sm">Chọn các phần tử bên cạnh để tạo thú nhồi bông của bạn</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Lựa Chọn Hiện Tại:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Thân: {categories.find((o) => o._id === selectedOptions.body)?.name}</li>
                  <li>Mắt: {categories.find((o) => o._id === selectedOptions.eyes)?.name}</li>
                  <li>Miệng: {categories.find((o) => o._id === selectedOptions.mouth)?.name}</li>
                  <li>Màu Lông: {categories.find((o) => o._id === selectedOptions.furColor)?.name}</li>
                  {selectedOptions.clothing && (
                    <li>Quần Áo: {categories.find((o) => o._id === selectedOptions.clothing)?.name}</li>
                  )}
                  {Object.entries(selectedOptions.accessories).length > 0 && (
                    <li>
                      Phụ Kiện:{" "}
                      {Object.entries(selectedOptions.accessories).map(([id, quantity]) => (
                        <span key={id}>
                          {categories.find((o) => o._id === id)?.name} ({quantity})
                        </span>
                      ))}
                    </li>
                  )}
                  <li>
                    Kích Thước:{" "}
                    {selectedOptions.size === "small" ? "Nhỏ" : selectedOptions.size === "medium" ? "Vừa" : "Lớn"}
                  </li>
                </ul>
              </div>
              <div>
                <div className="bg-pink-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Chi Tiết Giá:</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {totalPrice === 0 && (
                      <li className="text-gray-400 italic">Vui lòng chọn các phần để xem giá</li>
                    )}
                    {selectedOptions.body && (() => {
                      const bodyObj = categories.find((o) => o._id === selectedOptions.body);
                      return bodyObj && bodyObj.price !== undefined ? (
                        <li className="flex justify-between">
                          <span>Loại Thân ({bodyObj.name}):</span>
                          <span>
                            {isClient ? bodyObj.price.toLocaleString('vi-VN') + '₫' : bodyObj.price + '₫'}
                          </span>
                        </li>
                      ) : null;
                    })()}
                    {selectedOptions.eyes && (() => {
                      const eyesObj = categories.find((o) => o._id === selectedOptions.eyes);
                      return eyesObj && eyesObj.price !== undefined ? (
                        <li className="flex justify-between">
                          <span>Mắt ({eyesObj.name}):</span>
                          <span>
                            {isClient ? eyesObj.price.toLocaleString('vi-VN') + '₫' : eyesObj.price + '₫'}
                          </span>
                        </li>
                      ) : null;
                    })()}
                    {selectedOptions.size && (() => {
                      const sizeObj = categories.find((o) => o._id === selectedOptions.size);
                      return sizeObj && sizeObj.price !== undefined ? (
                        <li className="flex justify-between">
                          <span>Kích Thước ({sizeObj.name}):</span>
                          <span>{isClient ? sizeObj.price.toLocaleString('vi-VN') + '₫' : sizeObj.price + '₫'}</span>
                        </li>
                      ) : null;
                    })()}
                    {selectedOptions.material && (() => {
                      const materialObj = categories.find((o) => o._id === selectedOptions.material);
                      return materialObj && materialObj.price !== undefined ? (
                        <li className="flex justify-between">
                          <span>Chất Liệu ({materialObj.name}):</span>
                          <span>{isClient ? materialObj.price.toLocaleString('vi-VN') + '₫' : materialObj.price + '₫'}</span>
                        </li>
                      ) : null;
                    })()}
                    {selectedOptions.nose && (
                      <li className="flex justify-between">
                        <span>Mũi:</span>
                        <span>
                          +{categories.find((o) => o._id === selectedOptions.nose)?.price?.toLocaleString('vi-VN')}₫
                        </span>
                      </li>
                    )}
                    {selectedOptions.mouth && (
                      <li className="flex justify-between">
                        <span>Miệng:</span>
                        <span>
                          +{categories.find((o) => o._id === selectedOptions.mouth)?.price?.toLocaleString('vi-VN')}₫
                        </span>
                      </li>
                    )}
                    {selectedOptions.clothing && (
                      <li className="flex justify-between">
                        <span>Quần Áo:</span>
                        <span>
                          +{categories.find((o) => o._id === selectedOptions.clothing)?.price?.toLocaleString('vi-VN')}₫
                        </span>
                      </li>
                    )}
                    {Object.entries(selectedOptions.accessories).map(([accId, quantity]) => {
                      const accessoryObj = categories.find((o) => o._id === accId);
                      return accessoryObj && accessoryObj.price !== undefined ? (
                        <li key={accId} className="flex justify-between">
                          <span>{accessoryObj.name} ({quantity}):</span>
                          <span>+{(accessoryObj.price * quantity).toLocaleString('vi-VN')}₫</span>
                        </li>
                      ) : null;
                    })}
                    {selectedGiftBox && (
                      <li className="flex justify-between">
                        <span>Hộp quà: {selectedGiftBox.name}</span>
                        <span>+{selectedGiftBox.price.toLocaleString('vi-VN')}₫</span>
                      </li>
                    )}
                    <li className="flex justify-between font-bold border-t mt-2 pt-2">
                      <span>Tổng:</span>
                      <span>
                        {isClient ? (totalPrice + (selectedGiftBox?.price || 0)).toLocaleString('vi-VN') + '₫' : (totalPrice + (selectedGiftBox?.price || 0)) + '₫'}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tùy Chọn Tùy Chỉnh */}
        <div className="order-1 lg:order-2">
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="body" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="body">Thân</TabsTrigger>
                  <TabsTrigger value="features">Đặc Điểm</TabsTrigger>
                  <TabsTrigger value="extras">Phụ Kiện</TabsTrigger>
                </TabsList>

                <TabsContent value="body" className="space-y-6">
                  {/* Loại Thân */}
                  <div>
                    <h3 className="font-medium mb-4 text-lg text-gray-800">Loại Thân</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {bodyOptions.slice(0, bodyPerPage).map(option => (
                        <div
                          key={option._id}
                          className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                            selectedOptions.body === option._id 
                              ? "border-pink-500 bg-pink-50 shadow-md" 
                              : "border-gray-200 hover:border-pink-300"
                          }`}
                          onClick={() => {
                            setSelectedOptions(prev => {
                              const next = { ...prev, body: option._id };
                              console.log('DEBUG [onClick] Chọn thân:', option._id, 'selectedOptions.body:', next.body);
                              return next;
                            });
                          }}
                        >
                          <div className="flex flex-col items-center">
                            <Image
                              src={option.image || "/placeholder.svg"}
                              alt={option.name}
                              width={80}
                              height={80}
                              className="rounded-lg object-contain mb-3"
                            />
                            <p className="text-center text-sm font-medium text-gray-800">{option.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Nút "Xem thêm" cho thân */}
                    {bodyOptions.length > bodyPerPage && (
                      <div className="mt-6 text-center">
                        <button
                          onClick={() => setBodyPerPage(prev => prev + 9)}
                          className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                          Xem thêm {Math.min(9, bodyOptions.length - bodyPerPage)} loại thân
                        </button>
                      </div>
                    )}
                    
                    {/* Nút "Thu gọn" cho thân */}
                    {bodyPerPage > 9 && bodyOptions.length <= bodyPerPage && (
                      <div className="mt-6 text-center">
                        <button
                          onClick={() => setBodyPerPage(9)}
                          className="text-pink-500 hover:text-pink-600 px-6 py-2 rounded-lg font-medium transition-colors border border-pink-300 hover:border-pink-400"
                        >
                          Thu gọn
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Kích Thước */}
                  <div>
                    <h3 className="font-medium mb-3">Kích Thước</h3>
                    <RadioGroup
                      value={selectedOptions.size}
                      onValueChange={value => setSelectedOptions(prev => ({ ...prev, size: value }))}
                      className="flex space-x-4"
                    >
                      {sizeOptions.map(option => (
                        <div className="flex items-center space-x-2" key={option._id}>
                          <RadioGroupItem value={option._id} id={`size-${option._id}`} />
                          <Label htmlFor={`size-${option._id}`}>{option.name}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  {/* Chất Liệu */}
                  <div>
                    <h3 className="font-medium mb-3">Chất Liệu</h3>
                    <RadioGroup
                      value={selectedOptions.material}
                      onValueChange={value => setSelectedOptions(prev => ({ ...prev, material: value }))}
                      className="flex space-x-4"
                    >
                      {materialOptions.map(option => (
                        <div className="flex items-center space-x-2" key={option._id}>
                          <RadioGroupItem value={option._id} id={`material-${option._id}`} />
                          <Label htmlFor={`material-${option._id}`}>{option.name}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  {/* Màu Lông */}
                  <div>
                    <h3 className="font-medium mb-3">Màu Lông</h3>
                    <div className="flex flex-wrap gap-3 items-center">
                      {furColorOptions.map((option) => (
                        <div
                          key={option._id}
                          onClick={() => handleColorChange(option._id)}
                          className={`w-10 h-10 rounded-full border-2 cursor-pointer transition-all ${
                            selectedOptions.furColor === option._id
                              ? "ring-2 ring-offset-2 ring-pink-500"
                              : "border-gray-200"
                          }`}
                          style={{ backgroundColor: option.image || "#eee" }}
                          title={option.name}
                        />
                      ))}
                      {/* Nút bỏ chọn màu */}
                      <button
                        type="button"
                        onClick={() => setSelectedOptions(prev => ({ ...prev, furColor: '' }))}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-gray-400 hover:text-pink-500 hover:border-pink-300 transition-all ${!selectedOptions.furColor ? 'border-pink-400 bg-pink-50' : 'border-gray-200 bg-white'}`}
                        title="Bỏ chọn màu"
                      >
                        <span className="text-lg">×</span>
                      </button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="features" className="space-y-6">
                  {featureGroups.map(group => {
                    const groupFeatures = categories.filter(opt => opt.parent === group._id);
                    const displayedFeatures = groupFeatures.length > 0 
                      ? groupFeatures.slice(0, featuresPerPage)
                      : [group].slice(0, featuresPerPage);
                    const hasMore = groupFeatures.length > featuresPerPage;
                    
                    return (
                      <div key={group._id}>
                        <h3 className="font-medium mb-4 text-lg text-gray-800">{group.name}</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {displayedFeatures.map(option => (
                            <div
                              key={option._id}
                              className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                                String((selectedOptions as any)[mapGroupToOptionKey(group)]) === String(option._id) 
                                  ? "border-pink-500 bg-pink-50 shadow-md" 
                                  : "border-gray-200 hover:border-pink-300"
                              }`}
                              onClick={() => handleOptionSelect(mapGroupToOptionKey(group), option._id)}
                            >
                              <div className="flex flex-col items-center">
                                <Image
                                  src={option.image || "/placeholder.svg"}
                                  alt={option.name}
                                  width={80}
                                  height={80}
                                  className="rounded-lg object-contain mb-3"
                                />
                                <p className="text-center text-sm font-medium text-gray-800">{option.name}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Nút "Xem thêm" cho đặc điểm */}
                        {hasMore && (
                          <div className="mt-6 text-center">
                            <button
                              onClick={() => setFeaturesPerPage(prev => prev + 12)}
                              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                              Xem thêm {Math.min(12, groupFeatures.length - featuresPerPage)} đặc điểm
                            </button>
                          </div>
                        )}
                        
                        {/* Nút "Thu gọn" cho đặc điểm */}
                        {featuresPerPage > 12 && groupFeatures.length <= featuresPerPage && (
                          <div className="mt-6 text-center">
                            <button
                              onClick={() => setFeaturesPerPage(12)}
                              className="text-pink-500 hover:text-pink-600 px-6 py-2 rounded-lg font-medium transition-colors border border-pink-300 hover:border-pink-400"
                            >
                              Thu gọn
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </TabsContent>

                <TabsContent value="extras" className="space-y-6">
                  {accessoryGroups.map(group => {
                    const groupAccessories = categories.filter(opt => opt.parent === group._id && opt.type === "option");
                    const displayedAccessories = groupAccessories.slice(0, accessoriesPerPage);
                    const hasMore = groupAccessories.length > accessoriesPerPage;
                    
                    return (
                      <div key={group._id}>
                        <h3 className="font-medium mb-4 text-lg text-gray-800">{group.name}</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {displayedAccessories.map(option => (
                            <div
                              key={option._id}
                              className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                                selectedOptions.accessories[option._id] 
                                  ? "border-pink-500 bg-pink-50 shadow-md" 
                                  : "border-gray-200 hover:border-pink-300"
                              }`}
                              onClick={() => handleOptionSelect(mapGroupToOptionKey(group), option._id)}
                            >
                              <div className="flex flex-col items-center">
                                <div className="relative mb-3">
                                  <Image
                                    src={option.image || "/placeholder.svg"}
                                    alt={option.name}
                                    width={80}
                                    height={80}
                                    className="rounded-lg object-contain"
                                  />
                                  {selectedOptions.accessories[option._id] && (
                                    <div className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                      {selectedOptions.accessories[option._id]}
                                    </div>
                                  )}
                                </div>
                                <p className="text-center text-sm font-medium text-gray-800 mb-1">{option.name}</p>
                                <p className="text-center text-xs text-pink-600 font-semibold">+{option.price?.toLocaleString('vi-VN')}₫</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Nút "Xem thêm" */}
                        {hasMore && (
                          <div className="mt-6 text-center">
                            <button
                              onClick={() => setAccessoriesPerPage(prev => prev + 15)}
                              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                              Xem thêm {Math.min(15, groupAccessories.length - accessoriesPerPage)} phụ kiện
                            </button>
                          </div>
                        )}
                        
                        {/* Nút "Thu gọn" khi đã xem hết */}
                        {accessoriesPerPage > 15 && groupAccessories.length <= accessoriesPerPage && (
                          <div className="mt-6 text-center">
                            <button
                              onClick={() => setAccessoriesPerPage(15)}
                              className="text-pink-500 hover:text-pink-600 px-6 py-2 rounded-lg font-medium transition-colors border border-pink-300 hover:border-pink-400"
                            >
                              Thu gọn
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </TabsContent>
              </Tabs>

              <div className="mt-8 space-y-4">
                <Button 
                  className="w-full bg-pink-500 hover:bg-pink-600" 
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Thêm Vào Giỏ Hàng - {isClient ? (totalPrice + (selectedGiftBox?.price || 0)).toLocaleString('vi-VN') + '₫' : (totalPrice + (selectedGiftBox?.price || 0)) + '₫'}
                </Button>
                <div className="flex gap-4">
                  {/* 2. Sửa nút Lưu Thiết Kế để mở modal thay vì lưu ngay */}
                  <Button variant="outline" className="flex-1" onClick={() => {
                    let preview = "";
                    if (fabricRef.current && fabricRef.current.toDataURL) {
                      try {
                        preview = fabricRef.current.toDataURL({ format: 'png', quality: 0.8 });
                      } catch (e) { preview = ""; }
                    }
                    setSaveDesignForm(f => ({ ...f, previewImage: preview }));
                    setShowSaveDesignModal(true);
                  }}>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu Thiết Kế
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={handleAddToWishlist}>
                    <Heart className="mr-2 h-4 w-4" />
                    Thêm Vào Yêu Thích
                  </Button>
                </div>
                <Button
                  variant={selectedGiftBox ? "secondary" : "outline"}
                  className="w-full mt-2 border-pink-300"
                  onClick={() => setGiftBoxModalOpen(true)}
                >
                  🎁 {selectedGiftBox ? `Đã chọn: ${selectedGiftBox.name} (+${selectedGiftBox.price.toLocaleString('vi-VN')}₫)` : "Chọn hộp quà (không bắt buộc)"}
                </Button>
                <div className="mt-6">
                  <div className="mb-4 p-3 bg-pink-50 rounded flex flex-col md:flex-row md:items-end gap-3">
                    <div>
                      <Label htmlFor="add-text-content">Thêm nội dung lên gấu bông</Label>
                      <Input id="add-text-content" value={newText} onChange={e => setNewText(e.target.value)} placeholder="Nhập nội dung..." className="w-48" />
                    </div>
                    <Button
                      type="button"
                      className="flex items-center gap-1 h-10"
                      onClick={() => {
                        if (!newText.trim()) return toast.error("Vui lòng nhập nội dung!");
                        if (!isClient) return;
                        const id = Date.now().toString();
                        const allCurrentTexts = syncAllTextsFromCanvas();
                        setCustomTexts([...allCurrentTexts, { id, text: newText, fill: '#000', fontSize: 32, fontFamily: 'Arial', left: 250, top: 325 }]);
                        fabricRef.current?.addText(newText, { left: 250, top: 325 });
                        setNewText("");
                      }}
                    >
                      <Type className="w-5 h-5" /> Thêm Text
                    </Button>
                  </div>
                  {activeTextProps && (
                    <div className="mb-4 p-3 bg-yellow-50 rounded flex flex-col gap-3 border border-yellow-200 w-full max-w-md mx-auto">
                      <div>
                        <Label htmlFor="edit-text-content">Chỉnh văn bản</Label>
                        <Input id="edit-text-content" value={activeTextProps.text} onChange={e => {
                          setActiveTextProps(props => props ? { ...props, text: e.target.value } : null);
                          fabricRef.current?.updateActiveText({ text: e.target.value });
                        }} className="w-full" />
                      </div>
                      <div className="grid grid-cols-3 gap-3 items-end">
                        <div className="flex flex-col items-center">
                          <Label className="mb-1">Màu chữ</Label>
                          <input type="color" value={activeTextProps.fill} onChange={e => {
                            setActiveTextProps(props => props ? { ...props, fill: e.target.value } : null);
                            fabricRef.current?.updateActiveText({ fill: e.target.value });
                          }} className="w-10 h-10 p-0 border-none bg-transparent" />
                        </div>
                        <div className="flex flex-col">
                          <Label className="mb-1">Font</Label>
                          <select value={activeTextProps.fontFamily} onChange={e => {
                            setActiveTextProps(props => props ? { ...props, fontFamily: e.target.value } : null);
                            fabricRef.current?.updateActiveText({ fontFamily: e.target.value });
                          }} className="border rounded px-2 py-1 w-full">
                            {fontOptions.map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </div>
                        <div className="flex flex-col">
                          <Label className="mb-1">Cỡ chữ</Label>
                          <Input type="number" min={10} max={120} value={activeTextProps.fontSize} onChange={e => {
                            setActiveTextProps(props => props ? { ...props, fontSize: Number(e.target.value) } : null);
                            fabricRef.current?.updateActiveText({ fontSize: Number(e.target.value) });
                          }} className="w-full" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* 3. Modal nhập tên, mô tả, xem trước hình và xác nhận lưu */}
      {showSaveDesignModal && (
        <Dialog open={showSaveDesignModal} onOpenChange={setShowSaveDesignModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lưu Thiết Kế</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Tên thiết kế của bạn"
                value={saveDesignForm.designName}
                onChange={(e) => setSaveDesignForm(prev => ({ ...prev, designName: e.target.value }))}
                required
              />
              <Input
                placeholder="Mô tả ngắn (không bắt buộc)"
                value={saveDesignForm.description}
                onChange={e => setSaveDesignForm(f => ({ ...f, description: e.target.value }))}
              />
              {saveDesignForm.previewImage && (
                <img src={saveDesignForm.previewImage} alt="Preview" className="w-full h-48 object-contain rounded border" />
              )}
            </div>
            <DialogFooter>
              <Button
                onClick={async () => {
                  setSavingDesign(true);
                  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
                  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
                  if (!userId) {
                    toast.error("Bạn cần đăng nhập để lưu thiết kế!");
                    setSavingDesign(false);
                    return;
                  }
                  let canvasData = {};
                  if (fabricRef.current && fabricRef.current.toJSON) {
                    canvasData = fabricRef.current.toJSON();
                  }
                  // Đảm bảo parts.body là _id thực sự
                  if (!selectedOptions.body) {
                    toast.error("Bạn phải chọn loại thân cho thiết kế!");
                    setSavingDesign(false);
                    return;
                  }
                  // Có thể kiểm tra thêm các trường khác nếu muốn
                  // Chuyển đổi accessories từ object sang array để tương thích với backend
                  const partsForSave = { ...selectedOptions };
                  if (selectedOptions.accessories && typeof selectedOptions.accessories === 'object') {
                    const accessoriesArray: string[] = [];
                    Object.entries(selectedOptions.accessories).forEach(([accId, quantity]) => {
                      for (let i = 0; i < quantity; i++) {
                        accessoriesArray.push(accId);
                      }
                    });
                    (partsForSave as any).accessories = accessoriesArray;
                  }
                  
                  const saveBody = {
                    userId: role === 'admin' ? 'admin' : userId,
                    designName: saveDesignForm.designName || selectedOptions.name || "Thiết kế mới",
                    description: saveDesignForm.description,
                    parts: partsForSave,
                    canvasJSON: JSON.stringify(canvasData),
                    previewImage: saveDesignForm.previewImage
                  };
                  try {
                    await axios.post("http://localhost:5000/api/designs", saveBody);
                    setShowSaveDesignModal(false);
                    if (role === 'admin') {
                      toast.success("Đã lưu mẫu thiết kế sẵn! Mẫu sẽ hiển thị ở trang quản lý mẫu thiết kế.");
                    } else {
                      toast.success("Đã Lưu Thiết Kế. Thiết kế tùy chỉnh của bạn đã được lưu vào tài khoản.");
                    }
                  } catch (err: unknown) {
                    let errorMsg = "Có lỗi xảy ra.";
                    if (axios.isAxiosError(err)) {
                      errorMsg = err.response?.data?.error || err.message;
                    } else if (err instanceof Error) {
                      errorMsg = err.message;
                    }
                    toast.error(errorMsg);
                    console.error("Lỗi khi lưu thiết kế:", err);
                  }
                  setSavingDesign(false);
                }}
                disabled={savingDesign || !saveDesignForm.designName}
              >
                {savingDesign ? 'Đang lưu...' : 'Lưu thiết kế'}
              </Button>
              <Button variant="outline" onClick={() => setShowSaveDesignModal(false)}>Hủy</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <GiftBoxModal open={giftBoxModalOpen} onClose={() => setGiftBoxModalOpen(false)} onSelect={handleGiftBoxSelect} />
      {/* XÓA: Dialog Lưu thành mẫu thiết kế sẵn (chỉ admin) */}
      {/* Tìm và xoá đoạn:
      {isAdmin && (
        <Dialog open={showSaveTemplate} onOpenChange={setShowSaveTemplate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lưu thành mẫu thiết kế sẵn</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Tên mẫu thiết kế"
                value={templateForm.name}
                onChange={e => setTemplateForm(f => ({ ...f, name: e.target.value }))}
                required
              />
              <Input
                placeholder="Mô tả ngắn"
                value={templateForm.description}
                onChange={e => setTemplateForm(f => ({ ...f, description: e.target.value }))}
              />
              <ImageUpload
                currentImage={templateForm.previewImage}
                onImageUploaded={url => setTemplateForm(f => ({ ...f, previewImage: url }))}
                folder="designs"
              />
            </div>
            <DialogFooter>
              <Button
                onClick={async () => {
                  setSavingTemplate(true);
                  const userId = localStorage.getItem('userId') || 'admin';
                  const body = {
                    userId,
                    designName: templateForm.name,
                    description: templateForm.description,
                    previewImage: templateForm.previewImage,
                    canvasJSON: fabricRef.current?.toJSON() || {},
                    parts: selectedOptions,
                    isPublic: false // luôn là false để không lên cộng đồng
                  };
                  await fetch('http://localhost:5000/api/designs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                  });
                  setSavingTemplate(false);
                  setShowSaveTemplate(false);
                  toast.success('Đã lưu mẫu thiết kế sẵn!');
                }}
                disabled={savingTemplate || !templateForm.name}
              >
                {savingTemplate ? 'Đang lưu...' : 'Lưu mẫu'}
              </Button>
              <Button variant="outline" onClick={() => setShowSaveTemplate(false)}>Hủy</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      */}
    </div>
  )
}