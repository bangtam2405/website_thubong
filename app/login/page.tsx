"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import instance from "@/lib/axiosConfig"
import jwt_decode from "jwt-decode"
import { signIn, useSession } from "next-auth/react"
import { GoogleLogin } from '@react-oauth/google'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

      alert("Đăng nhập thành công!")

      // Chuyển hướng theo role
      if (role === "admin") {
        window.location.href = "/admin"
      } else {
        window.location.href = "/"
      }
    } catch (error: any) {
      const msg = error?.response?.data?.msg || "Lỗi đăng nhập"
      alert(msg)
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
      alert("Vui lòng nhập đầy đủ thông tin!")
      setIsLoading(false)
      return
    }
    if (password !== confirm) {
      alert("Mật khẩu xác nhận không khớp")
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

      alert("Đăng ký thành công, bạn có thể đăng nhập!")
    } catch (err: any) {
      console.log("Lỗi đăng ký:", err?.response?.data);
      const msg = err?.response?.data?.msg || err?.response?.data?.message || "Lỗi đăng ký";
      alert(msg);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md">
        <Tabs defaultValue="login">
          <CardHeader>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Đăng Nhập</TabsTrigger>
              <TabsTrigger value="register">Đăng Ký</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    {isClient && (
                      <Input id="email" type="email" placeholder="m@example.com" required />
                    )}
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Mật Khẩu</Label>
                      <Link href="/forgot-password" className="text-sm text-pink-500 hover:underline">
                        Quên mật khẩu?
                      </Link>
                    </div>
                    {isClient && (
                      <Input id="password" type="password" required />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember" className="text-sm">
                      Ghi nhớ đăng nhập
                    </Label>
                  </div>
                  <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600" disabled={isLoading}>
                    {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
                  </Button>
                </div>
              </form>
              <button
                type="button"
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded mt-4"
                onClick={() => signIn("google")}
              >
                Đăng nhập bằng Google
              </button>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleRegister}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="register-fullname">Họ tên</Label>
                    {isClient && (
                      <Input id="register-fullname" type="text" placeholder="Nguyễn Văn A" required />
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="register-email">Email</Label>
                    {isClient && (
                      <Input id="register-email" type="email" placeholder="m@example.com" required />
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="register-phone">Số điện thoại</Label>
                    {isClient && (
                      <Input id="register-phone" type="tel" placeholder="0123456789" required />
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="register-dob">Ngày sinh</Label>
                    {isClient && (
                      <Input id="register-dob" type="date" required />
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label>Giới tính</Label>
                    {isClient && (
                      <div className="flex gap-4">
                        <label><input type="radio" name="register-gender" value="male" defaultChecked /> Nam</label>
                        <label><input type="radio" name="register-gender" value="female" /> Nữ</label>
                        <label><input type="radio" name="register-gender" value="other" /> Khác</label>
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="register-address">Địa chỉ</Label>
                    {isClient && (
                      <Input id="register-address" type="text" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" required />
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="register-password">Mật Khẩu</Label>
                    {isClient && (
                      <Input id="register-password" type="password" required />
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Xác Nhận Mật Khẩu</Label>
                    {isClient && (
                      <Input id="confirm-password" type="password" required />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" required />
                    <Label htmlFor="terms" className="text-sm">
                      Tôi đồng ý với{" "}
                      <Link href="/terms" className="text-pink-500 hover:underline">
                        Điều Khoản Dịch Vụ
                      </Link>{" "}
                      và{" "}
                      <Link href="/privacy" className="text-pink-500 hover:underline">
                        Chính Sách Bảo Mật
                      </Link>
                    </Label>
                  </div>
                  <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600" disabled={isLoading}>
                    {isLoading ? "Đang tạo tài khoản..." : "Tạo Tài Khoản"}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-500">
              Bằng cách tiếp tục, bạn đồng ý với{" "}
              <Link href="/terms" className="text-pink-500 hover:underline">
                Điều Khoản Dịch Vụ
              </Link>{" "}
              và{" "}
              <Link href="/privacy" className="text-pink-500 hover:underline">
                Chính Sách Bảo Mật
              </Link>
            </p>
          </CardFooter>
        </Tabs>
      </Card>
    </div>
  )
}
