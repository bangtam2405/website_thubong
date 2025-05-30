"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const email = (document.getElementById("email") as HTMLInputElement).value
    const password = (document.getElementById("password") as HTMLInputElement).value

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem("token", data.token)
        // Nếu backend trả user thì lưu, không thì bỏ dòng này
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user))
        alert("Đăng nhập thành công!")
        window.location.href = "/" 
      } else {
        // Backend của bạn trả về lỗi trong trường msg hoặc errors
        alert(data.msg || (data.errors && data.errors[0].msg) || "Lỗi đăng nhập")
      }
    } catch (err) {
      alert("Lỗi kết nối server")
    }

    setIsLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const name = (document.getElementById("name") as HTMLInputElement).value
    const email = (document.getElementById("register-email") as HTMLInputElement).value
    const password = (document.getElementById("register-password") as HTMLInputElement).value
    const confirm = (document.getElementById("confirm-password") as HTMLInputElement).value

    if (password !== confirm) {
      alert("Mật khẩu xác nhận không khớp")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name, email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        alert("Đăng ký thành công")
        // Bạn có thể thêm chuyển sang tab login hoặc tự động đăng nhập
      } else {
        alert(data.msg || (data.errors && data.errors[0].msg) || "Lỗi không xác định")
      }
    } catch (err) {
      alert("Lỗi kết nối server")
    }

    setIsLoading(false)
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
                    <Input id="email" type="email" placeholder="m@example.com" required />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Mật Khẩu</Label>
                      <Link href="/forgot-password" className="text-sm text-pink-500 hover:underline">
                        Quên mật khẩu?
                      </Link>
                    </div>
                    <Input id="password" type="password" required />
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
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleRegister}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Họ Tên</Label>
                    <Input id="name" type="text" placeholder="Nguyễn Văn A" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input id="register-email" type="email" placeholder="m@example.com" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="register-password">Mật Khẩu</Label>
                    <Input id="register-password" type="password" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Xác Nhận Mật Khẩu</Label>
                    <Input id="confirm-password" type="password" required />
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
