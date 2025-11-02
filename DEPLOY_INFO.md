# 📍 Thông Tin Deploy - Website Thú Bông

## ✅ Backend - Đã Deploy

**URL Backend**: `https://backend-webthubong.onrender.com`

**Trạng thái**: ✅ Đã deploy thành công

**Platform**: Render (Free Plan)

**Repo**: https://github.com/bangtam2405/backend_webthubong

---

## 📝 Environment Variables Cần Thiết

### Backend (Render) - Đã Set

Các biến môi trường đã được cấu hình trên Render:

- ✅ `MONGO_URI` - MongoDB connection string
- ✅ `JWT_SECRET` - JWT secret key
- ✅ `JWT_REFRESH_SECRET` - JWT refresh secret
- ✅ `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- ✅ `CLOUDINARY_API_KEY` - Cloudinary API key
- ✅ `CLOUDINARY_API_SECRET` - Cloudinary API secret
- ⏳ `FRONTEND_URL` - **Sẽ thêm sau khi deploy frontend**

### Frontend (Vercel) - Cần Set Khi Deploy

Khi deploy frontend lên Vercel, cần set các biến sau:

```env
# Backend API URL - QUAN TRỌNG!
NEXT_PUBLIC_API_URL=https://backend-webthubong.onrender.com

# Google OAuth (nếu có)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# NextAuth
NEXTAUTH_URL=https://your-frontend.vercel.app (sẽ biết sau khi deploy)
NEXTAUTH_SECRET=your_nextauth_secret_min_32_chars

# Cloudinary (nếu frontend cần upload trực tiếp)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🧪 Test Backend

### Test API Endpoints:

1. **Health Check**:
   ```
   https://backend-webthubong.onrender.com
   ```

2. **Products API**:
   ```
   https://backend-webthubong.onrender.com/api/products
   ```

3. **Categories API**:
   ```
   https://backend-webthubong.onrender.com/api/categories
   ```

4. **Auth API**:
   ```
   https://backend-webthubong.onrender.com/api/auth
   ```

---

## 📋 Next Steps - Deploy Frontend

### Bước 1: Chuẩn bị Frontend

1. Đảm bảo code frontend đã được push lên GitHub
2. Kiểm tra build local:
   ```bash
   npm run build
   ```

### Bước 2: Deploy lên Vercel

1. Đăng nhập Vercel: https://vercel.com
2. **New Project** → Import GitHub repo
3. Cấu hình:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (hoặc để trống)
   - **Build Command**: `npm run build`
4. **Environment Variables**: Set các biến như trên (đặc biệt là `NEXT_PUBLIC_API_URL`)
5. **Deploy**

### Bước 3: Sau Khi Deploy Frontend

1. **Lấy Frontend URL** (ví dụ: `https://your-app.vercel.app`)
2. **Cập nhật Render Backend**:
   - Vào Render Dashboard → Service backend
   - Settings → Environment → Thêm:
     ```
     FRONTEND_URL=https://your-app.vercel.app
     ```
   - Save → Backend tự động redeploy

3. **Cập nhật Google OAuth** (nếu có):
   - Google Cloud Console → Credentials
   - Thêm frontend URL vào Authorized origins
   - Thêm callback URL: `https://your-app.vercel.app/api/auth/callback/google`

4. **Cập nhật Vercel**:
   - Settings → Environment Variables
   - Update `NEXTAUTH_URL` với URL thực tế
   - Redeploy

---

## 🔧 Các File Đã Được Cập Nhật

✅ `lib/axiosConfig.ts` - Đã dùng `NEXT_PUBLIC_API_URL`
✅ `backend/server.js` - Đã hỗ trợ CORS động với `FRONTEND_URL`
✅ `next.config.mjs` - Đã thêm `backend-webthubong.onrender.com` vào remotePatterns
✅ `backend/package.json` - Đã fix entry point

---

## 📝 Checklist Trước Khi Deploy Frontend

- [ ] Code frontend đã push lên GitHub
- [ ] Test build local thành công (`npm run build`)
- [ ] Đã chuẩn bị Google OAuth credentials (nếu cần)
- [ ] Đã chuẩn bị Cloudinary credentials (nếu frontend cần upload)
- [ ] Biết rõ các environment variables cần set trên Vercel
- [ ] Đã test backend URL hoạt động

---

## 🎯 Sau Khi Deploy Xong

Bạn sẽ có:
- ✅ **Backend**: `https://backend-webthubong.onrender.com`
- ⏳ **Frontend**: `https://your-app.vercel.app` (sẽ có sau khi deploy)

**Link gửi nhà tuyển dụng**: Frontend URL

---

## 🐛 Troubleshooting

### Backend không respond:
- Kiểm tra logs trên Render
- Đảm bảo MongoDB đã connected
- Kiểm tra environment variables

### CORS Error:
- Đảm bảo đã set `FRONTEND_URL` trên Render sau khi deploy frontend
- Kiểm tra backend logs để xem CORS config

### API calls failed:
- Kiểm tra `NEXT_PUBLIC_API_URL` trên Vercel đúng chưa
- Kiểm tra network tab trong browser DevTools

---

**Lưu ý**: Backend trên Render Free Plan sẽ sleep sau 15 phút không có traffic. Lần request đầu tiên sau khi sleep sẽ mất ~30 giây để wake up.

