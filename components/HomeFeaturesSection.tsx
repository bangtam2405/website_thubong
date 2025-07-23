"use client"
import { motion } from "framer-motion";
import { Palette, ShoppingBag, Gift } from "lucide-react";

export default function HomeFeaturesSection() {
  return (
    <motion.section
      className="py-16 px-4 sm:px-6 lg:px-8 bg-white"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: 0.2 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Cách Thức Hoạt Động</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Tạo ra thú nhồi bông hoàn hảo của bạn thật dễ dàng và thú vị với quy trình đơn giản của chúng tôi
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Palette className="h-10 w-10 text-pink-500" />,
              title: "Thiết Kế",
              description:
                "Lựa chọn từng chi tiết từ tai đến trang phục trong công cụ thiết kế tương tác của chúng tôi",
            },
            {
              icon: <ShoppingBag className="h-10 w-10 text-pink-500" />,
              title: "Đặt Hàng",
              description: "Xem lại thiết kế của bạn và đặt hàng với thanh toán an toàn",
            },
            {
              icon: <Gift className="h-10 w-10 text-pink-500" />,
              title: "Tận Hưởng",
              description: "Nhận thú nhồi bông thủ công được làm chính xác theo yêu cầu của bạn",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="bg-pink-50 rounded-xl p-8 text-center shadow hover:shadow-2xl transition-transform hover:-translate-y-2 hover:scale-105"
              whileHover={{ scale: 1.05, y: -8, boxShadow: "0 8px 32px 0 rgba(236, 72, 153, 0.15)" }}
            >
              <div className="mx-auto w-16 h-16 flex items-center justify-center bg-white rounded-full mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
} 