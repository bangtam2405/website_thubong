# 🔧 Khắc Phục Lỗi - Quản Lý Danh Mục Sản Phẩm

## 🚨 Lỗi Thường Gặp

### 1. Lỗi "Could not establish connection. Receiving end does not exist."

**Nguyên nhân:** Server chưa khởi động hoặc có lỗi trong code

**Cách khắc phục:**
```bash
# 1. Kiểm tra server có chạy không
cd backend
node server.js

# 2. Nếu có lỗi, chạy setup script
node setup-product-categories.js

# 3. Test API
node test-api.js
```

### 2. Lỗi "argument handler must be a function"

**Nguyên nhân:** Middleware không được import đúng cách

**Cách khắc phục:**
- Đã sửa trong `backend/routes/productCategoryRoutes.js`
- Sử dụng `verifyToken` và `checkAdmin` thay vì `auth` và `adminOnly`

### 3. Lỗi "TypeError: Cannot read property 'type' of undefined"

**Nguyên nhân:** Model Products không có enum type 'giftbox'

**Cách khắc phục:**
- Đã thêm 'giftbox' vào enum trong `backend/models/Products.js`

## 🔍 Kiểm Tra Từng Bước

### Bước 1: Kiểm tra Database
```bash
cd backend
node setup-product-categories.js
```

### Bước 2: Kiểm tra Server
```bash
cd backend
node server.js
```

### Bước 3: Test API
```bash
cd backend
node test-api.js
```

### Bước 4: Kiểm tra Frontend
```bash
npm run dev
# Truy cập: http://localhost:3000/admin/product-categories
```

## 📋 Checklist Khắc Phục

- [ ] MongoDB đã kết nối thành công
- [ ] Dữ liệu mẫu đã được tạo
- [ ] Server khởi động không có lỗi
- [ ] API endpoints hoạt động
- [ ] Frontend có thể truy cập
- [ ] Admin có quyền truy cập

## 🛠️ Debug Commands

```bash
# Kiểm tra MongoDB connection
cd backend
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB OK')).catch(console.error)"

# Kiểm tra model
node -e "require('dotenv').config(); const mongoose = require('mongoose'); const ProductCategory = require('./models/ProductCategory'); mongoose.connect(process.env.MONGO_URI).then(async () => { const cats = await ProductCategory.find(); console.log('Categories:', cats.length); process.exit(0); })"

# Test API endpoints
curl http://localhost:5000/api/product-categories
```

## 📞 Liên Hệ Hỗ Trợ

Nếu vẫn gặp lỗi, hãy:
1. Kiểm tra console log của server
2. Kiểm tra Network tab trong browser
3. Chạy các script test
4. Cung cấp thông tin lỗi chi tiết