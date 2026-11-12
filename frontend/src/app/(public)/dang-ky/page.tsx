"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth-store";
import { Form, Input, Button, Checkbox, App, Spin } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  NumberOutlined
} from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { RoleCode } from "@/enums/role.enum";

const registerSchema = zod
  .object({
    accountType: zod.enum(["CANDIDATE", "COMPANY"]),
    fullName: zod.string().min(2, "Họ tên phải từ 2 ký tự"),
    email: zod.string().email("Email không hợp lệ"),
    password: zod
      .string()
      .min(8, "Mật khẩu phải từ 8 ký tự trở lên")
      .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ hoa")
      .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ thường")
      .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 chữ số"),
    confirmPassword: zod.string().min(1, "Xác nhận mật khẩu là bắt buộc"),
    phoneNumber: zod
      .string()
      .regex(/^(0|\+84)[0-9]{9,10}$/, "Số điện thoại không hợp lệ (ví dụ: 0912345678)")
      .optional()
      .or(zod.literal("")),
    companyName: zod.string().optional(),
    taxCode: zod.string().optional(),
    agreeTerms: zod.boolean().refine((val) => val === true, {
      message: "Bạn cần đồng ý với Điều khoản và Chính sách của Careza",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.accountType === "COMPANY") {
        return !!data.companyName && data.companyName.trim().length >= 3;
      }
      return true;
    },
    {
      message: "Tên công ty phải từ 3 ký tự trở lên",
      path: ["companyName"],
    }
  )
  .refine(
    (data) => {
      if (data.accountType === "COMPANY") {
        return !!data.taxCode && /^\d{10,13}$/.test(data.taxCode.trim());
      }
      return true;
    },
    {
      message: "Mã số thuế phải là số dài từ 10-13 ký tự",
      path: ["taxCode"],
    }
  );

type RegisterFields = zod.infer<typeof registerSchema>;

function RegisterForm() {
  const { message } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [submitting, setSubmitting] = useState(false);

  const defaultType = searchParams.get("type") === "COMPANY" ? "COMPANY" : "CANDIDATE";

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      accountType: defaultType,
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      companyName: "",
      taxCode: "",
      agreeTerms: true,
    },
  });

  const accountType = watch("accountType");

  const onSubmit = async (data: RegisterFields) => {
    setSubmitting(true);
    try {
      const response = await authService.register({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber || undefined,
        accountType: data.accountType,
        companyName: data.accountType === "COMPANY" ? data.companyName : undefined,
        taxCode: data.accountType === "COMPANY" ? data.taxCode : undefined,
      });

      const user = response.data.user;
      setAuth(user);
      if (response.data.company) {
        useAuthStore.getState().setCompanyInfo(response.data.company);
      }
      message.success("Đăng ký tài khoản thành công!");

      if (data.accountType === "COMPANY") {
        window.location.href = "/doanh-nghiep/dashboard";
      } else {
        window.location.href = "/ung-vien/ho-so";
      }
    } catch (error: any) {
      const apiErrors = error.response?.data?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        const errorDetails = apiErrors.map((e: any) => e.message).join(". ");
        message.error(errorDetails || "Thông tin không hợp lệ.");
      } else {
        const errorMsg = error.response?.data?.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.";
        message.error(errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen w-full overflow-x-hidden lg:overflow-hidden flex flex-col lg:flex-row bg-[#f8fbff] font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900 select-none">
      {/* Google Fonts: Caveat (viết tay) & Font styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        
        .font-handwriting {
          font-family: 'Caveat', cursive, sans-serif;
        }
        
        .register-input .ant-input-affix-wrapper {
          border-radius: 12px;
          border-color: #e2e8f0;
          padding: 7px 13px;
          background-color: #ffffff;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
          transition: all 0.2s ease;
        }
        
        .register-input .ant-input-affix-wrapper:hover {
          border-color: #93c5fd;
        }
        
        .register-input .ant-input-affix-wrapper-focused,
        .register-input .ant-input-affix-wrapper:focus {
          border-color: #0062ff !important;
          box-shadow: 0 0 0 3px rgba(0, 98, 255, 0.12) !important;
        }

        .register-input .ant-input {
          font-size: 13px;
          color: #1e293b;
        }

        .register-input .ant-input::placeholder {
          color: #94a3b8;
          font-size: 12.5px;
        }

        .register-input .ant-form-item {
          margin-bottom: 15px;
        }

        @keyframes float-slow-1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        @keyframes float-slow-2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        .animate-float-1 {
          animation: float-slow-1 5s ease-in-out infinite;
        }

        .animate-float-2 {
          animation: float-slow-2 6s ease-in-out infinite;
          animation-delay: 1.5s;
        }
      `}} />

      {/* =========================================================================
          CỘT TRÁI (3/5 MÀN HÌNH - 60%): ẢNH BANNERS/DANGNHAP.WEBP + BRANDING + TEXT + 2 FLOATING CARDS
         ========================================================================= */}
      <div className="w-full lg:w-3/5 min-h-[420px] lg:h-full relative flex flex-col justify-between p-6 sm:p-8 lg:p-12 overflow-hidden bg-[#edf3fd]">

        {/* Ảnh nền rõ nét, căn chỉnh không gian bàn làm việc */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          <img
            src="/images/banners/dangnhap.webp"
            alt="Careza Workspace"
            className="w-full h-full object-cover object-[center_bottom] filter brightness-[1.01]"
          />
          {/* Lớp gradient sáng nhẹ giữ độ nét và làm nổi chữ */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/35 to-transparent" />
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/60 via-white/20 to-transparent" />
        </div>

        {/* 1. Header Logo Careza & Slogan */}
        <div className="relative z-20 flex items-center">
          <Link href="/" className="inline-flex items-center group">
            <img
              src="/images/logos/010cd82d-47e5-4e32-86e1-2df16032be39.png"
              alt="Careza - Kết nối nhân tài, Kiến tạo sự nghiệp"
              className="h-[72px] sm:h-[82px] lg:h-[88px] w-auto object-contain mix-blend-multiply group-hover:scale-[1.02] transition-transform"
            />
          </Link>
        </div>

        {/* 2. Hero Headline, Highlight cọ vàng, Mô tả & 3 Badges (Vị trí giữ nguyên chính xác) */}
        <div className="relative z-20 mt-[26px] sm:mt-[36px] lg:mt-[44px] mb-auto max-w-md lg:max-w-lg">
          {/* Headline lớn */}
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-slate-900 leading-[1.18] tracking-tight m-0">
            Cùng bạn chạm tới<br />
            phiên{" "}
            <span className="relative inline-block text-[#0062ff]">
              bản tốt hơn
              {/* Nét highlight cọ vàng vẽ tay lượn sóng bằng SVG */}
              <svg
                className="absolute -bottom-2.5 left-0 w-full h-3 text-[#facc15] pointer-events-none"
                viewBox="0 0 200 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 8.5C35 4 85 2.5 197 6.5C145 9.5 65 10.5 8 10"
                  stroke="currentColor"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* Đoạn mô tả */}
          <p className="mt-4 mb-1 text-[13.5px] sm:text-[15px] text-slate-700 leading-relaxed font-semibold tracking-[0.01em] max-w-sm sm:max-w-md">
            Kết nối đúng cơ hội, phát triển đúng tiềm năng.
          </p>

          {/* 3 Mục lợi ích (Icon + Text) */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {/* Item 1: Việc làm chất lượng */}
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs hover:scale-[1.02] transition-transform">
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-[11px] font-bold text-slate-800 leading-tight">Việc làm</div>
                <div className="text-[9.5px] text-slate-500 font-medium">chất lượng</div>
              </div>
            </div>

            {/* Item 2: Phát triển kỹ năng */}
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs hover:scale-[1.02] transition-transform">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zM16.2 13h2.8v6h-2.8z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-[11px] font-bold text-slate-800 leading-tight">Phát triển</div>
                <div className="text-[9.5px] text-slate-500 font-medium">kỹ năng</div>
              </div>
            </div>

            {/* Item 3: Cộng đồng hỗ trợ */}
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs hover:scale-[1.02] transition-transform">
              <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-[11px] font-bold text-slate-800 leading-tight">Cộng đồng</div>
                <div className="text-[9.5px] text-slate-500 font-medium">hỗ trợ</div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== 2 FLOATING CARDS NỔI ==================== */}

        {/* Floating Card 1: CV phù hợp 92% */}
        <div className="hidden sm:flex absolute right-4 lg:right-8 xl:right-12 top-[30%] z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-[0_12px_32px_rgba(0,40,110,0.1)] border border-white items-center gap-3 animate-float-1 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer">
          <div className="absolute -top-3.5 -left-3.5 text-amber-400 pointer-events-none">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M4 14l3-3" />
              <path d="M10 4v4" />
              <path d="M18 10l-3 3" />
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="text-[10.5px] font-semibold text-slate-600">CV phù hợp</span>
            <span className="text-xl font-black text-slate-900 leading-none my-0.5">92%</span>
            <span className="text-[9px] text-slate-400 font-medium">Cơ hội đang chờ bạn!</span>
          </div>

          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-blue-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#0062ff]"
                strokeDasharray="92, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[9.5px] font-black text-[#0062ff]">92%</span>
          </div>
        </div>

        {/* Floating Card 2: 24+ việc làm phù hợp */}
        <div className="hidden sm:flex absolute right-4 lg:right-8 xl:right-12 top-[44%] z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-[0_12px_32px_rgba(0,40,110,0.1)] border border-white flex-col gap-1 animate-float-2 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer">
          <div>
            <div className="text-[13.5px] font-black text-slate-900 leading-tight">24+</div>
            <div className="text-[9.5px] text-slate-500 font-medium">việc làm phù hợp</div>
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="flex -space-x-2 overflow-hidden">
              <img className="inline-block h-5 w-5 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80" alt="Avatar 1" />
              <img className="inline-block h-5 w-5 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80" alt="Avatar 2" />
              <img className="inline-block h-5 w-5 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80" alt="Avatar 3" />
              <img className="inline-block h-5 w-5 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80" alt="Avatar 4" />
            </div>
            <div className="w-5 h-5 rounded-full bg-[#0062ff] text-white flex items-center justify-center shadow-xs">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>
        </div>

        {/* 3. Footer góc trái: Scroll khám phá */}
        <div className="relative z-20 flex items-center gap-2 text-slate-600 text-[10px] font-bold tracking-widest uppercase">
          <div className="w-3.5 h-5 rounded-full border-2 border-slate-500 flex items-start justify-center p-0.5">
            <div className="w-1 h-1.5 bg-slate-600 rounded-full animate-bounce mt-0.5" />
          </div>
          <div>
            <div>SCROLL</div>
            <div className="text-[8.5px] text-slate-500 font-medium">ĐỂ KHÁM PHÁ</div>
          </div>
        </div>

      </div>

      {/* =========================================================================
          CỘT PHẢI (2/5 MÀN HÌNH - 40%): FORM ĐĂNG KÝ + DOTTED GRID + CÁC LỚP SÓNG LƯỢN + SHAPE GRADIENT
         ========================================================================= */}
      <div className="w-full lg:w-2/5 lg:h-full relative bg-[#f4f8fe] flex flex-col justify-between items-center p-5 sm:p-7 lg:p-8 z-10 overflow-y-auto overflow-x-hidden select-none">

        {/* Vòm tròn mờ xanh pastel lớn trên đỉnh */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[480px] sm:w-[520px] h-[340px] rounded-b-[260px] bg-gradient-to-b from-[#d9ebff] via-[#e6f2ff] to-transparent pointer-events-none z-0 opacity-80" />

        {/* Cụm chấm bi Dotted Grid Pattern ở góc trên bên phải */}
        <div className="absolute top-12 right-12 w-28 h-28 bg-[radial-gradient(#93c5fd_1.5px,transparent_1.5px)] [background-size:12px_12px] opacity-60 pointer-events-none z-0" />

        {/* Dải sóng cong mềm màu xanh pastel bên sườn phải */}
        <svg
          className="absolute right-0 top-[20%] w-48 h-[60%] text-[#dbeeff]/70 pointer-events-none z-0"
          viewBox="0 0 200 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M200 0C110 80 40 180 50 300C60 420 140 500 200 600V0Z"
            fill="currentColor"
          />
        </svg>

        {/* Vòm cong tím nhạt góc dưới bên trái */}
        <div className="absolute -bottom-8 -left-8 w-[240px] h-[200px] rounded-tr-[160px] bg-gradient-to-tr from-[#e7d8ff]/60 to-transparent pointer-events-none z-0" />

        {/* Góc trên cùng: Link "Về Careza →" */}
        <div className="w-full flex justify-end items-start relative z-20 max-w-[400px] shrink-0 mb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#0062ff] hover:text-blue-700 transition-colors py-1 px-2.5 rounded-full hover:bg-blue-50/60"
          >
            <span>Về Careza</span>
            <span className="text-base leading-none">→</span>
          </Link>
        </div>

        {/* ==================== KHỐI CARD FORM ĐĂNG KÝ CHÍNH ==================== */}
        <div className="w-full max-w-[400px] my-auto relative z-20 py-1">
          <div className="bg-white rounded-[32px] px-6 py-6 sm:px-7 sm:py-7 shadow-[0_20px_45px_rgba(0,40,120,0.06)] border border-slate-100/90 relative">

            {/* Header Form (Căn giữa) */}
            <div className="mb-4 text-center">
              <h2 className="text-[23px] sm:text-[25px] font-black text-slate-900 tracking-tight m-0 leading-tight">
                Tạo tài khoản
              </h2>
              <p className="text-[12px] text-slate-400 font-medium mt-1.5">
                Bắt đầu hành trình cùng Careza
              </p>
            </div>

            {/* Segmented Control / Tab chọn vai trò */}
            <div className="grid grid-cols-2 bg-[#f1f5f9] p-1 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setValue("accountType", "CANDIDATE")}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${accountType === "CANDIDATE"
                    ? "bg-[#e8f1ff] text-[#0062ff] shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                Người tìm việc
              </button>
              <button
                type="button"
                onClick={() => setValue("accountType", "COMPANY")}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${accountType === "COMPANY"
                    ? "bg-[#e8f1ff] text-[#0062ff] shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                Nhà tuyển dụng
              </button>
            </div>

            {/* Form Ant Design + React Hook Form */}
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)} requiredMark={false} className="register-input">

              {/* Họ và tên */}
              <Form.Item
                validateStatus={errors.fullName ? "error" : ""}
                help={errors.fullName?.message}
                className="!mb-[15px]"
              >
                <Controller
                  name="fullName"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      prefix={<UserOutlined className="text-slate-400 mr-1.5 text-sm" />}
                      placeholder={accountType === "CANDIDATE" ? "Họ và tên của bạn" : "Họ và tên người đại diện"}
                    />
                  )}
                />
              </Form.Item>

              {/* Email & Số điện thoại (Grid 2 cột) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-[15px]">
                {/* Email */}
                <Form.Item
                  validateStatus={errors.email ? "error" : ""}
                  help={errors.email?.message}
                  className="!mb-0"
                >
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        prefix={<MailOutlined className="text-slate-400 mr-1.5 text-sm" />}
                        placeholder="Email đăng nhập"
                        autoComplete="email"
                      />
                    )}
                  />
                </Form.Item>

                {/* Số điện thoại */}
                <Form.Item
                  validateStatus={errors.phoneNumber ? "error" : ""}
                  help={errors.phoneNumber?.message}
                  className="!mb-0"
                >
                  <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        prefix={<PhoneOutlined className="text-slate-400 mr-1.5 text-sm" />}
                        placeholder="Số điện thoại"
                      />
                    )}
                  />
                </Form.Item>
              </div>

              {/* Thông tin Doanh nghiệp nếu chọn Nhà tuyển dụng */}
              {accountType === "COMPANY" && (
                <div className="bg-slate-50/90 p-3 rounded-xl mb-[15px] border border-slate-200/60">
                  {/* Tên công ty */}
                  <Form.Item
                    validateStatus={errors.companyName ? "error" : ""}
                    help={errors.companyName?.message}
                    className="!mb-3"
                  >
                    <Controller
                      name="companyName"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          prefix={<BankOutlined className="text-slate-400 mr-1.5 text-sm" />}
                          placeholder="Tên công ty / Doanh nghiệp"
                        />
                      )}
                    />
                  </Form.Item>

                  {/* Mã số thuế */}
                  <Form.Item
                    validateStatus={errors.taxCode ? "error" : ""}
                    help={errors.taxCode?.message}
                    className="!mb-0"
                  >
                    <Controller
                      name="taxCode"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          prefix={<NumberOutlined className="text-slate-400 mr-1.5 text-sm" />}
                          placeholder="Mã số thuế (10-13 số)"
                        />
                      )}
                    />
                  </Form.Item>
                </div>
              )}

              {/* Mật khẩu & Xác nhận mật khẩu (Grid 2 cột) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-[19px]">
                {/* Mật khẩu */}
                <Form.Item
                  validateStatus={errors.password ? "error" : ""}
                  help={errors.password?.message}
                  className="!mb-0"
                >
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <Input.Password
                        {...field}
                        prefix={<LockOutlined className="text-slate-400 mr-1.5 text-sm" />}
                        placeholder="Mật khẩu (≥ 8 ký tự)"
                        autoComplete="new-password"
                      />
                    )}
                  />
                </Form.Item>

                {/* Xác nhận mật khẩu */}
                <Form.Item
                  validateStatus={errors.confirmPassword ? "error" : ""}
                  help={errors.confirmPassword?.message}
                  className="!mb-0"
                >
                  <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                      <Input.Password
                        {...field}
                        prefix={<LockOutlined className="text-slate-400 mr-1.5 text-sm" />}
                        placeholder="Xác nhận mật khẩu"
                        autoComplete="new-password"
                      />
                    )}
                  />
                </Form.Item>
              </div>

              {/* Checkbox Điều khoản & Chính sách */}
              <div className="mb-[18px]">
                <Controller
                  name="agreeTerms"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Checkbox
                      checked={value}
                      onChange={(e) => onChange(e.target.checked)}
                      className="text-[11.5px] text-slate-600 font-medium items-start"
                    >
                      Tôi đồng ý với{" "}
                      <Link
                        href="/dieu-khoan?tab=terms"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#0062ff] hover:underline font-semibold"
                      >
                        Điều khoản
                      </Link>{" "}
                      &{" "}
                      <Link
                        href="/dieu-khoan?tab=privacy"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#0062ff] hover:underline font-semibold"
                      >
                        Chính sách bảo mật
                      </Link>
                    </Checkbox>
                  )}
                />
                {errors.agreeTerms && (
                  <div className="text-[10.5px] text-red-500 mt-1 font-medium">
                    {errors.agreeTerms.message}
                  </div>
                )}
              </div>

              {/* Button Đăng ký chính */}
              <Form.Item className="!mb-[20px]">
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={submitting}
                  className="bg-[#0062ff] hover:bg-[#0052d9] text-white border-none rounded-xl h-10 text-[13.5px] font-bold shadow-[0_6px_16px_rgba(0,98,255,0.25)] hover:shadow-[0_8px_20px_rgba(0,98,255,0.35)] transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Đăng ký tài khoản</span>
                  <span className="text-base leading-none">→</span>
                </Button>
              </Form.Item>

              {/* Chuyển hướng Đăng nhập */}
              <div className="text-center">
                <span className="text-[11.5px] text-slate-500 font-medium">
                  Đã có tài khoản?{" "}
                  <Link href="/dang-nhap" className="text-[#0062ff] hover:underline font-bold">
                    Đăng nhập ngay →
                  </Link>
                </span>
              </div>
            </Form>
          </div>
        </div>

        {/* Shape sóng gradient xanh - tím nhiều lớp góc dưới cùng bên phải */}
        <div className="hidden lg:flex absolute bottom-0 right-0 w-48 h-36 rounded-tl-[130px] bg-gradient-to-tr from-[#0052d9] via-[#2563eb] to-[#7c3aed] text-white flex-col justify-end p-5 shadow-lg pointer-events-none z-10" />

        {/* Lớp sóng tím phụ phía dưới */}
        <div className="hidden lg:block absolute -bottom-6 -right-6 w-56 h-40 rounded-tl-[140px] bg-gradient-to-tr from-[#3b82f6]/40 to-[#a855f7]/50 blur-[2px] pointer-events-none z-0" />

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-[#f5f8ff]"><Spin size="large" /></div>}>
      <App>
        <RegisterForm />
      </App>
    </Suspense>
  );
}

