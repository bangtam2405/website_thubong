"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import axios from "axios"
import { User } from "lucide-react"

export default function ProfilePage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [userId, setUserId] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      setUsername(localStorage.getItem("username") || "")
      setEmail(localStorage.getItem("email") || "")
      setUserId(localStorage.getItem("userId") || "")
    }
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Cập nhật tên nếu thay đổi
      const res = await axios.put("http://localhost:5000/api/auth/profile", { userId, username })
      if (res.data.success) {
        setUsername(res.data.user.username)
        localStorage.setItem("username", res.data.user.username)
        localStorage.setItem("user", JSON.stringify(res.data.user))
        if (res.data.user.email) localStorage.setItem("email", res.data.user.email)
        if (res.data.user._id) localStorage.setItem("userId", res.data.user._id)
        // Nếu muốn các component khác nhận ngay tên mới, có thể dùng window.dispatchEvent để thông báo
        window.dispatchEvent(new Event("user-updated"));
      }
      // Đổi mật khẩu nếu có nhập
      if (newPassword || confirmPassword) {
        if (newPassword !== confirmPassword) {
          toast.error("Mật khẩu xác nhận không khớp!")
          setLoading(false)
          return
        }
        await axios.put("http://localhost:5000/api/auth/change-password", { userId, newPassword })
        toast.success("Đổi mật khẩu thành công!")
        setNewPassword("")
        setConfirmPassword("")
      }
      toast.success("Cập nhật thông tin thành công!")
    } catch (err) {
      toast.error("Cập nhật thất bại!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-lg mx-auto py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
        <div className="bg-pink-100 rounded-full p-4 mb-4">
          <User className="h-16 w-16 text-pink-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Hồ Sơ Cá Nhân</h1>
        <p className="text-gray-500 mb-6">Quản lý thông tin tài khoản của bạn</p>
        <form onSubmit={handleUpdate} className="w-full space-y-5">
          <div>
            <label className="block mb-1 font-medium">Tên</label>
            <Input value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <Input value={email} disabled />
          </div>
          <div>
            <label className="block mb-1 font-medium">User ID</label>
            <Input value={userId} disabled />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Mật khẩu mới</label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Để trống nếu không đổi" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Xác nhận mật khẩu</label>
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Để trống nếu không đổi" />
            </div>
          </div>
          <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 mt-4" disabled={loading}>
            {loading ? "Đang cập nhật..." : "Cập Nhật Thông Tin"}
          </Button>
        </form>
      </div>
    </div>
  )
} 