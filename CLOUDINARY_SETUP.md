# Hướng dẫn tích hợp Cloudinary

## 1. Đăng ký tài khoản Cloudinary

1. Truy cập [Cloudinary](https://cloudinary.com/) và đăng ký tài khoản miễn phí
2. Sau khi đăng ký, vào Dashboard để lấy thông tin cấu hình

## 2. Lấy thông tin cấu hình

Trong Dashboard Cloudinary, bạn sẽ thấy:
- **Cloud Name**: Tên cloud của bạn
- **API Key**: Khóa API
- **API Secret**: Bí mật API

## 3. Cấu hình biến môi trường

Tạo file `.env.local` trong thư mục gốc của dự án:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Database Configuration
MONGODB_URI=your_mongodb_uri

# JWT Secret
JWT_SECRET=your_jwt_secret
```

**Lưu ý**: Thay thế `your_cloud_name`, `your_api_key`, `your_api_secret` bằng thông tin thực từ Cloudinary Dashboard.

## 4. Các component đã được tích hợp

### ImageUpload Component
- Upload một hình ảnh
- Hỗ trợ kéo thả
- Preview hình ảnh
- Validation kích thước và loại file

### MultipleImageUpload Component
- Upload nhiều hình ảnh cùng lúc
- Giới hạn số lượng ảnh
- Xóa từng ảnh riêng lẻ

### useImageUpload Hook
- Custom hook để quản lý upload
- Xử lý lỗi và loading state

## 5. Cách sử dụng

### Trong form đơn giản:
```tsx
import ImageUpload from "@/components/ImageUpload";

function MyForm() {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <form>
      <ImageUpload 
        onImageUploaded={setImageUrl}
        currentImage={imageUrl}
        folder="products"
      />
    </form>
  );
}
```

### Upload nhiều ảnh:
```tsx
import MultipleImageUpload from "@/components/MultipleImageUpload";

function MyForm() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  return (
    <form>
      <MultipleImageUpload 
        onImagesUploaded={setImageUrls}
        currentImages={imageUrls}
        folder="gallery"
        maxImages={5}
      />
    </form>
  );
}
```

### Sử dụng hook:
```tsx
import { useImageUpload } from "@/hooks/useImageUpload";

function MyComponent() {
  const { isUploading, uploadImage } = useImageUpload();

  const handleFileChange = async (file: File) => {
    const url = await uploadImage(file, 'custom-folder');
    if (url) {
      console.log('Uploaded:', url);
    }
  };

  return (
    <div>
      {isUploading && <p>Đang upload...</p>}
      <input type="file" onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])} />
    </div>
  );
}
```

## 6. Cấu trúc thư mục Cloudinary

Hình ảnh sẽ được tổ chức theo thư mục:
- `website_thubong/` - Thư mục gốc
- `website_thubong/products/` - Ảnh sản phẩm
- `website_thubong/categories/` - Ảnh danh mục
- `website_thubong/parts/` - Ảnh các phần thú nhồi bông
- `website_thubong/gallery/` - Ảnh gallery

## 7. Tính năng bảo mật

- Validation loại file (chỉ chấp nhận hình ảnh)
- Giới hạn kích thước file (tối đa 5MB)
- Sử dụng HTTPS cho tất cả URL
- Tự động tối ưu hóa hình ảnh

## 8. Xử lý lỗi

Các lỗi thường gặp:
- **File quá lớn**: Giảm kích thước file xuống dưới 5MB
- **Sai loại file**: Chỉ upload file hình ảnh (JPG, PNG, GIF)
- **Lỗi mạng**: Kiểm tra kết nối internet
- **Lỗi cấu hình**: Kiểm tra biến môi trường Cloudinary

## 9. Tối ưu hóa

Cloudinary tự động:
- Nén hình ảnh
- Chuyển đổi format tối ưu
- Tạo nhiều kích thước khác nhau
- CDN toàn cầu

## 10. Monitoring

Theo dõi sử dụng trong Cloudinary Dashboard:
- Số lượng upload
- Dung lượng sử dụng
- Bandwidth
- Transformations

## Lưu ý quan trọng

1. **Không commit file .env.local** vào git
2. **Backup thông tin Cloudinary** ở nơi an toàn
3. **Kiểm tra quota** miễn phí của Cloudinary
4. **Test kỹ** trước khi deploy production 