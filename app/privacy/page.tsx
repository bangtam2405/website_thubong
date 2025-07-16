import React from "react";
import Link from "next/link";
import { Shield, User, Target, Lock, Mail } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-pink-100 rounded-full p-4 mb-4 shadow-lg">
            <Shield className="h-10 w-10 text-pink-500" />
          </div>
          <h1 className="text-4xl font-extrabold text-pink-500 mb-2 text-center drop-shadow">Chính Sách Bảo Mật</h1>
          <p className="text-gray-500 text-center max-w-xl">Chúng tôi cam kết bảo vệ thông tin cá nhân và quyền riêng tư của khách hàng khi sử dụng dịch vụ tại ThúBôngXinh.</p>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6 flex gap-4 items-start">
            <User className="h-7 w-7 text-pink-400 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Thu thập thông tin</h2>
              <p>Chúng tôi thu thập thông tin cá nhân như tên, email, số điện thoại, địa chỉ giao hàng khi bạn đặt hàng hoặc đăng ký tài khoản.</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex gap-4 items-start">
            <Target className="h-7 w-7 text-pink-400 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Mục đích sử dụng</h2>
              <ul className="list-disc ml-6 mt-2">
                <li>Xử lý đơn hàng, giao hàng và chăm sóc khách hàng.</li>
                <li>Cải thiện dịch vụ, cá nhân hóa trải nghiệm mua sắm.</li>
                <li>Gửi thông báo về khuyến mãi, cập nhật mới (nếu bạn đồng ý).</li>
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex gap-4 items-start">
            <Lock className="h-7 w-7 text-pink-400 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Bảo mật & chia sẻ thông tin</h2>
              <ul className="list-disc ml-6 mt-2">
                <li>Chúng tôi cam kết bảo mật thông tin cá nhân của bạn, không chia sẻ cho bên thứ ba ngoài các đối tác vận chuyển, thanh toán liên quan đến đơn hàng.</li>
                <li>Bạn có quyền yêu cầu chỉnh sửa hoặc xóa thông tin cá nhân bất cứ lúc nào.</li>
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex gap-4 items-start">
            <Mail className="h-7 w-7 text-pink-400 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Liên hệ</h2>
              <p>Nếu có thắc mắc về chính sách bảo mật, vui lòng liên hệ qua trang <Link href="/contact" className="text-pink-500 underline font-medium">Liên Hệ</Link>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 