"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2, Search, Save, X, Package, Tag, Palette, Gift, Star } from "lucide-react"
import Image from "next/image"
import instance from "@/lib/axiosConfig"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import ImageUpload from "@/components/ImageUpload"

interface ProductCategory {
  _id: string
  name: string
  type: string
  description?: string
  image?: string
  icon?: string
  color?: string
  isActive: boolean
  sortOrder: number
  productCount: number
  createdAt: string
  updatedAt: string
}

export default function ProductCategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    type: "teddy",
    description: "",
    image: "",
    icon: "",
    color: "#FF6B9D",
    isActive: true,
    sortOrder: 0
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await instance.get("http://localhost:5000/api/product-categories/admin")
      setCategories(response.data)
    } catch (error) {
      console.error("Lỗi khi tải danh mục sản phẩm:", error)
      toast.error("Không thể tải danh mục sản phẩm")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Validation
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục!")
      setLoading(false)
      return
    }
    
    if (!form.type.trim()) {
      toast.error("Vui lòng nhập mã danh mục!")
      setLoading(false)
      return
    }
    
    // Kiểm tra mã danh mục chỉ chứa chữ cái, số và dấu gạch ngang
    const typeRegex = /^[a-z0-9-]+$/
    if (!typeRegex.test(form.type)) {
      toast.error("Mã danh mục chỉ được chứa chữ cái thường, số và dấu gạch ngang!")
      setLoading(false)
      return
    }
    
    try {
      if (editingId) {
        // Cập nhật danh mục hiện có
        await instance.put(`http://localhost:5000/api/product-categories/admin/${editingId}`, form)
        toast.success("Cập nhật danh mục thành công!")
      } else {
        // Thêm danh mục mới
        await instance.post("http://localhost:5000/api/product-categories/admin", form)
        toast.success("Thêm danh mục thành công!")
      }
      
      setShowAddForm(false)
      setEditingId(null)
      resetForm()
      fetchCategories() // Tải lại dữ liệu
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra!"
      toast.error(errorMessage)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: ProductCategory) => {
    setEditingId(category._id)
    setForm({
      name: category.name,
      type: category.type,
      description: category.description || "",
      image: category.image || "",
      icon: category.icon || "",
      color: category.color || "#FF6B9D",
      isActive: category.isActive,
      sortOrder: category.sortOrder
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      // Kiểm tra xem có sản phẩm nào đang sử dụng danh mục này không
      const categoryToDelete = categories.find(cat => cat._id === id);
      if (categoryToDelete && categoryToDelete.productCount > 0) {
        toast.error(`Không thể xóa danh mục "${categoryToDelete.name}". Có ${categoryToDelete.productCount} sản phẩm đang sử dụng danh mục này.`);
        return;
      }

      await instance.delete(`http://localhost:5000/api/product-categories/admin/${id}`)
      toast.success("Xóa danh mục thành công!")
      fetchCategories() // Tải lại dữ liệu
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Lỗi khi xóa danh mục!"
      toast.error(errorMessage)
      console.error(error)
    }
  }

  const resetForm = () => {
    setForm({
      name: "",
      type: "teddy",
      description: "",
      image: "",
      icon: "",
      color: "#FF6B9D",
      isActive: true,
      sortOrder: 0
    })
  }

  const handleImageUploaded = (imageUrl: string) => {
    setForm(prev => ({ ...prev, image: imageUrl }))
  }

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case "teddy": return <Package className="w-5 h-5" />
      case "collection": return <Palette className="w-5 h-5" />
      case "accessory": return <Tag className="w-5 h-5" />
      case "new": return <Star className="w-5 h-5" />
      case "giftbox": return <Gift className="w-5 h-5" />
      default: return <Package className="w-5 h-5" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "teddy": return "Teddy"
      case "collection": return "Bộ Sưu Tập"
      case "accessory": return "Phụ Kiện"
      case "new": return "Hàng Mới"
      case "giftbox": return "Hộp Quà"
      default: return type
    }
  }

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    cat.description?.toLowerCase().includes(search.toLowerCase()) ||
    getTypeLabel(cat.type).toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Quản Lý Danh Mục Sản Phẩm</CardTitle>
            <CardDescription>Quản lý các danh mục sản phẩm chính: Teddy, Bộ sưu tập, Phụ kiện, Hàng mới, Hộp quà</CardDescription>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" /> Thêm danh mục
          </Button>
        </CardHeader>
        <CardContent>
          {/* Form thêm/sửa danh mục */}
          {showAddForm && (
            <Card className="mb-6 border-2 border-pink-200">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingId ? "Chỉnh Sửa Danh Mục" : "Thêm Danh Mục Mới"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Tên danh mục</label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="VD: Teddy, Bộ Sưu Tập, Phụ Kiện..."
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Tên hiển thị cho người dùng</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Mã danh mục</label>
                      <Input
                        value={form.type}
                        onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value.toLowerCase() }))}
                        placeholder="VD: teddy, collection, accessory..."
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Mã dùng trong code (viết thường, không dấu cách)</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Mô tả</label>
                    <Input
                      value={form.description}
                      onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Mô tả ngắn về danh mục..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Icon (emoji)</label>
                      <Input
                        value={form.icon}
                        onChange={(e) => setForm(prev => ({ ...prev, icon: e.target.value }))}
                        placeholder="🐻, 🎨, 🎀..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Màu sắc</label>
                      <Input
                        type="color"
                        value={form.color}
                        onChange={(e) => setForm(prev => ({ ...prev, color: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Thứ tự hiển thị</label>
                      <Input
                        type="number"
                        value={form.sortOrder}
                        onChange={(e) => setForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Hình ảnh danh mục</label>
                    <ImageUpload
                      onImageUploaded={handleImageUploaded}
                      currentImage={form.image}
                      folder="product-categories"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={form.isActive}
                      onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="isActive" className="text-sm">Kích hoạt danh mục</label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      {editingId ? "Cập nhật" : "Thêm mới"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowAddForm(false)
                        setEditingId(null)
                        resetForm()
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Hủy
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Tìm kiếm */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                className="pl-10"
                placeholder="Tìm kiếm danh mục..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Bảng danh mục */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Danh mục</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Số sản phẩm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thứ tự</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {category.image ? (
                        <Image 
                          src={category.image} 
                          alt={category.name} 
                          width={40} 
                          height={40} 
                          className="rounded object-cover"
                        />
                      ) : (
                        <div 
                          className="w-10 h-10 rounded flex items-center justify-center text-lg"
                          style={{ backgroundColor: category.color + '20' }}
                        >
                          {category.icon || getCategoryIcon(category.type)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-gray-500">
                          {category.icon} {getTypeLabel(category.type)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {getTypeLabel(category.type)}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={category.description}>
                      {category.description || "Không có mô tả"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{category.productCount}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      category.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.isActive ? 'Đang hoạt động' : 'Đã ẩn'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{category.sortOrder}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa danh mục</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa danh mục "{category.name}"? 
                              Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(category._id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCategories.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {search ? "Không tìm thấy danh mục nào phù hợp." : "Chưa có danh mục sản phẩm nào."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}