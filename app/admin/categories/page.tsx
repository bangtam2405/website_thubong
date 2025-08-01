"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2, Search, FolderOpen, Tag, Palette, Ruler, Package, DollarSign, Layers, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react"
import Image from "next/image"
import instance from "@/lib/axiosConfig"
import { useRouter } from "next/navigation"
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
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import CategoryForm from "../category/page";
import EditCategoryForm from "../edit-category/EditCategoryForm";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);

  useEffect(() => {
    instance.get("http://localhost:5000/api/categories").then(res => {
      setCategories(res.data);
      console.log('categories:', res.data);
      // Debug: kiểm tra dữ liệu stock và sold
      res.data.forEach((cat: any) => {
        if (cat.stock !== undefined || cat.sold !== undefined) {
          console.log(`${cat.name}: stock=${cat.stock}, sold=${cat.sold}`);
        }
      });
    }).finally(() => setLoading(false))
  }, [])

  function getAllDescendantIds(categories: any[], parentId: any): any[] {
    const directChildren = categories.filter((cat: any) => cat.parent === parentId);
    let all = directChildren.map((cat: any) => cat._id);
    for (const child of directChildren) {
      all = all.concat(getAllDescendantIds(categories, child._id));
    }
    return all;
  }
  function getChildren(categories: any[], parentId: any): any[] {
    return categories.filter((cat: any) => cat.parent === parentId);
  }

  const mainCategories = categories.filter((cat: any) => cat.parent === null)
  const options = categories.filter((cat: any) => cat.parent && cat.parent !== null)

  const filteredOptions = options.filter(opt => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return (
      (opt.name && opt.name.toLowerCase().includes(s)) ||
      (opt.type && opt.type.toLowerCase().includes(s)) ||
      (opt.description && opt.description.toLowerCase().includes(s))
    );
  });

  // Tính toán thống kê tổng quan
  const stats = {
    totalCategories: categories.length,
    mainCategories: mainCategories.length,
    subCategories: options.length,
    categoriesWithPrice: categories.filter(cat => cat.price && cat.price > 0).length,
    categoriesWithImage: categories.filter(cat => cat.image && cat.image !== '/placeholder.svg' && cat.image !== '').length,
    totalValue: categories.reduce((sum, cat) => sum + (cat.price || 0), 0),
    totalImported: categories.reduce((sum, cat) => sum + (cat.imported || 0), 0),
    totalSold: categories.reduce((sum, cat) => sum + (cat.sold || 0), 0),
    totalStock: categories.reduce((sum, cat) => sum + (cat.stock || 0), 0)
  };

  // Tính toán thống kê cho từng danh mục
  const getCategoryStats = (categoryId: string) => {
    // Lấy tất cả id con (bao gồm cả chính nó)
    const allIds = [categoryId, ...getAllDescendantIds(categories, categoryId)];
    const allCats = categories.filter(cat => allIds.includes(cat._id));
    return {
      totalItems: allCats.length,
      totalImported: allCats.reduce((sum, cat) => sum + (cat.imported || 0), 0),
      totalSold: allCats.reduce((sum, cat) => sum + (cat.sold || 0), 0),
      totalStock: allCats.reduce((sum, cat) => sum + (cat.stock || 0), 0),
      totalValue: allCats.reduce((sum, cat) => sum + (cat.price || 0), 0),
      lowStock: allCats.filter(cat => (cat.stock || 0) <= 5 && (cat.stock || 0) > 0).length,
      outOfStock: allCats.filter(cat => (cat.stock || 0) === 0).length
    };
  };

  // Lấy icon cho từng loại danh mục
  const getCategoryIcon = (categoryName: string) => {
    if (categoryName.includes('Mắt') || categoryName.includes('Eye')) return <Tag className="w-5 h-5" />;
    if (categoryName.includes('Miệng') || categoryName.includes('Mouth')) return <Tag className="w-5 h-5" />;
    if (categoryName.includes('Thân') || categoryName.includes('Body')) return <Package className="w-5 h-5" />;
    if (categoryName.includes('Màu') || categoryName.includes('Color')) return <Palette className="w-5 h-5" />;
    if (categoryName.includes('Kích') || categoryName.includes('Size')) return <Ruler className="w-5 h-5" />;
    if (categoryName.includes('Chất') || categoryName.includes('Material')) return <Layers className="w-5 h-5" />;
    return <FolderOpen className="w-5 h-5" />;
  };

  // Lấy màu cho trạng thái tồn kho
  const getStockStatusColor = (stock: number) => {
    if (stock === 0) return 'text-red-600 bg-red-100';
    if (stock <= 5) return 'text-orange-600 bg-orange-100';
    if (stock <= 10) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {showEditCategory && editCategoryId && (
        <Card className="mb-4 shadow-sm border">
          <CardHeader className="py-3 px-6">
            <CardTitle className="text-lg">Chỉnh Sửa Danh Mục</CardTitle>
            <CardDescription className="text-sm">Cập nhật thông tin danh mục phụ kiện, bộ phận, màu sắc, ...</CardDescription>
          </CardHeader>
          <CardContent className="py-4 px-6">
            <EditCategoryForm 
              id={editCategoryId} 
              onCancel={() => { 
                setShowEditCategory(false); 
                setEditCategoryId(null); 
                // Refresh dữ liệu sau khi chỉnh sửa
                instance.get("http://localhost:5000/api/categories").then(res => {
                  setCategories(res.data);
                });
              }} 
            />
          </CardContent>
        </Card>
      )}
      {showAddCategory && (
        <Card className="mb-4 shadow-sm border">
          <CardHeader className="py-3 px-6">
            <CardTitle className="text-lg">Thêm Danh Mục</CardTitle>
            <CardDescription className="text-sm">Thêm mới danh mục phụ kiện, bộ phận, màu sắc, ...</CardDescription>
          </CardHeader>
          <CardContent className="py-4 px-6">
            <div className="flex justify-end mb-2">
              <Button variant="outline" onClick={() => setShowAddCategory(false)}>Hủy</Button>
            </div>
            <CategoryForm onCancel={() => setShowAddCategory(false)} />
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Kho Phụ Kiện</CardTitle>
            <CardDescription>Quản lý toàn bộ phụ kiện, bộ phận, tồn kho, giá, hình ảnh...</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/admin/manage-categories')}>
              Quản lý chi tiết
            </Button>
            <Button onClick={() => setShowAddCategory(v => !v)} className={showAddCategory ? 'bg-gray-300 text-black' : ''}>
              <Plus className="w-4 h-4 mr-2" /> Thêm danh mục
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Thống kê tổng quan */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <FolderOpen className="w-5 h-5 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">{stats.totalCategories}</div>
              </div>
              <div className="text-sm text-blue-600">Tổng danh mục</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-5 h-5 text-green-600" />
                <div className="text-2xl font-bold text-green-600">{stats.mainCategories}</div>
              </div>
              <div className="text-sm text-green-600">Danh mục chính</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-5 h-5 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">{stats.subCategories}</div>
              </div>
              <div className="text-sm text-purple-600">Danh mục con</div>
            </div>

            <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="w-5 h-5 text-pink-600" />
                <div className="text-2xl font-bold text-pink-600">{stats.totalImported}</div>
              </div>
              <div className="text-sm text-pink-600">Tổng nhập</div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <div className="text-2xl font-bold text-indigo-600">{stats.totalSold}</div>
              </div>
              <div className="text-sm text-indigo-600">Đã bán</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-orange-600" />
                <div className="text-2xl font-bold text-orange-600">{stats.totalStock}</div>
              </div>
              <div className="text-sm text-orange-600">Tồn kho</div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-200 outline-none w-full"
                placeholder="Tìm kiếm tên, loại, mô tả phụ kiện..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="border rounded px-3 py-2 min-w-[180px] bg-white"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="all">Tất cả danh mục</option>
              {mainCategories.map((cat: any) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Hiển thị dạng group phân cấp */}
          {mainCategories
            .filter((cat: any) => categoryFilter === "all" || cat._id === categoryFilter)
            .map((parent: any) => {
              const hideImage = ["Kích Thước", "Chất Liệu", "Màu Lông"].includes(parent.name);
              const children = getChildren(categories, parent._id);
              const categoryStats = getCategoryStats(parent._id);
              
              return (
                <div key={parent._id} className="mb-8 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(parent.name)}
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">{parent.name}</h2>
                          <div className="flex gap-6 text-sm text-gray-600 mt-2">
                            <span className="flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              {categoryStats.totalItems} sản phẩm
                            </span>
                            <span className="flex items-center gap-1">
                              <ShoppingCart className="w-4 h-4" />
                              {categoryStats.totalImported} tổng nhập
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {categoryStats.totalSold} đã bán
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {categoryStats.totalStock} tồn kho
                            </span>
                            {categoryStats.lowStock > 0 && (
                              <span className="flex items-center gap-1 text-orange-600">
                                <AlertTriangle className="w-4 h-4" />
                                {categoryStats.lowStock} sắp hết
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => router.push(`/admin/edit-product/${parent._id}`)} title="Chỉnh sửa">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="border border-red-200 text-red-500 hover:bg-red-50 rounded-full"
                              onClick={() => setConfirmId(parent._id)}
                              title="Xóa danh mục"
                              disabled={deletingId === parent._id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-red-600">Xác nhận xóa danh mục</AlertDialogTitle>
                              <AlertDialogDescription>Bạn có chắc chắn muốn xóa danh mục gốc "{parent.name}" và tất cả danh mục con của nó? Hành động này không thể hoàn tác.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-gray-200 text-gray-500 hover:bg-gray-50" onClick={() => setConfirmId(null)}>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600 text-white"
                                onClick={async () => {
                                  setDeletingId(parent._id);
                                  try {
                                    await instance.delete(`http://localhost:5000/api/categories/${parent._id}`)
                                    const res = await instance.get("http://localhost:5000/api/categories")
                                    setCategories(res.data)
                                    toast.success("Đã xóa danh mục!");
                                  } catch {
                                    toast.error("Xóa danh mục thất bại!");
                                  } finally {
                                    setDeletingId(null);
                                    setConfirmId(null);
                                  }
                                }}
                                disabled={deletingId === parent._id}
                              >
                                {deletingId === parent._id ? "Đang xóa..." : "Xóa"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                  
                  {/* Lặp qua các con trực tiếp của parent */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {children.map((child: any) => {
                        const childStats = getCategoryStats(child._id);
                        return (
                          <div key={child._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="font-semibold text-lg mb-3 text-gray-800 flex items-center gap-2">
                              {getCategoryIcon(child.name)}
                              {child.name}
                            </div>
                            
                            {/* Thống kê cho danh mục con */}
                            <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                              <div className="bg-white rounded p-2 text-center">
                                <div className="font-semibold text-blue-600">{childStats.totalImported}</div>
                                <div className="text-gray-500">Tổng nhập</div>
                              </div>
                              <div className="bg-white rounded p-2 text-center">
                                <div className="font-semibold text-green-600">{childStats.totalSold}</div>
                                <div className="text-gray-500">Đã bán</div>
                              </div>
                              <div className="bg-white rounded p-2 text-center">
                                <div className="font-semibold text-orange-600">{childStats.totalStock}</div>
                                <div className="text-gray-500">Tồn kho</div>
                              </div>
                            </div>
                            
                            {/* Nếu child lại có con, lặp tiếp */}
                            {getChildren(categories, child._id).length > 0 ? (
                              <div className="space-y-3">
                                {/* Thêm nút xóa cho child (cấp 2) ngay cả khi có con */}
                                <div className="flex items-center gap-3 border rounded p-3 bg-yellow-50 border-yellow-200">
                                  {parent.name === 'Màu Lông' ? (
                                    child.parent === '685a946dc9b03b62c0b69989' && child.image && /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(child.image.trim())
                                      ? (
                                        <div
                                          className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0"
                                          style={{ backgroundColor: child.image }}
                                          title={child.name}
                                        />
                                      ) : null
                                  ) : child.parent === '685a946dc9b03b62c0b69989' ? null : (!hideImage && child.image && child.image !== '/placeholder.svg' && child.image !== '' ? (
                                    <Image src={child.image} alt={child.name} width={32} height={32} className="rounded border flex-shrink-0" />
                                  ) : null)}
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">{child.name} (Danh mục cha)</div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 flex-wrap">
                                      <span className="bg-blue-50 px-2 py-1 rounded whitespace-nowrap">Nhập: {child.imported || 0}</span>
                                      <span className="bg-green-50 px-2 py-1 rounded whitespace-nowrap">Bán: {child.sold || 0}</span>
                                      <span className={`px-2 py-1 rounded whitespace-nowrap ${getStockStatusColor(child.stock || 0)}`}>
                                        Tồn: {child.stock || 0}
                                      </span>
                                      <span className="bg-gray-50 px-2 py-1 rounded whitespace-nowrap">Giá: {child.price ? child.price.toLocaleString('vi-VN') + '₫' : '---'}</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-1 flex-shrink-0">
                                    <Button size="icon" variant="ghost" onClick={() => { setShowEditCategory(true); setEditCategoryId(child._id); }} title="Chỉnh sửa">
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="icon" variant="ghost" onClick={() => setConfirmId(child._id)} title="Xóa">
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle className="text-red-600">Xác nhận xóa danh mục</AlertDialogTitle>
                                          <AlertDialogDescription>Bạn có chắc chắn muốn xóa danh mục "{child.name}" và tất cả danh mục con của nó? Hành động này không thể hoàn tác.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel className="border-gray-200 text-gray-500 hover:bg-gray-50" onClick={() => setConfirmId(null)}>Hủy</AlertDialogCancel>
                                          <AlertDialogAction
                                            className="bg-red-500 hover:bg-red-600 text-white"
                                            onClick={async () => {
                                              setDeletingId(child._id);
                                              try {
                                                await instance.delete(`http://localhost:5000/api/categories/${child._id}`)
                                                const res = await instance.get("http://localhost:5000/api/categories")
                                                setCategories(res.data)
                                                toast.success("Đã xóa danh mục!");
                                              } catch {
                                                toast.error("Xóa danh mục thất bại!");
                                              } finally {
                                                setDeletingId(null);
                                                setConfirmId(null);
                                              }
                                            }}
                                            disabled={deletingId === child._id}
                                          >
                                            {deletingId === child._id ? "Đang xóa..." : "Xóa"}
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                                
                                {/* Hiển thị các danh mục con (cấp 3) */}
                                {getChildren(categories, child._id).map((grandchild: any) => (
                                  <div key={grandchild._id} className="flex items-center gap-3 border rounded p-3 bg-white border-gray-200">
                                    {parent.name === 'Màu Lông' ? (
                                      grandchild.parent === '685a946dc9b03b62c0b69989' && grandchild.image && /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(grandchild.image.trim())
                                        ? (
                                          <div
                                            className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0"
                                            style={{ backgroundColor: grandchild.image }}
                                            title={grandchild.name}
                                          />
                                        ) : null
                                    ) : grandchild.parent === '685a946dc9b03b62c0b69989' ? null : (!hideImage && grandchild.image && grandchild.image !== '/placeholder.svg' && grandchild.image !== '' ? (
                                      <Image src={grandchild.image} alt={grandchild.name} width={32} height={32} className="rounded border flex-shrink-0" />
                                    ) : null)}
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm truncate">{grandchild.name}</div>
                                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 flex-wrap">
                                        <span className="bg-blue-50 px-2 py-1 rounded whitespace-nowrap">Nhập: {grandchild.imported || 0}</span>
                                        <span className="bg-green-50 px-2 py-1 rounded whitespace-nowrap">Bán: {grandchild.sold || 0}</span>
                                        <span className={`px-2 py-1 rounded whitespace-nowrap ${getStockStatusColor(grandchild.stock || 0)}`}>
                                          Tồn: {grandchild.stock || 0}
                                        </span>
                                        <span className="bg-gray-50 px-2 py-1 rounded whitespace-nowrap">Giá: {grandchild.price ? grandchild.price.toLocaleString('vi-VN') + '₫' : '---'}</span>
                                      </div>
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                      <Button size="icon" variant="ghost" onClick={() => { setShowEditCategory(true); setEditCategoryId(grandchild._id); }} title="Chỉnh sửa">
                                        <Edit className="w-3 h-3" />
                                      </Button>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button size="icon" variant="ghost" onClick={() => setConfirmId(grandchild._id)} title="Xóa">
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle className="text-red-600">Xác nhận xóa danh mục</AlertDialogTitle>
                                            <AlertDialogDescription>Bạn có chắc chắn muốn xóa danh mục "{grandchild.name}"? Hành động này không thể hoàn tác.</AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel className="border-gray-200 text-gray-500 hover:bg-gray-50" onClick={() => setConfirmId(null)}>Hủy</AlertDialogCancel>
                                            <AlertDialogAction
                                              className="bg-red-500 hover:bg-red-600 text-white"
                                              onClick={async () => {
                                                setDeletingId(grandchild._id);
                                                try {
                                                  await instance.delete(`http://localhost:5000/api/categories/${grandchild._id}`)
                                                  const res = await instance.get("http://localhost:5000/api/categories")
                                                  setCategories(res.data)
                                                  toast.success("Đã xóa danh mục!");
                                                } catch {
                                                  toast.error("Xóa danh mục thất bại!");
                                                } finally {
                                                  setDeletingId(null);
                                                  setConfirmId(null);
                                                }
                                              }}
                                              disabled={deletingId === grandchild._id}
                                            >
                                              {deletingId === grandchild._id ? "Đang xóa..." : "Xóa"}
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 border rounded p-3 bg-white border-gray-200">
                                {parent.name === 'Màu Lông' ? (
                                  child.parent === '685a946dc9b03b62c0b69989' && child.image && /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(child.image.trim())
                                    ? (
                                      <div
                                        className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0"
                                        style={{ backgroundColor: child.image }}
                                        title={child.name}
                                      />
                                    ) : null
                                ) : child.parent === '685a946dc9b03b62c0b69989' ? null : (!hideImage && child.image && child.image !== '/placeholder.svg' && child.image !== '' ? (
                                  <Image src={child.image} alt={child.name} width={32} height={32} className="rounded border flex-shrink-0" />
                                ) : null)}
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm truncate">{child.name}</div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 flex-wrap">
                                    <span className="bg-blue-50 px-2 py-1 rounded whitespace-nowrap">Nhập: {child.imported || 0}</span>
                                    <span className="bg-green-50 px-2 py-1 rounded whitespace-nowrap">Bán: {child.sold || 0}</span>
                                    <span className={`px-2 py-1 rounded whitespace-nowrap ${getStockStatusColor(child.stock || 0)}`}>
                                      Tồn: {child.stock || 0}
                                    </span>
                                    <span className="bg-gray-50 px-2 py-1 rounded whitespace-nowrap">Giá: {child.price ? child.price.toLocaleString('vi-VN') + '₫' : '---'}</span>
                                  </div>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button size="icon" variant="ghost" onClick={() => { setShowEditCategory(true); setEditCategoryId(child._id); }} title="Chỉnh sửa">
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="icon" variant="ghost" onClick={() => setConfirmId(child._id)} title="Xóa">
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-red-600">Xác nhận xóa danh mục</AlertDialogTitle>
                                        <AlertDialogDescription>Bạn có chắc chắn muốn xóa danh mục "{child.name}"? Hành động này không thể hoàn tác.</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="border-gray-200 text-gray-500 hover:bg-gray-50" onClick={() => setConfirmId(null)}>Hủy</AlertDialogCancel>
                                        <AlertDialogAction
                                          className="bg-red-500 hover:bg-red-600 text-white"
                                          onClick={async () => {
                                            setDeletingId(child._id);
                                            try {
                                              await instance.delete(`http://localhost:5000/api/categories/${child._id}`)
                                              const res = await instance.get("http://localhost:5000/api/categories")
                                              setCategories(res.data)
                                              toast.success("Đã xóa danh mục!");
                                            } catch {
                                              toast.error("Xóa danh mục thất bại!");
                                            } finally {
                                              setDeletingId(null);
                                              setConfirmId(null);
                                            }
                                          }}
                                          disabled={deletingId === child._id}
                                        >
                                          {deletingId === child._id ? "Đang xóa..." : "Xóa"}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          {/* Nếu không có danh mục */}
          {mainCategories.length === 0 && (
            <div className="text-center text-gray-500 mt-8 py-12">
              <FolderOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-lg">Không có danh mục nào hoặc chưa có dữ liệu.</p>
              <p className="text-sm text-gray-400 mt-2">Hãy thêm danh mục đầu tiên để bắt đầu quản lý kho phụ kiện.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 