import React from 'react';
import { Badge } from '@/components/ui/badge';

interface CustomPart {
  id: string;
  name: string;
  image?: string;
  type: string;
  price?: number;
}

interface MainPart {
  label: string;
  info: CustomPart | CustomPart[];
  required: boolean;
  isAccessories?: boolean;
}

interface CustomPartsDisplayProps {
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
    image?: string;
    price?: number;
  }>;
  size?: string;
  material?: string;
}

export default function CustomPartsDisplay({ parts, categories, size, material }: CustomPartsDisplayProps) {
  // Hàm lấy thông tin bộ phận từ ID hoặc tên trực tiếp
  const getPartInfo = (partId: string, partType: string, directName?: string): CustomPart | null => {
    // Nếu directName có giá trị và không phải ID (không phải ObjectId format)
    if (directName && directName !== null && directName !== undefined && directName.toString().trim() !== '') {
      // Kiểm tra xem có phải ObjectId không (24 ký tự hex)
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(directName.toString());
      if (!isObjectId) {
        // Nếu không phải ObjectId, tìm trong categories theo tên
        const category = categories.find(cat => cat.name === directName.toString());
        if (category) {
          return {
            id: category._id,
            name: category.name,
            image: category.image,
            type: partType,
            price: category.price
          };
        }
        // Nếu không tìm thấy, trả về với thông tin cơ bản
        return {
          id: partId || '',
          name: directName.toString(),
          type: partType,
          image: undefined,
          price: undefined
        };
      }
    }
    
    // Nếu là ID, tìm trong categories
    if (!partId || (typeof partId === 'string' && partId.trim() === '')) return null;
    
    const category = categories.find(cat => cat._id === partId);
    if (category) {
      return {
        id: partId,
        name: category.name,
        image: category.image,
        type: partType,
        price: category.price
      };
    }
    
    return null;
  };

  // Hàm xử lý accessories
  const getAccessoriesInfo = () => {
    if (!parts.accessories) return [];
    
    const accessories: CustomPart[] = [];
    
    if (Array.isArray(parts.accessories)) {
      // Xử lý array - có thể chứa ID hoặc tên trực tiếp
      parts.accessories.forEach(accItem => {
        // Kiểm tra xem có phải ObjectId không
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(accItem);
        if (isObjectId) {
          // Nếu là ObjectId, tìm trong categories
          const accInfo = getPartInfo(accItem, 'accessory');
          if (accInfo) {
            accessories.push(accInfo);
          }
        } else {
          // Nếu không phải ObjectId, tìm trong categories theo tên
          const accCategory = categories.find(cat => cat.name === accItem);
          if (accCategory) {
            // Tìm thấy category theo tên
            accessories.push({
              id: accCategory._id,
              name: accItem,
              type: 'accessory',
              image: accCategory.image,
              price: accCategory.price
            });
          } else {
            // Không tìm thấy, sử dụng trực tiếp
            accessories.push({
              id: accItem,
              name: accItem,
              type: 'accessory',
              image: undefined,
              price: undefined
            });
          }
        }
      });
    } else if (typeof parts.accessories === 'object') {
      // Xử lý object mới {id: quantity}
      Object.entries(parts.accessories).forEach(([accId, quantity]) => {
        // Kiểm tra xem có phải ObjectId không
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(accId);
        if (isObjectId) {
          const accInfo = getPartInfo(accId, 'accessory');
          if (accInfo) {
            accessories.push({
              ...accInfo,
              name: `${accInfo.name} (x${quantity})`
            });
          }
        } else {
          // Nếu không phải ObjectId, tìm trong categories theo tên
          const accCategory = categories.find(cat => cat.name === accId);
          if (accCategory) {
            // Tìm thấy category theo tên
            accessories.push({
              id: accCategory._id,
              name: `${accId} (x${quantity})`,
              type: 'accessory',
              image: accCategory.image,
              price: accCategory.price
            });
          } else {
            // Không tìm thấy, sử dụng trực tiếp
            accessories.push({
              id: accId,
              name: `${accId} (x${quantity})`,
              type: 'accessory',
              image: undefined,
              price: undefined
            });
          }
        }
      });
    }
    
    return accessories;
  };

  // Lấy thông tin các bộ phận chính
  const bodyInfo = getPartInfo(parts.body || '', 'body', parts.body || '');
  const earsInfo = getPartInfo(parts.ears || '', 'ears', parts.ears || '');
  const eyesInfo = getPartInfo(parts.eyes || '', 'eyes', parts.eyes || '');
  const noseInfo = getPartInfo(parts.nose || '', 'nose', parts.nose || '');
  const mouthInfo = getPartInfo(parts.mouth || '', 'mouth', parts.mouth || '');
  const furColorInfo = getPartInfo(parts.furColor || '', 'furColor', parts.furColor || '');
  const clothingInfo = getPartInfo(parts.clothing || '', 'clothing', parts.clothing || '');
  const accessoriesInfo = getAccessoriesInfo();



  // Hàm hiển thị tên bộ phận
  const getPartDisplayName = (partInfo: CustomPart | null, fallback: string = '--') => {
    if (partInfo && partInfo.name) {
      return partInfo.name;
    }
    return fallback;
  };

  // Xử lý kích thước - ưu tiên sizeName từ specifications
  const getSizeText = (sizeValue?: string) => {
    // Ưu tiên sizeName từ specifications
    if (parts.sizeName && parts.sizeName.trim() !== '') {
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
    if (parts.material && parts.material.trim() !== '') {
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

  const mainParts: MainPart[] = [
    { label: 'Thân', info: bodyInfo || { id: '', name: parts.body !== undefined ? parts.body : '--', type: 'body' }, required: true },
    { label: 'Mắt', info: eyesInfo || { id: '', name: parts.eyes !== undefined ? parts.eyes : '--', type: 'eyes' }, required: true },
    { label: 'Miệng', info: mouthInfo || { id: '', name: parts.mouth !== undefined ? parts.mouth : '--', type: 'mouth' }, required: false },
    { label: 'Màu lông', info: furColorInfo || { id: '', name: parts.furColor !== undefined ? parts.furColor : '--', type: 'furColor' }, required: false },
    { label: 'Phụ kiện', info: accessoriesInfo.length > 0 ? accessoriesInfo : [{ id: '', name: 'Không có phụ kiện', type: 'accessory' }], required: false, isAccessories: true },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Thông tin cơ bản - Hiển thị rõ ràng hơn */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="font-semibold text-lg mb-4 text-gray-800 flex items-center gap-2">
          <span className="text-blue-500">📋</span>
          Thông tin cơ bản
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xl">📏</span>
            </div>
            <div>
              <div className="font-semibold text-blue-800">Kích thước</div>
              <div className="text-lg font-bold text-blue-700">{getSizeText(size || parts.size)}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xl">🧶</span>
            </div>
            <div>
              <div className="font-semibold text-green-800">Chất liệu</div>
              <div className="text-lg font-bold text-green-700">{getMaterialText(material || parts.material)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Parts - Hiển thị đẹp và rõ ràng hơn */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="font-semibold text-lg mb-6 text-gray-800 flex items-center gap-2">
          <span className="text-pink-500">🔧</span>
          Các bộ phận đã chọn
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mainParts.map((part, index) => (
            <div key={index} className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 hover:border-pink-300">
              {part.isAccessories ? (
                // Special handling for accessories (array)
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-gray-800">{part.label}</span>
                    <Badge variant="outline" className="text-sm bg-purple-100 text-purple-700 border-purple-300 px-3 py-1">
                      Phụ kiện
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {Array.isArray(part.info) && part.info.map((acc: CustomPart, accIndex: number) => (
                      <div key={accIndex} className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        {acc.image && (
                          <img 
                            src={acc.image} 
                            alt={acc.name} 
                            className="w-12 h-12 rounded-lg object-cover border-2 border-purple-300 shadow-sm"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{acc.name}</div>
                          {acc.price && acc.price > 0 && (
                            <Badge variant="outline" className="text-sm mt-2 bg-green-100 text-green-700 border-green-300 px-3 py-1">
                              +{acc.price.toLocaleString('vi-VN')}đ
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Regular single part - Hiển thị đẹp hơn
                <div className="flex items-start gap-4">
                  {(part.info as CustomPart)?.image && part.label !== 'Màu lông' ? (
                    <div className="relative flex-shrink-0">
                      <img 
                        src={(part.info as CustomPart).image} 
                        alt={(part.info as CustomPart).name} 
                        className="w-20 h-20 rounded-xl object-cover border-2 border-gray-300 shadow-md"
                      />
                      {part.required && (
                        <div className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white text-sm font-bold">!</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Placeholder cho các bộ phận không có hình
                    <div className="relative flex-shrink-0">
                      <div className="w-20 h-20 bg-gray-100 rounded-xl border-2 border-gray-300 flex items-center justify-center">
                        <span className="text-gray-400 text-2xl">
                          {part.label === 'Thân' ? '🐻' : 
                           part.label === 'Mắt' ? '👀' : 
                           part.label === 'Miệng' ? '👄' : 
                           part.label === 'Màu lông' ? '🎨' : '🔧'}
                        </span>
                      </div>
                      {part.required && (
                        <div className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white text-sm font-bold">!</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-bold text-lg text-gray-800">{part.label}</span>
                      {part.required && (
                        <Badge variant="destructive" className="text-sm px-3 py-1">Bắt buộc</Badge>
                      )}
                    </div>
                    <div className="text-base text-gray-700 mb-3 font-medium">
                      {(part.info as CustomPart)?.name || 'Chưa chọn'}
                    </div>
                    {/* Hiển thị giá cho tất cả các bộ phận có giá */}
                    {(() => {
                      const partInfo = part.info as CustomPart;
                      return partInfo?.price && partInfo.price > 0 ? (
                        <Badge variant="outline" className="text-sm bg-green-100 text-green-700 border-green-300 px-3 py-1">
                          +{partInfo.price.toLocaleString('vi-VN')}đ
                        </Badge>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ghi chú cho nhà sản xuất - Đơn giản hơn */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-amber-600 text-xl">📝</span>
          </div>
          <div>
            <div className="font-semibold text-amber-800 mb-3 text-lg">
              Ghi chú cho nhà sản xuất
            </div>
            <div className="text-amber-700 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                <span>Đây là sản phẩm tùy chỉnh theo yêu cầu khách hàng</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                <span>Vui lòng sử dụng đúng các bộ phận đã được chọn</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                <span>Kiểm tra kỹ kích thước và chất liệu trước khi sản xuất</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                <span>Đảm bảo chất lượng và độ an toàn của sản phẩm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
