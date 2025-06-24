"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Heart, Save, ShoppingCart, Undo, Redo, Camera, Trash2 } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import axios from "axios"
import CustomFabricCanvas from "@/components/CustomFabricCanvas"
import type { AxiosError } from "axios"
import { useSearchParams } from "next/navigation"
import { useCart } from "@/contexts/CartContext"
import { AddToCartButton } from "@/components/AddToCartButton"

interface Category {
  _id: string
  name: string
  parent: string | null
  type: string
  image?: string
  price?: number
}

export default function CustomizePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("body")
  const [selectedOptions, setSelectedOptions] = useState({
    body: "",
    ears: "",
    eyes: "",
    nose: "",
    mouth: "",
    furColor: "",
    clothing: "",
    accessories: [] as string[],
    name: "",
    size: "",
  })

  const [totalPrice, setTotalPrice] = useState(29.99) // Giá cơ bản
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

  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const editType = searchParams.get("type"); // "product" hoặc "design"

  const { addToCart } = useCart();

  const [canvasJSON, setCanvasJSON] = useState<any>(null);
  const fabricRef = useRef<any>(null);
  const [loadedCanvasJSON, setLoadedCanvasJSON] = useState<any>(null);

  // Reset loadedCanvasJSON khi không edit
  useEffect(() => {
    if (!editId) {
      setLoadedCanvasJSON(null);
      console.log("Reset loadedCanvasJSON to null");
    }
  }, [editId]);

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
    let price = 299000 // Giá cơ bản (299.000₫)

    // Thêm giá quần áo nếu được chọn
    if (selectedOptions.clothing) {
      const selectedClothing = categories.find((item) => item._id === selectedOptions.clothing)
      if (selectedClothing?.price) {
        price += selectedClothing.price
      }
    }

    // Thêm giá phụ kiện
    selectedOptions.accessories.forEach((accId) => {
      const selectedAcc = categories.find((item) => item._id === accId)
      if (selectedAcc?.price) {
        price += selectedAcc.price
      }
    })

    // Thêm giá mũi nếu được chọn
    if (selectedOptions.nose) {
      const selectedNose = categories.find((item) => item._id === selectedOptions.nose)
      if (selectedNose?.price) {
        price += selectedNose.price
      }
    }

    // Thêm giá miệng nếu được chọn
    if (selectedOptions.mouth) {
      const selectedMouth = categories.find((item) => item._id === selectedOptions.mouth)
      if (selectedMouth?.price) {
        price += selectedMouth.price
      }
    }

    // Điều chỉnh giá dựa trên kích thước
    if (selectedOptions.size === "small") {
      price -= 50000 // Giảm 50.000₫ cho size nhỏ
    } else if (selectedOptions.size === "large") {
      price += 100000 // Tăng 100.000₫ cho size lớn
    }

    setTotalPrice(price)
  }, [selectedOptions, categories])

  // Thêm vào lịch sử khi lựa chọn thay đổi
  useEffect(() => {
    // Chỉ thêm vào lịch sử nếu không điều hướng qua lịch sử
    if (historyIndex === history.length - 1 || historyIndex === -1) {
      const newHistory = [...history.slice(0, historyIndex + 1), { ...selectedOptions }]
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
  }, [selectedOptions])

  useEffect(() => {
    if (editId) {
      if (editType === 'product') {
        // Load trực tiếp từ products API cho custom products
        axios.get(`http://localhost:5000/api/products/${editId}`)
          .then(productRes => {
            console.log("[DEBUG] Custom product từ products API:", productRes.data);
            const product = productRes.data;
            
            if (product.isCustom && product.customData) {
              // Load parts từ customData
              if (product.customData.parts) {
                setSelectedOptions(product.customData.parts);
              }
              
              // Set canvas JSON để CustomFabricCanvas load
              if (product.customData.canvasJSON) {
                const canvasData = typeof product.customData.canvasJSON === 'string' 
                  ? JSON.parse(product.customData.canvasJSON) 
                  : product.customData.canvasJSON;
                console.log("[DEBUG] Setting loadedCanvasJSON from product:", canvasData);
                setLoadedCanvasJSON(canvasData);
              }
            }
          })
          .catch(productError => {
            console.error("Không tìm thấy custom product:", productError);
          });
      } else {
        // Load từ designs API (mặc định)
        axios.get(`http://localhost:5000/api/designs/${editId}`)
          .then(res => {
            console.log("[DEBUG] Thiết kế từ designs API:", res.data);
            if (res.data && res.data.canvasJSON) {
              setSelectedOptions(res.data.parts);
              // Set canvas JSON để CustomFabricCanvas load
              const canvasData = typeof res.data.canvasJSON === 'string' 
                ? JSON.parse(res.data.canvasJSON) 
                : res.data.canvasJSON;
              setLoadedCanvasJSON(canvasData);
            }
          })
          .catch(designError => {
            console.error("Không tìm thấy design:", designError);
          });
      }
    }
  }, [editId, editType]);

  const handleOptionSelect = (category: string, optionId: string) => {
    setSelectedOptions((prev) => {
      const next = category === "accessories"
        ? { ...prev, accessories: prev.accessories.includes(optionId) ? prev.accessories.filter((id) => id !== optionId) : [...prev.accessories, optionId] }
        : { ...prev, [category]: optionId }
      console.log("[handleOptionSelect]", category, optionId, next)
      return next
    })
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOptions((prev) => ({ ...prev, name: e.target.value }))
  }

  const handleSizeChange = (value: string) => {
    setSelectedOptions((prev) => ({ ...prev, size: value }))
  }

  const handleColorChange = (color: string) => {
    setSelectedOptions((prev) => ({ ...prev, furColor: color }));
    if (fabricRef.current) {
      fabricRef.current.updateFurColor(color);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setSelectedOptions(history[historyIndex - 1])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setSelectedOptions(history[historyIndex + 1])
    }
  }

  const handleSaveDesign = async () => {
    console.log("[DEBUG] Bấm Lưu Thiết Kế");
    let canvasData = {};
    if (!fabricRef.current) {
      console.log("[DEBUG] fabricRef.current chưa sẵn sàng!");
    } else if (!fabricRef.current.toJSON) {
      console.log("[DEBUG] fabricRef.current.toJSON không tồn tại!");
    } else {
      canvasData = fabricRef.current.toJSON();
      console.log("[DEBUG] canvasData khi lưu:", canvasData);
    }
    toast("Test toast: Đã bấm nút Lưu Thiết Kế");
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (!userId) {
      toast.error("Bạn cần đăng nhập để lưu thiết kế!");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/designs", {
        userId,
        designName: selectedOptions.name || "Thiết kế mới",
        parts: selectedOptions,
        canvasJSON: JSON.stringify(canvasData),
      });
      toast.success("Đã Lưu Thiết Kế. Thiết kế tùy chỉnh của bạn đã được lưu vào tài khoản.");
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
  }

  const handleAddToCart = () => {
    if (!fabricRef.current) {
      toast.error("Không thể lấy hình ảnh thiết kế!")
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
      _id: `custom-${Date.now()}`, // Tạo ID tạm thời
      name: selectedOptions.name || "Thú nhồi bông tùy chỉnh",
      description: `Thú nhồi bông tùy chỉnh với ${selectedOptions.size} kích thước`,
      price: totalPrice,
      image: canvasImage, // Sử dụng hình ảnh từ canvas
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
        accessories: selectedOptions.accessories
          .map(id => categories.find((o) => o._id === id)?.name)
          .filter((name): name is string => name !== undefined),
        size: selectedOptions.size
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Thêm vào giỏ hàng
    addToCart(customizedProduct)
    toast.success("Đã thêm thú nhồi bông tùy chỉnh vào giỏ hàng!")
  }

  const handleAddToWishlist = async () => {
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
        accessories: selectedOptions.accessories
          .map(id => categories.find((o) => o._id === id)?.name)
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
      
      // Lưu sản phẩm tùy chỉnh vào database trước
      const productResponse = await axios.post("http://localhost:5000/api/products/custom", {
        ...customizedProduct,
        isCustom: true,
        customData: {
          parts: selectedOptions,
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
    toast.success("Đã Tải Xuống Thiết Kế. Hình ảnh thiết kế tùy chỉnh của bạn đã được tải xuống.");
  }

  const handleTakeScreenshot = () => {
    toast.success("Đã Chụp Màn Hình. Ảnh chụp màn hình thiết kế của bạn đã được lưu.");
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
          next.accessories = prev.accessories.filter(id => id !== activeObject.partId)
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

  function mapGroupToOptionKey(group: any) {
    if (group.type === "accessory" || group.name.toLowerCase().includes("phụ kiện")) return "accessories";
    if (group.type === "body" || group.name.toLowerCase().includes("loại thân")) return "body";
    if (group.type === "ear" || group.name.toLowerCase().includes("tai")) return "ears";
    if (group.type === "eye" || group.name.toLowerCase().includes("mắt")) return "eyes";
    if (group.type === "nose" || group.name.toLowerCase().includes("mũi")) return "nose";
    if (group.type === "mouth" || group.name.toLowerCase().includes("miệng")) return "mouth";
    if (group.type === "furColor" || group.name.toLowerCase().includes("màu lông")) return "furColor";
    if (group.type === "clothing" || group.name.toLowerCase().includes("quần áo")) return "clothing";
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

  useEffect(() => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (!userId) {
      window.location.href = "/login";
    }
  }, []);

  if (loading) return <div>Đang tải dữ liệu...</div>

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Thiết Kế Thú Nhồi Bông Tùy Chỉnh Của Bạn</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Phần Xem Trước */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <div className="bg-white rounded-xl shadow-lg p-6 h-full">
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

            <div className="relative h-[650px] w-[500px] mx-auto bg-pink-50 rounded-lg flex items-center justify-center mb-6">
              <CustomFabricCanvas 
                ref={fabricRef} 
                selectedOptions={selectedOptions} 
                categories={categories} 
                canvasJSON={loadedCanvasJSON}
              />
              <div className="absolute bottom-2 left-0 right-0 text-center">
                <p className="mt-4 text-gray-500">Xem Trước Trực Tiếp</p>
                {selectedOptions.name && <p className="mt-2 text-pink-500 font-medium">Tên: {selectedOptions.name}</p>}
              </div>
              {!selectedOptions.body && !loadedCanvasJSON && (
                <div className="absolute inset-0 flex items-center justify-center bg-pink-50 bg-opacity-90">
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
                  <li>Thân: {bodyGroups.find((o) => o._id === selectedOptions.body)?.name}</li>
                  <li>Tai: {categories.find((o) => o._id === selectedOptions.ears)?.name}</li>
                  <li>Mắt: {categories.find((o) => o._id === selectedOptions.eyes)?.name}</li>
                  <li>Mũi: {categories.find((o) => o._id === selectedOptions.nose)?.name}</li>
                  <li>Miệng: {categories.find((o) => o._id === selectedOptions.mouth)?.name}</li>
                  <li>Màu Lông: {categories.find((o) => o._id === selectedOptions.furColor)?.name}</li>
                  {selectedOptions.clothing && (
                    <li>Quần Áo: {categories.find((o) => o._id === selectedOptions.clothing)?.name}</li>
                  )}
                  {selectedOptions.accessories.length > 0 && (
                    <li>
                      Phụ Kiện:{" "}
                      {selectedOptions.accessories
                        .map((id) => categories.find((o) => o._id === id)?.name)
                        .join(", ")}
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
                    <li className="flex justify-between">
                      <span>Giá Cơ Bản:</span>
                      <span>299.000₫</span>
                    </li>
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
                    {selectedOptions.accessories.map((accId) => (
                      <li key={accId} className="flex justify-between">
                        <span>{categories.find((o) => o._id === accId)?.name}:</span>
                        <span>+{categories.find((o) => o._id === accId)?.price?.toLocaleString('vi-VN')}₫</span>
                      </li>
                    ))}
                    {selectedOptions.size !== "medium" && (
                      <li className="flex justify-between">
                        <span>Kích Thước ({selectedOptions.size === "small" ? "Nhỏ" : "Lớn"}):</span>
                        <span>{selectedOptions.size === "small" ? "-50.000₫" : "+100.000₫"}</span>
                      </li>
                    )}
                    <li className="flex justify-between font-bold border-t mt-2 pt-2">
                      <span>Tổng:</span>
                      <span>{totalPrice.toLocaleString('vi-VN')}₫</span>
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
                  {bodyGroups.map(group => (
                    <div key={group._id}>
                      <h3 className="font-medium mb-3">{group.name}</h3>
                      {group.name === "Kích Thước" ? (
                        <RadioGroup
                          value={(selectedOptions as any)[mapGroupToOptionKey(group)] || selectedOptions.size}
                          onValueChange={value => setSelectedOptions(prev => ({ ...prev, [mapGroupToOptionKey(group) || "size"]: value }))}
                          className="flex space-x-4"
                        >
                          {categories.filter(opt => opt.parent === group._id && opt.type === "option").map(option => (
                            <div key={option._id} className="flex items-center space-x-2">
                              <RadioGroupItem value={option._id} id={`size-${option._id}`} />
                              <Label htmlFor={`size-${option._id}`}>{option.name}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      ) : (
                        <div className="grid grid-cols-3 gap-3">
                          {categories.filter(opt => opt.parent === group._id && opt.type === "option").map(option => (
                            <div
                              key={option._id}
                              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                                (selectedOptions as any)[mapGroupToOptionKey(group)] === option._id ? "border-pink-500 bg-pink-50" : "hover:border-gray-300"
                              }`}
                              onClick={() => handleOptionSelect(mapGroupToOptionKey(group), option._id)}
                            >
                              <Image
                                src={option.image || "/placeholder.svg"}
                                alt={option.name}
                                width={60}
                                height={60}
                                className="mx-auto mb-2"
                              />
                              <p className="text-center text-sm">{option.name}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="features" className="space-y-6">
                  {featureGroups.map(group => (
                    <div key={group._id}>
                      <h3 className="font-medium mb-3">{group.name}</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {categories.filter(opt => opt.parent === group._id).length > 0
                          ? categories.filter(opt => opt.parent === group._id).map(option => (
                              <div
                                key={option._id}
                                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                                  (selectedOptions as any)[mapGroupToOptionKey(group)] === option._id ? "border-pink-500 bg-pink-50" : "hover:border-gray-300"
                                }`}
                                onClick={() => handleOptionSelect(mapGroupToOptionKey(group), option._id)}
                              >
                                <Image
                                  src={option.image || "/placeholder.svg"}
                                  alt={option.name}
                                  width={60}
                                  height={60}
                                  className="mx-auto mb-2"
                                />
                                <p className="text-center text-sm">{option.name}</p>
                              </div>
                            ))
                          : (
                            <div
                              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                                (selectedOptions as any)[mapGroupToOptionKey(group)] === group._id ? "border-pink-500 bg-pink-50" : "hover:border-gray-300"
                              }`}
                              onClick={() => handleOptionSelect(mapGroupToOptionKey(group), group._id)}
                            >
                              <Image
                                src={group.image || "/placeholder.svg"}
                                alt={group.name}
                                width={60}
                                height={60}
                                className="mx-auto mb-2"
                              />
                              <p className="text-center text-sm">{group.name}</p>
                            </div>
                          )
                        }
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="extras" className="space-y-6">
                  {accessoryGroups.map(group => (
                    <div key={group._id}>
                      <h3 className="font-medium mb-3">{group.name}</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {categories.filter(opt => opt.parent === group._id && opt.type === "option").map(option => (
                          <div
                            key={option._id}
                            className={`border rounded-lg p-3 cursor-pointer transition-all ${
                              selectedOptions.accessories?.includes(option._id) ? "border-pink-500 bg-pink-50" : "hover:border-gray-300"
                            }`}
                            onClick={() => handleOptionSelect(mapGroupToOptionKey(group), option._id)}
                          >
                            <Image
                              src={option.image || "/placeholder.svg"}
                              alt={option.name}
                              width={70}
                              height={70}
                              className="mx-auto mb-2"
                            />
                            <p className="text-center text-sm">{option.name}</p>
                            <p className="text-center text-xs text-pink-500">+{option.price?.toLocaleString('vi-VN')}₫</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>

              <div className="mt-8 space-y-4">
                <Button 
                  className="w-full bg-pink-500 hover:bg-pink-600" 
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Thêm Vào Giỏ Hàng - {totalPrice.toLocaleString('vi-VN')}₫
                </Button>
                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1" onClick={handleSaveDesign}>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu Thiết Kế
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={handleAddToWishlist}>
                    <Heart className="mr-2 h-4 w-4" />
                    Thêm Vào Yêu Thích
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
