import React from "react";
import Link from "next/link";
import { HelpCircle, Brush, Truck, RefreshCcw, Search, Mail } from "lucide-react";

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-pink-100 rounded-full p-4 mb-4 shadow-lg">
            <HelpCircle className="h-10 w-10 text-pink-500" />
          </div>
          <h1 className="text-4xl font-extrabold text-pink-500 mb-2 text-center drop-shadow">Câu Hỏi Thường Gặp</h1>
          <p className="text-gray-500 text-center max-w-xl">Tổng hợp những thắc mắc phổ biến về dịch vụ, sản phẩm và trải nghiệm tại ThúBôngXinh. Nếu bạn cần thêm hỗ trợ, đừng ngần ngại liên hệ với chúng tôi!</p>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6 flex gap-4 items-start">
            <Brush className="h-7 w-7 text-pink-400 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Làm thế nào để thiết kế gấu bông của riêng tôi?</h2>
              <p className="text-gray-700 mt-1">Bạn có thể truy cập trang <Link href="/customize" className="text-pink-500 underline font-medium">Thiết Kế</Link> để bắt đầu sáng tạo chú gấu bông theo ý thích: chọn mắt, mũi, màu lông, trang phục và nhiều chi tiết khác.</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex gap-4 items-start">
            <Truck className="h-7 w-7 text-pink-400 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Thời gian giao hàng dự kiến là bao lâu?</h2>
              <p className="text-gray-700 mt-1">Thời gian giao hàng thông thường từ 2-5 ngày làm việc tùy vào địa chỉ nhận hàng. Đơn hàng thiết kế cá nhân hóa có thể mất thêm 1-2 ngày để hoàn thiện.</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex gap-4 items-start">
            <RefreshCcw className="h-7 w-7 text-pink-400 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Tôi có thể đổi trả sản phẩm không?</h2>
              <p className="text-gray-700 mt-1">Bạn có thể đổi trả sản phẩm trong vòng 7 ngày kể từ khi nhận hàng nếu sản phẩm bị lỗi hoặc không đúng mô tả. Xem chi tiết tại <Link href="/returns" className="text-pink-500 underline font-medium">Chính Sách Đổi Trả</Link>.</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex gap-4 items-start">
            <Search className="h-7 w-7 text-pink-400 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Tôi có thể theo dõi đơn hàng của mình ở đâu?</h2>
              <p className="text-gray-700 mt-1">Sau khi đặt hàng, bạn sẽ nhận được email xác nhận cùng mã đơn hàng. Bạn có thể theo dõi trạng thái đơn tại trang <Link href="/orders" className="text-pink-500 underline font-medium">Đơn Hàng</Link>.</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex gap-4 items-start">
            <Mail className="h-7 w-7 text-pink-400 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Tôi có thể liên hệ hỗ trợ bằng cách nào?</h2>
              <p className="text-gray-700 mt-1">Bạn có thể liên hệ với chúng tôi qua trang <Link href="/contact" className="text-pink-500 underline font-medium">Liên Hệ</Link> hoặc gửi email về địa chỉ <span className="font-medium">support@thubongxinh.vn</span>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 