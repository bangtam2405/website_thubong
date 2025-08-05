"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import ImageUpload from "@/components/ImageUpload"
import { Switch } from "@/components/ui/switch"
import Loader from "@/components/ui/Loader"

export default function AdminBannerPage() {
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newBanner, setNewBanner] = useState({ url: "", caption: "", link: "", order: 0, isActive: true })
  const [uploading, setUploading] = useState(false)
  const [isClient, setIsClient] = useState(false);

  const fetchBanners = async () => {
    setLoading(true)
    const res = await fetch("http://localhost:5000/api/banner")
    const data = await res.json()
    setBanners(data)
    setLoading(false)
  }

  useEffect(() => { fetchBanners() }, [])
  useEffect(() => { setIsClient(true); }, []);

  const handleAddBanner = async () => {
    if (!newBanner.url) return toast.error("Vui lòng upload ảnh banner!")
    setUploading(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const res = await fetch("http://localhost:5000/api/banner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newBanner)
      })
      if (!res.ok) throw new Error("Lỗi khi tạo banner")
      toast.success("Thêm banner thành công!")
      setNewBanner({ url: "", caption: "", link: "", order: 0, isActive: true })
      fetchBanners()
    } catch {
      toast.error("Lỗi khi thêm banner!")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa banner này?")) return
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const res = await fetch(`http://localhost:5000/api/banner/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (!res.ok) throw new Error()
      toast.success("Đã xóa banner!")
      fetchBanners()
    } catch {
      toast.error("Lỗi khi xóa banner!")
    }
  }

  const handleUpdate = async (id: string, data: any) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const res = await fetch(`http://localhost:5000/api/banner/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error()
      toast.success("Cập nhật banner thành công!")
      fetchBanners()
    } catch {
      toast.error("Lỗi khi cập nhật banner!")
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý Banner Trang Chủ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-10 p-6 bg-pink-50 rounded-2xl shadow flex flex-col md:flex-row gap-6 items-center border border-pink-100">
            <div className="flex flex-col items-center gap-2">
              <ImageUpload
                onImageUploaded={url => setNewBanner(b => ({ ...b, url }))}
                currentImage={newBanner.url}
                folder="banner"
              />
              {newBanner.url && <img src={newBanner.url} alt="preview" className="w-40 h-24 object-cover rounded-lg border mt-2" />}
            </div>
            <div className="flex-1 flex flex-col gap-3">
              <Input
                placeholder="Tiêu đề (caption)"
                value={newBanner.caption}
                onChange={e => setNewBanner(b => ({ ...b, caption: e.target.value }))}
              />
              <Input
                placeholder="Link khi click"
                value={newBanner.link}
                onChange={e => setNewBanner(b => ({ ...b, link: e.target.value }))}
              />
              <div className="flex gap-3 items-center">
                <Input
                  placeholder="Thứ tự"
                  type="number"
                  value={newBanner.order}
                  onChange={e => setNewBanner(b => ({ ...b, order: Number(e.target.value) }))}
                  className="w-24"
                />
                <span className="text-gray-500 text-xs">(Thứ tự nhỏ sẽ hiển thị trước)</span>
              </div>
              <div className="flex gap-3 items-center">
                <Switch
                  checked={newBanner.isActive}
                  onCheckedChange={v => setNewBanner(b => ({ ...b, isActive: v }))}
                />
                <span className="text-gray-600 text-sm">Hiển thị</span>
              </div>
              <Button onClick={handleAddBanner} disabled={uploading} className="mt-2 w-fit bg-pink-500 hover:bg-pink-600 text-white font-semibold px-8 py-2 rounded-lg shadow">
                {uploading ? "Đang thêm..." : "Thêm banner"}
              </Button>
            </div>
          </div>
          <hr className="my-8" />
          <h2 className="font-semibold mb-4 text-lg">Danh sách banner</h2>
          {(!isClient || loading) ? <Loader /> : (
            <div className="grid gap-6">
              {banners.length === 0 && <div className="text-gray-400">Chưa có banner nào.</div>}
              {banners.map((b: any) => (
                <div key={b._id} className="flex flex-col md:flex-row gap-6 items-center bg-white rounded-2xl shadow border border-pink-100 p-4 hover:shadow-lg transition">
                  <img src={b.url} alt="banner" className="w-60 h-36 object-cover rounded-xl border shadow" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                      <Input
                        value={b.caption}
                        onChange={e => handleUpdate(b._id, { ...b, caption: e.target.value })}
                        className="flex-1 font-semibold text-pink-700 text-base"
                        placeholder="Tiêu đề"
                      />
                      <Switch
                        checked={b.isActive}
                        onCheckedChange={v => handleUpdate(b._id, { ...b, isActive: v })}
                      />
                      <span className="text-gray-500 text-xs">Hiển thị</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Input
                        value={b.link}
                        onChange={e => handleUpdate(b._id, { ...b, link: e.target.value })}
                        className="flex-1"
                        placeholder="Link"
                      />
                      <Input
                        type="number"
                        value={b.order}
                        onChange={e => handleUpdate(b._id, { ...b, order: Number(e.target.value) })}
                        className="w-20"
                        placeholder="Thứ tự"
                      />
                    </div>
                  </div>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(b._id)} title="Xóa banner" className="ml-2">
                    <span className="sr-only">Xóa</span>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-white"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 