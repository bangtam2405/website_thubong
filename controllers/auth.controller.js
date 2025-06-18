const bcrypt = require('bcrypt');
const User = require('../models/user');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email đã được đăng ký" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, email, password: hashedPassword, role: "user" });

    res.status(201).json({ message: "Tạo tài khoản thành công", userId: newUser._id });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Cập nhật tên người dùng
exports.updateProfile = async (req, res) => {
  try {
    const { userId, username } = req.body;
    if (!userId || !username) return res.status(400).json({ success: false, error: "Thiếu userId hoặc username" });
    const user = await User.findByIdAndUpdate(userId, { username }, { new: true });
    if (!user) return res.status(404).json({ success: false, error: "Không tìm thấy user" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 