"use client"
import { Briefcase, Users, Star, Send } from "lucide-react";

export default function RecruitmentPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-white py-12 px-4">
      <div className="max-w-2xl w-full bg-white/80 rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-6">
          <Briefcase className="h-12 w-12 text-pink-500 mb-2" />
          <h1 className="text-3xl font-bold text-pink-600 mb-2 text-center">Tuyển Dụng</h1>
          <p className="text-gray-600 text-center">Gia nhập đội ngũ Gấu Xinh để cùng nhau sáng tạo, phát triển và lan tỏa yêu thương!</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="flex flex-col items-center bg-pink-50 rounded-xl p-4 shadow-sm">
            <Users className="h-8 w-8 text-pink-400 mb-2" />
            <h2 className="font-semibold text-lg text-pink-600 mb-1">Vị trí tuyển dụng</h2>
            <p className="text-gray-500 text-center">Nhân viên bán hàng, Marketing, Thiết kế, Quản lý kho...</p>
          </div>
          <div className="flex flex-col items-center bg-pink-50 rounded-xl p-4 shadow-sm">
            <Star className="h-8 w-8 text-pink-400 mb-2" />
            <h2 className="font-semibold text-lg text-pink-600 mb-1">Quyền lợi</h2>
            <p className="text-gray-500 text-center">Lương thưởng hấp dẫn, môi trường trẻ trung, cơ hội phát triển bản thân.</p>
          </div>
          <div className="flex flex-col items-center bg-pink-50 rounded-xl p-4 shadow-sm">
            <Briefcase className="h-8 w-8 text-pink-400 mb-2" />
            <h2 className="font-semibold text-lg text-pink-600 mb-1">Môi trường làm việc</h2>
            <p className="text-gray-500 text-center">Năng động, sáng tạo, đồng nghiệp thân thiện, hỗ trợ lẫn nhau.</p>
          </div>
          <div className="flex flex-col items-center bg-pink-50 rounded-xl p-4 shadow-sm">
            <Send className="h-8 w-8 text-pink-400 mb-2" />
            <h2 className="font-semibold text-lg text-pink-600 mb-1">Ứng tuyển</h2>
            <p className="text-gray-500 text-center">Gửi CV về email: <b>tuyendung@gauxinh.vn</b> hoặc liên hệ trực tiếp qua fanpage.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 