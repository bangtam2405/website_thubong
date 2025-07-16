"use client"
import { Building, Award, Users, Globe2 } from "lucide-react";

export default function CompanyPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 to-white py-12 px-4">
      <div className="max-w-2xl w-full bg-white/80 rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-6">
          <Building className="h-12 w-12 text-pink-500 mb-2" />
          <h1 className="text-3xl font-bold text-pink-600 mb-2 text-center">Công Ty Gấu Xinh</h1>
          <p className="text-gray-600 text-center">Mang đến những chú gấu bông và quà tặng ý nghĩa, đồng hành cùng mọi khoảnh khắc yêu thương của bạn.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="flex flex-col items-center bg-pink-50 rounded-xl p-4 shadow-sm">
            <Award className="h-8 w-8 text-pink-400 mb-2" />
            <h2 className="font-semibold text-lg text-pink-600 mb-1">Sứ mệnh</h2>
            <p className="text-gray-500 text-center">Lan tỏa yêu thương qua từng sản phẩm, mang lại niềm vui và sự ấm áp cho mọi khách hàng.</p>
          </div>
          <div className="flex flex-col items-center bg-pink-50 rounded-xl p-4 shadow-sm">
            <Users className="h-8 w-8 text-pink-400 mb-2" />
            <h2 className="font-semibold text-lg text-pink-600 mb-1">Đội ngũ</h2>
            <p className="text-gray-500 text-center">Tập thể trẻ trung, sáng tạo, tận tâm với khách hàng và đam mê sáng tạo sản phẩm mới.</p>
          </div>
          <div className="flex flex-col items-center bg-pink-50 rounded-xl p-4 shadow-sm">
            <Globe2 className="h-8 w-8 text-pink-400 mb-2" />
            <h2 className="font-semibold text-lg text-pink-600 mb-1">Giá trị cốt lõi</h2>
            <p className="text-gray-500 text-center">Chất lượng - Sáng tạo - Tận tâm - Trách nhiệm xã hội.</p>
          </div>
          <div className="flex flex-col items-center bg-pink-50 rounded-xl p-4 shadow-sm">
            <Building className="h-8 w-8 text-pink-400 mb-2" />
            <h2 className="font-semibold text-lg text-pink-600 mb-1">Lịch sử phát triển</h2>
            <p className="text-gray-500 text-center">Khởi đầu từ 2024, không ngừng lớn mạnh và đổi mới để phục vụ khách hàng tốt nhất.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 