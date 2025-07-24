"use client"
import { ReactNode, useState, createContext, useEffect } from "react";
import { Gift, User, ShoppingBag, List, Users, LayoutDashboard, Star, Palette, ClipboardList, Boxes } from "lucide-react";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTags, faUserTie } from "@fortawesome/free-solid-svg-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ImageUpload";
import { toast } from "sonner";
import instance from "@/lib/axiosConfig";

export const AdminTabContext = createContext({ tab: "stats", setTab: (t: string) => {} });

const iconClass = "text-pink-400";
const menu = [
  { label: "Đơn hàng", value: "orders", icon: <ClipboardList size={20} className={iconClass} /> },
  { label: "Khách hàng", value: "users", icon: <Users size={20} className={iconClass} /> },
  { label: "Sản phẩm", value: "products", icon: <ShoppingBag size={20} className={iconClass} /> },
  { label: "Kho phụ kiện", value: "categories", icon: <Boxes size={20} className={iconClass} /> },
  { label: "Hộp quà", value: "giftboxes", icon: <Gift size={20} className={iconClass} /> },
  { label: "Giảm giá", value: "coupons", icon: <FontAwesomeIcon icon={faTags} className="text-pink-400 h-5 w-5" /> },
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
    if (pathname.startsWith('/admin/coupons')) return 'coupons';
    if (pathname.startsWith('/admin/designs') || pathname.startsWith('/admin/community-designs')) return 'community-designs';
    if (pathname.startsWith('/admin/reviews')) return 'reviews';
    return 'stats';
  };
  const activeTab = getActiveTab();
  const [showProfile, setShowProfile] = useState(false);
  const [fullName, setFullName] = useState("");
  const [avatar, setAvatar] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("other");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  // Lấy thông tin admin (giả sử là user đầu tiên có role admin)
  useEffect(() => {
    if (!showProfile) return;
    const token = typeof window !== 'undefined' ? (localStorage.getItem("accessToken") || localStorage.getItem("token")) : null;
    const apiUrl = "/api/auth/me";
    console.log("[ADMIN] Token gửi lên:", token);
    console.log("[ADMIN] Gọi API:", apiUrl);
    if (!token) {
      toast.error("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn!");
      setShowProfile(false);
      return;
    }
    setLoading(true);
    instance.get(apiUrl)
      .then(res => {
        const u = res.data.user;
        setUserId(u._id || "");
        setUsername(u.username || "");
        setFullName(u.fullName || "");
        setAvatar(u.avatar || "");
        setPhone(u.phone || "");
        setDob(u.dob ? u.dob.slice(0, 10) : "");
        setGender(u.gender || "other");
      })
      .catch(err => {
        console.error("[ADMIN] Lỗi lấy profile:", err?.response?.data || err);
        // Nếu lỗi do token, xóa localStorage và reload lại trang
        if (err?.response?.status === 401 || err?.response?.status === 400) {
          toast.error("Token không hợp lệ hoặc đã hết hạn. Đăng nhập lại!");
          localStorage.clear();
          setTimeout(() => window.location.reload(), 1000);
        } else {
          toast.error("Không thể lấy thông tin admin. Vui lòng đăng nhập lại!");
        }
        setShowProfile(false);
      })
      .finally(() => setLoading(false));
  }, [showProfile]);
  const handleAvatarUploaded = async (url: string) => {
    setAvatar(url);
    setLoading(true);
    try {
      await instance.put("/api/auth/profile", { userId, username, avatar: url, fullName, phone, dob, gender });
      toast.success("Cập nhật ảnh đại diện thành công!");
    } finally { setLoading(false); }
  };
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await instance.put("/api/auth/profile", { userId, username, avatar, fullName, phone, dob, gender });
      toast.success("Cập nhật thông tin thành công!");
      setShowProfile(false);
    } finally { setLoading(false); }
  };
  return (
    <AdminTabContext.Provider value={{ tab: activeTab, setTab }}>
      <div className="min-h-screen flex bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
          <div className="h-16 flex items-center justify-center font-bold text-xl text-pink-600 border-b">
            <FontAwesomeIcon icon={faUserTie} className="mr-2 text-pink-500" /> ADMIN
          </div>
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
        </aside>
        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Topbar */}
          <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm">
            <div className="font-semibold text-lg text-pink-600">Bảng điều khiển quản trị</div>
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setShowProfile(true)}>
              <FontAwesomeIcon icon={faUserTie} className="w-6 h-6 text-gray-400" />
              <span className="text-gray-700 font-medium">Admin</span>
            </div>
          </header>
          <Dialog open={showProfile} onOpenChange={setShowProfile}>
            <DialogContent aria-describedby="admin-profile-desc">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa thông tin admin</DialogTitle>
                <span id="admin-profile-desc" className="sr-only">Cập nhật tên, avatar, số điện thoại, ngày sinh, giới tính cho tài khoản admin.</span>
              </DialogHeader>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="flex flex-col items-center mb-4">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-pink-200 mb-2" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-pink-100 flex items-center justify-center mb-2">
                      <User className="h-12 w-12 text-pink-500" />
                    </div>
                  )}
                  <ImageUpload onImageUploaded={handleAvatarUploaded} currentImage={avatar} folder="avatars" />
                </div>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Họ và tên" className="" />
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Số điện thoại" className="" />
                <Input value={dob} onChange={e => setDob(e.target.value)} placeholder="Ngày sinh" type="date" className="" />
                <div className="flex gap-4 items-center">
                  <span>Giới tính</span>
                  <label><input type="radio" checked={gender === 'male'} onChange={() => setGender('male')} /> Nam</label>
                  <label><input type="radio" checked={gender === 'female'} onChange={() => setGender('female')} /> Nữ</label>
                  <label><input type="radio" checked={gender === 'other'} onChange={() => setGender('other')} /> Khác</label>
                </div>
                <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600">Lưu Thay Đổi</Button>
              </form>
            </DialogContent>
          </Dialog>
          <main className="flex-1 p-8 bg-gray-50">{children}</main>
        </div>
      </div>
    </AdminTabContext.Provider>
  );
} 