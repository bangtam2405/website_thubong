const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image: String,
  images: [{ type: String }],
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  sold: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  type: { 
    type: String, 
    required: true,
    enum: ['teddy', 'accessory', 'collection', 'new']
  },
  specifications: {
    material: String,
    size: String,
    weight: String,
    color: String
  },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema); 