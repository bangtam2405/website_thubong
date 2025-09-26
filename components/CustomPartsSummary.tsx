import React from 'react';
import { Badge } from '@/components/ui/badge';

interface CustomPartsSummaryProps {
  parts: {
    body?: string;
    ears?: string;
    eyes?: string;
    nose?: string;
    mouth?: string;
    furColor?: string;
    clothing?: string;
    accessories?: string[] | { [key: string]: number };
    size?: string;
    material?: string;
    sizeName?: string;
    materialPrice?: number;
    giftBox?: any;
  };
  categories: Array<{
    _id: string;
    name: string;
    type: string;
  }>;
}

export default function CustomPartsSummary({ parts, categories }: CustomPartsSummaryProps) {
  // Hàm lấy tên bộ phận từ ID hoặc tên trực tiếp
  const getPartName = (partId: string, directName?: string) => {
    // Nếu có tên trực tiếp và không phải null/undefined, ưu tiên sử dụng
    if (directName && directName !== null && directName !== undefined && directName.toString().trim() !== '') {
      return directName.toString();
    }
    
    // Nếu không có tên trực tiếp, tìm trong categories
    if (!partId || (typeof partId === 'string' && partId.trim() === '')) return '--';
    
    const category = categories.find(cat => cat._id === partId);
    return category ? category.name : '--';
  };

  // Lấy tên các bộ phận - truy cập trực tiếp từ parts
  const bodyName = (() => {
    if (parts.body !== undefined && parts.body !== null && typeof parts.body === 'string' && parts.body.trim() !== '') {
      // Kiểm tra xem có phải ObjectId không
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(parts.body);
      if (isObjectId) {
        // Nếu là ObjectId, tìm trong categories
        const bodyCategory = categories.find(cat => cat._id === parts.body);
        return bodyCategory?.name || 'Chưa chọn';
      } else {
        // Nếu không phải ObjectId, sử dụng trực tiếp
        return parts.body;
      }
    }
    return 'Chưa chọn';
  })();
  
  const earsName = (() => {
    if (parts.ears !== undefined && parts.ears !== null && typeof parts.ears === 'string' && parts.ears.trim() !== '') {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(parts.ears);
      if (isObjectId) {
        const earsCategory = categories.find(cat => cat._id === parts.ears);
        return earsCategory?.name || 'Chưa chọn';
      } else {
        return parts.ears;
      }
    }
    return 'Chưa chọn';
  })();
  
  const eyesName = (() => {
    if (parts.eyes !== undefined && parts.eyes !== null && typeof parts.eyes === 'string' && parts.eyes.trim() !== '') {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(parts.eyes);
      if (isObjectId) {
        const eyesCategory = categories.find(cat => cat._id === parts.eyes);
        return eyesCategory?.name || 'Chưa chọn';
      } else {
        return parts.eyes;
      }
    }
    return 'Chưa chọn';
  })();
  
  const noseName = (() => {
    if (parts.nose !== undefined && parts.nose !== null && typeof parts.nose === 'string' && parts.nose.trim() !== '') {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(parts.nose);
      if (isObjectId) {
        const noseCategory = categories.find(cat => cat._id === parts.nose);
        return noseCategory?.name || 'Chưa chọn';
      } else {
        return parts.nose;
      }
    }
    return 'Chưa chọn';
  })();
  
  const mouthName = (() => {
    if (parts.mouth !== undefined && parts.mouth !== null && typeof parts.mouth === 'string' && parts.mouth.trim() !== '') {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(parts.mouth);
      if (isObjectId) {
        const mouthCategory = categories.find(cat => cat._id === parts.mouth);
        return mouthCategory?.name || 'Chưa chọn';
      } else {
        return parts.mouth;
      }
    }
    return 'Chưa chọn';
  })();
  
  const furColorName = (() => {
    if (parts.furColor !== undefined && parts.furColor !== null && typeof parts.furColor === 'string' && parts.furColor.trim() !== '') {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(parts.furColor);
      if (isObjectId) {
        const furCategory = categories.find(cat => cat._id === parts.furColor);
        return furCategory?.name || 'Chưa chọn';
      } else {
        return parts.furColor;
      }
    }
    return 'Chưa chọn';
  })();
  
  const clothingName = (() => {
    if (parts.clothing !== undefined && parts.clothing !== null && typeof parts.clothing === 'string' && parts.clothing.trim() !== '') {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(parts.clothing);
      if (isObjectId) {
        const clothingCategory = categories.find(cat => cat._id === parts.clothing);
        return clothingCategory?.name || 'Chưa chọn';
      } else {
        return parts.clothing;
      }
    }
    return 'Chưa chọn';
  })();

  // Xử lý accessories
  const getAccessoriesText = () => {
    if (!parts.accessories || (Array.isArray(parts.accessories) && parts.accessories.length === 0) || 
        (typeof parts.accessories === 'object' && Object.keys(parts.accessories).length === 0)) {
      return 'Không có';
    }

    if (Array.isArray(parts.accessories)) {
      return parts.accessories.map(accItem => {
        // Kiểm tra xem có phải ObjectId không
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(accItem);
        if (isObjectId) {
          const accCategory = categories.find(cat => cat._id === accItem);
          return accCategory?.name || accItem;
        } else {
          // Nếu không phải ObjectId, sử dụng trực tiếp
          return accItem;
        }
      }).join(', ');
    } else if (typeof parts.accessories === 'object') {
      return Object.entries(parts.accessories).map(([accId, quantity]) => {
        // Kiểm tra xem có phải ObjectId không
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(accId);
        if (isObjectId) {
          const accCategory = categories.find(cat => cat._id === accId);
          return `${accCategory?.name || accId} (x${quantity})`;
        } else {
          // Nếu không phải ObjectId, sử dụng trực tiếp
          return `${accId} (x${quantity})`;
        }
      }).join(', ');
    }

    return 'Không có';
  };

  const accessoriesText = getAccessoriesText();

  // Xử lý kích thước - ưu tiên sizeName từ specifications
  const getSizeText = (sizeValue?: string) => {
    // Ưu tiên sizeName từ specifications
    if (parts.sizeName && parts.sizeName !== null && typeof parts.sizeName === 'string' && parts.sizeName.trim() !== '') {
      return parts.sizeName;
    }
    
    if (!sizeValue) return '--';
    if (sizeValue === 'small') return 'Nhỏ';
    if (sizeValue === 'medium') return 'Vừa';
    if (sizeValue === 'large') return 'Lớn';
    return sizeValue;
  };

  // Xử lý chất liệu - ưu tiên material từ specifications
  const getMaterialText = (materialValue?: string) => {
    // Ưu tiên material từ specifications
    if (parts.material && parts.material !== null && typeof parts.material === 'string' && parts.material.trim() !== '') {
      return parts.material;
    }
    
    if (!materialValue) return '--';
    if (materialValue === 'cotton') return 'Bông';
    if (materialValue === 'wool') return 'Len';
    if (materialValue === 'silk') return 'Tơ';
    if (materialValue === 'leather') return 'Da';
    if (materialValue === 'cotton-wool') return 'Bông Len';
    if (materialValue === 'cotton-silk') return 'Bông Tơ';
    if (materialValue === 'wool-silk') return 'Len Tơ';
    if (materialValue === 'cotton-wool-silk') return 'Bông Len Tơ';
    return materialValue;
  };

  const sizeText = getSizeText(parts.size);
  const materialText = getMaterialText(parts.material);

  // Tạo danh sách các bộ phận có thông tin
  const partDetails = [
    { label: 'Thân', value: bodyName },
    { label: 'Mắt', value: eyesName },
    { label: 'Miệng', value: mouthName },
    { label: 'Màu lông', value: furColorName },
    { label: 'Phụ kiện', value: accessoriesText },
    { label: 'Kích thước', value: sizeText || '--' },
    { label: 'Chất liệu', value: materialText || '--' },
  ].filter(part => part.value !== '--' && part.value !== 'Chưa chọn' && part.value !== 'Không có');

  if (partDetails.length === 0) {
    return (
      <div className="text-sm text-gray-500 mt-2">
        <Badge variant="outline" className="text-xs">
          Gấu bông tùy chỉnh
        </Badge>
        <span className="ml-2">Chưa có thông tin chi tiết</span>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <Badge variant="outline" className="text-xs mb-2">
        🎨 Gấu bông tùy chỉnh
      </Badge>
      <div className="text-xs text-gray-600 space-y-1">
        {partDetails.slice(0, 4).map((part, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="font-medium text-gray-700">{part.label}:</span>
            <span>{part.value}</span>
          </div>
        ))}
        {partDetails.length > 4 && (
          <div className="text-gray-500 italic">
            +{partDetails.length - 4} bộ phận khác...
          </div>
        )}
      </div>
    </div>
  );
}
