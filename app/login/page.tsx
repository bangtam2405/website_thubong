"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"
import jwt_decode from "jwt-decode"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const email = (document.getElementById("email") as HTMLInputElement).value
    const password = (document.getElementById("password") as HTMLInputElement).value

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      })

      const { token } = response.data
      localStorage.setItem("token", token)

      // Decode token để lấy role (giả sử backend trả role trong token)
      const decoded: any = jwt_decode(token)
      const role = decoded.role
      localStorage.setItem("role", role)

      alert("Đăng nhập thành công!")

      // Chuyển hướng theo role
      if (role === "admin") {
        router.push("/admin")
      } else {
        router.push("/")
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
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        username: name,
        email,
        password,
      })

      alert("Đăng ký thành công, bạn có thể đăng nhập!")
    } catch (err: any) {
      const msg = err?.response?.data?.msg || "Lỗi đăng ký"
      alert(msg)
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
