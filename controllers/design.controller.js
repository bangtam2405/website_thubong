// Xóa thiết kế
exports.deleteDesign = async (req, res) => {
  try {
    const { id } = req.params;
    await Design.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 