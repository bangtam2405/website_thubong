import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DesignTabs() {
  const pathname = usePathname();
  return (
    <div className="flex gap-2 mb-6">
      <Link href="/admin/designs">
        <button
          className={
            pathname === "/admin/designs"
              ? "bg-pink-500 text-white px-4 py-2 rounded font-semibold"
              : "bg-white border px-4 py-2 rounded text-gray-700"
          }
        >
          Quản lý mẫu thiết kế
        </button>
      </Link>
      <Link href="/admin/community-designs">
        <button
          className={
            pathname === "/admin/community-designs"
              ? "bg-pink-500 text-white px-4 py-2 rounded font-semibold"
              : "bg-white border px-4 py-2 rounded text-gray-700"
          }
        >
          Quản lý thiết kế cộng đồng
        </button>
      </Link>
    </div>
  );
} 