"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Heart, Save, ShoppingCart, Undo, Redo, Camera } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import axios from "axios"
import { fabric } from "fabric"

interface Category {
  _id: string
  name: string
  parent: string | null
  type: string
  image?: string
  price?: number
}

export default function CustomizePage() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("body")
  const [selectedOptions, setSelectedOptions] = useState({
    body: "",
    ears: "",
    eyes: "",
    furColor: "",
    clothing: "",
    accessories: [] as string[],
    name: "",
    size: "medium",
  })

  const [totalPrice, setTotalPrice] = useState(29.99) // Giá cơ bản
  const [history, setHistory] = useState<any[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fabricCanvas, setFabricCanvas] = useState<any>(null)
  const [fabricLib, setFabricLib] = useState<any>(null)

  // Khởi tạo selectedOptions động dựa trên dữ liệu fetch được
  useEffect(() => {
    if (!loading && categories.length > 0) {
      setSelectedOptions({
        body: categories.filter(cat => cat.type === "body")[0]?._id || "",
        ears: categories.filter(cat => cat.type === "ear")[0]?._id || "",
        eyes: categories.filter(cat => cat.type === "eye")[0]?._id || "",
        furColor: "",
        clothing: categories.filter(cat => cat.type === "clothing")[0]?._id || "",
        accessories: [],
        name: "",
        size: "medium",
      })
    }
  }, [loading, categories])

  // Tính tổng giá dựa trên lựa chọn
  useEffect(() => {
    let price = 29.99 // Giá cơ bản

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

    // Điều chỉnh giá dựa trên kích thước
    if (selectedOptions.size === "small") {
      price -= 5
    } else if (selectedOptions.size === "large") {
      price += 10
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

  // Dynamic import fabric.js và khởi tạo canvas
  useEffect(() => {
    if (canvasRef.current && !fabricCanvas) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 500,
        height: 650,
        backgroundColor: "#fdf2f8"
      });
      setFabricCanvas(canvas);
    }
    // Cleanup
    return () => {
      if (fabricCanvas) fabricCanvas.dispose();
    };
  }, [canvasRef, fabricCanvas]);

  // Update layer mỗi khi selectedOptions thay đổi
  useEffect(() => {
    if (!fabricCanvas || !fabricLib) return;
    fabricCanvas.clear();
    fabricCanvas.setBackgroundColor("#fdf2f8", () => {});
    // Helper để add image
    const addImg = (url: string | undefined, zIndex: number, label?: string) => {
      if (!url) url = "/cute.png"; // test.png là ảnh mẫu trong public/
      console.log(`[addImg] zIndex ${zIndex} (${label || ''}):`, url)
      fabricLib.Image.fromURL(url, (img: any) => {
        if (!img) return;
        img.selectable = false;
        img.evented = false;
        img.set({ left: 0, top: 0, scaleX: 1, scaleY: 1 });
        fabricCanvas.add(img);
        fabricCanvas.moveTo(img, zIndex);
        fabricCanvas.renderAll();
      });
    };
    addImg(categories.find(c => c._id === selectedOptions.body)?.image, 10, 'body');
    addImg(categories.find(c => c._id === selectedOptions.furColor)?.image, 20, 'furColor');
    addImg(categories.find(c => c._id === selectedOptions.clothing)?.image, 30, 'clothing');
    addImg(categories.find(c => c._id === selectedOptions.ears)?.image, 40, 'ears');
    addImg(categories.find(c => c._id === selectedOptions.eyes)?.image, 50, 'eyes');
    selectedOptions.accessories.forEach((accId: string, idx: number) => addImg(categories.find(c => c._id === accId)?.image, 60 + idx, `accessory-${accId}`));
    console.log('[useEffect] selectedOptions:', selectedOptions)
    console.log('[useEffect] categories:', categories)
  }, [fabricCanvas, fabricLib, selectedOptions, categories]);

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
    if (!fabricCanvas) return;
    const canvasJSON = fabricCanvas.toJSON();
    await axios.post("/api/designs", {
      userId: "userId",
      designName: selectedOptions.name || "Thiết kế mới",
      parts: selectedOptions,
      canvasJSON
    });
    toast({
      title: "Đã Lưu Thiết Kế",
      description: "Thiết kế tùy chỉnh của bạn đã được lưu vào tài khoản.",
    });
  }

  const handleAddToCart = () => {
    // Trong ứng dụng thực tế, điều này sẽ thêm vào giỏ hàng
    toast({
      title: "Đã Thêm Vào Giỏ Hàng",
      description: "Thú nhồi bông tùy chỉnh của bạn đã được thêm vào giỏ hàng.",
    })
  }

  const handleAddToWishlist = () => {
    // Trong ứng dụng thực tế, điều này sẽ thêm vào danh sách yêu thích
    toast({
      title: "Đã Thêm Vào Danh Sách Yêu Thích",
      description: "Thú nhồi bông tùy chỉnh của bạn đã được thêm vào danh sách yêu thích.",
    })
  }

  const handleDownloadDesign = () => {
    // Trong ứng dụng thực tế, điều này sẽ tạo và tải xuống hình ảnh
    toast({
      title: "Đã Tải Xuống Thiết Kế",
      description: "Hình ảnh thiết kế tùy chỉnh của bạn đã được tải xuống.",
    })
  }

  const handleTakeScreenshot = () => {
    // Trong ứng dụng thực tế, điều này sẽ chụp thiết kế hiện tại
    toast({
      title: "Đã Chụp Màn Hình",
      description: "Ảnh chụp màn hình thiết kế của bạn đã được lưu.",
    })
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
    if (group.type === "body" || group.name.toLowerCase().includes("loại thân")) return "body";
    if (group.type === "ear" || group.name.toLowerCase().includes("tai")) return "ears";
    if (group.type === "eye" || group.name.toLowerCase().includes("mắt")) return "eyes";
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
              </div>
            </div>

            <div className="relative h-[650px] w-[500px] mx-auto bg-pink-50 rounded-lg flex items-center justify-center mb-6">
              <canvas ref={canvasRef} width={500} height={650} className="rounded-lg" />
              <div className="absolute bottom-2 left-0 right-0 text-center">
                <p className="mt-4 text-gray-500">Xem Trước Trực Tiếp</p>
                {selectedOptions.name && <p className="mt-2 text-pink-500 font-medium">Tên: {selectedOptions.name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Lựa Chọn Hiện Tại:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Thân: {bodyGroups.find((o) => o._id === selectedOptions.body)?.name}</li>
                  <li>Tai: {categories.find((o) => o._id === selectedOptions.ears)?.name}</li>
                  <li>Mắt: {categories.find((o) => o._id === selectedOptions.eyes)?.name}</li>
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
                      <span>29.99$</span>
                    </li>
                    {selectedOptions.clothing && (
                      <li className="flex justify-between">
                        <span>Quần Áo:</span>
                        <span>
                          +{categories.find((o) => o._id === selectedOptions.clothing)?.price?.toFixed(2)}$
                        </span>
                      </li>
                    )}
                    {selectedOptions.accessories.map((accId) => (
                      <li key={accId} className="flex justify-between">
                        <span>{categories.find((o) => o._id === accId)?.name}:</span>
                        <span>+{categories.find((o) => o._id === accId)?.price?.toFixed(2)}$</span>
                      </li>
                    ))}
                    {selectedOptions.size !== "medium" && (
                      <li className="flex justify-between">
                        <span>Kích Thước ({selectedOptions.size === "small" ? "Nhỏ" : "Lớn"}):</span>
                        <span>{selectedOptions.size === "small" ? "-5.00$" : "+10.00$"}</span>
                      </li>
                    )}
                    <li className="flex justify-between font-bold border-t mt-2 pt-2">
                      <span>Tổng:</span>
                      <span>{totalPrice.toFixed(2)}$</span>
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
                            <p className="text-center text-xs text-pink-500">+{option.price?.toFixed(2)}$</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>

              <div className="mt-8 space-y-4">
                <Button className="w-full bg-pink-500 hover:bg-pink-600" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Thêm Vào Giỏ Hàng - {totalPrice.toFixed(2)}$
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
