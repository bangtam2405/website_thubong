# Bảng mô tả thành phần giao diện chức năng đăng ký

| STT | Loại điều khiển | Nội dung thực hiện | Giá trị mặc định | Lưu ý |
|-----|-----------------|-------------------|------------------|-------|
| 1 | Input field (Text) | Họ và tên - Nhập thông tin họ tên đầy đủ của người dùng | Placeholder: "Nhập họ tên" | Bắt buộc nhập, không được để trống |
| 2 | Input field (Email) | Email - Nhập địa chỉ email để liên lạc và đăng nhập | Placeholder: "Nhập email" | Bắt buộc nhập, phải đúng định dạng email |
| 3 | Input field (Phone) | Số điện thoại - Nhập số điện thoại liên lạc | Placeholder: "0123456789" | Bắt buộc nhập, phải đúng định dạng số điện thoại Việt Nam |
| 4 | Input field (Date) | Ngày sinh - Chọn ngày tháng năm sinh | Placeholder: "mm/dd/yyyy" | Có icon calendar để chọn ngày, bắt buộc nhập |
| 5 | Radio button group | Giới tính - Chọn giới tính của người dùng | "Nam" được chọn sẵn | 3 lựa chọn: Nam, Nữ, Khác |
| 6 | Dropdown/Select | Tỉnh/Thành phố - Chọn tỉnh thành nơi cư trú | Placeholder: "Chọn tỉnh/thành..." | Bắt buộc chọn, có dấu * |
| 7 | Dropdown/Select | Phường/Xã - Chọn phường xã nơi cư trú | Placeholder: "Chọn tỉnh/thành..." | Bắt buộc chọn, có dấu *, phụ thuộc vào tỉnh/thành đã chọn |
| 8 | Input field (Text) | Địa chỉ chi tiết - Nhập địa chỉ cụ thể | Placeholder: "VD: 123 Nguyễn Huệ, Chung cư AB" | Bắt buộc nhập, mô tả chi tiết địa chỉ |
| 9 | Input field (Password) | Mật khẩu - Tạo mật khẩu cho tài khoản | Placeholder: "Tạo mật khẩu" | Có icon eye để ẩn/hiện, bắt buộc nhập |
| 10 | Input field (Password) | Xác nhận mật khẩu - Nhập lại mật khẩu để xác nhận | Placeholder: "Nhập lại mật khẩu" | Có icon eye để ẩn/hiện, phải khớp với mật khẩu |
| 11 | Button (Submit) | Đăng Ký - Nút gửi form đăng ký tài khoản | Text: "Đăng Ký" | Nút chính để hoàn tất quá trình đăng ký |

## Ghi chú bổ sung:

- **Validation**: Tất cả các trường bắt buộc phải được validate trước khi submit
- **Responsive**: Form được thiết kế responsive với 2 cột trên desktop
- **UI/UX**: Sử dụng màu hồng làm chủ đạo, phù hợp với theme "Gấu Xinh"
- **Accessibility**: Các input field có label rõ ràng và placeholder text hướng dẫn
- **Security**: Mật khẩu có tính năng ẩn/hiện và validation độ mạnh 