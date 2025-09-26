# 🎨 Hệ thống hiển thị chi tiết bộ phận tùy chỉnh gấu bông

## Tổng quan

Hệ thống này được thiết kế để giúp nhà sản xuất dễ dàng nhận đơn hàng và hiểu rõ các bộ phận khách hàng đã tùy chỉnh trên con gấu bông. Hệ thống bao gồm:

1. **CustomPartsDisplay**: Component chi tiết hiển thị đầy đủ thông tin các bộ phận
2. **CustomPartsSummary**: Component tóm tắt hiển thị trong danh sách đơn hàng
3. **Tích hợp vào trang admin**: Hiển thị chi tiết cho nhà sản xuất
4. **Tích hợp vào trang khách hàng**: Hiển thị thông tin cho khách hàng
5. **Export PDF**: Bao gồm thông tin chi tiết trong file PDF

## 🚀 Cách sử dụng

### 1. Component CustomPartsDisplay

Component này hiển thị đầy đủ thông tin các bộ phận tùy chỉnh:

```tsx
import CustomPartsDisplay from "@/components/CustomPartsDisplay";

<CustomPartsDisplay 
  parts={customParts}
  categories={categories}
  size={size}
  material={material}
/>
```

**Props:**
- `parts`: Object chứa thông tin các bộ phận (body, ears, eyes, nose, mouth, furColor, clothing, accessories)
- `categories`: Array các category để lấy tên bộ phận từ ID
- `size`: Kích thước gấu bông
- `material`: Chất liệu gấu bông

### 2. Component CustomPartsSummary

Component này hiển thị tóm tắt thông tin trong danh sách:

```tsx
import CustomPartsSummary from "@/components/CustomPartsSummary";

<CustomPartsSummary 
  parts={customParts}
  categories={categories}
/>
```

## 📋 Thông tin hiển thị

### Các bộ phận chính:
- **Thân** (bắt buộc): Hình dạng cơ thể gấu bông
- **Tai** (bắt buộc): Hình dạng tai
- **Mắt** (bắt buộc): Kiểu mắt
- **Mũi** (tùy chọn): Kiểu mũi
- **Miệng** (tùy chọn): Kiểu miệng
- **Màu lông** (tùy chọn): Màu sắc lông
- **Quần áo** (tùy chọn): Trang phục cho gấu
- **Phụ kiện** (tùy chọn): Các phụ kiện đi kèm

### Thông tin bổ sung:
- **Kích thước**: Nhỏ, Vừa, Lớn
- **Chất liệu**: Bông, Len, Tơ, Da, hoặc kết hợp
- **Ghi chú cho nhà sản xuất**: Hướng dẫn sản xuất

## 🔧 Tích hợp vào hệ thống

### Trang Admin Order Detail
- Hiển thị đầy đủ thông tin bộ phận
- Bao gồm trong PDF export
- Ghi chú rõ ràng cho nhà sản xuất

### Trang Khách hàng Order Detail
- Hiển thị chi tiết bộ phận đã chọn
- Giúp khách hàng xác nhận đơn hàng

### Trang Danh sách đơn hàng
- Hiển thị tóm tắt thông tin tùy chỉnh
- Giúp khách hàng nhanh chóng xem đơn hàng

## 📊 Cấu trúc dữ liệu

### Model Order
```javascript
{
  products: [
    {
      product: ObjectId | String, // ID sản phẩm hoặc design
      productInfo: {
        customData: {
          parts: {
            body: String,      // ID category body
            ears: String,      // ID category ears
            eyes: String,      // ID category eyes
            nose: String,      // ID category nose
            mouth: String,     // ID category mouth
            furColor: String,  // ID category furColor
            clothing: String,  // ID category clothing
            accessories: [String] | {[id]: quantity}, // Array hoặc Object
            size: String,      // small, medium, large
            material: String   // cotton, wool, silk, leather
          }
        }
      }
    }
  ]
}
```

### Model Category
```javascript
{
  _id: ObjectId,
  name: String,        // Tên bộ phận
  type: String,        // Loại: body, ear, eye, clothing, accessory, option
  image: String,       // Hình ảnh bộ phận
  price: Number        // Giá bộ phận
}
```

## 🎯 Lợi ích

### Cho nhà sản xuất:
- **Thông tin rõ ràng**: Biết chính xác các bộ phận cần sản xuất
- **Hướng dẫn chi tiết**: Ghi chú cụ thể cho từng đơn hàng
- **PDF đầy đủ**: Có thể in và sử dụng làm tài liệu sản xuất
- **Tiết kiệm thời gian**: Không cần hỏi lại khách hàng

### Cho khách hàng:
- **Xác nhận đơn hàng**: Thấy rõ các bộ phận đã chọn
- **Theo dõi đơn hàng**: Biết trạng thái sản xuất
- **Thông tin đầy đủ**: Hiểu rõ sản phẩm sẽ nhận

### Cho hệ thống:
- **Quản lý hiệu quả**: Theo dõi đơn hàng tùy chỉnh dễ dàng
- **Báo cáo chi tiết**: Thống kê sản phẩm tùy chỉnh
- **Tích hợp hoàn chỉnh**: Hoạt động với toàn bộ hệ thống

## 🚀 Triển khai

1. **Cài đặt components**: Copy các component vào thư mục components
2. **Tích hợp vào trang admin**: Thêm CustomPartsDisplay vào trang order detail
3. **Tích hợp vào trang khách hàng**: Thêm vào trang order detail và danh sách
4. **Cập nhật PDF export**: Bao gồm thông tin bộ phận tùy chỉnh
5. **Kiểm tra API**: Đảm bảo API categories hoạt động

## 🔍 Troubleshooting

### Vấn đề thường gặp:
1. **Không hiển thị thông tin**: Kiểm tra cấu trúc dữ liệu parts
2. **Lỗi categories**: Đảm bảo API categories trả về đúng format
3. **PDF không có thông tin**: Kiểm tra logic trong handleExportPDF

### Debug:
- Console.log để kiểm tra dữ liệu
- Kiểm tra Network tab để xem API calls
- Xác nhận cấu trúc dữ liệu trong database

## 📝 Ghi chú

- Hệ thống hỗ trợ cả array và object cho accessories
- Tự động xử lý các trường hợp dữ liệu null/undefined
- Responsive design cho mobile và desktop
- Tích hợp với hệ thống authentication hiện tại
