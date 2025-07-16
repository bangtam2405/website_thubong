import React from "react";
import Link from "next/link";
import { FileText, User, ShoppingCart, Lock, PenTool, RefreshCcw, Mail } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-pink-100 rounded-full p-4 mb-4 shadow-lg">
            <FileText className="h-10 w-10 text-pink-500" />
          </div>
          <h1 className="text-4xl font-extrabold text-pink-500 mb-2 text-center drop-shadow">Điều Khoản Dịch Vụ</h1>
          <p className="text-gray-500 text-center max-w-xl">Các quy định và điều kiện sử dụng dịch vụ tại ThúBôngXinh. Vui lòng đọc kỹ trước khi sử dụng website.</p>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6 flex gap-4 items-start">
            <User className="h-7 w-7 text-pink-400 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Tài khoản & bảo mật</h2>
              <ul className="list-disc ml-6 mt-2">
                <li>Bạn chịu trách nhiệm bảo mật thông tin tài khoản và mật khẩu.</li>
                <li>Không chia sẻ tài khoản cho người khác sử dụng.</li>
                <li>Thông báo ngay cho chúng tôi nếu phát hiện truy cập trái phép.</li>
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex gap-4 items-start">
            <ShoppingCart className="h-7 w-7 text-pink-400 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Đặt hàng & thanh toán</h2>
              <ul className="list-disc ml-6 mt-2">
                <li>Đơn hàng chỉ được xác nhận khi bạn nhận được email xác nhận từ chúng tôi.</li>
                <li>Giá sản phẩm và phí vận chuyển có thể thay đổi mà không cần báo trước.</li>
                <li>Chúng tôi có quyền từ chối hoặc hủy đơn hàng trong một số trường hợp nhất định.</li>
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex gap-4 items-start">
            <PenTool className="h-7 w-7 text-pink-400 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quyền sở hữu trí tuệ</h2>
              <p>Tất cả nội dung, hình ảnh, thiết kế trên website thuộc sở hữu của ThúBôngXinh. Nghiêm cấm sao chép, sử dụng lại khi chưa có sự đồng ý bằng văn bản.</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex gap-4 items-start">
            <RefreshCcw className="h-7 w-7 text-pink-400 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Thay đổi điều khoản</h2>
              <p>Chúng tôi có thể cập nhật, thay đổi điều khoản bất cứ lúc nào. Các thay đổi sẽ được thông báo trên website.</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex gap-4 items-start">
            <Mail className="h-7 w-7 text-pink-400 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Liên hệ</h2>
              <p>Mọi thắc mắc về điều khoản dịch vụ, vui lòng liên hệ qua trang <Link href="/contact" className="text-pink-500 underline font-medium">Liên Hệ</Link>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 