"use client"
import { notFound, useParams } from "next/navigation";
import { BookOpen, PenLine, Sparkles } from "lucide-react";
import Link from "next/link";
import { formatDateVN } from "@/lib/utils";

const blogPosts = [
  {
    slug: "qua-tang-gau-bong-doc-dao",
    title: "5 Ý Tưởng Quà Tặng Gấu Bông Độc Đáo Cho Người Thân",
    icon: <Sparkles className="h-8 w-8 text-pink-500 mb-4" />,
    content: (
      <>
        <p className="mb-4">Bạn đang tìm kiếm món quà ý nghĩa cho người thân? Dưới đây là 5 ý tưởng tặng gấu bông độc đáo mà shop gợi ý cho bạn:</p>
        <ol className="list-decimal pl-6 space-y-2 mb-4">
          <li>Gấu bông in tên người nhận hoặc lời chúc đặc biệt.</li>
          <li>Gấu bông mặc trang phục theo sở thích (bác sĩ, sinh viên, ...).</li>
          <li>Gấu bông kèm hộp quà, thiệp viết tay.</li>
          <li>Gấu bông custom theo hình ảnh thật của người nhận.</li>
          <li>Combo gấu bông + phụ kiện dễ thương của shop.</li>
        </ol>
        <p>Tham khảo thêm các <Link href="/products/teddy" className="text-pink-600 underline">mẫu gấu bông</Link> mới nhất tại Gấu Xinh!</p>
      </>
    ),
  },
  {
    slug: "bao-quan-gau-bong",
    title: "Cách Bảo Quản Gấu Bông Luôn Như Mới",
    icon: <BookOpen className="h-8 w-8 text-pink-500 mb-4" />,
    content: (
      <>
        <p className="mb-4">Để gấu bông luôn mềm mại, thơm tho, bạn nên:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Giặt gấu bông định kỳ bằng tay hoặc máy giặt chế độ nhẹ.</li>
          <li>Phơi nơi khô ráo, tránh ánh nắng trực tiếp quá lâu.</li>
          <li>Dùng túi hút chân không khi không sử dụng lâu ngày.</li>
          <li>Tránh để gấu bông tiếp xúc với vật sắc nhọn, hóa chất.</li>
        </ul>
        <p>Nếu cần mua <Link href="/accessories" className="text-pink-600 underline">phụ kiện vệ sinh gấu bông</Link>, Gấu Xinh luôn sẵn sàng hỗ trợ!</p>
      </>
    ),
  },
  {
    slug: "y-nghia-gau-bong",
    title: "Tại Sao Gấu Bông Là Món Quà Quốc Dân?",
    icon: <PenLine className="h-8 w-8 text-pink-500 mb-4" />,
    content: (
      <>
        <p className="mb-4">Gấu bông là món quà quốc dân bởi:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Phù hợp với mọi lứa tuổi, giới tính.</li>
          <li>Biểu tượng của sự ấm áp, yêu thương, an ủi.</li>
          <li>Dễ dàng cá nhân hóa, sáng tạo theo ý thích.</li>
          <li>Giá thành đa dạng, phù hợp nhiều dịp tặng quà.</li>
        </ul>
        <p>Khám phá thêm <Link href="/company" className="text-pink-600 underline">câu chuyện thương hiệu</Link> của Gấu Xinh!</p>
      </>
    ),
  },
];

export default function BlogDetailPage() {
  const params = useParams();
  const post = blogPosts.find((p) => p.slug === params?.slug);

  if (!post) return notFound();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-white py-12 px-4">
      <div className="max-w-2xl w-full bg-white/80 rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-6">
          {post.icon}
          <h1 className="text-3xl font-bold text-pink-600 mb-4 text-center">{post.title}</h1>
        </div>
        <div className="prose prose-p:text-gray-700 prose-li:text-gray-600 max-w-none">
          {post.content}
        </div>
        <div className="mt-8 text-center">
          <Link href="/blog" className="text-pink-500 hover:underline">← Quay lại Blog</Link>
        </div>
      </div>
    </div>
  );
} 