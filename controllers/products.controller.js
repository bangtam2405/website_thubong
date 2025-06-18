const Product = require('../models/Products');

// Lấy tất cả sản phẩm, có thể lọc theo type
exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy sản phẩm theo id
exports.getById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Thêm sản phẩm mới
exports.create = async (req, res) => {
  try {
    // Validate dữ liệu đầu vào
    const { name, price, type } = req.body;
    if (!name || !price || !type) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
    }

    // Tạo sản phẩm mới với giá trị mặc định cho các trường mới
    const productData = {
      ...req.body,
      rating: 0,
      reviews: 0,
      sold: 0,
      stock: req.body.stock || 0,
      featured: req.body.featured || false,
      images: req.body.images || [],
      specifications: {
        material: req.body.specifications?.material || '',
        size: req.body.specifications?.size || '',
        weight: req.body.specifications?.weight || '',
        color: req.body.specifications?.color || ''
      }
    };

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Sửa sản phẩm
exports.update = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });

    // Cập nhật thông tin sản phẩm
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        specifications: {
          material: req.body.specifications?.material || product.specifications?.material || '',
          size: req.body.specifications?.size || product.specifications?.size || '',
          weight: req.body.specifications?.weight || product.specifications?.weight || '',
          color: req.body.specifications?.color || product.specifications?.color || ''
        }
      },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xóa sản phẩm
exports.remove = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    res.json({ success: true, message: 'Đã xóa sản phẩm thành công' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Cập nhật đánh giá sản phẩm
exports.updateRating = async (req, res) => {
  try {
    const { rating } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });

    // Cập nhật rating và reviews
    const newReviews = product.reviews + 1;
    const newRating = ((product.rating * product.reviews) + rating) / newReviews;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        rating: newRating,
        reviews: newReviews
      },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Cập nhật số lượng đã bán
exports.updateSold = async (req, res) => {
  try {
    const { quantity } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });

    // Kiểm tra số lượng tồn kho
    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Số lượng trong kho không đủ' });
    }

    // Cập nhật số lượng đã bán và tồn kho
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { sold: quantity, stock: -quantity }
      },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}; 