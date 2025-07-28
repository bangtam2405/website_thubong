"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import axios from "axios"
import { User, Pencil, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link"
import { formatDateVN } from "@/lib/utils";

export default function ProfilePage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [avatar, setAvatar] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("other");
  const [address, setAddress] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const userIdLS = typeof window !== "undefined" ? localStorage.getItem("userId") : "";
    if (!userIdLS) {
      router.push("/login");
      return;
    }
    setUserId(userIdLS);
    // Gọi API lấy profile từ backend
    axios.get(`http://localhost:5000/api/auth/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => {
        if (res.data && res.data.success && res.data.user) {
          const u = res.data.user;
          setFullName(u.fullName || "");
          setEmail(u.email || "");
          setPhone(u.phone || "");
          setDob(u.dob ? u.dob.slice(0, 10) : "");
          setGender(u.gender || "other");
          setAddress(u.addresses && u.addresses[0] ? u.addresses[0].address : "");
          setAvatar(u.avatar || "");
          // Luôn đồng bộ localStorage từng trường lẻ (kể cả khi không bấm Lưu)
          localStorage.setItem("fullName", u.fullName || "");
          localStorage.setItem("email", u.email || "");
          localStorage.setItem("phone", u.phone || "");
          localStorage.setItem("dob", u.dob ? u.dob.slice(0, 10) : "");
          localStorage.setItem("gender", u.gender || "other");
          localStorage.setItem("address", u.addresses && u.addresses[0] ? u.addresses[0].address : "");
          localStorage.setItem("avatar", u.avatar || "");
          localStorage.setItem("user", JSON.stringify(u));
        } else {
          console.error('API trả về không đúng:', res.data);
        }
      })
      .catch((err) => {
        console.error('Lỗi lấy profile:', err);
        // fallback localStorage nếu lỗi
        setFullName(localStorage.getItem("fullName") || "");
        setEmail(localStorage.getItem("email") || "");
        setPhone(localStorage.getItem("phone") || "");
        setDob(localStorage.getItem("dob") || "");
        setGender(localStorage.getItem("gender") || "other");
        setAddress(localStorage.getItem("address") || "");
        setAvatar(localStorage.getItem("avatar") || "");
      });
  }, [router]);

  // Luôn đồng bộ localStorage khi user thay đổi input (UX tốt hơn)
  useEffect(() => { localStorage.setItem("fullName", fullName); }, [fullName]);
  useEffect(() => { localStorage.setItem("phone", phone); }, [phone]);
  useEffect(() => { localStorage.setItem("address", address); }, [address]);

  const handleAvatarUploaded = async (url: string) => {
    setAvatar(url);
    if (!userId || !url) return;
    setLoading(true);
    try {
      const res = await axios.put("http://localhost:5000/api/auth/profile", {
        userId,
        username: email, // username là email nếu không có trường riêng
        avatar: url,
        fullName,
        email,
        phone,
        dob,
        gender,
        address,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.data.success) {
        localStorage.setItem("avatar", url);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        window.dispatchEvent(new Event("user-updated"));
        toast.success("Cập nhật ảnh đại diện thành công!");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Cập nhật ảnh đại diện thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put("http://localhost:5000/api/auth/profile", {
        userId,
        username: email, // username là email nếu không có trường riêng
        fullName,
        email,
        phone,
        dob,
        gender,
        address,
        avatar,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.data.success) {
        const u = res.data.user;
        setFullName(u.fullName || "");
        setEmail(u.email || "");
        setPhone(u.phone || "");
        setDob(u.dob ? u.dob.slice(0, 10) : "");
        setGender(u.gender || "other");
        setAddress(u.addresses && u.addresses[0] ? u.addresses[0].address : "");
        localStorage.setItem("fullName", u.fullName || "");
        localStorage.setItem("email", u.email || "");
        localStorage.setItem("phone", u.phone || "");
        localStorage.setItem("dob", u.dob ? u.dob.slice(0, 10) : "");
        localStorage.setItem("gender", u.gender || "other");
        localStorage.setItem("address", u.addresses && u.addresses[0] ? u.addresses[0].address : "");
        localStorage.setItem("user", JSON.stringify(u));
        window.dispatchEvent(new Event("user-updated"));
      }
      // Đổi mật khẩu nếu có nhập
      if (newPassword || confirmPassword) {
        if (newPassword !== confirmPassword) {
          toast.error("Mật khẩu xác nhận không khớp!");
          setLoading(false);
          return;
        }
        await axios.put("http://localhost:5000/api/auth/change-password", { userId, newPassword }, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        toast.success("Đổi mật khẩu thành công!");
        setNewPassword("");
        setConfirmPassword("");
      }
      toast.success("Cập nhật thông tin thành công!");
    } catch (err: any) {
      toast.error("Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <aside className="w-full md:w-1/4 mb-4 md:mb-0">
        <div className="bg-white rounded-2xl shadow-xl p-4 flex flex-col items-center">
          <div className="mb-2 relative group">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-28 h-28 rounded-full object-cover border-4 border-pink-200" />
            ) : (
              <div className="bg-pink-100 rounded-full p-3 w-28 h-28 flex items-center justify-center">
                <User className="h-20 w-20 text-pink-500" />
              </div>
            )}
            {/* Icon bút overlay */}
            <button
              type="button"
              className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow hover:bg-pink-100 transition-colors opacity-80 group-hover:opacity-100"
              title="Đổi ảnh đại diện"
              onClick={() => document.getElementById('avatar-upload-input')?.click()}
            >
              <Pencil className="w-5 h-5 text-pink-500" />
            </button>
            <input
              id="avatar-upload-input"
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', 'avatars');
                setLoading(true);
                try {
                  const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                  });
                  const data = await res.json();
                  if (data.success && data.url) {
                    await handleAvatarUploaded(data.url);
                  } else {
                    toast.error('Upload ảnh thất bại!');
                  }
                } catch (err) {
                  toast.error('Lỗi upload ảnh!');
                } finally {
                  setLoading(false);
                }
              }}
            />
          </div>
          <div className="mb-1 font-semibold text-base text-center truncate w-full">{fullName || "Chưa có tên"}</div>
          <div className="text-gray-500 text-xs mb-2 text-center truncate w-full">{email}</div>
          <nav className="mt-6 w-full">
            <ul className="space-y-1">
              <li>
                <button className={`w-full text-left px-2 py-1 rounded ${!showChangePassword ? 'bg-pink-100 text-pink-500 font-semibold' : 'text-gray-600'}`} onClick={() => setShowChangePassword(false)}>Hồ Sơ</button>
              </li>
              <li>
                <Link href="/orders" className="w-full block text-left px-2 py-1 rounded text-gray-600 hover:bg-pink-50 hover:text-pink-500 transition">
                  Đơn Hàng
                </Link>
              </li>
              <li>
                <Link href="/profile/coupons" className="w-full block text-left px-2 py-1 rounded text-gray-600 hover:bg-pink-50 hover:text-pink-500 transition">
                  Ưu đãi của tôi
                </Link>
              </li>
              <li>
                <button className={`w-full text-left px-2 py-1 rounded ${showChangePassword ? 'bg-pink-100 text-pink-500 font-semibold' : 'text-gray-600'}`} onClick={() => setShowChangePassword(true)}>Đổi Mật Khẩu</button>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {!showChangePassword ? (
            <>
              <h1 className="text-xl font-bold mb-2 text-pink-500">Hồ Sơ Cá Nhân</h1>
              <p className="text-gray-500 mb-4 text-sm">Quản lý thông tin tài khoản của bạn</p>
              <form onSubmit={handleUpdate} className="w-full space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Họ và tên</label>
                    <Input value={fullName} onChange={e => setFullName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Email</label>
                    <Input value={email} disabled />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Số điện thoại</label>
                    <Input value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Ngày sinh</label>
                    <Input type="date" value={dob} onChange={e => setDob(e.target.value)} />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Giới tính</label>
                    <div className="flex gap-4 mt-1">
                      <label className="text-sm"><input type="radio" name="gender" value="male" checked={gender === "male"} onChange={() => setGender("male")} /> Nam</label>
                      <label className="text-sm"><input type="radio" name="gender" value="female" checked={gender === "female"} onChange={() => setGender("female")} /> Nữ</label>
                      <label className="text-sm"><input type="radio" name="gender" value="other" checked={gender === "other"} onChange={() => setGender("other")} /> Khác</label>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-1 font-medium text-sm">Địa chỉ</label>
                    <Input value={address} onChange={e => setAddress(e.target.value)} />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 mt-2" disabled={loading}>
                  {loading ? "Đang cập nhật..." : "Lưu Thay Đổi"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-4 text-pink-500">Đổi Mật Khẩu</h2>
              <form onSubmit={handleUpdate} className="w-full space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium text-sm">Mật khẩu mới</label>
                    <div className="relative">
                      <Input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Để trống nếu không đổi" className="pr-10" />
                      <button type="button" tabIndex={-1} className="absolute right-2 top-2 text-gray-400 hover:text-pink-500" onClick={() => setShowNewPassword(v => !v)}>
                        {showNewPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-sm">Xác nhận mật khẩu</label>
                    <div className="relative">
                      <Input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Để trống nếu không đổi" className="pr-10" />
                      <button type="button" tabIndex={-1} className="absolute right-2 top-2 text-gray-400 hover:text-pink-500" onClick={() => setShowConfirmPassword(v => !v)}>
                        {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-pink-400 hover:bg-pink-500 mt-2" disabled={loading}>
                  {loading ? "Đang cập nhật..." : "Đổi Mật Khẩu"}
                </Button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
} 