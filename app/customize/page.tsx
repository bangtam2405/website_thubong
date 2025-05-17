"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Heart, Save, ShoppingCart, Undo, Redo, Camera } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"

// Định nghĩa kiểu dữ liệu cho các tùy chọn tùy chỉnh
interface CustomizationOption {
  id: string
  name: string
  image: string
  price?: number
}

// Dữ liệu mẫu cho các tùy chọn tùy chỉnh
const bodyOptions: CustomizationOption[] = [
  { id: "body1", name: "Gấu Truyền Thống", image: "/placeholder.svg?height=100&width=100" },
  { id: "body2", name: "Thỏ", image: "/placeholder.svg?height=100&width=100" },
  { id: "body3", name: "Cún Con", image: "/placeholder.svg?height=100&width=100" },
  { id: "body4", name: "Mèo Con", image: "/placeholder.svg?height=100&width=100" },
]

const earOptions: CustomizationOption[] = [
  { id: "ear1", name: "Tai Tròn", image: "/placeholder.svg?height=100&width=100" },
  { id: "ear2", name: "Tai Nhọn", image: "/placeholder.svg?height=100&width=100" },
  { id: "ear3", name: "Tai Xệ", image: "/placeholder.svg?height=100&width=100" },
]

const eyeOptions: CustomizationOption[] = [
  { id: "eye1", name: "Mắt Nút", image: "/placeholder.svg?height=100&width=100" },
  { id: "eye2", name: "Mắt Thêu", image: "/placeholder.svg?height=100&width=100" },
  { id: "eye3", name: "Mắt Nhựa", image: "/placeholder.svg?height=100&width=100" },
]

const furColorOptions: CustomizationOption[] = [
  { id: "color1", name: "Nâu", image: "/placeholder.svg?height=100&width=100" },
  { id: "color2", name: "Trắng", image: "/placeholder.svg?height=100&width=100" },
  { id: "color3", name: "Hồng", image: "/placeholder.svg?height=100&width=100" },
  { id: "color4", name: "Xanh Dương", image: "/placeholder.svg?height=100&width=100" },
  { id: "color5", name: "Tím", image: "/placeholder.svg?height=100&width=100" },
]

const clothingOptions: CustomizationOption[] = [
  { id: "clothing1", name: "Áo Thun", image: "/placeholder.svg?height=100&width=100", price: 5 },
  { id: "clothing2", name: "Váy", image: "/placeholder.svg?height=100&width=100", price: 8 },
  { id: "clothing3", name: "Yếm", image: "/placeholder.svg?height=100&width=100", price: 7 },
  { id: "clothing4", name: "Áo Len", image: "/placeholder.svg?height=100&width=100", price: 6 },
]

const accessoryOptions: CustomizationOption[] = [
  { id: "acc1", name: "Nơ Cổ", image: "/placeholder.svg?height=100&width=100", price: 3 },
  { id: "acc2", name: "Kính", image: "/placeholder.svg?height=100&width=100", price: 4 },
  { id: "acc3", name: "Mũ", image: "/placeholder.svg?height=100&width=100", price: 5 },
  { id: "acc4", name: "Khăn Quàng", image: "/placeholder.svg?height=100&width=100", price: 4 },
]

export default function CustomizePage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("body")
  const [selectedOptions, setSelectedOptions] = useState({
    body: bodyOptions[0].id,
    ears: earOptions[0].id,
    eyes: eyeOptions[0].id,
    furColor: furColorOptions[0].id,
    clothing: "",
    accessories: [] as string[],
    name: "",
    size: "medium",
  })

  const [totalPrice, setTotalPrice] = useState(29.99) // Giá cơ bản
  const [history, setHistory] = useState<any[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Tính tổng giá dựa trên lựa chọn
  useEffect(() => {
    let price = 29.99 // Giá cơ bản

    // Thêm giá quần áo nếu được chọn
    if (selectedOptions.clothing) {
      const selectedClothing = clothingOptions.find((item) => item.id === selectedOptions.clothing)
      if (selectedClothing?.price) {
        price += selectedClothing.price
      }
    }

    // Thêm giá phụ kiện
    selectedOptions.accessories.forEach((accId) => {
      const selectedAcc = accessoryOptions.find((item) => item.id === accId)
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
  }, [selectedOptions])

  // Thêm vào lịch sử khi lựa chọn thay đổi
  useEffect(() => {
    // Chỉ thêm vào lịch sử nếu không điều hướng qua lịch sử
    if (historyIndex === history.length - 1 || historyIndex === -1) {
      const newHistory = [...history.slice(0, historyIndex + 1), { ...selectedOptions }]
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
  }, [selectedOptions])

  const handleOptionSelect = (category: string, optionId: string) => {
    setSelectedOptions((prev) => {
      if (category === "accessories") {
        // Chuyển đổi lựa chọn phụ kiện
        const accessories = prev.accessories.includes(optionId)
          ? prev.accessories.filter((id) => id !== optionId)
          : [...prev.accessories, optionId]
        return { ...prev, accessories }
      }
      return { ...prev, [category]: optionId }
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

  const handleSaveDesign = () => {
    // Trong ứng dụng thực tế, điều này sẽ lưu vào cơ sở dữ liệu
    toast({
      title: "Đã Lưu Thiết Kế",
      description: "Thiết kế tùy chỉnh của bạn đã được lưu vào tài khoản.",
    })
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

            <div className="relative h-[400px] bg-pink-50 rounded-lg flex items-center justify-center mb-6">
              {/* Đây sẽ được thay thế bằng canvas hoặc xem trước tương tác trong triển khai thực tế */}
              <div className="text-center">
                <Image
                  src="/placeholder.svg?height=300&width=300"
                  alt="Xem Trước Thú Nhồi Bông"
                  width={300}
                  height={300}
                  className="mx-auto"
                />
                <p className="mt-4 text-gray-500">Xem Trước Trực Tiếp</p>
                {selectedOptions.name && <p className="mt-2 text-pink-500 font-medium">Tên: {selectedOptions.name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Lựa Chọn Hiện Tại:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Thân: {bodyOptions.find((o) => o.id === selectedOptions.body)?.name}</li>
                  <li>Tai: {earOptions.find((o) => o.id === selectedOptions.ears)?.name}</li>
                  <li>Mắt: {eyeOptions.find((o) => o.id === selectedOptions.eyes)?.name}</li>
                  <li>Màu Lông: {furColorOptions.find((o) => o.id === selectedOptions.furColor)?.name}</li>
                  {selectedOptions.clothing && (
                    <li>Quần Áo: {clothingOptions.find((o) => o.id === selectedOptions.clothing)?.name}</li>
                  )}
                  {selectedOptions.accessories.length > 0 && (
                    <li>
                      Phụ Kiện:{" "}
                      {selectedOptions.accessories
                        .map((id) => accessoryOptions.find((o) => o.id === id)?.name)
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
                          +{clothingOptions.find((o) => o.id === selectedOptions.clothing)?.price?.toFixed(2)}$
                        </span>
                      </li>
                    )}
                    {selectedOptions.accessories.map((accId) => (
                      <li key={accId} className="flex justify-between">
                        <span>{accessoryOptions.find((o) => o.id === accId)?.name}:</span>
                        <span>+{accessoryOptions.find((o) => o.id === accId)?.price?.toFixed(2)}$</span>
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
                  <div>
                    <h3 className="font-medium mb-3">Chọn Loại Thân</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {bodyOptions.map((option) => (
                        <div
                          key={option.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            selectedOptions.body === option.id ? "border-pink-500 bg-pink-50" : "hover:border-gray-300"
                          }`}
                          onClick={() => handleOptionSelect("body", option.id)}
                        >
                          <Image
                            src={option.image || "/placeholder.svg"}
                            alt={option.name}
                            width={80}
                            height={80}
                            className="mx-auto mb-2"
                          />
                          <p className="text-center text-sm">{option.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Kích Thước</h3>
                    <RadioGroup
                      value={selectedOptions.size}
                      onValueChange={handleSizeChange}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="small" id="size-small" />
                        <Label htmlFor="size-small">Nhỏ</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="size-medium" />
                        <Label htmlFor="size-medium">Vừa</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="large" id="size-large" />
                        <Label htmlFor="size-large">Lớn</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Màu Lông</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {furColorOptions.map((option) => (
                        <div
                          key={option.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            selectedOptions.furColor === option.id
                              ? "border-pink-500 bg-pink-50"
                              : "hover:border-gray-300"
                          }`}
                          onClick={() => handleOptionSelect("furColor", option.id)}
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
                  </div>
                </TabsContent>

                <TabsContent value="features" className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Tai</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {earOptions.map((option) => (
                        <div
                          key={option.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            selectedOptions.ears === option.id ? "border-pink-500 bg-pink-50" : "hover:border-gray-300"
                          }`}
                          onClick={() => handleOptionSelect("ears", option.id)}
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
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Mắt</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {eyeOptions.map((option) => (
                        <div
                          key={option.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            selectedOptions.eyes === option.id ? "border-pink-500 bg-pink-50" : "hover:border-gray-300"
                          }`}
                          onClick={() => handleOptionSelect("eyes", option.id)}
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
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Đặt Tên Cho Thú Bông Của Bạn</h3>
                    <Input
                      placeholder="Nhập tên"
                      value={selectedOptions.name}
                      onChange={handleNameChange}
                      maxLength={20}
                    />
                    <p className="text-xs text-gray-500 mt-1">Tên này sẽ được thêu trên thẻ (tùy chọn)</p>
                  </div>
                </TabsContent>

                <TabsContent value="extras" className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Quần Áo (Tùy Chọn)</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {clothingOptions.map((option) => (
                        <div
                          key={option.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            selectedOptions.clothing === option.id
                              ? "border-pink-500 bg-pink-50"
                              : "hover:border-gray-300"
                          }`}
                          onClick={() => handleOptionSelect("clothing", option.id)}
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

                  <div>
                    <h3 className="font-medium mb-3">Phụ Kiện (Tùy Chọn)</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {accessoryOptions.map((option) => (
                        <div
                          key={option.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            selectedOptions.accessories.includes(option.id)
                              ? "border-pink-500 bg-pink-50"
                              : "hover:border-gray-300"
                          }`}
                          onClick={() => handleOptionSelect("accessories", option.id)}
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
