"use client"

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Truck, MapPin, DollarSign } from 'lucide-react'

interface ShippingCalculatorProps {
  selectedProvince: string
  selectedWard: string
  subtotal: number
  onShippingFeeChange: (fee: number) => void
}

interface ShippingInfo {
  fee: number
  description: string
  zone: string
}

export default function ShippingCalculator({ 
  selectedProvince, 
  selectedWard, 
  subtotal,
  onShippingFeeChange
}: ShippingCalculatorProps) {
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null)

  // Danh sách phường miễn phí ship (đơn > 100k) hoặc 10k (đơn < 100k)
  const FREE_SHIPPING_WARDS = [
    'Phường Cái Khế',      // Shop location
    'Phường Bình Thủy',
    'Phường Ninh Kiều', 
    'Phường Tân An',
    'Phường Cái Răng',
    'Phường An Bình',
    'Phường Long Tuyền'
  ]

  // Tính phí ship dựa trên địa chỉ
  useEffect(() => {
    if (!selectedProvince || !selectedWard) {
      setShippingInfo(null)
      return
    }

    let fee = 0
    let description = ''
    let zone = ''

    // Kiểm tra xem có phải Thành phố Cần Thơ không
    if (selectedProvince === 'Thành phố Cần Thơ') {
      // Kiểm tra xem có phải phường miễn phí ship không
      if (FREE_SHIPPING_WARDS.includes(selectedWard)) {
        if (subtotal >= 100000) {
          fee = 0
          description = 'Miễn phí ship cho đơn hàng từ 100.000đ'
          zone = 'Khu vực gần shop'
        } else {
          fee = 10000
          description = 'Phí ship 10.000đ cho đơn hàng dưới 100.000đ'
          zone = 'Khu vực gần shop'
        }
      } else {
        fee = 25000
        description = 'Phí ship 25.000đ cho các phường khác tại Cần Thơ'
        zone = 'Cần Thơ'
      }
    } else {
      // Các tỉnh thành khác
      fee = 35000
      description = 'Phí ship 35.000đ cho các tỉnh thành khác'
      zone = 'Tỉnh thành khác'
    }

    setShippingInfo({ fee, description, zone })
    onShippingFeeChange(fee)
  }, [selectedProvince, selectedWard, subtotal, onShippingFeeChange])

  if (!shippingInfo) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-gray-500">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">Vui lòng chọn địa chỉ để tính phí ship</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Phí vận chuyển</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {shippingInfo.zone}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-900">
              {shippingInfo.fee === 0 ? (
                <span className="text-green-600">Miễn phí</span>
              ) : (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {shippingInfo.fee.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1">{shippingInfo.description}</p>
          </div>
        </div>
        
        {/* Thông tin chi tiết */}
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="text-xs text-gray-600">
            <p><strong>Địa chỉ:</strong> {selectedWard}, {selectedProvince}</p>
            <p><strong>Giá trị đơn hàng:</strong> {subtotal.toLocaleString('vi-VN')}đ</p>
            {subtotal < 100000 && FREE_SHIPPING_WARDS.includes(selectedWard) && (
              <p className="text-orange-600 mt-1">
                💡 Mua thêm {(100000 - subtotal).toLocaleString('vi-VN')}đ để được miễn phí ship!
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 