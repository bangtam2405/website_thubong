"use client"
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomeFeaturedSection({ featuredProducts }: { featuredProducts: any[] }) {
  return (
    <motion.section
      className="py-16 px-4 sm:px-6 lg:px-8 bg-white"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7 }}
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8" style={{color: '#e3497a'}}>Sản Phẩm Nổi Bật</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {featuredProducts.length === 0 ? (
            <p className="col-span-3 text-center text-gray-500">Chưa có sản phẩm nổi bật.</p>
          ) : (
            featuredProducts.map((product: any) => (
              <motion.div
                key={product._id}
                className="bg-pink-50 rounded-xl p-6 text-center shadow hover:shadow-2xl transition-transform hover:-translate-y-2 hover:scale-105"
                whileHover={{ scale: 1.05, y: -8, boxShadow: "0 8px 32px 0 rgba(236, 72, 153, 0.15)" }}
              >
                <Image
                  src={product.image || "/placeholder.jpg"}
                  alt={product.name}
                  width={200}
                  height={200}
                  className="mx-auto rounded-lg object-cover"
                />
                <h3 className="text-xl font-bold text-gray-900 mt-4">{product.name}</h3>
                <p className="text-gray-500 text-xs mt-1">🛒 Đã bán: {product.sold || 0} lượt</p>
                <p className="text-pink-500 font-semibold mt-2">{product.price?.toLocaleString()}₫</p>
                <Link href={`/product/${product._id}`}>
                  <Button size="sm" className="mt-4 bg-pink-500 hover:bg-pink-600">Xem Chi Tiết</Button>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.section>
  );
} 