"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { Form, Input, Button, App, Spin } from "antd";
import { MailOutlined, CheckCircleOutlined, KeyOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";

const forgotPasswordSchema = zod.object({
  email: zod.string().email("Email không hợp lệ"),
});

type ForgotPasswordFields = zod.infer<typeof forgotPasswordSchema>;

function ForgotPasswordForm() {
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailSent, setEmailSent] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFields>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFields) => {
    setSubmitting(true);
    try {
      await authService.forgotPassword(data.email);
      setEmailSent(data.email);
      setSubmitted(true);
      message.success("Đã gửi link khôi phục mật khẩu đến email của bạn.");
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Gửi yêu cầu thất bại. Vui lòng kiểm tra lại email.";
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden flex flex-col lg:flex-row bg-[#f8fbff] font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900 select-none">
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        
        .font-handwriting {
          font-family: 'Caveat', cursive, sans-serif;
        }
        
        .forgot-input .ant-input-affix-wrapper {
          border-radius: 12px;
          border-color: #e2e8f0;
          padding: 8px 14px;
          background-color: #ffffff;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
          transition: all 0.2s ease;
        }
        
        .forgot-input .ant-input-affix-wrapper:hover {
          border-color: #93c5fd;
        }
        
        .forgot-input .ant-input-affix-wrapper-focused,
        .forgot-input .ant-input-affix-wrapper:focus {
          border-color: #0062ff !important;
          box-shadow: 0 0 0 3px rgba(0, 98, 255, 0.12) !important;
        }

        .forgot-input .ant-input {
          font-size: 13px;
          color: #1e293b;
        }

        .forgot-input .ant-input::placeholder {
          color: #94a3b8;
          font-size: 12.5px;
        }

        @keyframes float-slow-1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        .animate-float-1 {
          animation: float-slow-1 5s ease-in-out infinite;
        }
      `}} />

      {/* =========================================================================
          CỘT TRÁI (3/5 MÀN HÌNH - 60%): ẢNH HERO DANGNHAP.PNG + BRANDING + TEXT
         ========================================================================= */}
      <div className="w-full lg:w-3/5 h-full relative flex flex-col justify-between p-6 sm:p-8 lg:p-12 overflow-hidden bg-[#edf3fd]">

        {/* Ảnh nền rõ nét */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          <img
            src="/images/banners/dangnhap.webp"
            alt="Careza Workspace"
            className="w-full h-full object-cover object-[center_bottom] filter brightness-[1.01]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/35 to-transparent" />
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/60 via-white/20 to-transparent" />
        </div>

        {/* 1. Header Logo Careza & Slogan */}
        <div className="relative z-20 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0052d9] to-[#0070f3] flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                <circle cx="19" cy="5" r="2" />
                <circle cx="5" cy="19" r="1.5" />
              </svg>
            </div>
            <span className="text-[23px] font-black tracking-tight text-[#0052d9]">
              Careza
            </span>
          </Link>
          <div className="h-6 w-[1px] bg-slate-300/80 mx-1" />
          <div className="flex flex-col text-[10px] font-semibold text-slate-600 leading-tight">
            <span>Kết nối nhân tài</span>
            <span>Kiến tạo sự nghiệp</span>
          </div>
        </div>

        {/* 2. Hero Headline, Badge dạng vạch, Highlight cọ vàng, Mô tả */}
        <div className="relative z-20 mt-6 sm:mt-8 lg:mt-10 mb-auto max-w-md lg:max-w-lg">

          {/* Badge: KHÔI PHỤC TÀI KHOẢN */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-[#0062ff]">
              KHÔI PHỤC TÀI KHOẢN
            </span>
            <div className="h-[2px] w-12 bg-blue-300/80 rounded-full" />
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-slate-900 leading-[1.18] tracking-tight m-0">
            Lấy lại quyền truy cập<br />
            nhanh{" "}
            <span className="relative inline-block text-[#0062ff]">
              chóng & an toàn
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

          {/* Mô tả */}
          <p className="mt-3.5 text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal max-w-sm sm:max-w-md">
            Chúng tôi sẽ gửi liên kết bảo mật giúp bạn đặt lại mật khẩu và tiếp tục hành trình sự nghiệp.
          </p>

          {/* 1 Floating Badge */}
          <div className="mt-5 inline-flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-blue-100 shadow-xs">
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center font-bold text-sm">
              <KeyOutlined />
            </div>
            <div className="text-left">
              <div className="text-[11.5px] font-bold text-slate-800 leading-tight">Xác thực qua Email</div>
              <div className="text-[9.5px] text-slate-400 font-medium">Bảo mật đa tầng theo tiêu chuẩn</div>
            </div>
          </div>
        </div>

        {/* 1 Floating Card trên không gian ảnh */}
        <div className="hidden sm:flex absolute right-6 lg:right-12 top-[35%] z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-[0_12px_32px_rgba(0,40,110,0.1)] border border-white items-center gap-3 animate-float-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 text-white flex items-center justify-center text-lg shadow-xs">
            <MailOutlined />
          </div>
          <div>
            <div className="text-[13px] font-black text-slate-900 leading-tight">Khôi phục tức thì</div>
            <div className="text-[9.5px] text-slate-400 font-medium">Chỉ trong 1 phút</div>
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
          CỘT PHẢI (2/5 MÀN HÌNH - 40%): FORM QUÊN MẬT KHẨU
         ========================================================================= */}
      <div className="w-full lg:w-2/5 h-full relative bg-[#f4f8fe] flex flex-col justify-between items-center p-5 sm:p-7 lg:p-8 z-10 overflow-hidden select-none">

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
        <div className="w-full flex justify-end items-start relative z-20 max-w-[400px]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#0062ff] hover:text-blue-700 transition-colors py-1 px-2.5 rounded-full hover:bg-blue-50/60"
          >
            <span>Về Careza</span>
            <span className="text-base leading-none">→</span>
          </Link>
        </div>

        {/* ==================== KHỐI CARD FORM CHÍNH ==================== */}
        <div className="w-full max-w-[395px] my-auto relative z-20">
          <div className="bg-white rounded-[32px] p-6 sm:p-7 shadow-[0_20px_45px_rgba(0,40,120,0.06)] border border-slate-100/90 relative">

            {!submitted ? (
              <>
                {/* Header Form */}
                <div className="mb-4">
                  <h2 className="text-[23px] sm:text-[25px] font-black text-slate-900 tracking-tight m-0">
                    Quên mật khẩu?
                  </h2>
                  <p className="text-[12px] text-slate-400 font-medium mt-1">
                    Nhập email đăng ký để nhận liên kết khôi phục mật khẩu
                  </p>
                </div>

                {/* Form Ant Design + React Hook Form */}
                <Form layout="vertical" onFinish={handleSubmit(onSubmit)} requiredMark={false} className="forgot-input">

                  {/* Email */}
                  <Form.Item
                    validateStatus={errors.email ? "error" : ""}
                    help={errors.email?.message}
                    className="mb-4"
                  >
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          prefix={<MailOutlined className="text-slate-400 mr-1.5 text-sm" />}
                          placeholder="Nhập email tài khoản của bạn"
                          autoComplete="email"
                        />
                      )}
                    />
                  </Form.Item>

                  {/* Button Gửi liên kết */}
                  <Form.Item className="mb-3.5">
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      loading={submitting}
                      className="bg-[#0062ff] hover:bg-[#0052d9] text-white border-none rounded-xl h-10 text-[13.5px] font-bold shadow-[0_6px_16px_rgba(0,98,255,0.25)] hover:shadow-[0_8px_20px_rgba(0,98,255,0.35)] transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Gửi liên kết khôi phục</span>
                      <span className="text-base leading-none">→</span>
                    </Button>
                  </Form.Item>

                  {/* Chuyển hướng Đăng nhập */}
                  <div className="text-center">
                    <Link href="/dang-nhap" className="text-[11.5px] text-[#0062ff] hover:underline font-bold inline-flex items-center gap-1">
                      <span>← Quay lại đăng nhập</span>
                    </Link>
                  </div>
                </Form>
              </>
            ) : (
              /* State đã gửi email thành công */
              <div className="text-center py-3">
                <div className="w-16 h-16 bg-blue-50 text-[#0062ff] rounded-full flex items-center justify-center mx-auto mb-3 text-3xl shadow-xs">
                  <MailOutlined />
                </div>
                <h3 className="text-[20px] font-black text-slate-900 m-0">
                  Kiểm tra Email của bạn
                </h3>
                <p className="text-[12px] text-slate-500 font-medium mt-1 mb-2 leading-relaxed">
                  Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến:
                </p>
                <div className="bg-blue-50/80 border border-blue-100 rounded-xl py-2 px-3 text-slate-800 text-xs font-bold mb-3 break-all">
                  {emailSent}
                </div>
                <p className="text-[11px] text-slate-400 font-normal mb-5">
                  Nếu không nhận được, hãy kiểm tra hòm thư rác (Spam).
                </p>

                <div className="flex flex-col gap-2">
                  <Button
                    type="default"
                    block
                    onClick={() => setSubmitted(false)}
                    className="rounded-xl h-10 text-xs font-bold border-slate-200 hover:border-slate-300 text-slate-700"
                  >
                    Nhập lại email khác
                  </Button>
                  <Link href="/dang-nhap" className="block">
                    <Button
                      type="primary"
                      block
                      className="bg-[#0062ff] hover:bg-[#0052d9] text-white border-none rounded-xl h-10 text-xs font-bold shadow-md"
                    >
                      Quay lại đăng nhập →
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer: An toàn · Bảo mật · Luôn đồng hành */}
        <div className="relative z-20 flex items-center justify-center gap-6 text-[11.5px] text-slate-500 font-medium pt-1">
          <div className="flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>An toàn</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Bảo mật</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Luôn đồng hành</span>
          </div>
        </div>

        {/* Shape sóng gradient xanh - tím nhiều lớp góc dưới cùng bên phải */}
        <div className="hidden lg:flex absolute bottom-0 right-0 w-48 h-36 rounded-tl-[130px] bg-gradient-to-tr from-[#0052d9] via-[#2563eb] to-[#7c3aed] text-white flex-col justify-end p-5 shadow-lg pointer-events-none z-10">
          <div className="text-[9.5px] font-extrabold tracking-wider leading-tight text-white/95">
            VÌ NHỮNG ✦<br />
            GIÁ TRỊ TỐT ĐẸP<br />
            HƠN MỖI NGÀY
          </div>
        </div>

        {/* Lớp sóng tím phụ phía dưới */}
        <div className="hidden lg:block absolute -bottom-6 -right-6 w-56 h-40 rounded-tl-[140px] bg-gradient-to-tr from-[#3b82f6]/40 to-[#a855f7]/50 blur-[2px] pointer-events-none z-0" />

      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-[#f5f8ff]"><Spin size="large" /></div>}>
      <App>
        <ForgotPasswordForm />
      </App>
    </Suspense>
  );
}

