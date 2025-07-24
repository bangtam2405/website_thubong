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
import { useSession, signOut } from "next-auth/react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHeart, faFolderOpen, faUser, faBoxOpen, faSignOutAlt, faGift } from "@fortawesome/free-solid-svg-icons"
import { useRouter } from "next/navigation"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  // Debounce search
  useEffect(() => {
    if (!search) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setLoadingSuggest(true);
    const timeout = setTimeout(() => {
      fetch(`http://localhost:5000/api/products?search=${encodeURIComponent(search)}`)
        .then(res => res.json())
        .then(data => {
          // Lọc type
          const filtered = Array.isArray(data)
            ? data.filter((p:any) => ["teddy","accessory","collection"].includes(p.type))
            : [];
          setSuggestions(filtered);
          setShowDropdown(true);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoadingSuggest(false));
    }, 350);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setIsClient(true);
    // Hàm cập nhật user từ localStorage
    const updateUser = () => {
      const userStr = localStorage.getItem("user");
      setUser(userStr ? JSON.parse(userStr) : null);
    };
    updateUser();
    window.addEventListener("user-updated", updateUser);

    // Đồng bộ profile mới nhất nếu đã đăng nhập
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (token && userId) {
      fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.success && data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("avatar", data.user.avatar || "");
            localStorage.setItem("fullName", data.user.fullName || "");
            window.dispatchEvent(new Event("user-updated"));
          }
        })
        .catch(() => {});
    }
    return () => window.removeEventListener("user-updated", updateUser);
  }, []);

  const handleLogout = () => {
    // Xóa toàn bộ thông tin user khỏi localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    localStorage.removeItem('email');
    localStorage.removeItem('avatar');
    // ...xóa thêm nếu có
    signOut(); // NextAuth
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
                  src="/Logo3.svg"
                  alt="ThúBôngXinh Logo"
                  width={50}
                  height={50}
                  className="mr-2"
                />
                <span className="text-2xl font-bold text-pink-500" style={{ fontFamily: 'Pacifico, cursive' }}>Gấu Xinh</span>
              </Link>
            </div>

            {/* Search bar */}
            <div className="hidden md:block flex-grow max-w-md mx-4 relative">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Nhập sản phẩm cần tìm"
                  className="w-full border-gray-300 rounded-md pl-10 pr-4"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={() => search && setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Button className="absolute right-0 top-0 h-full rounded-l-none bg-pink-500 hover:bg-pink-600"
                  onClick={() => {
                    if (suggestions.length > 0) {
                      router.push(`/product/${suggestions[0]._id}`)
                    } else if (search) {
                      router.push(`/products?search=${encodeURIComponent(search)}`)
                    }
                  }}
                >
                  <Search className="h-4 w-4" />
                </Button>
                {/* Dropdown gợi ý */}
                {showDropdown && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow-lg z-50 max-h-80 overflow-y-auto">
                    {loadingSuggest ? (
                      <div className="p-4 text-center text-gray-400">Đang tìm kiếm...</div>
                    ) : suggestions.length === 0 ? (
                      <div className="p-4 text-center text-gray-400">Không tìm thấy sản phẩm</div>
                    ) : suggestions.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-pink-50 cursor-pointer"
                        onMouseDown={() => router.push(`/product/${item._id}`)}
                      >
                        <img src={item.image || "/placeholder.jpg"} alt={item.name} className="w-10 h-10 rounded object-cover border" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.type === "teddy" ? "Teddy" : item.type === "accessory" ? "Phụ kiện" : "Bộ sưu tập"}</div>
                        </div>
                        <div className="text-pink-600 font-semibold">{Number(item.price).toLocaleString('vi-VN')}₫</div>
                      </div>
                    ))}
                  </div>
                )}
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
              {/* Giỏ hàng */}
              <Button variant="ghost" size="icon" className="relative" onClick={() => {
                if (!user) {
                  alert("Bạn vui lòng đăng nhập để sử dụng giỏ hàng!");
                  window.location.href = "/login";
                  return;
                }
                window.location.href = "/cart";
              }}>
                <ShoppingCart className="h-6 w-6 text-gray-700" />
                {cartCount > 0 && user && (
                  <Badge className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs h-5 w-5 flex items-center justify-center p-0 rounded-full animate-bounce">
                    {cartCount}
                  </Badge>
                )}
              </Button>

              {/* Nếu chưa đăng nhập thì hiện nút Đăng nhập ra ngoài */}
              {isClient && !user && (
                <Link href="/login">
                  <Button className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-4 py-2 rounded">
                    Đăng nhập
                  </Button>
                </Link>
              )}

              {/* Nếu đã đăng nhập thì hiện avatar và menu */}
              {isClient && user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="p-0">
                      <Avatar>
                        <AvatarImage src={user.avatar || "/placeholder-user.jpg"} alt={user.fullName || user.name || user.username || "avatar"} />
                        <AvatarFallback>{(user.fullName || user.name || user.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      Xin chào, {user.fullName || user.name || user.username || "Người dùng"}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link href="/wishlist" className="w-full flex items-center gap-2">
                        <FontAwesomeIcon icon={faHeart} className="h-4 w-4 text-pink-500" />
                        Danh sách yêu thích
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/my-designs" className="w-full flex items-center gap-2">
                        <FontAwesomeIcon icon={faFolderOpen} className="h-4 w-4 text-pink-500" />
                        Xem Thiết Kế Đã Lưu
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/profile" className="w-full flex items-center gap-2">
                        <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-pink-500" />
                        Hồ Sơ
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/profile/coupons" className="w-full flex items-center gap-2">
                        <FontAwesomeIcon icon={faGift} className="h-4 w-4 text-pink-500" />
                        Ưu đãi của tôi
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/orders" className="w-full flex items-center gap-2">
                        <FontAwesomeIcon icon={faBoxOpen} className="h-4 w-4 text-pink-500" />
                        Đơn Hàng Của Tôi
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer flex items-center gap-2">
                      <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-4 text-pink-500" />
                      Đăng Xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

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
              MẪU THIẾT KẾ
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
