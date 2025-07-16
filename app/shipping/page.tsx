import React from "react";
import Link from "next/link";
import { Truck, Timer, DollarSign, Search, AlertCircle } from "lucide-react";

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-pink-100 rounded-full p-4 mb-4 shadow-lg">
            <Truck className="h-10 w-10 text-pink-500" />
          </div>
          <h1 className="text-4xl font-extrabold text-pink-500 mb-2 text-center drop-shadow">Chính Sách Vận Chuyển</h1>
          <p className="text-gray-500 text-center max-w-xl">Thông tin chi tiết về khu vực giao hàng, thời gian, phí vận chuyển và các lưu ý khi nhận hàng tại ThúBôngXinh.</p>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6 flex gap-4 items-start">
            <Truck className="h-7 w-7 text-pink-400 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Khu vực giao hàng</h2>
              <p>Chúng tôi giao hàng toàn quốc thông qua các đối tác vận chuyển uy tín như Giao Hàng Nhanh, Viettel Post, J&T Express...</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex gap-4 items-start">
            <Timer className="h-7 w-7 text-pink-400 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Thời gian xử lý & giao hàng</h2>
              <ul className="list-disc ml-6 mt-2">
                <li>Đơn hàng sẽ được xử lý trong vòng 24h kể từ khi xác nhận thành công.</li>
                <li>Thời gian giao hàng dự kiến: 2-5 ngày làm việc tùy khu vực.</li>
                <li>Đơn hàng thiết kế cá nhân hóa có thể mất thêm 1-2 ngày để hoàn thiện.</li>
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex gap-4 items-start">
            <DollarSign className="h-7 w-7 text-pink-400 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Phí vận chuyển</h2>
              <ul className="list-disc ml-6 mt-2">
                <li>Miễn phí vận chuyển cho đơn hàng từ 500.000đ trở lên.</li>
                <li>Đơn hàng dưới 500.000đ: phí vận chuyển từ 25.000đ - 40.000đ tùy khu vực.</li>
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex gap-4 items-start">
            <Search className="h-7 w-7 text-pink-400 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Theo dõi đơn hàng</h2>
              <p>Bạn sẽ nhận được mã vận đơn qua email/SMS sau khi đơn hàng được gửi đi. Có thể theo dõi trạng thái tại trang <Link href="/orders" className="text-pink-500 underline font-medium">Đơn Hàng</Link> hoặc website của đối tác vận chuyển.</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex gap-4 items-start">
            <AlertCircle className="h-7 w-7 text-pink-400 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Lưu ý</h2>
              <ul className="list-disc ml-6 mt-2">
                <li>Vui lòng kiểm tra kỹ sản phẩm trước khi nhận hàng.</li>
                <li>Nếu có vấn đề về vận chuyển, liên hệ ngay với chúng tôi qua trang <Link href="/contact" className="text-pink-500 underline font-medium">Liên Hệ</Link>.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 