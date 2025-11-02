# 🚀 Quick Deploy Checklist - Deploy Nhanh Trong 30 Phút

File này tóm tắt các bước quan trọng nhất để deploy. Xem `DEPLOY_GUIDE.md` để có hướng dẫn chi tiết.

## 📝 Checklist Nhanh

### 1. Chuẩn Bị (5 phút)
- [ ] Push code lên GitHub
- [ ] Có tài khoản: Vercel, Render, MongoDB Atlas, Cloudinary

### 2. MongoDB Atlas (5 phút)
- [ ] Tạo cluster FREE
- [ ] Tạo database user
- [ ] Whitelist IP (0.0.0.0/0)
- [ ] Copy connection string → **LƯU LẠI**

### 3. Cloudinary (2 phút)
- [ ] Đăng ký → Lấy Cloud Name, API Key, API Secret → **LƯU LẠI**

### 4. Deploy Backend - Render (10 phút)
- [ ] New Web Service → Connect GitHub → Chọn repo
- [ ] Root Directory: `backend`
- [ ] Build: `npm install`
- [ ] Start: `npm start`
- [ ] Environment Variables:
  ```
  MONGO_URI=mongodb+srv://...
  JWT_SECRET=...
  JWT_REFRESH_SECRET=...
  CLOUDINARY_CLOUD_NAME=...
  CLOUDINARY_API_KEY=...
  CLOUDINARY_API_SECRET=...
  FRONTEND_URL=https://your-frontend.vercel.app (sẽ update sau)
  ```
- [ ] Deploy → Copy URL backend: `https://backend-webthubong.onrender.com` ✅

### 5. Deploy Frontend - Vercel (8 phút)
- [ ] New Project → Import GitHub → Chọn repo
- [ ] Environment Variables:
  ```
  NEXT_PUBLIC_API_URL=https://backend-webthubong.onrender.com
  GOOGLE_CLIENT_ID=...
  GOOGLE_CLIENT_SECRET=...
  NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
  NEXTAUTH_URL=https://your-app.vercel.app
  NEXTAUTH_SECRET=...
  ```
- [ ] Deploy → Copy URL frontend → **LƯU LẠI**

### 6. Cập Nhật (5 phút)
- [ ] Update CORS backend: Thêm URL frontend vào `FRONTEND_URL`
- [ ] Update Google OAuth: Thêm URL frontend vào authorized origins
- [ ] Redeploy cả 2

### 7. Test (5 phút)
- [ ] Test frontend URL → Kiểm tra load trang
- [ ] Test API calls → Mở DevTools Network
- [ ] Test upload ảnh (nếu có)
- [ ] Test đăng nhập (nếu có)

## 🎯 Kết Quả

Sau khi hoàn thành, bạn sẽ có:
- ⏳ Frontend: `https://your-app.vercel.app` (sẽ có sau)
- ✅ Backend: `https://backend-webthubong.onrender.com` ✅ ĐÃ DEPLOY

**Link gửi nhà tuyển dụng**: Frontend URL

---

💡 **Tip**: Nếu gặp lỗi, xem phần "Xử Lý Lỗi Thường Gặp" trong `DEPLOY_GUIDE.md`

