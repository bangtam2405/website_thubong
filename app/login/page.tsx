"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import instance from "@/lib/axiosConfig"
import jwt_decode from "jwt-decode"
import { signIn, useSession } from "next-auth/react"
import { GoogleLogin } from '@react-oauth/google'
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isClient, setIsClient] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      localStorage.setItem("user", JSON.stringify(session.user))
      localStorage.setItem("email", session.user.email || "")
      localStorage.setItem("username", session.user.name || "")
      localStorage.setItem("avatar", session.user.image || "")
      router.push("/")
    }
  }, [status, session, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const email = (document.getElementById("email") as HTMLInputElement).value
    const password = (document.getElementById("password") as HTMLInputElement).value

    try {
      const response = await instance.post("/api/auth/login", {
        email,
        password,
      })

      const { accessToken, refreshToken } = response.data
      localStorage.setItem("token", accessToken)
      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)

      // Gọi API lấy user profile mới nhất
      let userProfile = null;
      let userId = "";
      let username = "";
      try {
        const profileRes = await instance.get("auth/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (profileRes.data && profileRes.data.success && profileRes.data.user) {
          userProfile = profileRes.data.user;
          userId = userProfile._id || userProfile.id || "";
          username = userProfile.username || "";
          localStorage.setItem("userId", userId);
          localStorage.setItem("username", username);
          localStorage.setItem("email", userProfile.email || "");
          localStorage.setItem("user", JSON.stringify(userProfile));
        }
      } catch (e) {
        // fallback nếu lỗi: lấy từ token decode và email
        try {
          const decoded: any = jwt_decode(accessToken);
          userId = decoded.userId || "";
          username = email;
          localStorage.setItem("userId", userId);
          localStorage.setItem("username", username);
          localStorage.setItem("user", JSON.stringify({ _id: userId, username: username, email: email }));
        } catch {}
      }

      // Decode token để lấy role (giả sử backend trả role trong token)
      const decoded: any = jwt_decode(accessToken)
      const role = decoded.role
      // Đã lấy userId, name từ profile ở trên
      localStorage.setItem("role", role)
      window.dispatchEvent(new Event("user-updated"));

      toast.success("Đăng nhập thành công!")

      // Chuyển hướng theo role
      if (role === "admin") {
        router.push("/admin")
      } else {
        router.push("/")
      }
    } catch (error: any) {
      const msg = error?.response?.data?.msg || "Lỗi đăng nhập"
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const username = (document.getElementById("name") as HTMLInputElement)?.value || ""
    const email = (document.getElementById("register-email") as HTMLInputElement)?.value || ""
    const password = (document.getElementById("register-password") as HTMLInputElement)?.value || ""
    const confirm = (document.getElementById("confirm-password") as HTMLInputElement)?.value || ""
    const fullName = (document.getElementById("register-fullname") as HTMLInputElement)?.value || ""
    const phone = (document.getElementById("register-phone") as HTMLInputElement)?.value || ""
    const dob = (document.getElementById("register-dob") as HTMLInputElement)?.value || ""
    const gender = (document.querySelector('input[name="register-gender"]:checked') as HTMLInputElement)?.value || "other"
    const address = (document.getElementById("register-address") as HTMLInputElement)?.value || ""

    if (!fullName || !email || !phone || !dob || !address) {
      toast.error("Vui lòng nhập đầy đủ thông tin!")
      setIsLoading(false)
      return
    }
    if (password !== confirm) {
      toast.error("Mật khẩu xác nhận không khớp")
      setIsLoading(false)
      return
    }

    try {
      const res = await instance.post("/api/auth/register", {
        username: username || fullName,
        email,
        password,
        fullName,
        phone,
        dob,
        gender,
        address,
      })

      toast.success("Đăng ký thành công, bạn có thể đăng nhập!")
    } catch (err: any) {
      console.log("Lỗi đăng ký:", err?.response?.data);
      const msg = err?.response?.data?.msg || err?.response?.data?.message || "Lỗi đăng ký";
      toast.error(msg);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Ảnh nền */}
      <div className="absolute inset-0 bg-[url('/Banner.png')] bg-cover bg-center z-0" />
      {/* Overlay màu hồng nhạt */}
      <div className="absolute inset-0 bg-pink-100/70 z-10" />
      {/* Khung đăng nhập/đăng ký */}
      <div className="relative z-20 w-full max-w-4xl">
        <div className="relative min-h-[650px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-row transition-all duration-700">
          {/* Panel chuyển đổi */}
          <div className={`absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center transition-all duration-700 z-10 ${isRegister ? 'bg-pink-100' : 'bg-pink-200'} ${isRegister ? 'translate-x-0' : 'translate-x-full'} ${isRegister ? 'order-1' : 'order-2'} p-8 md:p-12`}
            style={{ borderTopLeftRadius: 24, borderBottomLeftRadius: 24, borderTopRightRadius: isRegister ? 24 : 0, borderBottomRightRadius: isRegister ? 24 : 0 }}>
            <div className="flex flex-col items-center justify-center h-full w-full max-w-xs mx-auto text-center">
              <div className="mb-8">
                <img src={isRegister ? "/Logo3.svg" : "/dethuong.jpg"} alt="Thú bông minh họa" className="w-40 h-40 object-contain rounded-2xl shadow-lg mx-auto border-2 border-pink-200" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-pink-500">
                {isRegister ? "Chào mừng bạn đến với Gấu Xinh" : "Bắt đầu hành trình sáng tạo của bạn!"}
              </h3>
              <p className="text-gray-500 mb-6">
                {isRegister ? "Nếu đã có tài khoản, hãy đăng nhập để tiếp tục mua sắm và thiết kế thú bông!" : "Nếu chưa có tài khoản, hãy đăng ký để trải nghiệm nhiều tính năng hấp dẫn!"}
              </p>
              <Button
                variant="outline"
                className="border-2 border-pink-400 text-pink-500 font-semibold px-8 py-2 rounded-full hover:bg-pink-100 transition"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? "Đăng nhập" : "Đăng ký"}
              </Button>
            </div>
          </div>
          {/* Form Đăng nhập */}
          <div className={`w-1/2 h-full flex flex-col justify-center items-center px-6 md:px-12 py-8 transition-all duration-700 bg-white ${isRegister ? '-translate-x-full opacity-0 pointer-events-none order-2' : 'translate-x-0 opacity-100 order-1'} relative z-20`}
            style={{ minWidth: 320, maxWidth: 480 }}>
            <div className="w-full max-w-xs mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-pink-500 text-center">Đăng nhập tài khoản</h2>
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Nhập email" required />
                </div>
                <div className="relative">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Input id="password" type={showLoginPassword ? "text" : "password"} placeholder="Nhập mật khẩu" required className="pr-10" />
                  <button type="button" tabIndex={-1} className="absolute right-2 top-9 text-gray-400 hover:text-pink-500" onClick={() => setShowLoginPassword(v => !v)}>
                    {showLoginPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember">Ghi nhớ đăng nhập</Label>
                  </div>
                  <Link href="/forgot-password" className="text-pink-500 hover:underline">Quên mật khẩu?</Link>
                </div>
                <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg shadow-sm" disabled={isLoading}>
                  {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
                </Button>
              </form>
              {/* Divider 'hoặc' */}
              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="mx-4 text-gray-400 text-sm">hoặc</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>
              <div className="flex mb-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 border-pink-300 text-pink-500 font-semibold py-3 rounded-lg shadow-sm hover:bg-pink-50"
                  onClick={() => signIn("google")}
                >
                  <FcGoogle className="w-6 h-6" />
                  Đăng nhập bằng Google
                </Button>
              </div>
            </div>
          </div>
          {/* Form Đăng ký */}
          <div className={`w-1/2 h-full flex flex-col justify-center items-center px-6 md:px-12 py-8 transition-all duration-700 bg-white absolute top-0 right-0 ${isRegister ? 'translate-x-0 opacity-100 pointer-events-auto order-2' : 'translate-x-full opacity-0 pointer-events-none order-1'} z-20`}
            style={{ minWidth: 320, maxWidth: 480 }}>
            <div className="w-full max-w-xs mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-pink-500 text-center">Tạo tài khoản mới</h2>
              <form onSubmit={handleRegister} className="space-y-5 overflow-y-auto max-h-[80vh] pb-4">
                <div>
                  <Label htmlFor="register-fullname">Họ và tên</Label>
                  <Input id="register-fullname" type="text" placeholder="Nhập họ tên" required />
                </div>
                <div>
                  <Label htmlFor="register-email">Email</Label>
                  <Input id="register-email" type="email" placeholder="Nhập email" required />
                </div>
                <div>
                  <Label htmlFor="register-phone">Số điện thoại</Label>
                  <Input id="register-phone" type="tel" placeholder="0123456789" required />
                </div>
                <div>
                  <Label htmlFor="register-dob">Ngày sinh</Label>
                  <Input id="register-dob" type="date" required />
                </div>
                <div>
                  <Label>Giới tính</Label>
                  <div className="flex gap-4">
                    <label><input type="radio" name="register-gender" value="male" defaultChecked className="accent-pink-500" /> Nam</label>
                    <label><input type="radio" name="register-gender" value="female" className="accent-pink-500" /> Nữ</label>
                    <label><input type="radio" name="register-gender" value="other" className="accent-pink-500" /> Khác</label>
                  </div>
                </div>
                <div>
                  <Label htmlFor="register-address">Địa chỉ</Label>
                  <Input id="register-address" type="text" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" required />
                </div>
                <div>
                  <Label htmlFor="register-password">Mật khẩu</Label>
                  <div className="relative">
                    <Input id="register-password" type={showRegisterPassword ? "text" : "password"} placeholder="Tạo mật khẩu" required className="pr-10" />
                    <button type="button" tabIndex={-1} className="absolute right-2 top-2 text-gray-400 hover:text-pink-500" onClick={() => setShowRegisterPassword(v => !v)}>
                      {showRegisterPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                  <div className="relative">
                    <Input id="confirm-password" type={showRegisterConfirm ? "text" : "password"} placeholder="Nhập lại mật khẩu" required className="pr-10" />
                    <button type="button" tabIndex={-1} className="absolute right-2 top-2 text-gray-400 hover:text-pink-500" onClick={() => setShowRegisterConfirm(v => !v)}>
                      {showRegisterConfirm ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg shadow-sm" disabled={isLoading}>
                  {isLoading ? "Đang đăng ký..." : "Đăng Ký"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
