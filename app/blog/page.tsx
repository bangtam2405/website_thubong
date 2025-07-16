"use client"
import { BookOpen, PenLine, Sparkles } from "lucide-react";
import Link from "next/link";

const blogPosts = [
  {
    slug: "qua-tang-gau-bong-doc-dao",
    title: "5 Ý Tưởng Quà Tặng Gấu Bông Độc Đáo Cho Người Thân",
    excerpt: "Khám phá những ý tưởng tặng gấu bông sáng tạo, ý nghĩa cho mọi dịp đặc biệt.",
    icon: <Sparkles className="h-8 w-8 text-pink-400 mb-2" />,
  },
  {
    slug: "bao-quan-gau-bong",
    title: "Cách Bảo Quản Gấu Bông Luôn Như Mới",
    excerpt: "Hướng dẫn vệ sinh, bảo quản gấu bông đúng cách để luôn mềm mại, thơm tho.",
    icon: <BookOpen className="h-8 w-8 text-pink-400 mb-2" />,
  },
  {
    slug: "y-nghia-gau-bong",
    title: "Tại Sao Gấu Bông Là Món Quà Quốc Dân?",
    excerpt: "Tìm hiểu lý do vì sao gấu bông luôn được yêu thích và là lựa chọn hàng đầu khi tặng quà.",
    icon: <PenLine className="h-8 w-8 text-pink-400 mb-2" />,
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-white py-12 px-4">
      <div className="max-w-2xl w-full bg-white/80 rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-6">
          <BookOpen className="h-12 w-12 text-pink-500 mb-2" />
          <h1 className="text-3xl font-bold text-pink-600 mb-2 text-center">Blog</h1>
          <p className="text-gray-600 text-center">Chia sẻ kiến thức, kinh nghiệm, câu chuyện thú vị về gấu bông và quà tặng.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 mt-6">
          {blogPosts.map((post, idx) => (
            <Link href={`/blog/${post.slug}`} key={post.slug} className="flex flex-col items-center bg-pink-50 rounded-xl p-4 shadow-sm hover:shadow-lg transition-shadow group">
              {post.icon}
              <h2 className="font-semibold text-lg text-pink-600 mb-1 text-center group-hover:underline">{post.title}</h2>
              <p className="text-gray-500 text-center">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 