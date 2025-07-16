import React from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-pink-100 rounded-full p-4 mb-4 shadow-lg">
            <Mail className="h-10 w-10 text-pink-500" />
          </div>
          <h1 className="text-4xl font-extrabold text-pink-500 mb-2 text-center drop-shadow">Liên Hệ</h1>
          <p className="text-gray-500 text-center max-w-xl">Bạn cần hỗ trợ, tư vấn hoặc góp ý? Hãy liên hệ với Gấu Xinh qua form bên dưới hoặc các kênh liên lạc sau!</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Phone className="h-6 w-6 text-pink-400" />
              <span className="text-gray-700 font-medium">Hotline: <a href="tel:0123456789" className="text-pink-500 hover:underline">0123 456 789</a></span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-pink-400" />
              <span className="text-gray-700 font-medium">Email: <a href="mailto:support@thubongxinh.vn" className="text-pink-500 hover:underline">support@thubongxinh.vn</a></span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-pink-400" />
              <span className="text-gray-700 font-medium">Địa chỉ: 233 Nguyễn Văn Cừ, Phường Cái Khế, TP. Cần Thơ</span>
            </div>
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Kết nối với chúng tôi</h2>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-pink-500"><svg width="24" height="24" fill="currentColor"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.326 24h11.495v-9.294H9.692v-3.622h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg></a>
                <a href="#" className="text-gray-400 hover:text-pink-500"><svg width="24" height="24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.567 5.782 2.295 7.148 2.233 8.414 2.175 8.794 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.363 3.678 1.344c-.98.98-1.213 2.092-1.272 3.373C2.013 5.668 2 6.077 2 12c0 5.923.013 6.332.072 7.613.059 1.281.292 2.393 1.272 3.373.98.98 2.092 1.213 3.373 1.272C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.281-.059 2.393-.292 3.373-1.272.98-.98 1.213-2.092 1.272-3.373.059-1.281.072-1.69.072-7.613 0-5.923-.013-6.332-.072-7.613-.059-1.281-.292-2.393-1.272-3.373-.98-.98-2.092-1.213-3.373-1.272C15.668.013 15.259 0 12 0z"/><circle cx="12" cy="12" r="3.5"/></svg></a>
                <a href="#" className="text-gray-400 hover:text-pink-500"><svg width="24" height="24" fill="currentColor"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 0 0-8.384 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.856 3.17 0 2.188 1.115 4.116 2.823 5.247a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.212c9.058 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/></svg></a>
              </div>
            </div>
          </div>
          <form className="bg-white rounded-xl shadow-md p-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input id="name" name="name" type="text" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300" placeholder="Nhập họ tên của bạn" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input id="email" name="email" type="email" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300" placeholder="Nhập email của bạn" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
              <textarea id="message" name="message" rows={4} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300" placeholder="Nhập nội dung liên hệ" />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-pink-500 text-white px-6 py-2 rounded-full font-semibold shadow hover:bg-pink-600 transition">
              <Send className="h-5 w-5" />
              Gửi liên hệ
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 