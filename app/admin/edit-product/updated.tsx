"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [image, setImage] = useState("")
  const [price, setPrice] = useState("")

  useEffect(() => {
    axios.get(`http://localhost:5000/api/categories/updated`)
      .then(res => {
        setData(res.data)
        setName(res.data.name || "")
        setImage(res.data.image || "")
        setPrice(res.data.price ? String(res.data.price) : "")
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await axios.put(`http://localhost:5000/api/categories/updated`,
      { name, image, price: price ? Number(price) : undefined })
    router.push("/admin")
  }

  if (loading) return <div>Đang tải dữ liệu...</div>
  if (!data) return <div>Không tìm thấy sản phẩm/danh mục.</div>

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-bold mb-4">Sửa sản phẩm/danh mục</h2>
      <Input value={name} onChange={e => setName(e.target.value)} placeholder="Tên" required />
      <Input value={image} onChange={e => setImage(e.target.value)} placeholder="Link ảnh" />
      <Input value={price} onChange={e => setPrice(e.target.value)} placeholder="Giá" type="number" />
      <div className="flex gap-4 mt-4">
        <Button type="submit" className="bg-blue-600 text-white">Lưu</Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin")}>Hủy</Button>
      </div>
    </form>
  )
} 