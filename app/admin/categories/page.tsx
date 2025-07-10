"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2 } from "lucide-react"
import Image from "next/image"
import instance from "@/lib/axiosConfig"
import { useRouter } from "next/navigation"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    instance.get("http://localhost:5000/api/categories").then(res => setCategories(res.data)).finally(() => setLoading(false))
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

  let filteredOptions = options;
  if (categoryFilter !== "all") {
    const descendantIds = getAllDescendantIds(categories, categoryFilter);
    filteredOptions = options.filter((opt: any) =>
      (descendantIds.includes(opt.parent) || opt.parent === categoryFilter) &&
      (opt.name?.toLowerCase().includes(search.toLowerCase()))
    );
  } else {
    filteredOptions = options.filter((opt: any) =>
      opt.name?.toLowerCase().includes(search.toLowerCase())
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Kho phụ kiện</CardTitle>
            <CardDescription>Quản lý toàn bộ phụ kiện, bộ phận, tồn kho, giá, hình ảnh...</CardDescription>
          </div>
          <div className="flex flex-wrap gap-4 mb-4">
            <Input placeholder="Tìm kiếm sản phẩm..." value={search} onChange={e => setSearch(e.target.value)} />
            <select
              className="border rounded px-2 py-1"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="all">Tất cả danh mục</option>
              {mainCategories.map((cat: any) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => router.push('/admin/bulk-update')}>
                Cập nhật hàng loạt
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin/manage-categories')}>
                Quản lý chi tiết
              </Button>
              <Button onClick={() => router.push("/admin/category")}> 
                <Plus className="w-4 h-4 mr-2" /> Thêm danh mục 
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Hiển thị dạng group phân cấp */}
          {mainCategories
            .filter((cat: any) => categoryFilter === "all" || cat._id === categoryFilter)
            .map((parent: any) => (
              <div key={parent._id} className="mb-10 bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-pink-600">{parent.name}</h2>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => router.push(`/admin/edit-product/${parent._id}`)}>
                      <Edit />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={async () => {
                        if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục gốc "${parent.name}" và tất cả danh mục con của nó?`)) {
                          await instance.delete(`http://localhost:5000/api/categories/${parent._id}`)
                          const res = await instance.get("http://localhost:5000/api/categories")
                          setCategories(res.data)
                        }
                      }}
                    >
                      <Trash2 />
                    </Button>
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
                            <Image src={child.image || '/placeholder.svg'} alt={child.name} width={48} height={48} className="rounded" />
                            <div className="flex-1">
                              <div className="font-medium">{child.name} (Danh mục cha)</div>
                              <div className="text-xs text-gray-500">Giá: {child.price ? child.price + '$' : '---'}</div>
                            </div>
                            <Button size="icon" variant="ghost" onClick={() => router.push(`/admin/edit-category/${child._id}`)}><Edit /></Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={async () => {
                                if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${child.name}" và tất cả danh mục con của nó?`)) {
                                  await instance.delete(`http://localhost:5000/api/categories/${child._id}`)
                                  const res = await instance.get("http://localhost:5000/api/categories")
                                  setCategories(res.data)
                                }
                              }}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                          {/* Hiển thị các danh mục con (cấp 3) */}
                          {getChildren(categories, child._id).map((grandchild: any) => (
                            <div key={grandchild._id} className="flex items-center gap-3 border rounded p-2 bg-white">
                              <Image src={grandchild.image || '/placeholder.svg'} alt={grandchild.name} width={48} height={48} className="rounded" />
                              <div className="flex-1">
                                <div className="font-medium">{grandchild.name}</div>
                                <div className="text-xs text-gray-500">Giá: {grandchild.price ? grandchild.price + '$' : '---'}</div>
                              </div>
                              <Button size="icon" variant="ghost" onClick={() => router.push(`/admin/edit-category/${grandchild._id}`)}><Edit /></Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={async () => {
                                  if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
                                    await instance.delete(`http://localhost:5000/api/categories/${grandchild._id}`)
                                    const res = await instance.get("http://localhost:5000/api/categories")
                                    setCategories(res.data)
                                  }
                                }}
                              >
                                <Trash2 />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 border rounded p-2 bg-white">
                          <Image src={child.image || '/placeholder.svg'} alt={child.name} width={48} height={48} className="rounded" />
                          <div className="flex-1">
                            <div className="font-medium">{child.name}</div>
                            <div className="text-xs text-gray-500">Giá: {child.price ? child.price + '$' : '---'}</div>
                          </div>
                          <Button size="icon" variant="ghost" onClick={() => router.push(`/admin/edit-category/${child._id}`)}><Edit /></Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={async () => {
                              if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
                                await instance.delete(`http://localhost:5000/api/categories/${child._id}`)
                                const res = await instance.get("http://localhost:5000/api/categories")
                                setCategories(res.data)
                              }
                            }}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          {/* Nếu không có danh mục */}
          {mainCategories.length === 0 && (
            <div className="text-center text-gray-500 mt-8">Không có danh mục nào hoặc chưa có dữ liệu.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 