"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      // Xóa toàn bộ thông tin user khỏi localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      localStorage.removeItem('email');
      localStorage.removeItem('avatar');
      localStorage.removeItem('fullName');
      
      // Đăng xuất NextAuth
      await signOut({ 
        callbackUrl: '/login',
        redirect: false 
      });
      
      // Reload trang để đảm bảo session được xóa hoàn toàn
      window.location.href = "/login";
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
      // Nếu có lỗi vẫn xóa localStorage và chuyển về trang login
      window.location.href = "/login";
    }
  };

  return (
    <Button 
      onClick={handleLogout}
      className="fixed top-4 right-4 z-50 bg-red-500 hover:bg-red-600 text-white"
    >
      Đăng xuất
    </Button>
  );
} 