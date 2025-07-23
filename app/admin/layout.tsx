"use client"
import { ReactNode, useState, createContext } from "react";
import { Gift, User, ShoppingBag, List, Users, LayoutDashboard, Star, Palette, ClipboardList, Boxes } from "lucide-react";
import { usePathname } from "next/navigation";

export const AdminTabContext = createContext({ tab: "stats", setTab: (t: string) => {} });

const iconClass = "text-pink-400";
const menu = [
  { label: "Đơn hàng", value: "orders", icon: <ClipboardList size={20} className={iconClass} /> },
  { label: "Khách hàng", value: "users", icon: <Users size={20} className={iconClass} /> },
  { label: "Sản phẩm", value: "products", icon: <ShoppingBag size={20} className={iconClass} /> },
  { label: "Kho phụ kiện", value: "categories", icon: <Boxes size={20} className={iconClass} /> },
  { label: "Hộp quà", value: "giftboxes", icon: <Gift size={20} className={iconClass} /> },
  { label: "Thiết kế", value: "community-designs", icon: <Palette size={20} className={iconClass} /> },
  { label: "Đánh giá", value: "reviews", icon: <Star size={20} className={iconClass} /> },
  { label: "Thống kê", value: "stats", icon: <LayoutDashboard size={20} className={iconClass} /> },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState("stats");
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  // Map path to menu value
  const getActiveTab = () => {
    if (pathname.startsWith('/admin/orders')) return 'orders';
    if (pathname.startsWith('/admin/users')) return 'users';
    if (pathname.startsWith('/admin/products')) return 'products';
    if (pathname.startsWith('/admin/categories')) return 'categories';
    if (pathname.startsWith('/admin/giftboxes')) return 'giftboxes';
    if (pathname.startsWith('/admin/designs') || pathname.startsWith('/admin/community-designs')) return 'community-designs';
    if (pathname.startsWith('/admin/reviews')) return 'reviews';
    return 'stats';
  };
  const activeTab = getActiveTab();
  return (
    <AdminTabContext.Provider value={{ tab: activeTab, setTab }}>
      <div className="min-h-screen flex bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
          <div className="h-16 flex items-center justify-center font-bold text-xl text-pink-600 border-b">ADMIN</div>
          <nav className="flex-1 py-4">
            {menu.map(item => (
              <a
                key={item.value}
                href={item.value === 'stats' ? '/admin' : (item.value === 'community-designs' ? '/admin/designs' : `/admin/${item.value}`)}
                className={`flex items-center gap-3 px-6 py-3 w-full text-left text-gray-700 hover:bg-pink-50 transition font-medium ${activeTab === item.value ? 'bg-pink-100 text-pink-600' : ''}`}
                onClick={() => setTab(item.value)}
              >
                {item.icon}
                {item.label}
              </a>
            ))}
          </nav>
          <div className="p-4 border-t text-xs text-gray-400">&copy; {new Date().getFullYear()} Plush Admin</div>
        </aside>
        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Topbar */}
          <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm">
            <div className="font-semibold text-lg text-pink-600">Bảng điều khiển quản trị</div>
            <div className="flex items-center gap-4">
              <User className="w-6 h-6 text-gray-400" />
              <span className="text-gray-700 font-medium">Admin</span>
            </div>
          </header>
          <main className="flex-1 p-8 bg-gray-50">{children}</main>
        </div>
      </div>
    </AdminTabContext.Provider>
  );
} 