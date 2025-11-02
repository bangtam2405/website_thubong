# ✅ Checklist Cấu Hình Render - Backend

## 🔍 Kiểm Tra Sau Khi Deploy

### 1. Kiểm Tra Logs
Sau khi deploy xong, vào **Logs** tab và tìm:

✅ **Thành công nếu thấy:**
```
MongoDB connected
Server running on port 5000
```

❌ **Lỗi nếu thấy:**
```
MongoDB connect error: ...
Error: ...
```

### 2. Kiểm Tra Environment Variables

Vào **Settings** → **Environment** và đảm bảo có đầy đủ:

#### Bắt buộc:
- ✅ `MONGO_URI` - Connection string từ MongoDB Atlas
- ✅ `JWT_SECRET` - Secret key cho JWT (min 32 chars)
- ✅ `JWT_REFRESH_SECRET` - Secret key cho refresh token (min 32 chars)
- ✅ `CLOUDINARY_CLOUD_NAME` - Từ Cloudinary dashboard
- ✅ `CLOUDINARY_API_KEY` - Từ Cloudinary dashboard
- ✅ `CLOUDINARY_API_SECRET` - Từ Cloudinary dashboard

#### Tùy chọn (sẽ thêm sau):
- `FRONTEND_URL` - URL frontend (thêm sau khi deploy frontend)
- `PORT` - Render tự set, không cần thiết
- `VNP_TMNCODE`, `VNP_HASHSECRET` - Nếu dùng VNPay
- `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`, `MOMO_SECRET_KEY` - Nếu dùng MoMo
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Nếu dùng email

### 3. Kiểm Tra Cấu Hình Build & Deploy

Vào **Settings** → **Build & Deploy**:

| Setting | Giá trị đúng |
|---------|--------------|
| **Root Directory** | `./` hoặc để trống (vì backend là repo riêng) |
| **Environment** | `Node` |
| **Node Version** | `22.16.0` (hoặc để default) |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` hoặc `node server.js` |

### 4. Test Backend URL

Sau khi deploy xong, bạn sẽ có URL như:
```
https://your-backend-name.onrender.com
```

**Test endpoints:**
- Mở browser: `https://your-backend-name.onrender.com`
- Test API: `https://your-backend-name.onrender.com/api/products`
- Test health: `https://your-backend-name.onrender.com/api/health` (nếu có)

### 5. Fix Vulnerabilities (Sau khi deploy xong)

Sau khi đảm bảo mọi thứ hoạt động:

1. Pull code về local:
   ```bash
   cd backend
   npm audit fix
   git add package.json package-lock.json
   git commit -m "Fix: Update dependencies to fix vulnerabilities"
   git push
   ```

2. Render sẽ tự động redeploy với dependencies mới

---

## 🐛 Các Lỗi Thường Gặp

### Lỗi: "MongoDB connect error"
**Giải pháp:**
- Kiểm tra `MONGO_URI` có đúng format không
- Kiểm tra MongoDB Atlas đã whitelist IP (0.0.0.0/0)
- Kiểm tra password trong connection string có đúng không

### Lỗi: "Cannot find module..."
**Giải pháp:**
- Kiểm tra `package.json` có đầy đủ dependencies không
- Đảm bảo `npm install` chạy thành công trong build logs

### Lỗi: "JWT_SECRET is not defined"
**Giải pháp:**
- Thêm `JWT_SECRET` và `JWT_REFRESH_SECRET` vào Environment Variables
- Tạo secret bằng: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Backend bị sleep (free plan)
**Giải pháp:**
- Render free plan sẽ sleep sau 15 phút không có traffic
- Lần request đầu sau khi sleep sẽ mất ~30 giây
- Đây là hành vi bình thường của free plan

---

## ✅ Checklist Cuối Cùng

- [ ] Backend deploy thành công (không có lỗi trong logs)
- [ ] MongoDB connected (thấy trong logs)
- [ ] Server running (thấy "Server running on port 5000")
- [ ] Test URL backend mở được (hoặc thấy response)
- [ ] Test API endpoint hoạt động
- [ ] Lưu lại backend URL để dùng cho frontend

**Backend URL của bạn**: `https://your-backend-name.onrender.com`

Lưu lại URL này, sẽ cần dùng khi deploy frontend! 🚀

