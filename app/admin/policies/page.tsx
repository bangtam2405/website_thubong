"use client"
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Truck, RefreshCw, Shield, Save, Plus, Trash2, Pencil } from "lucide-react";
import instance from "@/lib/axiosConfig";

interface ShippingZone {
  _id?: string;
  name: string;
  provinces: string[];
  wards: string[];
  baseFee: number;
  freeThreshold: number;
  description: string;
}

interface ReturnPolicy {
  _id?: string;
  title: string;
  content: string;
  isActive: boolean;
}

interface WarrantyPolicy {
  _id?: string;
  title: string;
  content: string;
  duration: number; // days
  isActive: boolean;
}

export default function PoliciesPage() {
  const [activeTab, setActiveTab] = useState("shipping");
  const [loading, setLoading] = useState(false);

  // Shipping policies
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [newZone, setNewZone] = useState<ShippingZone>({
    name: "",
    provinces: [],
    wards: [],
    baseFee: 0,
    freeThreshold: 0,
    description: ""
  });
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);

  // Return policies
  const [returnPolicies, setReturnPolicies] = useState<ReturnPolicy[]>([]);
  const [newReturnPolicy, setNewReturnPolicy] = useState<ReturnPolicy>({
    title: "",
    content: "",
    isActive: true
  });
  const [editingReturnPolicy, setEditingReturnPolicy] = useState<ReturnPolicy | null>(null);

  // Warranty policies
  const [warrantyPolicies, setWarrantyPolicies] = useState<WarrantyPolicy[]>([]);
  const [newWarrantyPolicy, setNewWarrantyPolicy] = useState<WarrantyPolicy>({
    title: "",
    content: "",
    duration: 30,
    isActive: true
  });
  const [editingWarrantyPolicy, setEditingWarrantyPolicy] = useState<WarrantyPolicy | null>(null);

  // Load data
  useEffect(() => {
    loadShippingZones();
    loadReturnPolicies();
    loadWarrantyPolicies();
  }, []);

  const loadShippingZones = async () => {
    try {
      const response = await instance.get('/api/policies/shipping');
      setShippingZones(response.data.zones || []);
    } catch (error) {
      console.error('Lỗi load shipping zones:', error);
    }
  };

  const loadReturnPolicies = async () => {
    try {
      const response = await instance.get('/api/policies/returns');
      setReturnPolicies(response.data.policies || []);
    } catch (error) {
      console.error('Lỗi load return policies:', error);
    }
  };

  const loadWarrantyPolicies = async () => {
    try {
      const response = await instance.get('/api/policies/warranty');
      setWarrantyPolicies(response.data.policies || []);
    } catch (error) {
      console.error('Lỗi load warranty policies:', error);
    }
  };

  // Shipping zone functions
  const addShippingZone = async () => {
    if (!newZone.name || newZone.baseFee < 0) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      const response = await instance.post('/api/policies/shipping', newZone);
      setShippingZones([...shippingZones, response.data.zone]);
      setNewZone({
        name: "",
        provinces: [],
        wards: [],
        baseFee: 0,
        freeThreshold: 0,
        description: ""
      });
      toast.success("Thêm khu vực vận chuyển thành công!");
    } catch (error) {
      toast.error("Lỗi khi thêm khu vực vận chuyển!");
    } finally {
      setLoading(false);
    }
  };

  const editShippingZone = (zone: ShippingZone) => {
    setEditingZone(zone);
  };

  const cancelEditShippingZone = () => {
    setEditingZone(null);
  };

  const updateShippingZone = async (zone: ShippingZone) => {
    setLoading(true);
    try {
      await instance.put(`/api/policies/shipping/${zone._id}`, zone);
      setShippingZones(shippingZones.map(z => z._id === zone._id ? zone : z));
      setEditingZone(null);
      toast.success("Cập nhật khu vực vận chuyển thành công!");
    } catch (error) {
      toast.error("Lỗi khi cập nhật khu vực vận chuyển!");
    } finally {
      setLoading(false);
    }
  };

  const deleteShippingZone = async (zoneId: string) => {
    if (!confirm("Bạn có chắc muốn xóa khu vực này?")) return;

    setLoading(true);
    try {
      await instance.delete(`/api/policies/shipping/${zoneId}`);
      setShippingZones(shippingZones.filter(z => z._id !== zoneId));
      toast.success("Xóa khu vực vận chuyển thành công!");
    } catch (error) {
      toast.error("Lỗi khi xóa khu vực vận chuyển!");
    } finally {
      setLoading(false);
    }
  };

  // Return policy functions
  const addReturnPolicy = async () => {
    if (!newReturnPolicy.title || !newReturnPolicy.content) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      const response = await instance.post('/api/policies/returns', newReturnPolicy);
      setReturnPolicies([...returnPolicies, response.data.policy]);
      setNewReturnPolicy({
        title: "",
        content: "",
        isActive: true
      });
      toast.success("Thêm chính sách đổi trả thành công!");
    } catch (error) {
      toast.error("Lỗi khi thêm chính sách đổi trả!");
    } finally {
      setLoading(false);
    }
  };

  const editReturnPolicy = (policy: ReturnPolicy) => {
    setEditingReturnPolicy(policy);
  };

  const cancelEditReturnPolicy = () => {
    setEditingReturnPolicy(null);
  };

  const updateReturnPolicy = async (policy: ReturnPolicy) => {
    setLoading(true);
    try {
      await instance.put(`/api/policies/returns/${policy._id}`, policy);
      setReturnPolicies(returnPolicies.map(p => p._id === policy._id ? policy : p));
      setEditingReturnPolicy(null);
      toast.success("Cập nhật chính sách đổi trả thành công!");
    } catch (error) {
      toast.error("Lỗi khi cập nhật chính sách đổi trả!");
    } finally {
      setLoading(false);
    }
  };

  const deleteReturnPolicy = async (policyId: string) => {
    if (!confirm("Bạn có chắc muốn xóa chính sách này?")) return;

    setLoading(true);
    try {
      await instance.delete(`/api/policies/returns/${policyId}`);
      setReturnPolicies(returnPolicies.filter(p => p._id !== policyId));
      toast.success("Xóa chính sách đổi trả thành công!");
    } catch (error) {
      toast.error("Lỗi khi xóa chính sách đổi trả!");
    } finally {
      setLoading(false);
    }
  };

  // Warranty policy functions
  const addWarrantyPolicy = async () => {
    if (!newWarrantyPolicy.title || !newWarrantyPolicy.content) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      const response = await instance.post('/api/policies/warranty', newWarrantyPolicy);
      setWarrantyPolicies([...warrantyPolicies, response.data.policy]);
      setNewWarrantyPolicy({
        title: "",
        content: "",
        duration: 30,
        isActive: true
      });
      toast.success("Thêm chính sách bảo hành thành công!");
    } catch (error) {
      toast.error("Lỗi khi thêm chính sách bảo hành!");
    } finally {
      setLoading(false);
    }
  };

  const editWarrantyPolicy = (policy: WarrantyPolicy) => {
    setEditingWarrantyPolicy(policy);
  };

  const cancelEditWarrantyPolicy = () => {
    setEditingWarrantyPolicy(null);
  };

  const updateWarrantyPolicy = async (policy: WarrantyPolicy) => {
    setLoading(true);
    try {
      await instance.put(`/api/policies/warranty/${policy._id}`, policy);
      setWarrantyPolicies(warrantyPolicies.map(p => p._id === policy._id ? policy : p));
      setEditingWarrantyPolicy(null);
      toast.success("Cập nhật chính sách bảo hành thành công!");
    } catch (error) {
      toast.error("Lỗi khi cập nhật chính sách bảo hành!");
    } finally {
      setLoading(false);
    }
  };

  const deleteWarrantyPolicy = async (policyId: string) => {
    if (!confirm("Bạn có chắc muốn xóa chính sách này?")) return;

    setLoading(true);
    try {
      await instance.delete(`/api/policies/warranty/${policyId}`);
      setWarrantyPolicies(warrantyPolicies.filter(p => p._id !== policyId));
      toast.success("Xóa chính sách bảo hành thành công!");
    } catch (error) {
      toast.error("Lỗi khi xóa chính sách bảo hành!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#E3497A] mb-2">Quản Lý Chính Sách</h1>
        <p className="text-gray-600">Cấu hình các chính sách vận chuyển, đổi trả và bảo hành</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="text-blue-600" />
                Thêm Khu Vực Vận Chuyển Mới
              </CardTitle>
              <CardDescription>
                Cấu hình phí vận chuyển cho từng khu vực
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zoneName">Tên khu vực</Label>
                  <Input
                    id="zoneName"
                    value={newZone.name}
                    onChange={(e) => setNewZone({...newZone, name: e.target.value})}
                    placeholder="VD: Khu vực nội thành Cần Thơ"
                  />
                </div>
                <div>
                  <Label htmlFor="baseFee">Phí cơ bản (VNĐ)</Label>
                  <Input
                    id="baseFee"
                    type="number"
                    value={newZone.baseFee}
                    onChange={(e) => setNewZone({...newZone, baseFee: Number(e.target.value)})}
                    placeholder="25000"
                  />
                </div>
                <div>
                  <Label htmlFor="freeThreshold">Ngưỡng miễn phí (VNĐ)</Label>
                  <Input
                    id="freeThreshold"
                    type="number"
                    value={newZone.freeThreshold}
                    onChange={(e) => setNewZone({...newZone, freeThreshold: Number(e.target.value)})}
                    placeholder="100000"
                  />
                </div>
                <div>
                  <Label htmlFor="provinces">Tỉnh/Thành phố (phân cách bằng dấu phẩy)</Label>
                  <Input
                    id="provinces"
                    value={newZone.provinces.join(', ')}
                    onChange={(e) => setNewZone({...newZone, provinces: e.target.value.split(',').map(p => p.trim())})}
                    placeholder="Thành Phố Cần Thơ"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="wards">Phường/Xã (phân cách bằng dấu phẩy)</Label>
                <Input
                  id="wards"
                  value={newZone.wards.join(', ')}
                  onChange={(e) => setNewZone({...newZone, wards: e.target.value.split(',').map(w => w.trim())})}
                  placeholder="Phường Cái Khế, Phường Bình Thủy"
                />
              </div>
              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={newZone.description}
                  onChange={(e) => setNewZone({...newZone, description: e.target.value})}
                  placeholder="Mô tả chi tiết về khu vực vận chuyển..."
                />
              </div>
              <Button onClick={addShippingZone} disabled={loading} className="flex items-center gap-2">
                <Plus size={16} />
                Thêm Khu Vực
              </Button>
            </CardContent>
          </Card>

          {/* Existing Shipping Zones */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Khu Vực Vận Chuyển Hiện Tại</h3>
            {shippingZones.map((zone) => (
              <Card key={zone._id}>
                <CardContent className="pt-6">
                  {editingZone?._id === zone._id ? (
                    // Edit Form
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`edit-zone-name-${zone._id}`}>Tên khu vực</Label>
                          <Input
                            id={`edit-zone-name-${zone._id}`}
                            value={editingZone?.name || ''}
                            onChange={(e) => setEditingZone(editingZone ? {...editingZone, name: e.target.value} : null)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-zone-baseFee-${zone._id}`}>Phí cơ bản (VNĐ)</Label>
                          <Input
                            id={`edit-zone-baseFee-${zone._id}`}
                            type="number"
                            value={editingZone?.baseFee || 0}
                            onChange={(e) => setEditingZone(editingZone ? {...editingZone, baseFee: Number(e.target.value)} : null)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-zone-freeThreshold-${zone._id}`}>Ngưỡng miễn phí (VNĐ)</Label>
                          <Input
                            id={`edit-zone-freeThreshold-${zone._id}`}
                            type="number"
                            value={editingZone?.freeThreshold || 0}
                            onChange={(e) => setEditingZone(editingZone ? {...editingZone, freeThreshold: Number(e.target.value)} : null)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-zone-provinces-${zone._id}`}>Tỉnh/Thành phố</Label>
                          <Input
                            id={`edit-zone-provinces-${zone._id}`}
                            value={editingZone?.provinces?.join(', ') || ''}
                            onChange={(e) => setEditingZone(editingZone ? {...editingZone, provinces: e.target.value.split(',').map(p => p.trim())} : null)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`edit-zone-wards-${zone._id}`}>Phường/Xã</Label>
                        <Input
                          id={`edit-zone-wards-${zone._id}`}
                          value={editingZone?.wards?.join(', ') || ''}
                          onChange={(e) => setEditingZone(editingZone ? {...editingZone, wards: e.target.value.split(',').map(w => w.trim())} : null)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-zone-description-${zone._id}`}>Mô tả</Label>
                        <Textarea
                          id={`edit-zone-description-${zone._id}`}
                          value={editingZone?.description || ''}
                          onChange={(e) => setEditingZone(editingZone ? {...editingZone, description: e.target.value} : null)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => editingZone && updateShippingZone(editingZone as ShippingZone)}
                          disabled={loading || !editingZone}
                        >
                          <Save size={14} className="mr-1" />
                          Lưu
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditShippingZone}
                          disabled={loading}
                        >
                          Hủy
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{zone.name}</h4>
                          <p className="text-gray-600 text-sm">{zone.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editShippingZone(zone)}
                            disabled={loading}
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteShippingZone(zone._id!)}
                            disabled={loading}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Phí cơ bản:</span>
                          <p className="text-blue-600">{zone.baseFee.toLocaleString()}₫</p>
                        </div>
                        <div>
                          <span className="font-medium">Miễn phí từ:</span>
                          <p className="text-green-600">{zone.freeThreshold.toLocaleString()}₫</p>
                        </div>
                        <div>
                          <span className="font-medium">Tỉnh/Thành:</span>
                          <p>{zone.provinces.join(', ')}</p>
                        </div>
                        <div>
                          <span className="font-medium">Phường/Xã:</span>
                          <p>{zone.wards.join(', ')}</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Return Policies Tab */}
        <TabsContent value="returns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="text-orange-600" />
                Thêm Chính Sách Đổi Trả Mới
              </CardTitle>
              <CardDescription>
                Cấu hình các chính sách đổi trả hàng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="returnTitle">Tiêu đề</Label>
                <Input
                  id="returnTitle"
                  value={newReturnPolicy.title}
                  onChange={(e) => setNewReturnPolicy({...newReturnPolicy, title: e.target.value})}
                  placeholder="VD: Chính sách đổi trả trong 7 ngày"
                />
              </div>
              <div>
                <Label htmlFor="returnContent">Nội dung</Label>
                <Textarea
                  id="returnContent"
                  value={newReturnPolicy.content}
                  onChange={(e) => setNewReturnPolicy({...newReturnPolicy, content: e.target.value})}
                  placeholder="Mô tả chi tiết chính sách đổi trả..."
                  rows={4}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="returnActive"
                  checked={newReturnPolicy.isActive}
                  onCheckedChange={(checked) => setNewReturnPolicy({...newReturnPolicy, isActive: checked})}
                />
                <Label htmlFor="returnActive">Kích hoạt chính sách</Label>
              </div>
              <Button onClick={addReturnPolicy} disabled={loading} className="flex items-center gap-2">
                <Plus size={16} />
                Thêm Chính Sách
              </Button>
            </CardContent>
          </Card>

          {/* Existing Return Policies */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Chính Sách Đổi Trả Hiện Tại</h3>
            {returnPolicies.map((policy) => (
              <Card key={policy._id}>
                <CardContent className="pt-6">
                  {editingReturnPolicy?._id === policy._id ? (
                    // Edit Form
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`edit-return-title-${policy._id}`}>Tiêu đề</Label>
                        <Input
                          id={`edit-return-title-${policy._id}`}
                          value={editingReturnPolicy?.title || ''}
                          onChange={(e) => setEditingReturnPolicy(editingReturnPolicy ? {...editingReturnPolicy, title: e.target.value} : null)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-return-content-${policy._id}`}>Nội dung</Label>
                        <Textarea
                          id={`edit-return-content-${policy._id}`}
                          value={editingReturnPolicy?.content || ''}
                          onChange={(e) => setEditingReturnPolicy(editingReturnPolicy ? {...editingReturnPolicy, content: e.target.value} : null)}
                          rows={4}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`edit-return-active-${policy._id}`}
                          checked={editingReturnPolicy?.isActive || false}
                          onCheckedChange={(checked) => setEditingReturnPolicy(editingReturnPolicy ? {...editingReturnPolicy, isActive: checked} : null)}
                        />
                        <Label htmlFor={`edit-return-active-${policy._id}`}>Kích hoạt chính sách</Label>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => editingReturnPolicy && updateReturnPolicy(editingReturnPolicy as ReturnPolicy)}
                          disabled={loading || !editingReturnPolicy}
                        >
                          <Save size={14} className="mr-1" />
                          Lưu
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditReturnPolicy}
                          disabled={loading}
                        >
                          Hủy
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-lg">{policy.title}</h4>
                            <Badge variant={policy.isActive ? "default" : "secondary"}>
                              {policy.isActive ? "Đang hoạt động" : "Tạm ngưng"}
                            </Badge>
                          </div>
                          <p className="text-gray-600 whitespace-pre-wrap">{policy.content}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editReturnPolicy(policy)}
                            disabled={loading}
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteReturnPolicy(policy._id!)}
                            disabled={loading}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Warranty Policies Tab */}
        <TabsContent value="warranty" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="text-green-600" />
                Thêm Chính Sách Bảo Hành Mới
              </CardTitle>
              <CardDescription>
                Cấu hình các chính sách bảo hành sản phẩm
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="warrantyTitle">Tiêu đề</Label>
                <Input
                  id="warrantyTitle"
                  value={newWarrantyPolicy.title}
                  onChange={(e) => setNewWarrantyPolicy({...newWarrantyPolicy, title: e.target.value})}
                  placeholder="VD: Bảo hành 1 năm"
                />
              </div>
              <div>
                <Label htmlFor="warrantyContent">Nội dung</Label>
                <Textarea
                  id="warrantyContent"
                  value={newWarrantyPolicy.content}
                  onChange={(e) => setNewWarrantyPolicy({...newWarrantyPolicy, content: e.target.value})}
                  placeholder="Mô tả chi tiết chính sách bảo hành..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="warrantyDuration">Thời hạn bảo hành (ngày)</Label>
                <Input
                  id="warrantyDuration"
                  type="number"
                  value={newWarrantyPolicy.duration}
                  onChange={(e) => setNewWarrantyPolicy({...newWarrantyPolicy, duration: Number(e.target.value)})}
                  placeholder="365"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="warrantyActive"
                  checked={newWarrantyPolicy.isActive}
                  onCheckedChange={(checked) => setNewWarrantyPolicy({...newWarrantyPolicy, isActive: checked})}
                />
                <Label htmlFor="warrantyActive">Kích hoạt chính sách</Label>
              </div>
              <Button onClick={addWarrantyPolicy} disabled={loading} className="flex items-center gap-2">
                <Plus size={16} />
                Thêm Chính Sách
              </Button>
            </CardContent>
          </Card>

          {/* Existing Warranty Policies */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Chính Sách Bảo Hành Hiện Tại</h3>
            {warrantyPolicies.map((policy) => (
              <Card key={policy._id}>
                <CardContent className="pt-6">
                  {editingWarrantyPolicy?._id === policy._id ? (
                    // Edit Form
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`edit-warranty-title-${policy._id}`}>Tiêu đề</Label>
                        <Input
                          id={`edit-warranty-title-${policy._id}`}
                          value={editingWarrantyPolicy?.title || ''}
                          onChange={(e) => setEditingWarrantyPolicy(editingWarrantyPolicy ? {...editingWarrantyPolicy, title: e.target.value} : null)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-warranty-content-${policy._id}`}>Nội dung</Label>
                        <Textarea
                          id={`edit-warranty-content-${policy._id}`}
                          value={editingWarrantyPolicy?.content || ''}
                          onChange={(e) => setEditingWarrantyPolicy(editingWarrantyPolicy ? {...editingWarrantyPolicy, content: e.target.value} : null)}
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`edit-warranty-duration-${policy._id}`}>Thời hạn bảo hành (ngày)</Label>
                        <Input
                          id={`edit-warranty-duration-${policy._id}`}
                          type="number"
                          value={editingWarrantyPolicy?.duration || 30}
                          onChange={(e) => setEditingWarrantyPolicy(editingWarrantyPolicy ? {...editingWarrantyPolicy, duration: Number(e.target.value)} : null)}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`edit-warranty-active-${policy._id}`}
                          checked={editingWarrantyPolicy?.isActive || false}
                          onCheckedChange={(checked) => setEditingWarrantyPolicy(editingWarrantyPolicy ? {...editingWarrantyPolicy, isActive: checked} : null)}
                        />
                        <Label htmlFor={`edit-warranty-active-${policy._id}`}>Kích hoạt chính sách</Label>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => editingWarrantyPolicy && updateWarrantyPolicy(editingWarrantyPolicy as WarrantyPolicy)}
                          disabled={loading || !editingWarrantyPolicy}
                        >
                          <Save size={14} className="mr-1" />
                          Lưu
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditWarrantyPolicy}
                          disabled={loading}
                        >
                          Hủy
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-lg">{policy.title}</h4>
                            <Badge variant={policy.isActive ? "default" : "secondary"}>
                              {policy.isActive ? "Đang hoạt động" : "Tạm ngưng"}
                            </Badge>
                            <Badge variant="outline">
                              {policy.duration} ngày
                            </Badge>
                          </div>
                          <p className="text-gray-600 whitespace-pre-wrap">{policy.content}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editWarrantyPolicy(policy)}
                            disabled={loading}
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteWarrantyPolicy(policy._id!)}
                            disabled={loading}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 