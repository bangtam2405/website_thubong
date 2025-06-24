"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingCart, User, Search, Menu, X, Heart } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { usePathname } from "next/navigation"
import { useCart } from "@/contexts/CartContext"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(useCurrentUser());
  const pathname = usePathname();
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  useEffect(() => {
    const handleUserUpdated = () => {
      setUser(useCurrentUser());
    };
    window.addEventListener("user-updated", handleUserUpdated);
    // Luôn cập nhật user mỗi khi route thay đổi
    setUser(useCurrentUser());
    return () => window.removeEventListener("user-updated", handleUserUpdated);
  }, [pathname]);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top header with logo, search and contact */}
      <div className="bg-white border-b py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image
                  src="/placeholder.svg?height=50&width=50"
                  alt="ThúBôngXinh Logo"
                  width={50}
                  height={50}
                  className="mr-2"
                />
                <span className="text-2xl font-bold text-pink-500">Gấu Studio</span>
              </Link>
            </div>

            {/* Search bar */}
            <div className="hidden md:block flex-grow max-w-md mx-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Nhập sản phẩm cần tìm"
                  className="w-full border-gray-300 rounded-md pl-10 pr-4"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Button className="absolute right-0 top-0 h-full rounded-l-none bg-pink-500 hover:bg-pink-600">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Phone number */}
            <div className="hidden md:flex items-center">
              <div className="bg-pink-100 rounded-full p-2 mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-pink-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <span className="text-xl font-medium text-pink-500">093.377.6616</span>
            </div>

            {/* User and cart */}
            <div className="flex items-center space-x-4">
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-6 w-6 text-gray-700" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs h-5 w-5 flex items-center justify-center p-0 rounded-full animate-bounce">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-6 w-6 text-gray-700" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user ? (
                    <>
                      <DropdownMenuLabel>Xin chào, {user.username || user.userId}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link href="/wishlist" className="w-full flex items-center">
                          <Heart className="h-4 w-4 mr-2" />
                          Danh sách yêu thích
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/my-designs" className="w-full">Xem Thiết Kế Đã Lưu</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/profile" className="w-full">Hồ Sơ</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/orders" className="w-full">Đơn Hàng Của Tôi</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">Đăng Xuất</DropdownMenuItem>
                    </>
                  ) : (
                    <>
                  <DropdownMenuLabel>Tài Khoản Của Tôi</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                        <Link href="/login" className="w-full">Đăng Nhập</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                        <Link href="/register" className="w-full">Đăng Ký</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                        <Link href="/profile" className="w-full">Hồ Sơ</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                        <Link href="/orders" className="w-full">Đơn Hàng Của Tôi</Link>
                  </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation menu */}
      <div className="bg-pink-400 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="hidden md:flex items-center justify-between h-12">
            <Link href="/" className="text-white font-medium px-3 py-2 hover:bg-pink-500 rounded">
              TRANG CHỦ
            </Link>
            <Link href="/customize" className="text-white font-medium px-3 py-2 hover:bg-pink-500 rounded">
              THIẾT KẾ THÚ BÔNG
            </Link>
            <Link href="/gallery" className="text-white font-medium px-3 py-2 hover:bg-pink-500 rounded">
              BỘ SƯU TẬP
            </Link>
            <Link href="/teddy" className="text-white font-medium px-3 py-2 hover:bg-pink-500 rounded">
              GẤU TEDDY CAO CẤP
            </Link>
            <Link href="/accessories" className="text-white font-medium px-3 py-2 hover:bg-pink-500 rounded">
              PHỤ KIỆN
            </Link>
            <Link href="/new" className="text-white font-medium px-3 py-2 hover:bg-pink-500 rounded">
              HÀNG MỚI VỀ
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Mobile search */}
            <div className="relative mb-4 px-3">
              <Input
                type="text"
                placeholder="Nhập sản phẩm cần tìm"
                className="w-full border-gray-300 rounded-md pl-10 pr-4"
              />
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-500 hover:bg-pink-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Trang Chủ
            </Link>
            <Link
              href="/customize"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-500 hover:bg-pink-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Thiết Kế Thú Bông
            </Link>
            <Link
              href="/gallery"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-500 hover:bg-pink-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Bộ Sưu Tập
            </Link>
            <Link
              href="/teddy"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-500 hover:bg-pink-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Gấu Teddy Cao Cấp
            </Link>
            <Link
              href="/accessories"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-500 hover:bg-pink-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Phụ Kiện
            </Link>
            <Link
              href="/new"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-500 hover:bg-pink-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Hàng Mới Về
            </Link>

            {/* Mobile phone */}
            <div className="mt-4 px-3 flex items-center">
              <div className="bg-pink-100 rounded-full p-2 mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-pink-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <span className="text-base font-medium text-pink-500">078.123.456</span>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
