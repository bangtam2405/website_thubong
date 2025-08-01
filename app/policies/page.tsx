"use client"
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, RefreshCw, Shield, Clock, MapPin, DollarSign } from "lucide-react";
import instance from "@/lib/axiosConfig";

interface ShippingZone {
  _id: string;
  name: string;
  provinces: string[];
  wards: string[];
  baseFee: number;
  freeThreshold: number;
  description: string;
}

interface ReturnPolicy {
  _id: string;
  title: string;
  content: string;
  isActive: boolean;
}

interface WarrantyPolicy {
  _id: string;
  title: string;
  content: string;
  duration: number;
  isActive: boolean;
}

export default function PoliciesPage() {
  const [activeTab, setActiveTab] = useState("shipping");
  const [loading, setLoading] = useState(true);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [returnPolicies, setReturnPolicies] = useState<ReturnPolicy[]>([]);
  const [warrantyPolicies, setWarrantyPolicies] = useState<WarrantyPolicy[]>([]);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const [shippingRes, returnRes, warrantyRes] = await Promise.all([
        instance.get('/api/policies/shipping'),
        instance.get('/api/policies/returns'),
        instance.get('/api/policies/warranty')
      ]);

      setShippingZones(shippingRes.data.zones || []);
      setReturnPolicies(returnRes.data.policies || []);
      setWarrantyPolicies(warrantyRes.data.policies || []);
    } catch (error) {
      console.error('Lỗi load policies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-[#E3497A] mb-4">Chính Sách Của Chúng Tôi</h1>
        <p className="text-gray-600 text-lg">
          Tìm hiểu về các chính sách vận chuyển, đổi trả và bảo hành của chúng tôi
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="shipping" className="flex items-center gap-2">
            <Truck size={16} />
            Vận Chuyển
          </TabsTrigger>
          <TabsTrigger value="returns" className="flex items-center gap-2">
            <RefreshCw size={16} />
            Đổi Trả
          </TabsTrigger>
          <TabsTrigger value="warranty" className="flex items-center gap-2">
            <Shield size={16} />
            Bảo Hành
          </TabsTrigger>
        </TabsList>

        {/* Shipping Policies Tab */}
        <TabsContent value="shipping" className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Chính Sách Vận Chuyển</h2>
            <p className="text-gray-600">
              Chúng tôi cung cấp dịch vụ vận chuyển nhanh chóng và tiết kiệm cho mọi khu vực
            </p>
          </div>

          {shippingZones.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                Chưa có thông tin về khu vực vận chuyển
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {shippingZones.map((zone) => (
                <Card key={zone._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="text-blue-600" size={20} />
                      {zone.name}
                    </CardTitle>
                    <CardDescription>{zone.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Phí cơ bản:</span>
                      <span className="text-blue-600 font-semibold">
                        {zone.baseFee.toLocaleString()}₫
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Miễn phí từ:</span>
                      <span className="text-green-600 font-semibold">
                        {zone.freeThreshold.toLocaleString()}₫
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="text-sm text-gray-600 mb-1">
                        <strong>Khu vực áp dụng:</strong>
                      </div>
                      <div className="text-xs text-gray-500">
                        <div><strong>Tỉnh/Thành:</strong> {zone.provinces.join(', ')}</div>
                        <div><strong>Phường/Xã:</strong> {zone.wards.join(', ')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Thông tin thêm về vận chuyển */}
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Truck className="text-blue-600" />
                Lưu Ý Về Vận Chuyển
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Thời gian giao hàng: 1-3 ngày làm việc (tùy khu vực)</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Giao hàng từ 8:00 - 20:00 các ngày trong tuần</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Liên hệ hotline nếu cần giao hàng nhanh hoặc đặc biệt</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Return Policies Tab */}
        <TabsContent value="returns" className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Chính Sách Đổi Trả</h2>
            <p className="text-gray-600">
              Chúng tôi cam kết đảm bảo quyền lợi của khách hàng với chính sách đổi trả linh hoạt
            </p>
          </div>

          {returnPolicies.filter(p => p.isActive).length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                Chưa có thông tin về chính sách đổi trả
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {returnPolicies.filter(p => p.isActive).map((policy) => (
                <Card key={policy._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="text-orange-600" size={20} />
                      <CardTitle>{policy.title}</CardTitle>
                      <Badge variant="default" className="bg-orange-100 text-orange-800">
                        Đang áp dụng
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {policy.content}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Thông tin thêm về đổi trả */}
          <Card className="mt-8 bg-gradient-to-r from-orange-50 to-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <RefreshCw className="text-orange-600" />
                Quy Trình Đổi Trả
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Liên hệ hotline hoặc email để báo cáo sản phẩm cần đổi trả</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Chụp ảnh sản phẩm và gửi thông tin chi tiết</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Nhân viên sẽ kiểm tra và xác nhận trong 24h</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Thực hiện đổi trả theo hướng dẫn của nhân viên</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Warranty Policies Tab */}
        <TabsContent value="warranty" className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Chính Sách Bảo Hành</h2>
            <p className="text-gray-600">
              Đảm bảo chất lượng sản phẩm với chính sách bảo hành toàn diện
            </p>
          </div>

          {warrantyPolicies.filter(p => p.isActive).length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                Chưa có thông tin về chính sách bảo hành
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {warrantyPolicies.filter(p => p.isActive).map((policy) => (
                <Card key={policy._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Shield className="text-green-600" size={20} />
                      <CardTitle>{policy.title}</CardTitle>
                      <Badge variant="outline" className="border-green-200 text-green-700">
                        <Clock size={12} className="mr-1" />
                        {policy.duration} ngày
                      </Badge>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Đang áp dụng
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {policy.content}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Thông tin thêm về bảo hành */}
          <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Shield className="text-green-600" />
                Dịch Vụ Bảo Hành
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Bảo hành chính hãng với đầy đủ giấy tờ và tem bảo hành</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Hỗ trợ bảo hành tại nhà cho các sản phẩm lớn</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Thay thế linh kiện chính hãng với giá ưu đãi</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Hotline hỗ trợ kỹ thuật 24/7</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact Information */}
      <Card className="mt-12 bg-gradient-to-r from-pink-50 to-rose-50">
        <CardHeader className="text-center">
          <CardTitle className="text-[#E3497A]">Cần Hỗ Trợ Thêm?</CardTitle>
          <CardDescription>
            Liên hệ với chúng tôi để được tư vấn chi tiết hơn
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            <strong>Hotline:</strong> 1900-xxxx | <strong>Email:</strong> support@thubong.com
          </p>
          <p className="text-sm text-gray-600">
            <strong>Giờ làm việc:</strong> 8:00 - 20:00 (Thứ 2 - Chủ nhật)
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 