import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-pink-500">Thú Bông Xinh</h3>
            <p className="text-gray-600 text-sm">
              Tạo thú nhồi bông tùy chỉnh của riêng bạn với công cụ thiết kế tương tác. Chọn tai, mắt, màu lông, quần áo
              và nhiều hơn nữa!
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-pink-500">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-pink-500">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-pink-500">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Cửa Hàng</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/customize" className="text-gray-600 hover:text-pink-500 text-sm">
                  Thiết Kế
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-gray-600 hover:text-pink-500 text-sm">
                  Bộ Sưu Tập
                </Link>
              </li>
              <li>
                <Link href="/accessories" className="text-gray-600 hover:text-pink-500 text-sm">
                  Phụ Kiện
                </Link>
              </li>
              <li>
                <Link href="/gift-cards" className="text-gray-600 hover:text-pink-500 text-sm">
                  Thẻ Quà Tặng
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Công Ty</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-pink-500 text-sm">
                  Về Chúng Tôi
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-pink-500 text-sm">
                  Liên Hệ
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-600 hover:text-pink-500 text-sm">
                  Tuyển Dụng
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-pink-500 text-sm">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Trợ Giúp</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-pink-500 text-sm">
                  Câu Hỏi Thường Gặp
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-600 hover:text-pink-500 text-sm">
                  Vận Chuyển
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-600 hover:text-pink-500 text-sm">
                  Đổi Trả
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-pink-500 text-sm">
                  Chính Sách Bảo Mật
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-pink-500 text-sm">
                  Điều Khoản Dịch Vụ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-gray-400 text-sm text-center">
            &copy; {new Date().getFullYear()} ThúBôngXinh. Đã đăng ký bản quyền.
          </p>
        </div>
      </div>
    </footer>
  )
}
