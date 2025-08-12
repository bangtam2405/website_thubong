"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import instance from "@/lib/axiosConfig"
import jwt_decode from "jwt-decode"
import { signIn, useSession } from "next-auth/react"
import { GoogleLogin } from '@react-oauth/google'
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import AddressSelector from "@/components/AddressSelector"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isClient, setIsClient] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);
  const [registerErrors, setRegisterErrors] = useState<{ email?: string; password?: string; confirm?: string; fullName?: string; phone?: string; dob?: string; address?: string }>({});
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});
  
  // Thêm state lưu giá trị input
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirm, setRegisterConfirm] = useState("");
  const [registerFullName, setRegisterFullName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerDob, setRegisterDob] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  const [selectedAddress, setSelectedAddress] = useState({
    province: "",
    ward: "",
    detail: "",
    fullAddress: ""
  });

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    // Nếu đã login Google (next-auth) thì redirect
    if (status === "authenticated" && session?.user && session.user.email) {
      localStorage.setItem("user", JSON.stringify(session.user))
      localStorage.setItem("email", session.user.email || "")
      localStorage.setItem("username", session.user.name || "")
      localStorage.setItem("avatar", session.user.image || "")
      router.push("/")
    }
    // Nếu đã có token (user thường đã login) thì cũng redirect
    else if (typeof window !== "undefined" && localStorage.getItem("token")) {
      router.push("/")
    }
  }, [status, session, router])

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    // Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginErrors({});

    // Validation
    let hasError = false;
    const errors: { email?: string; password?: string } = {};

    if (!loginEmail.trim()) {
      errors.email = "Vui lòng nhập đầy đủ thông tin";
      hasError = true;
    } else if (!validateEmail(loginEmail)) {
      errors.email = "Email không hợp lệ";
      hasError = true;
    }

    if (!loginPassword.trim()) {
      errors.password = "Vui lòng nhập đầy đủ thông tin";
      hasError = true;
    }

    if (hasError) {
      setLoginErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await instance.post("/api/auth/login", {
        email: loginEmail,
        password: loginPassword,
      })

      const { accessToken, refreshToken } = response.data
      localStorage.setItem("token", accessToken)
      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)

      // Gọi API lấy user profile mới nhất
      let userProfile = null;
      let userId = "";
      let username = "";
      try {
        const profileRes = await instance.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (profileRes.data && profileRes.data.success && profileRes.data.user) {
          userProfile = profileRes.data.user;
          userId = userProfile._id || userProfile.id || "";
          username = userProfile.username || "";
          localStorage.setItem("userId", userId);
          localStorage.setItem("username", username);
          localStorage.setItem("email", userProfile.email || "");
          localStorage.setItem("user", JSON.stringify(userProfile));
        }
      } catch (e) {
        // fallback nếu lỗi: lấy từ token decode và email
        try {
          const decoded: any = jwt_decode(accessToken);
          userId = decoded.userId || "";
          username = loginEmail;
          localStorage.setItem("userId", userId);
          localStorage.setItem("username", username);
          localStorage.setItem("user", JSON.stringify({ _id: userId, username: username, email: loginEmail }));
        } catch {}
      }

      // Decode token để lấy role (giả sử backend trả role trong token)
      const decoded: any = jwt_decode(accessToken)
      const role = decoded.role
      // Đã lấy userId, name từ profile ở trên
      localStorage.setItem("role", role)
      window.dispatchEvent(new Event("user-updated"));

      toast.success("Đăng nhập thành công!")

      // Chuyển hướng theo role
      if (role === "admin") {
        router.push("/admin")
      } else {
        router.push("/")
      }
    } catch (error: any) {
      const msg = error?.response?.data?.msg || error?.response?.data?.message || "Lỗi đăng nhập";
      
      // Xử lý các trường hợp lỗi cụ thể
      if (error?.response?.status === 401) {
        if (msg.includes("mật khẩu") || msg.includes("password")) {
          setLoginErrors({ password: "Mật khẩu không đúng" });
        } else if (msg.includes("tài khoản") || msg.includes("email") || msg.includes("user")) {
          setLoginErrors({ email: "Tài khoản không tồn tại" });
        } else {
          toast.error(msg);
        }
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Validate từng trường khi nhập/chuyển focus
  const handleRegisterEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRegisterEmail(value);
    let error = "";
    if (!value) error = "Email là bắt buộc";
    else if (!validateEmail(value)) error = "Email không hợp lệ";
    setRegisterErrors(prev => ({ ...prev, email: error }));
  };

  const handleRegisterPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRegisterPassword(value);
    let error = "";
    if (!value) error = "Mật khẩu là bắt buộc";
    else if (!validatePassword(value)) error = "Mật khẩu không đủ mạnh";
    setRegisterErrors(prev => ({ ...prev, password: error }));
  };

  const handleRegisterConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRegisterConfirm(value);
    let error = "";
    if (value !== registerPassword) error = "Mật khẩu xác nhận không khớp";
    setRegisterErrors(prev => ({ ...prev, confirm: error }));
  };

  const handleRegisterFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRegisterFullName(value);
    let error = "";
    if (!value.trim()) error = "Họ và tên là bắt buộc";
    setRegisterErrors(prev => ({ ...prev, fullName: error }));
  };

  const handleRegisterPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRegisterPhone(value);
    let error = "";
    if (!value) error = "Số điện thoại là bắt buộc";
    else if (!validatePhone(value)) error = "Số điện thoại không hợp lệ";
    setRegisterErrors(prev => ({ ...prev, phone: error }));
  };

  const handleRegisterDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRegisterDob(value);
    let error = "";
    if (!value) error = "Ngày sinh là bắt buộc";
    setRegisterErrors(prev => ({ ...prev, dob: error }));
  };

  const handleLoginEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLoginEmail(value);
    let error = "";
    if (!value.trim()) error = "Email là bắt buộc";
    else if (!validateEmail(value)) error = "Email không hợp lệ";
    setLoginErrors(prev => ({ ...prev, email: error }));
  };

  const handleLoginPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLoginPassword(value);
    let error = "";
    if (!value.trim()) error = "Mật khẩu là bắt buộc";
    setLoginErrors(prev => ({ ...prev, password: error }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setRegisterErrors({});

    // Validation đầy đủ
    let hasError = false;
    const errors: { email?: string; password?: string; confirm?: string; fullName?: string; phone?: string; dob?: string; address?: string } = {};

    // Validate email
    if (!registerEmail.trim()) {
      errors.email = "Email là bắt buộc";
      hasError = true;
    } else if (!validateEmail(registerEmail)) {
      errors.email = "Email không hợp lệ";
      hasError = true;
    }

    // Validate password
    if (!registerPassword.trim()) {
      errors.password = "Mật khẩu là bắt buộc";
      hasError = true;
    } else if (!validatePassword(registerPassword)) {
      errors.password = "Mật khẩu không đủ mạnh";
      hasError = true;
    }

    // Validate confirm password
    if (registerPassword !== registerConfirm) {
      errors.confirm = "Mật khẩu xác nhận không khớp";
      hasError = true;
    }

    // Validate full name
    if (!registerFullName.trim()) {
      errors.fullName = "Họ và tên là bắt buộc";
      hasError = true;
    }

    // Validate phone
    if (!registerPhone.trim()) {
      errors.phone = "Số điện thoại là bắt buộc";
      hasError = true;
    } else if (!validatePhone(registerPhone)) {
      errors.phone = "Số điện thoại không hợp lệ";
      hasError = true;
    }

    // Validate date of birth
    if (!registerDob) {
      errors.dob = "Ngày sinh là bắt buộc";
      hasError = true;
    }

    // Validate address
    if (!selectedAddress.province || !selectedAddress.ward) {
      errors.address = "Địa chỉ là bắt buộc";
      hasError = true;
    }

    if (hasError) {
      setRegisterErrors(errors);
      setIsLoading(false);
      return;
    }

    const username = registerFullName;
    const email = registerEmail;
    const password = registerPassword;
    const fullName = registerFullName;
    const phone = registerPhone;
    const dob = registerDob;
    const gender = (document.querySelector('input[name="register-gender"]:checked') as HTMLInputElement)?.value || "other"
    const address = selectedAddress.fullAddress || ""

    try {
      const res = await instance.post("/api/auth/register", {
        username: username || fullName,
        email,
        password,
        fullName,
        phone,
        dob,
        gender,
        address,
        province: selectedAddress.province,
        ward: selectedAddress.ward,
        detail: selectedAddress.detail,
      })

      toast.success("Đăng ký thành công, bạn có thể đăng nhập!")
      // Chuyển sang form đăng nhập sau khi đăng ký thành công
      setIsRegister(false);
      setLoginEmail(email);
    } catch (err: any) {
      console.log("Lỗi đăng ký:", err?.response?.data);
      const msg = err?.response?.data?.msg || err?.response?.data?.message || "Lỗi đăng ký";
      
      // Xử lý các trường hợp lỗi cụ thể
      if (err?.response?.status === 400) {
        if (msg.includes("email") && msg.includes("tồn tại")) {
          setRegisterErrors({ email: "Email đã tồn tại" });
        } else if (msg.includes("mật khẩu")) {
          setRegisterErrors({ password: "Mật khẩu không đủ mạnh" });
        } else {
          toast.error(msg);
        }
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Ảnh nền */}
      <div className="absolute inset-0 bg-[url('/Banner.png')] bg-cover bg-center z-0" />
      {/* Overlay màu hồng nhạt */}
      <div className="absolute inset-0 bg-pink-100/70 z-10" />
      {/* Khung đăng nhập/đăng ký */}
      <div className="relative z-20 w-full max-w-5xl">
        <div className="relative min-h-[750px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-row transition-all duration-700">
          {/* Panel chuyển đổi */}
          <div className={`absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center transition-all duration-700 z-10 ${isRegister ? 'bg-pink-100' : 'bg-pink-200'} ${isRegister ? 'translate-x-0' : 'translate-x-full'} ${isRegister ? 'order-1' : 'order-2'} p-8 md:p-12`}
            style={{ borderTopLeftRadius: 24, borderBottomLeftRadius: 24, borderTopRightRadius: isRegister ? 24 : 0, borderBottomRightRadius: isRegister ? 24 : 0 }}>
            <div className="flex flex-col items-center justify-center h-full w-full max-w-xs mx-auto text-center">
              <div className="mb-8">
                <img src={isRegister ? "/Logo3.svg" : "/dethuong.jpg"} alt="Thú bông minh họa" className="w-40 h-40 object-contain rounded-2xl shadow-lg mx-auto border-2 border-pink-200" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-pink-500">
                {isRegister ? "Chào mừng bạn đến với Gấu Xinh" : "Bắt đầu hành trình sáng tạo của bạn!"}
              </h3>
              <p className="text-gray-500 mb-6">
                {isRegister ? "Nếu đã có tài khoản, hãy đăng nhập để tiếp tục mua sắm và thiết kế thú bông!" : "Nếu chưa có tài khoản, hãy đăng ký để trải nghiệm nhiều tính năng hấp dẫn!"}
              </p>
              <Button
                variant="outline"
                className="border-2 border-pink-400 text-pink-500 font-semibold px-8 py-2 rounded-full hover:bg-pink-100 transition"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? "Đăng nhập" : "Đăng ký"}
              </Button>
            </div>
          </div>
          {/* Form Đăng nhập */}
          <div className={`w-1/2 h-full flex flex-col justify-center items-center px-6 md:px-12 py-8 transition-all duration-700 bg-white ${isRegister ? '-translate-x-full opacity-0 pointer-events-none order-2' : 'translate-x-0 opacity-100 order-1'} relative z-20`}
            style={{ minWidth: 320, maxWidth: 480 }}>
            <div className="w-full max-w-xs mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-pink-500 text-center">Đăng nhập tài khoản</h2>
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input 
                    id="login-email" 
                    type="email" 
                    placeholder="Nhập email" 
                    value={loginEmail}
                    onChange={handleLoginEmailChange}
                    onBlur={handleLoginEmailChange}
                    className={loginErrors.email ? "border-red-500" : ""}
                    required 
                  />
                  {loginErrors.email && <div className="text-red-500 text-xs mt-1">{loginErrors.email}</div>}
                </div>
                <div className="relative">
                  <Label htmlFor="login-password">Mật khẩu</Label>
                  <Input 
                    id="login-password" 
                    type={showLoginPassword ? "text" : "password"} 
                    placeholder="Nhập mật khẩu" 
                    value={loginPassword}
                    onChange={handleLoginPasswordChange}
                    onBlur={handleLoginPasswordChange}
                    className={`pr-10 ${loginErrors.password ? "border-red-500" : ""}`}
                    required 
                  />
                  <button type="button" tabIndex={-1} className="absolute right-2 top-9 text-gray-400 hover:text-pink-500" onClick={() => setShowLoginPassword(v => !v)}>
                    {showLoginPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  {loginErrors.password && <div className="text-red-500 text-xs mt-1">{loginErrors.password}</div>}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember">Ghi nhớ đăng nhập</Label>
                  </div>
                  <Link href="/forgot-password" className="text-pink-500 hover:underline">Quên mật khẩu?</Link>
                </div>
                <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg shadow-sm" disabled={isLoading}>
                  {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
                </Button>
              </form>
              {/* Divider 'hoặc' */}
              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="mx-4 text-gray-400 text-sm">hoặc</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>
              <div className="flex mb-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 border-pink-300 text-pink-500 font-semibold py-3 rounded-lg shadow-sm hover:bg-pink-50"
                  onClick={() => signIn("google")}
                >
                  <FcGoogle className="w-6 h-6" />
                  Đăng nhập bằng Google
                </Button>
              </div>
            </div>
          </div>
          {/* Form Đăng ký */}
          <div className={`w-1/2 h-full flex flex-col justify-center items-center px-6 md:px-12 py-8 transition-all duration-700 bg-white absolute top-0 right-0 ${isRegister ? 'translate-x-0 opacity-100 pointer-events-auto order-2' : 'translate-x-full opacity-0 pointer-events-none order-1'} z-20`}
            style={{ minWidth: 320, maxWidth: 540 }}>
            <div className="w-full max-w-md mx-auto flex flex-col h-full">
              <h2 className="text-3xl font-bold text-pink-500 text-center mb-4 mt-6">Đăng ký tài khoản</h2>
              <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleRegister} className="space-y-6 bg-white rounded-2xl shadow-lg border p-6">
                  <div>
                    <Label htmlFor="register-fullname">Họ và tên</Label>
                    <Input 
                      id="register-fullname" 
                      type="text" 
                      placeholder="Nhập họ tên" 
                      value={registerFullName}
                      onChange={handleRegisterFullNameChange}
                      onBlur={handleRegisterFullNameChange}
                      className={registerErrors.fullName ? "border-red-500" : ""}
                      required 
                    />
                    {registerErrors.fullName && <div className="text-red-500 text-xs mt-1">{registerErrors.fullName}</div>}
                  </div>
                  <div>
                    <Label htmlFor="register-email">Email</Label>
                    <Input 
                      id="register-email" 
                      type="email" 
                      placeholder="Nhập email" 
                      value={registerEmail} 
                      onChange={handleRegisterEmailChange} 
                      onBlur={handleRegisterEmailChange}
                      className={registerErrors.email ? "border-red-500" : ""}
                      required 
                    />
                    {registerErrors.email && <div className="text-red-500 text-xs mt-1">{registerErrors.email}</div>}
                  </div>
                  <div>
                    <Label htmlFor="register-phone">Số điện thoại</Label>
                    <Input 
                      id="register-phone" 
                      type="tel" 
                      placeholder="0123456789" 
                      value={registerPhone}
                      onChange={handleRegisterPhoneChange}
                      onBlur={handleRegisterPhoneChange}
                      className={registerErrors.phone ? "border-red-500" : ""}
                      required 
                    />
                    {registerErrors.phone && <div className="text-red-500 text-xs mt-1">{registerErrors.phone}</div>}
                  </div>
                  <div>
                    <Label htmlFor="register-dob">Ngày sinh</Label>
                    <Input 
                      id="register-dob" 
                      type="date" 
                      value={registerDob}
                      onChange={handleRegisterDobChange}
                      onBlur={handleRegisterDobChange}
                      className={registerErrors.dob ? "border-red-500" : ""}
                      required 
                    />
                    {registerErrors.dob && <div className="text-red-500 text-xs mt-1">{registerErrors.dob}</div>}
                  </div>
                  <div>
                    <Label>Giới tính</Label>
                    <div className="flex gap-4">
                      <label><input type="radio" name="register-gender" value="male" defaultChecked /> Nam</label>
                      <label><input type="radio" name="register-gender" value="female" /> Nữ</label>
                      <label><input type="radio" name="register-gender" value="other" /> Khác</label>
                    </div>
                  </div>
                  <div>
                    <Label>Địa chỉ</Label>
                    <AddressSelector 
                      onAddressChange={(addressData) => {
                        setSelectedAddress(addressData)
                      }}
                      defaultProvince=""
                      defaultWard=""
                      defaultDetail=""
                      disableLocalStorage={true}
                    />
                    {registerErrors.address && <div className="text-red-500 text-xs mt-1">{registerErrors.address}</div>}
                  </div>
                  <div>
                    <Label htmlFor="register-password">Mật khẩu</Label>
                    <div className="relative">
                      <Input 
                        id="register-password" 
                        type={showRegisterPassword ? "text" : "password"} 
                        placeholder="Tạo mật khẩu" 
                        value={registerPassword} 
                        onChange={handleRegisterPasswordChange} 
                        onBlur={handleRegisterPasswordChange}
                        className={`pr-10 ${registerErrors.password ? "border-red-500" : ""}`}
                        required 
                      />
                      <button type="button" tabIndex={-1} className="absolute right-2 top-2 text-gray-400 hover:text-pink-500" onClick={() => setShowRegisterPassword(v => !v)}>
                        {showRegisterPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                    </div>
                    {registerErrors.password && <div className="text-red-500 text-xs mt-1">{registerErrors.password}</div>}
                    <div className="text-xs text-gray-500 mt-1">
                      Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                    <div className="relative">
                      <Input 
                        id="confirm-password" 
                        type={showRegisterConfirm ? "text" : "password"} 
                        placeholder="Nhập lại mật khẩu" 
                        value={registerConfirm} 
                        onChange={handleRegisterConfirmChange} 
                        onBlur={handleRegisterConfirmChange}
                        className={`pr-10 ${registerErrors.confirm ? "border-red-500" : ""}`}
                        required 
                      />
                      <button type="button" tabIndex={-1} className="absolute right-2 top-2 text-gray-400 hover:text-pink-500" onClick={() => setShowRegisterConfirm(v => !v)}>
                        {showRegisterConfirm ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                    </div>
                    {registerErrors.confirm && <div className="text-red-500 text-xs mt-1">{registerErrors.confirm}</div>}
                  </div>
                  <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg shadow-sm" disabled={isLoading}>
                    {isLoading ? "Đang đăng ký..." : "Đăng Ký"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
