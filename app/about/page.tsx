"use client"
import { Users, Eye, HeartHandshake, Smile } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-white py-12 px-4">
      <div className="max-w-2xl w-full bg-white/80 rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-6">
          <Smile className="h-12 w-12 text-pink-500 mb-2" />
          <h1 className="text-3xl font-bold text-pink-600 mb-2 text-center">Về Gấu Xinh</h1>
          <p className="text-gray-600 text-center">Chúng tôi là những người trẻ đam mê sáng tạo, mong muốn mang lại niềm vui và sự ấm áp cho mọi người qua từng sản phẩm gấu bông.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="flex flex-col items-center bg-pink-50 rounded-xl p-4 shadow-sm">
            <Users className="h-8 w-8 text-pink-400 mb-2" />
            <h2 className="font-semibold text-lg text-pink-600 mb-1">Đội ngũ</h2>
            <p className="text-gray-500 text-center">Năng động, sáng tạo, luôn lắng nghe và thấu hiểu khách hàng.</p>
          </div>
          <div className="flex flex-col items-center bg-pink-50 rounded-xl p-4 shadow-sm">
            <Eye className="h-8 w-8 text-pink-400 mb-2" />
            <h2 className="font-semibold text-lg text-pink-600 mb-1">Tầm nhìn</h2>
            <p className="text-gray-500 text-center">Trở thành thương hiệu gấu bông được yêu thích nhất Việt Nam.</p>
          </div>
          <div className="flex flex-col items-center bg-pink-50 rounded-xl p-4 shadow-sm">
            <HeartHandshake className="h-8 w-8 text-pink-400 mb-2" />
            <h2 className="font-semibold text-lg text-pink-600 mb-1">Cam kết</h2>
            <p className="text-gray-500 text-center">Chất lượng sản phẩm, dịch vụ tận tâm, bảo hành uy tín.</p>
          </div>
          <div className="flex flex-col items-center bg-pink-50 rounded-xl p-4 shadow-sm">
            <Smile className="h-8 w-8 text-pink-400 mb-2" />
            <h2 className="font-semibold text-lg text-pink-600 mb-1">Lý do thành lập</h2>
            <p className="text-gray-500 text-center">Mang lại niềm vui, sự sẻ chia và gắn kết cho mọi người qua từng món quà nhỏ.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 