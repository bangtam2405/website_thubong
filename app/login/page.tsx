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
    // Giả lập API call
    setTimeout(() => {
      setIsLoading(false)
      // Trong ứng dụng thực tế, điều này sẽ chuyển hướng đến trang chủ hoặc bảng điều khiển
    }, 1500)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Giả lập API call
    setTimeout(() => {
      setIsLoading(false)
      // Trong ứng dụng thực tế, điều này sẽ chuyển hướng đến trang chủ hoặc bảng điều khiển
    }, 1500)
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
