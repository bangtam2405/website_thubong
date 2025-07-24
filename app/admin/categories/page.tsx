"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2, Search } from "lucide-react"
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

  return (
    <div className="container mx-auto py-8 px-4">
      {showEditCategory && editCategoryId && (
        <Card className="mb-4 shadow-sm border">
          <CardHeader className="py-3 px-6">
            <CardTitle className="text-lg">Chỉnh Sửa Danh Mục</CardTitle>
            <CardDescription className="text-sm">Cập nhật thông tin danh mục phụ kiện, bộ phận, màu sắc, ...</CardDescription>
          </CardHeader>
          <CardContent className="py-4 px-6">
            <EditCategoryForm id={editCategoryId} onCancel={() => { setShowEditCategory(false); setEditCategoryId(null); }} />
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
        <CardHeader className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full items-center mb-4">
            <div className="col-span-1 md:col-span-2">
              <div className="relative max-w-full">
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
            </div>
            <div className="col-span-1">
              <select
                className="border rounded px-2 py-2 min-w-[160px] w-full"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
              >
                <option value="all">Tất cả danh mục</option>
                {mainCategories.map((cat: any) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-1 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => router.push('/admin/bulk-update')}>
                Cập nhật hàng loạt
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin/manage-categories')}>
                Quản lý chi tiết
              </Button>
              <Button onClick={() => setShowAddCategory(v => !v)} className={showAddCategory ? 'bg-gray-300 text-black' : ''}>
                <Plus className="w-4 h-4 mr-2" /> Thêm danh mục
              </Button>
            </div>
          </div>
          <CardTitle>Kho phụ kiện</CardTitle>
          <CardDescription>Quản lý toàn bộ phụ kiện, bộ phận, tồn kho, giá, hình ảnh...</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Hiển thị dạng group phân cấp */}
          {mainCategories
            .filter((cat: any) => categoryFilter === "all" || cat._id === categoryFilter)
            .map((parent: any) => {
              const hideImage = ["Kích Thước", "Chất Liệu", "Màu Lông"].includes(parent.name);
              return (
                <div key={parent._id} className="mb-10 bg-white rounded-xl shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-pink-600">{parent.name}</h2>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => router.push(`/admin/edit-product/${parent._id}`)}>
                        <Edit />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="ml-2 border border-pink-200 text-pink-500 hover:bg-pink-50 rounded-full"
                            onClick={() => setConfirmId(parent._id)}
                            title="Xóa danh mục"
                            disabled={deletingId === parent._id}
                          >
                            <Trash2 size={18} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-pink-600">Xác nhận xóa danh mục</AlertDialogTitle>
                            <AlertDialogDescription>Bạn có chắc chắn muốn xóa danh mục gốc "{parent.name}" và tất cả danh mục con của nó? Hành động này không thể hoàn tác.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-pink-200 text-pink-500 hover:bg-pink-50" onClick={() => setConfirmId(null)}>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-pink-500 hover:bg-pink-600 text-white"
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
                  {/* Lặp qua các con trực tiếp của parent */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {getChildren(categories, parent._id).map((child: any) => (
                      <div key={child._id} className="bg-pink-50 rounded-lg p-4 shadow flex flex-col">
                        <div className="font-semibold text-lg mb-2 text-pink-700">{child.name}</div>
                        {/* Nếu child lại có con, lặp tiếp */}
                        {getChildren(categories, child._id).length > 0 ? (
                          <div className="grid grid-cols-1 gap-3">
                            {/* Thêm nút xóa cho child (cấp 2) ngay cả khi có con */}
                            <div className="flex items-center gap-3 border rounded p-2 bg-yellow-50">
                              {parent.name === 'Màu Lông' ? (
                                child.parent === '685a946dc9b03b62c0b69989' && child.image && /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(child.image.trim())
                                  ? (
                                    <div
                                      className="w-10 h-10 rounded-full border"
                                      style={{ backgroundColor: child.image }}
                                      title={child.name}
                                    />
                                  ) : null
                              ) : child.parent === '685a946dc9b03b62c0b69989' ? null : (!hideImage && child.image && child.image !== '/placeholder.svg' && child.image !== '' ? (
                                <Image src={child.image} alt={child.name} width={48} height={48} className="rounded border" />
                              ) : null)}
                              <div className="flex-1">
                                <div className="font-medium">{child.name} (Danh mục cha)</div>
                                <div className="text-xs text-gray-500">Giá: {child.price ? child.price + '$' : '---'}</div>
                              </div>
                              <Button size="icon" variant="ghost" onClick={() => { setShowEditCategory(true); setEditCategoryId(child._id); }}><Edit /></Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="icon" variant="ghost" onClick={() => setConfirmId(child._id)}>
                                    <Trash2 />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-pink-600">Xác nhận xóa danh mục</AlertDialogTitle>
                                    <AlertDialogDescription>Bạn có chắc chắn muốn xóa danh mục "{child.name}" và tất cả danh mục con của nó? Hành động này không thể hoàn tác.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="border-pink-200 text-pink-500 hover:bg-pink-50" onClick={() => setConfirmId(null)}>Hủy</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-pink-500 hover:bg-pink-600 text-white"
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
                            {/* Hiển thị các danh mục con (cấp 3) */}
                            {getChildren(categories, child._id).map((grandchild: any) => (
                              <div key={grandchild._id} className="flex items-center gap-3 border rounded p-2 bg-white">
                                {parent.name === 'Màu Lông' ? (
                                  grandchild.parent === '685a946dc9b03b62c0b69989' && grandchild.image && /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(grandchild.image.trim())
                                    ? (
                                      <div
                                        className="w-10 h-10 rounded-full border"
                                        style={{ backgroundColor: grandchild.image }}
                                        title={grandchild.name}
                                      />
                                    ) : null
                                ) : grandchild.parent === '685a946dc9b03b62c0b69989' ? null : (!hideImage && grandchild.image && grandchild.image !== '/placeholder.svg' && grandchild.image !== '' ? (
                                  <Image src={grandchild.image} alt={grandchild.name} width={48} height={48} className="rounded border" />
                                ) : null)}
                                <div className="flex-1">
                                  <div className="font-medium">{grandchild.name}</div>
                                  <div className="text-xs text-gray-500">Giá: {grandchild.price ? grandchild.price + '$' : '---'}</div>
                                </div>
                                <Button size="icon" variant="ghost" onClick={() => { setShowEditCategory(true); setEditCategoryId(grandchild._id); }}><Edit /></Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="icon" variant="ghost" onClick={() => setConfirmId(grandchild._id)}>
                                      <Trash2 />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-pink-600">Xác nhận xóa danh mục</AlertDialogTitle>
                                      <AlertDialogDescription>Bạn có chắc chắn muốn xóa danh mục "{grandchild.name}"? Hành động này không thể hoàn tác.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="border-pink-200 text-pink-500 hover:bg-pink-50" onClick={() => setConfirmId(null)}>Hủy</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-pink-500 hover:bg-pink-600 text-white"
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
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 border rounded p-2 bg-white">
                            {parent.name === 'Màu Lông' ? (
                              child.parent === '685a946dc9b03b62c0b69989' && child.image && /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(child.image.trim())
                                ? (
                                  <div
                                    className="w-10 h-10 rounded-full border"
                                    style={{ backgroundColor: child.image }}
                                    title={child.name}
                                  />
                                ) : null
                            ) : child.parent === '685a946dc9b03b62c0b69989' ? null : (!hideImage && child.image && child.image !== '/placeholder.svg' && child.image !== '' ? (
                              <Image src={child.image} alt={child.name} width={48} height={48} className="rounded border" />
                            ) : null)}
                            <div className="flex-1">
                              <div className="font-medium">{child.name}</div>
                              <div className="text-xs text-gray-500">Giá: {child.price ? child.price + '$' : '---'}</div>
                            </div>
                            <Button size="icon" variant="ghost" onClick={() => { setShowEditCategory(true); setEditCategoryId(child._id); }}><Edit /></Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" onClick={() => setConfirmId(child._id)}>
                                  <Trash2 />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-pink-600">Xác nhận xóa danh mục</AlertDialogTitle>
                                  <AlertDialogDescription>Bạn có chắc chắn muốn xóa danh mục "{child.name}"? Hành động này không thể hoàn tác.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-pink-200 text-pink-500 hover:bg-pink-50" onClick={() => setConfirmId(null)}>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-pink-500 hover:bg-pink-600 text-white"
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
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          {/* Nếu không có danh mục */}
          {mainCategories.length === 0 && (
            <div className="text-center text-gray-500 mt-8">Không có danh mục nào hoặc chưa có dữ liệu.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 