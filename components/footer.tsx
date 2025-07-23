import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gradient-to-t from-pink-50 to-white border-t-4 border-pink-200 rounded-t-3xl shadow-inner">
      <div className="max-w-7xl mx-auto py-14 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          <div className="space-y-4 flex flex-col items-center md:items-start">
            <h3 className="text-2xl font-extrabold" style={{color:'#e3497a'}}>Gấu Xinh</h3>
            <p className="text-gray-600 text-sm text-center md:text-left">
              Tự tay thiết kế chú gấu bông trong mơ của bạn – từ mắt, mũi, màu lông đến trang phục. Món quà độc đáo, mang dấu ấn riêng!
            </p>
            <div className="flex space-x-3 mt-2">
              <Link href="#" className="bg-white border border-pink-200 rounded-full p-2 shadow hover:bg-pink-100 transition-all">
                <Facebook className="h-5 w-5 text-pink-500" />
              </Link>
              <Link href="#" className="bg-white border border-pink-200 rounded-full p-2 shadow hover:bg-pink-100 transition-all">
                <Instagram className="h-5 w-5 text-pink-500" />
              </Link>
              <Link href="#" className="bg-white border border-pink-200 rounded-full p-2 shadow hover:bg-pink-100 transition-all">
                <Twitter className="h-5 w-5 text-pink-500" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold mb-4 uppercase tracking-wider" style={{color:'#e3497a'}}>Cửa Hàng</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/customize" className="text-gray-600 hover:text-pink-500 text-sm hover:underline transition-all">
                  Thiết Kế
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-gray-600 hover:text-pink-500 text-sm hover:underline transition-all">
                  Bộ Sưu Tập
                </Link>
              </li>
              <li>
                <Link href="/accessories" className="text-gray-600 hover:text-pink-500 text-sm hover:underline transition-all">
                  Phụ Kiện
                </Link>
              </li>
              <li>
                <Link href="/gift-cards" className="text-gray-600 hover:text-pink-500 text-sm hover:underline transition-all">
                  Thẻ Quà Tặng
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold mb-4 uppercase tracking-wider" style={{color:'#e3497a'}}>Công Ty</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-pink-500 text-sm hover:underline transition-all">
                  Về Chúng Tôi
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-pink-500 text-sm hover:underline transition-all">
                  Liên Hệ
                </Link>
              </li>
              <li>
                <Link href="/recruitment" className="text-gray-600 hover:text-pink-500 text-sm hover:underline transition-all">
                  Tuyển Dụng
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-pink-500 text-sm hover:underline transition-all">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold mb-4 uppercase tracking-wider" style={{color:'#e3497a'}}>Trợ Giúp</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-pink-500 text-sm hover:underline transition-all">
                  Câu Hỏi Thường Gặp
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-600 hover:text-pink-500 text-sm hover:underline transition-all">
                  Vận Chuyển
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-600 hover:text-pink-500 text-sm hover:underline transition-all">
                  Đổi Trả
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-pink-500 text-sm hover:underline transition-all">
                  Chính Sách Bảo Mật
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-pink-500 text-sm hover:underline transition-all">
                  Điều Khoản Dịch Vụ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t-2 border-pink-200 pt-8 rounded-b-2xl">
          <p className="text-gray-400 text-sm text-center">
            &copy; {new Date().getFullYear()} Gấu Xinh. Đã đăng ký bản quyền.
          </p>
        </div>
      </div>
    </footer>
  )
}
