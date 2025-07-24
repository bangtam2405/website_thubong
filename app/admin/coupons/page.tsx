"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Select from 'react-select';
import { Search } from "lucide-react";

const fetchUsers = async () => {
  const res = await fetch('http://localhost:5000/api/auth/users');
  if (!res.ok) throw new Error('Lỗi khi lấy danh sách user');
  return res.json();
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({
    code: "",
    type: "percentage",
    value: 10,
    minOrderAmount: 0,
    maxDiscountAmount: null,
    usageLimit: 1,
    validUntil: "",
    isActive: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [filterUser, setFilterUser] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [search, setSearch] = useState("");

  const fetchCoupons = async () => {
    setLoading(true);
    const res = await fetch("http://localhost:5000/api/coupons");
    const data = await res.json();
    setCoupons(Array.isArray(data) ? data : []);
    setLoading(false);
  };
  useEffect(() => { fetchCoupons(); }, []);

  useEffect(() => {
    fetchUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  const filteredCoupons = coupons.filter(coupon => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return (
      (coupon.code && coupon.code.toLowerCase().includes(s)) ||
      (coupon.description && coupon.description.toLowerCase().includes(s)) ||
      (coupon.status && coupon.status.toLowerCase().includes(s))
    );
  });

  const getUserEmail = (userId: string) => {
    if (!userId) return 'Toàn bộ khách hàng';
    const u = users.find(u => u._id === userId);
    return u ? u.email : userId;
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `http://localhost:5000/api/coupons/${editingId}`
        : "http://localhost:5000/api/coupons";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Lỗi khi lưu mã giảm giá");
      setShowForm(false);
      setEditingId(null);
      setForm({ code: "", type: "percentage", value: 10, minOrderAmount: 0, maxDiscountAmount: null, usageLimit: 1, validUntil: "", isActive: true });
      fetchCoupons();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (coupon: any) => {
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      usageLimit: coupon.usageLimit,
      validUntil: coupon.validUntil ? coupon.validUntil.slice(0, 10) : "",
      isActive: coupon.isActive,
      userId: coupon.userId || ""
    });
    setEditingId(coupon._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mã này?")) return;
    await fetch(`http://localhost:5000/api/coupons/${id}`, { method: "DELETE" });
    fetchCoupons();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6" style={{color:'#e3497a'}}>Quản Lý Mã Giảm Giá</h1>
      <div className="flex items-center gap-2 mb-4">
        <div className="relative w-full max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-200 outline-none w-full"
            placeholder="Tìm kiếm mã giảm giá"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mb-4 w-full items-center">
        <select value={filterUser} onChange={e => setFilterUser(e.target.value)} className="border rounded px-2 py-2 flex-grow min-w-[180px]">
          <option value="">Tất cả người dùng</option>
          {/* <option value="null">Toàn bộ khách hàng</option> */}
          {users.map(u => <option key={u._id} value={u._id}>{u.email}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border rounded px-2 py-2 flex-grow min-w-[140px]">
          <option value="">Tất cả loại</option>
          <option value="percentage">Giảm %</option>
          <option value="fixed">Giảm tiền</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border rounded px-2 py-2 flex-grow min-w-[140px]">
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang dùng</option>
          <option value="inactive">Tạm dừng</option>
        </select>
        <Button className="bg-pink-500 hover:bg-pink-600 flex-shrink-0" style={{height: '40px'}} onClick={() => { setShowForm(true); setEditingId(null); setForm({ code: "", type: "percentage", value: 10, minOrderAmount: 0, maxDiscountAmount: null, usageLimit: 1, validUntil: "", isActive: true }); }}>Tạo Mã Mới</Button>
      </div>
      <div className="w-full">
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="code" value={form.code} onChange={handleChange} placeholder="Mã giảm giá" required className="w-full" />
              <select name="type" value={form.type} onChange={handleChange} className="border rounded px-2 py-2 w-full">
                <option value="percentage">Giảm theo %</option>
                <option value="fixed">Giảm số tiền</option>
              </select>
              <Input name="value" value={form.value} onChange={handleChange} placeholder="Giá trị" type="number" required className="w-full" />
              <Input name="minOrderAmount" value={form.minOrderAmount} onChange={handleChange} placeholder="Đơn tối thiểu" type="number" className="w-full" />
              <Input name="maxDiscountAmount" value={form.maxDiscountAmount || ""} onChange={handleChange} placeholder="Giảm tối đa (nếu %)" className="w-full" />
              <Input name="usageLimit" value={form.usageLimit} onChange={handleChange} placeholder="Số lần dùng" type="number" className="w-full" />
              <Input name="validUntil" value={form.validUntil} onChange={handleChange} placeholder="Hạn dùng" type="date" className="w-full" />
              <select name="isActive" value={form.isActive ? "true" : "false"} onChange={e => setForm({ ...form, isActive: e.target.value === "true" })} className="border rounded px-2 py-2 w-full">
                <option value="true">Kích hoạt</option>
                <option value="false">Tạm dừng</option>
              </select>
              {/* Trường chọn khách hàng chiếm cả 2 cột */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Chọn khách hàng (nếu muốn mã cá nhân hóa)</label>
                <Select
                  options={[{ value: '', label: '-- Mã cho toàn bộ khách hàng --' }, ...users.map(u => ({ value: u._id, label: u.email }))]}
                  value={users ? [{ value: '', label: '-- Mã cho toàn bộ khách hàng --' }, ...users.map(u => ({ value: u._id, label: u.email }))].find(opt => opt.value === (form.userId || '')) : null}
                  onChange={opt => setForm({ ...form, userId: opt?.value || '' })}
                  isClearable
                  placeholder="Chọn hoặc tìm email khách hàng..."
                  classNamePrefix="react-select"
                />
              </div>
            </div>
            {error && <p className="text-red-600 mt-2">{error}</p>}
            <div className="flex gap-2 mt-4">
              <Button type="submit" className="bg-pink-500 hover:bg-pink-600">{editingId ? "Cập nhật" : "Tạo mới"}</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
            </div>
          </form>
        )}
        <div className="bg-white rounded-xl shadow p-6">
          {loading ? <div>Đang tải...</div> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-pink-50">
                  <th className="p-2">Mã</th>
                  <th>Loại</th>
                  <th>Giá trị</th>
                  <th>Đơn tối thiểu</th>
                  <th>Giảm tối đa</th>
                  <th>Số lần dùng</th>
                  <th>Đã dùng</th>
                  <th>Hạn dùng</th>
                  <th>Trạng thái</th>
                  <th>User</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map(c => (
                  <tr key={c._id} className="border-b hover:bg-pink-50">
                    <td className="p-2 font-bold text-pink-600">{c.code}</td>
                    <td>{c.type === "percentage" ? "%" : "Tiền"}</td>
                    <td>{c.type === "percentage" ? `${c.value}%` : `${c.value.toLocaleString('vi-VN')}₫`}</td>
                    <td>{c.minOrderAmount ? c.minOrderAmount.toLocaleString('vi-VN') + '₫' : '-'}</td>
                    <td>{c.maxDiscountAmount ? c.maxDiscountAmount.toLocaleString('vi-VN') + '₫' : '-'}</td>
                    <td>{c.usageLimit || '-'}</td>
                    <td>{c.usedCount || 0}</td>
                    <td>{c.validUntil ? new Date(c.validUntil).toLocaleDateString() : '-'}</td>
                    <td>{c.isActive ? <span className="text-green-600 font-semibold">Đang dùng</span> : <span className="text-gray-400">Tạm dừng</span>}</td>
                    <td>{getUserEmail(c.userId)}</td>
                    <td>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(c)}>Sửa</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(c._id)} className="ml-2">Xóa</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
} 