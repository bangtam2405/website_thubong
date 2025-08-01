"use client"

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Ward {
  ward_code: string
  name: string
  province_code: string
}

interface Province {
  province_code: string
  name: string
  short_name: string
  code: string
  place_type: string
  wards: Ward[]
}

interface AddressSelectorProps {
  onAddressChange: (address: {
    province: string
    ward: string
    detail: string
    fullAddress: string
  }) => void
  defaultProvince?: string
  defaultWard?: string
  defaultDetail?: string
  disableLocalStorage?: boolean
}

export default function AddressSelector({
  onAddressChange,
  defaultProvince = "",
  defaultWard = "",
  defaultDetail = "",
  disableLocalStorage = false
}: AddressSelectorProps) {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [selectedProvince, setSelectedProvince] = useState("")
  const [selectedWard, setSelectedWard] = useState("")
  const [detailAddress, setDetailAddress] = useState(defaultDetail)
  const [availableWards, setAvailableWards] = useState<Ward[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInitializing, setIsInitializing] = useState(true)

  // Cập nhật state khi default values thay đổi và provinces đã load
  useEffect(() => {
    if (provinces.length > 0) {
      setIsInitializing(true)
      
      // Tìm province_code từ tên tỉnh
      if (defaultProvince) {
        const province = provinces.find(p => p.name === defaultProvince)
        if (province) {
          setSelectedProvince(province.province_code)
          setAvailableWards(province.wards)
          
          // Tìm ward_code từ tên phường
          if (defaultWard) {
            const ward = province.wards.find(w => w.name === defaultWard)
            if (ward) {
              setSelectedWard(ward.ward_code)
            }
          }
        }
      }
      
      // Đánh dấu đã khởi tạo xong sau khi đã set xong tất cả
      setTimeout(() => {
        setIsInitializing(false)
      }, 100)
    }
    
    // Cập nhật detail address
    if (defaultDetail) {
      setDetailAddress(defaultDetail)
    }
  }, [defaultProvince, defaultWard, defaultDetail, provinces])

  // Thêm useEffect để đảm bảo luôn load từ localStorage khi provinces đã sẵn sàng
  useEffect(() => {
    // Chỉ load từ localStorage nếu không bị disable và không có default values và provinces đã load
    if (!disableLocalStorage && provinces.length > 0 && !selectedProvince && !selectedWard && !defaultProvince && !defaultWard && !isInitializing) {
      const savedAddress = localStorage.getItem("selectedAddress");
      if (savedAddress) {
        try {
          const addressData = JSON.parse(savedAddress);
          if (addressData.province && addressData.ward) {
            const province = provinces.find(p => p.name === addressData.province);
            if (province) {
              setSelectedProvince(province.province_code);
              setAvailableWards(province.wards);
              
              const ward = province.wards.find(w => w.name === addressData.ward);
              if (ward) {
                setSelectedWard(ward.ward_code);
              }
            }
            
            if (addressData.detail) {
              setDetailAddress(addressData.detail);
            }
          }
        } catch (error) {
          console.error('Lỗi khi parse địa chỉ từ localStorage:', error);
        }
      }
    }
  }, [provinces, selectedProvince, selectedWard, defaultProvince, defaultWard, disableLocalStorage, isInitializing]);

  // Thêm useEffect riêng cho checkout - load từ localStorage nếu có default values nhưng selectedProvince/selectedWard vẫn trống
  useEffect(() => {
    if (!disableLocalStorage && provinces.length > 0 && !isInitializing && 
        (defaultProvince || defaultWard) && (!selectedProvince || !selectedWard)) {
      const savedAddress = localStorage.getItem("selectedAddress");
      if (savedAddress) {
        try {
          const addressData = JSON.parse(savedAddress);
          if (addressData.province && addressData.ward) {
            const province = provinces.find(p => p.name === addressData.province);
            if (province) {
              setSelectedProvince(province.province_code);
              setAvailableWards(province.wards);
              
              const ward = province.wards.find(w => w.name === addressData.ward);
              if (ward) {
                setSelectedWard(ward.ward_code);
              }
            }
            
            if (addressData.detail) {
              setDetailAddress(addressData.detail);
            }
          }
        } catch (error) {
          console.error('Lỗi khi parse địa chỉ từ localStorage:', error);
        }
      }
    }
  }, [provinces, selectedProvince, selectedWard, defaultProvince, defaultWard, disableLocalStorage, isInitializing]);

  // Load dữ liệu địa chỉ từ file JSON
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const response = await fetch('/data/34citynew_data.json')
        const data = await response.json()
        setProvinces(data)
        setIsLoading(false)
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu địa chỉ:', error)
        setIsLoading(false)
      }
    }
    loadAddresses()
  }, [])

  // Cập nhật danh sách phường/xã khi chọn tỉnh/thành phố
  useEffect(() => {
    // Bỏ qua nếu đang khởi tạo
    if (isInitializing) {
      return
    }
    
    if (selectedProvince && provinces.length > 0) {
      // Tìm province theo province_code hoặc tên tỉnh
      const province = provinces.find(p => p.province_code === selectedProvince || p.name === selectedProvince)
      if (province) {
        setAvailableWards(province.wards)
        
        // Nếu có defaultWard và selectedWard đang trống, set lại từ defaultWard
        if (defaultWard && !selectedWard) {
          const defaultWardObj = province.wards.find(w => w.name === defaultWard)
          if (defaultWardObj) {
            setSelectedWard(defaultWardObj.ward_code)
            return
          }
        }
      }
    } else if (!selectedProvince && defaultProvince && provinces.length > 0) {
      // Nếu không có selectedProvince nhưng có defaultProvince, load wards cho defaultProvince
      const province = provinces.find(p => p.name === defaultProvince)
      if (province) {
        setAvailableWards(province.wards)
      }
    } else if (!selectedProvince) {
      setAvailableWards([])
    }
  }, [selectedProvince, provinces, selectedWard, defaultWard, defaultProvince, isInitializing])

  // Gọi callback khi địa chỉ thay đổi
  useEffect(() => {
    if (selectedProvince && selectedWard) {
      // Tìm province theo province_code hoặc tên tỉnh
      const province = provinces.find(p => p.province_code === selectedProvince || p.name === selectedProvince)
      // Tìm ward theo ward_code hoặc tên phường
      const ward = availableWards.find(w => w.ward_code === selectedWard || w.name === selectedWard)
      
      if (province && ward) {
        const fullAddress = `${detailAddress ? detailAddress + ', ' : ''}${ward.name}, ${province.name}`
        onAddressChange({
          province: province.name,
          ward: ward.name,
          detail: detailAddress,
          fullAddress
        })
      }
    }
  }, [selectedProvince, selectedWard, detailAddress, provinces, availableWards])

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="text-sm text-gray-500">Đang tải dữ liệu địa chỉ...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tỉnh/Thành phố */}
          <div className="space-y-2">
            <Label htmlFor="province">Tỉnh/Thành phố *</Label>
            <Select value={selectedProvince} onValueChange={setSelectedProvince}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn tỉnh/thành phố" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((province) => (
                  <SelectItem key={province.province_code} value={province.province_code}>
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Phường/Xã */}
          <div className="space-y-2">
            <Label htmlFor="ward">Phường/Xã *</Label>
            <Select value={selectedWard} onValueChange={setSelectedWard} disabled={!selectedProvince}>
              <SelectTrigger>
                <SelectValue placeholder={selectedProvince ? "Chọn phường/xã" : "Chọn tỉnh/thành phố trước"} />
              </SelectTrigger>
              <SelectContent>
                {availableWards.map((ward) => (
                  <SelectItem key={ward.ward_code} value={ward.ward_code}>
                    {ward.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          </div>
        </div>
      )}

      {/* Địa chỉ chi tiết */}
      {!isLoading && (
        <div className="space-y-2">
          <Label htmlFor="detail">Địa chỉ chi tiết (số nhà, tên đường, ...)</Label>
          <Input
            id="detail"
            placeholder="VD: 123 Nguyễn Huệ, Chung cư ABC, Tầng 5"
            value={detailAddress}
            onChange={(e) => setDetailAddress(e.target.value)}
          />
        </div>
      )}

                    {/* Hiển thị địa chỉ đầy đủ */}
        {!isLoading && selectedProvince && selectedWard && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <Label className="text-sm font-medium text-gray-700">Địa chỉ đầy đủ:</Label>
            <p className="text-sm text-gray-600 mt-1">
              {detailAddress ? `${detailAddress}, ` : ''}
              {availableWards.find(w => w.ward_code === selectedWard || w.name === selectedWard)?.name}, 
              {provinces.find(p => p.province_code === selectedProvince || p.name === selectedProvince)?.name}
            </p>
          </div>
        )}
    </div>
  )
} 