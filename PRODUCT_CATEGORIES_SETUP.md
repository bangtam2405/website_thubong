# Quản Lý Danh Mục Sản Phẩm - Hướng Dẫn Setup

## 🎯 Tính Năng Mới

Website đã được bổ sung tính năng **Quản lý danh mục sản phẩm chính** bao gồm:
- **Teddy** - Các mẫu thú bông teddy
- **Bộ Sưu Tập** - Bộ sưu tập đặc biệt
- **Phụ Kiện** - Phụ kiện trang trí
- **Hàng Mới** - Sản phẩm mới nhất
- **Hộp Quà** - Combo thú bông + phụ kiện

## 📁 Files Đã Tạo

### Frontend (Next.js)
- `app/admin/product-categories/page.tsx` - Trang quản lý danh mục sản phẩm
- `app/admin/layout.tsx` - Cập nhật menu admin

### Backend (Node.js)
- `backend/models/ProductCategory.js` - Model danh mục sản phẩm
- `backend/controllers/productCategory.controller.js` - Controller xử lý API
- `backend/routes/productCategoryRoutes.js` - Routes API
- `backend/scripts/initProductCategories.js` - Script khởi tạo dữ liệu mẫu
- `backend/server.js` - Thêm route mới

## 🚀 Cách Setup

### 1. Khởi tạo Database
```bash
cd backend
node scripts/initProductCategories.js
```

### 2. Khởi động Backend
```bash
cd backend
npm start
```

### 3. Khởi động Frontend
```bash
npm run dev
```

## 📊 Tính Năng Quản Lý

### Trang Admin: `/admin/product-categories`

#### ✅ Chức năng có sẵn:
- **Xem danh sách** - Hiển thị tất cả danh mục sản phẩm
- **Thêm mới** - Tạo danh mục sản phẩm mới
- **Chỉnh sửa** - Cập nhật thông tin danh mục
- **Xóa** - Xóa danh mục (chỉ khi không có sản phẩm nào)
- **Tìm kiếm** - Tìm kiếm theo tên, mô tả, loại
- **Sắp xếp** - Theo thứ tự hiển thị

#### 🎨 Thông tin danh mục:
- **Tên danh mục** - VD: "Teddy", "Bộ Sưu Tập"
- **Loại** - teddy, collection, accessory, new, giftbox
- **Mô tả** - Mô tả ngắn về danh mục
- **Icon** - Emoji hoặc icon đại diện
- **Màu sắc** - Màu chủ đạo của danh mục
- **Hình ảnh** - Ảnh đại diện danh mục
- **Trạng thái** - Đang hoạt động/Đã ẩn
- **Thứ tự** - Thứ tự hiển thị trong menu
- **Số sản phẩm** - Số lượng sản phẩm trong danh mục

## 🔗 API Endpoints

### Admin Routes (Cần đăng nhập + quyền admin)
- `GET /api/product-categories/admin` - Lấy tất cả danh mục
- `GET /api/product-categories/admin/:id` - Lấy danh mục theo ID
- `POST /api/product-categories/admin` - Tạo danh mục mới
- `PUT /api/product-categories/admin/:id` - Cập nhật danh mục
- `DELETE /api/product-categories/admin/:id` - Xóa danh mục
- `PUT /api/product-categories/admin/order` - Cập nhật thứ tự

### Public Routes
- `GET /api/product-categories` - Lấy danh mục đang hoạt động
- `GET /api/product-categories/:id` - Lấy danh mục theo ID

## 📈 Thống Kê Dashboard

Trang admin chính (`/admin`) đã được cập nhật với:
- **Card thống kê** - Hiển thị số lượng sản phẩm theo từng danh mục
- **Menu navigation** - Thêm link "Danh mục sản phẩm" trong sidebar

## 🔧 Cấu Trúc Database

### Collection: `productcategories`
```javascript
{
  _id: ObjectId,
  name: String,           // Tên danh mục
  type: String,           // teddy, collection, accessory, new, giftbox
  description: String,    // Mô tả
  image: String,          // URL hình ảnh
  icon: String,           // Emoji icon
  color: String,          // Màu hex
  isActive: Boolean,      // Trạng thái hoạt động
  sortOrder: Number,      // Thứ tự hiển thị
  productCount: Number,   // Số sản phẩm (tính động)
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 Lợi Ích

1. **Quản lý tập trung** - Tất cả danh mục sản phẩm chính trong một nơi
2. **Dễ dàng mở rộng** - Thêm danh mục mới dễ dàng
3. **Thống kê chi tiết** - Theo dõi số lượng sản phẩm theo danh mục
4. **Tùy chỉnh giao diện** - Icon, màu sắc, hình ảnh cho từng danh mục
5. **Quản lý trạng thái** - Ẩn/hiện danh mục linh hoạt

## 🚨 Lưu Ý

- **Xóa danh mục**: Chỉ xóa được khi không có sản phẩm nào trong danh mục
- **Tên danh mục**: Phải là duy nhất
- **Loại danh mục**: Phải thuộc một trong các giá trị: teddy, collection, accessory, new, giftbox
- **Quyền truy cập**: Chỉ admin mới có thể quản lý danh mục sản phẩm

## 🔄 Cập Nhật Tương Lai

- [ ] Tích hợp với trang sản phẩm frontend
- [ ] Thêm tính năng kéo thả sắp xếp
- [ ] Export/Import danh mục
- [ ] Thống kê doanh thu theo danh mục
- [ ] SEO optimization cho từng danh mục