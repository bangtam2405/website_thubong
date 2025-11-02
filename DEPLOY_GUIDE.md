# 📘 Hướng Dẫn Deploy Dự Án Website Thú Bông

Hướng dẫn chi tiết từng bước để deploy dự án lên production và có link cho nhà tuyển dụng xem.

---

## 🎯 Tổng Quan Kiến Trúc

- **Frontend**: Next.js 15 (TypeScript) → Deploy trên **Vercel** (MIỄN PHÍ)
- **Backend**: Node.js + Express → Deploy trên **Render** hoặc **Railway** (MIỄN PHÍ)
- **Database**: MongoDB → Sử dụng **MongoDB Atlas** (MIỄN PHÍ 512MB)
- **Image Storage**: Cloudinary (MIỄN PHÍ 25GB)

---

## 📋 Bước 1: Chuẩn Bị Tài Khoản

### 1.1. Đăng ký các tài khoản miễn phí:

1. ✅ **GitHub** (nếu chưa có): https://github.com
2. ✅ **Vercel** (deploy frontend): https://vercel.com
3. ✅ **Render** (deploy backend): https://render.com
4. ✅ **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
5. ✅ **Cloudinary**: https://cloudinary.com
6. ✅ **Google Cloud Console** (cho OAuth): https://console.cloud.google.com

---

## 📋 Bước 2: Setup MongoDB Atlas

### 2.1. Tạo Cluster MongoDB Atlas

1. Đăng nhập MongoDB Atlas: https://www.mongodb.com/cloud/atlas
2. Click **"Build a Database"** → Chọn **FREE** (M0 Sandbox)
3. Chọn **Provider** (AWS) và **Region** (gần Việt Nam nhất, ví dụ: Singapore)
4. Đặt tên cluster → Click **Create**

### 2.2. Tạo Database User

1. Vào **Database Access** → Click **Add New Database User**
2. Authentication Method: **Password**
3. Username: `thubong_user` (tự đặt)
4. Password: Tạo password mạnh (COPY LẠI PASSWORD!)
5. Database User Privileges: **Read and write to any database**
6. Click **Add User**

### 2.3. Whitelist IP Address

1. Vào **Network Access** → Click **Add IP Address**
2. Chọn **Allow Access from Anywhere** (0.0.0.0/0) - hoặc thêm IP cụ thể
3. Click **Confirm**

### 2.4. Lấy Connection String

1. Vào **Deployments** → Click **Connect** trên cluster
2. Chọn **Drivers** → Chọn **Node.js**
3. Copy connection string, ví dụ:
   ```
   mongodb+srv://thubong_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Thay `<password>` bằng password vừa tạo
5. Thay `?retryWrites=true&w=majority` bằng `thubongxinh?retryWrites=true&w=majority`
6. **LƯU LẠI** connection string này, sẽ dùng ở bước deploy backend

---

## 📋 Bước 3: Setup Cloudinary

### 3.1. Tạo tài khoản Cloudinary

1. Đăng ký tại: https://cloudinary.com/users/register/free
2. Xác nhận email

### 3.2. Lấy thông tin API

1. Vào **Dashboard** → Bạn sẽ thấy:
   - **Cloud Name**: ví dụ `dalfo6cjq`
   - **API Key**: ví dụ `791655776287295`
   - **API Secret**: (click "Reveal" để xem)
2. **LƯU LẠI** 3 thông tin này

---

## 📋 Bước 4: Setup Google OAuth (Nếu cần đăng nhập bằng Google)

### 4.1. Tạo OAuth Credentials

1. Vào Google Cloud Console: https://console.cloud.google.com
2. Tạo project mới (hoặc chọn project có sẵn)
3. Vào **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Chọn **Web application**
6. **Authorized JavaScript origins**:
   - `http://localhost:3000` (cho dev)
   - `https://your-app.vercel.app` (URL sau khi deploy frontend)
7. **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-app.vercel.app/api/auth/callback/google`
8. Click **Create** → Copy **Client ID** và **Client Secret**

---

## 📋 Bước 5: Push Code Lên GitHub

### 5.1. Chuẩn bị code

1. Đảm bảo code đã chạy tốt ở local
2. Kiểm tra không có lỗi build:
   ```bash
   cd website_thubong
   npm run build
   ```

### 5.2. Push lên GitHub

1. Tạo repository mới trên GitHub
2. Push code lên:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

---

## 📋 Bước 6: Deploy Backend Lên Render

### 6.1. Tạo Service trên Render

1. Đăng nhập Render: https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect GitHub repository của bạn
4. Chọn repository chứa backend
5. Cấu hình:
   - **Name**: `thubong-backend` (hoặc tên bạn muốn)
   - **Root Directory**: `backend`
   - **Environment**: **Node**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free**

### 6.2. Cấu hình Environment Variables

Trong phần **Environment Variables**, thêm các biến sau:

```env
# MongoDB
MONGO_URI=mongodb+srv://thubong_user:PASSWORD@cluster0.xxxxx.mongodb.net/thubongxinh?retryWrites=true&w=majority

# JWT Secrets (tạo random string)
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_here_min_32_chars

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL (cần set sau khi deploy frontend xong)
FRONTEND_URL=https://your-app.vercel.app

# Port (Render tự động set, nhưng có thể để default)
PORT=5000

# VNPay (nếu cần thanh toán VNPay - để trống nếu chưa có)
VNP_TMNCODE=
VNP_HASHSECRET=
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

# MoMo (nếu cần thanh toán MoMo - để trống nếu chưa có)
MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
MOMO_SECRET_KEY=

# Email SMTP (nếu cần gửi email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com
```

**Lưu ý quan trọng:**
- Thay `PASSWORD` trong `MONGO_URI` bằng password thực tế
- Tạo JWT secrets bằng cách chạy: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 6.3. Deploy và Lấy URL Backend

1. Click **Create Web Service**
2. Đợi deploy xong (khoảng 5-10 phút)
3. Copy URL backend: `https://backend-webthubong.onrender.com` (URL thực tế)
4. **LƯU LẠI URL này** - sẽ dùng cho frontend

---

## 📋 Bước 7: Cập Nhật Frontend Cho Production

### 7.1. Cập nhật file `lib/axiosConfig.ts`

Cần thay đổi `baseURL` từ localhost sang URL backend thực tế:

```typescript
const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  withCredentials: true,
});
```

Và trong refresh token:
```typescript
const res = await axios.post(
  `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/refresh-token`,
  { refreshToken }
);
```

### 7.2. Cập nhật `next.config.mjs`

Thêm domain của backend vào `remotePatterns`:

```javascript
remotePatterns: [
      {
        protocol: 'https',
        hostname: 'backend-webthubong.onrender.com',
        pathname: '/**',
      },
  // ... các patterns khác
],
```

### 7.3. Cập nhật CORS trong Backend

**ĐÃ ĐƯỢC TỰ ĐỘNG XỬ LÝ!** 

File `backend/server.js` đã được cập nhật để tự động đọc từ biến môi trường `FRONTEND_URL`. Bạn chỉ cần:

1. Sau khi deploy frontend, quay lại Render
2. Thêm environment variable: `FRONTEND_URL=https://your-frontend.vercel.app`
3. Redeploy backend

Code đã tự động xử lý CORS động rồi, không cần sửa code nữa!

---

## 📋 Bước 8: Deploy Frontend Lên Vercel

### 8.1. Tạo Project trên Vercel

1. Đăng nhập Vercel: https://vercel.com
2. Click **Add New** → **Project**
3. Import GitHub repository
4. Chọn repository chứa frontend
5. Cấu hình:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (hoặc để trống nếu root)
   - **Build Command**: `npm run build` (hoặc để Vercel tự detect)
   - **Output Directory**: `.next` (Vercel tự detect)

### 8.2. Cấu hình Environment Variables

Trong phần **Environment Variables**, thêm:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=https://backend-webthubong.onrender.com

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Cloudinary (nếu frontend cần upload trực tiếp)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# NextAuth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_min_32_chars
```

**Lưu ý:**
- `NEXTAUTH_SECRET`: Tạo bằng lệnh: `openssl rand -base64 32`
- `NEXTAUTH_URL`: Đợi deploy xong mới biết URL, có thể update sau

### 8.3. Deploy

1. Click **Deploy**
2. Đợi build và deploy (3-5 phút)
3. Copy URL frontend: `https://your-app.vercel.app`
4. **LƯU LẠI URL này**

### 8.4. Cập Nhật CORS Backend và Google OAuth

1. **Render (Backend)**: 
   - Vào **Environment Variables** → Thêm hoặc cập nhật:
     ```
     FRONTEND_URL=https://your-app.vercel.app
     ```
   - Click **Save Changes** → Service sẽ tự động redeploy

2. **Google Cloud Console**: 
   - Vào **Credentials** → Chọn OAuth client → **Edit**
   - **Authorized JavaScript origins**: Thêm `https://your-app.vercel.app`
   - **Authorized redirect URIs**: Thêm `https://your-app.vercel.app/api/auth/callback/google`
   - Click **Save**

3. **Vercel (Frontend)**: 
   - Vào **Settings** → **Environment Variables**
   - Cập nhật `NEXTAUTH_URL=https://your-app.vercel.app`
   - Redeploy deployment mới nhất

4. **Đợi redeploy xong** → Test lại website

---

## 📋 Bước 9: Kiểm Tra và Test

### 9.1. Kiểm tra Backend

1. Mở URL backend: `https://thubong-backend.onrender.com`
2. Nếu thấy response hoặc không có lỗi 404 → OK
3. Test API: `https://thubong-backend.onrender.com/api/products` (hoặc endpoint khác)

### 9.2. Kiểm tra Frontend

1. Mở URL frontend: `https://your-app.vercel.app`
2. Kiểm tra:
   - ✅ Trang chủ load được
   - ✅ API calls hoạt động (mở DevTools → Network)
   - ✅ Đăng nhập/đăng ký (nếu có)
   - ✅ Upload ảnh (nếu có)
   - ✅ Các tính năng chính

### 9.3. Kiểm tra Logs Nếu Có Lỗi

**Backend (Render):**
- Vào Dashboard → Click service → Tab **Logs**

**Frontend (Vercel):**
- Vào Dashboard → Click project → Tab **Deployments** → Click deployment → **Functions Logs**

---

## 📋 Bước 10: Custom Domain (Tùy Chọn)

### 10.1. Thêm Domain cho Frontend (Vercel)

1. Vào Vercel Project → Settings → **Domains**
2. Thêm domain của bạn (ví dụ: `www.yourname.com`)
3. Làm theo hướng dẫn cập nhật DNS records

### 10.2. Thêm Domain cho Backend (Render)

1. Vào Render Service → Settings → **Custom Domains**
2. Thêm domain (cần upgrade plan nếu không phải free)

---

## 🐛 Xử Lý Lỗi Thường Gặp

### Lỗi: "Cannot connect to MongoDB"

**Nguyên nhân:** 
- MongoDB Atlas chưa whitelist IP
- Connection string sai
- Password sai

**Giải pháp:**
- Kiểm tra Network Access trên MongoDB Atlas
- Kiểm tra lại connection string trong environment variables
- Đảm bảo đã thay `<password>` bằng password thực

### Lỗi: "CORS error"

**Nguyên nhân:** 
- Backend chưa cho phép origin của frontend

**Giải pháp:**
- Cập nhật CORS trong `backend/server.js` với URL frontend chính xác
- Redeploy backend

### Lỗi: "API calls failed"

**Nguyên nhân:** 
- `NEXT_PUBLIC_API_URL` chưa được set hoặc sai

**Giải pháp:**
- Kiểm tra Environment Variables trên Vercel
- Đảm bảo biến bắt đầu bằng `NEXT_PUBLIC_` để client-side có thể truy cập

### Lỗi: "Image upload failed"

**Nguyên nhân:** 
- Cloudinary chưa được cấu hình đúng

**Giải pháp:**
- Kiểm tra lại Cloudinary credentials
- Đảm bảo đã set đủ: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### Lỗi: "Build failed on Vercel"

**Nguyên nhân:** 
- TypeScript errors
- Missing dependencies
- Memory issues

**Giải pháp:**
- Fix TypeScript errors (hoặc để `ignoreBuildErrors: true` như đã có)
- Kiểm tra `package.json` dependencies
- Xem build logs trên Vercel để biết lỗi cụ thể

---

## ✅ Checklist Sau Khi Deploy

- [ ] Backend deploy thành công và có thể truy cập
- [ ] Frontend deploy thành công và load được
- [ ] API calls từ frontend đến backend hoạt động
- [ ] MongoDB kết nối thành công (check logs backend)
- [ ] Upload ảnh lên Cloudinary hoạt động
- [ ] Đăng nhập/đăng ký hoạt động (nếu có)
- [ ] Các tính năng chính của website hoạt động
- [ ] Mobile responsive hoạt động tốt
- [ ] Không có lỗi trong Console (F12)

---

## 📝 Tổng Kết URLs

Sau khi deploy xong, bạn sẽ có:

1. **Frontend URL**: `https://your-app.vercel.app`
2. **Backend URL**: `https://backend-webthubong.onrender.com` ✅ ĐÃ DEPLOY
3. **MongoDB Atlas**: Connection string (không cần public URL)
4. **Cloudinary**: Dashboard để quản lý ảnh

**Link chính để gửi nhà tuyển dụng**: **Frontend URL** (`https://your-app.vercel.app`)

---

## 🎉 Hoàn Thành!

Bây giờ bạn đã có một website live trên internet! 🚀

Chia sẻ link frontend với nhà tuyển dụng và đừng quên:
- Đảm bảo website hoạt động ổn định
- Test kỹ các tính năng trước khi gửi
- Chuẩn bị demo video/presentation nếu cần
- Backup code và environment variables

Chúc bạn thành công! 💪

