import React from "react";
import Link from "next/link";
import { RefreshCcw, ListChecks, ClipboardList, AlertTriangle } from "lucide-react";

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-pink-100 rounded-full p-4 mb-4 shadow-lg">
            <RefreshCcw className="h-10 w-10 text-pink-500" />
          </div>
          <h1 className="text-4xl font-extrabold text-pink-500 mb-2 text-center drop-shadow">Chính Sách Đổi Trả</h1>
          <p className="text-gray-500 text-center max-w-xl">Thông tin về điều kiện, quy trình và lưu ý khi đổi trả sản phẩm tại ThúBôngXinh.</p>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6 flex gap-4 items-start">
            <ListChecks className="h-7 w-7 text-pink-400 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Điều kiện đổi trả</h2>
              <ul className="list-disc ml-6 mt-2">
                <li>Sản phẩm bị lỗi do sản xuất hoặc vận chuyển.</li>
                <li>Sản phẩm không đúng mô tả hoặc nhầm lẫn khi giao hàng.</li>
                <li>Yêu cầu đổi trả trong vòng 7 ngày kể từ khi nhận hàng.</li>
                <li>Sản phẩm còn nguyên tem, nhãn, chưa qua sử dụng.</li>
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex gap-4 items-start">
            <ClipboardList className="h-7 w-7 text-pink-400 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Quy trình đổi trả</h2>
              <ul className="list-decimal ml-6 mt-2">
                <li>Liên hệ với chúng tôi qua trang <Link href="/contact" className="text-pink-500 underline font-medium">Liên Hệ</Link> hoặc hotline để thông báo về sản phẩm cần đổi trả.</li>
                <li>Gửi hình ảnh sản phẩm và thông tin đơn hàng để xác minh.</li>
                <li>Gửi trả sản phẩm về địa chỉ được cung cấp sau khi xác nhận đủ điều kiện đổi trả.</li>
                <li>Sau khi nhận và kiểm tra sản phẩm, chúng tôi sẽ hoàn tiền hoặc gửi sản phẩm thay thế trong 3-5 ngày làm việc.</li>
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex gap-4 items-start">
            <AlertTriangle className="h-7 w-7 text-pink-400 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Lưu ý</h2>
              <ul className="list-disc ml-6 mt-2">
                <li>Không áp dụng đổi trả với sản phẩm thiết kế cá nhân hóa trừ khi bị lỗi sản xuất.</li>
                <li>Khách hàng chịu chi phí vận chuyển khi đổi trả nếu không phải lỗi từ phía chúng tôi.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 