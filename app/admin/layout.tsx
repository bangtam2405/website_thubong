"use client"
import { ReactNode, useState, createContext } from "react";
import { Gift, User, ShoppingBag, List, Users, LayoutDashboard } from "lucide-react";

export const AdminTabContext = createContext({ tab: "stats", setTab: (t: string) => {} });

const menu = [
  { label: "Đơn hàng", value: "orders", icon: <List size={20} /> },
  { label: "Khách hàng", value: "users", icon: <Users size={20} /> },
  { label: "Sản phẩm", value: "products", icon: <ShoppingBag size={20} /> },
  { label: "Kho phụ kiện", value: "categories", icon: <List size={20} /> },
  { label: "Hộp quà", value: "giftboxes", icon: <Gift size={20} /> },
  { label: "Thống kê", value: "stats", icon: <LayoutDashboard size={20} /> },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState("stats");
  return (
    <AdminTabContext.Provider value={{ tab, setTab }}>
      <div className="min-h-screen flex bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
          <div className="h-16 flex items-center justify-center font-bold text-xl text-pink-600 border-b">ADMIN</div>
          <nav className="flex-1 py-4">
            {menu.map(item => (
              <button
                key={item.value}
                className={`flex items-center gap-3 px-6 py-3 w-full text-left text-gray-700 hover:bg-pink-50 transition font-medium ${tab === item.value ? 'bg-pink-100 text-pink-600' : ''}`}
                onClick={() => setTab(item.value)}
              >
                {item.icon}
                {item.label}
              </button>
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