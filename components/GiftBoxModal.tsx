import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';

interface GiftBox {
  _id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  description?: string;
}

interface GiftBoxModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (giftBox: GiftBox | null) => void;
}

const GiftBoxModal: React.FC<GiftBoxModalProps> = ({ open, onClose, onSelect }) => {
  const [giftBoxes, setGiftBoxes] = useState<GiftBox[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/giftboxes`)
        .then(res => res.json())
        .then(data => setGiftBoxes(data))
        .finally(() => setLoading(false));
    }
  }, [open]);

  const handleSelect = () => {
    const box = giftBoxes.find(g => g._id === selected) || null;
    onSelect(box);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={open ? onClose : undefined}>
      <DialogContent className="max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chọn hộp quà (không bắt buộc)</DialogTitle>
        </DialogHeader>
        {loading ? <div>Đang tải...</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {giftBoxes.map(box => (
              <div
                key={box._id}
                className={`border rounded-lg p-2 cursor-pointer transition-all ${selected === box._id ? 'border-pink-500 bg-pink-50' : 'hover:border-gray-300'}`}
                onClick={() => setSelected(box._id)}
              >
                <img src={box.image} alt={box.name} className="w-full h-32 object-cover rounded mb-2" />
                <div className="font-medium text-base mb-1">{box.name}</div>
                <div className="text-pink-500 font-bold mb-1">{box.price.toLocaleString('vi-VN')}₫</div>
                <div className="text-xs text-gray-500 mb-1">Còn lại: {box.quantity}</div>
                {box.description && <div className="text-xs text-gray-600">{box.description}</div>}
              </div>
            ))}
          </div>
        )}
        <DialogFooter className="mt-4 flex gap-2 justify-end">
          <Button variant="outline" onClick={() => { onSelect(null); onClose(); }}>Bỏ qua</Button>
          <Button onClick={handleSelect} disabled={!selected}>Chọn hộp quà</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GiftBoxModal; 