"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  Headphones,
  ShieldCheck,
  Shield,
  Send,
  Mail,
  Phone,
  Clock,
  ArrowRight,
  ChevronDown,
  Globe,
  HelpCircle,
} from "lucide-react";
import { message } from "antd";

export default function PublicFooter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      message.warning("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }
    setIsSubmitting(true);
    // Phản hồi thân thiện thông báo ghi nhận email mà không gọi API giả lập
    setTimeout(() => {
      message.success("Cảm ơn bạn đã đăng ký! CAREZA sẽ gửi thông tin việc làm phù hợp tới email của bạn.");
      setEmail("");
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <footer className="w-full relative bg-gradient-to-b from-[#f8faff] via-white to-[#edf5ff]/40 border-t border-blue-100/70 pt-10 pb-5 overflow-hidden text-slate-600 font-sans">
      {/* Họa tiết sóng mềm tinh tế đỉnh footer */}
      <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none opacity-45">
        <svg
          viewBox="0 0 1440 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-14 sm:h-20 object-cover"
          preserveAspectRatio="none"
        >
          <path
            d="M0,35 C320,75 520,10 760,42 C1000,74 1160,18 1440,35 L1440,0 L0,0 Z"
            fill="url(#footer-wave-grad-1)"
          />
          <path
            d="M0,50 C260,20 540,65 840,32 C1140,0 1280,48 1440,38 L1440,0 L0,0 Z"
            fill="url(#footer-wave-grad-2)"
            opacity="0.45"
          />
          <defs>
            <linearGradient id="footer-wave-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#dbeafe" />
              <stop offset="50%" stopColor="#e0e7ff" />
              <stop offset="100%" stopColor="#bfdbfe" />
            </linearGradient>
            <linearGradient id="footer-wave-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#bfdbfe" />
              <stop offset="100%" stopColor="#dbeafe" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Họa tiết sóng mềm tinh tế đáy footer */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none opacity-30">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-12 sm:h-16 object-cover"
          preserveAspectRatio="none"
        >
          <path
            d="M0,25 C360,55 720,5 1080,35 C1260,48 1380,22 1440,28 L1440,60 L0,60 Z"
            fill="#dbeafe"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Bố cục ngang nhiều cột */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-[1.3fr_1fr_1fr_1.1fr_0.9fr_1.35fr] gap-8 lg:gap-6 items-start">
          {/* Cột 1: Thương hiệu */}
          <div className="flex flex-col space-y-4">
            <Link href="/" className="inline-block focus:outline-hidden">
              <img
                src="/images/logos/010cd82d-47e5-4e32-86e1-2df16032be39.png"
                alt="CAREZA"
                className="h-10 sm:h-11 w-auto object-contain"
              />
            </Link>
            <p className="text-[13px] text-slate-500 leading-relaxed font-normal max-w-[270px]">
              Nền tảng tuyển dụng thông minh, ứng dụng AI để kết nối ứng viên phù hợp với doanh nghiệp, tạo giá trị bền vững cho cả hai bên.
            </p>
            {/* Biểu tượng mạng xã hội */}
            <div className="flex items-center gap-2.5 pt-1">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-xl bg-blue-50/70 border border-blue-100/90 hover:bg-blue-600 hover:border-blue-600 text-blue-600 hover:text-white transition-all duration-200 shadow-2xs flex items-center justify-center group"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-xl bg-blue-50/70 border border-blue-100/90 hover:bg-blue-600 hover:border-blue-600 text-blue-600 hover:text-white transition-all duration-200 shadow-2xs flex items-center justify-center group"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-xl bg-blue-50/70 border border-blue-100/90 hover:bg-blue-600 hover:border-blue-600 text-blue-600 hover:text-white transition-all duration-200 shadow-2xs flex items-center justify-center group"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              {/* TikTok */}
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-9 h-9 rounded-xl bg-blue-50/70 border border-blue-100/90 hover:bg-blue-600 hover:border-blue-600 text-blue-600 hover:text-white transition-all duration-200 shadow-2xs flex items-center justify-center group"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Cột 2: Khám phá */}
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-4">
              <Briefcase className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Khám phá</span>
            </div>
            <ul className="space-y-2.5 text-[13px] text-slate-600 list-none p-0 m-0 font-normal">
              <li>
                <Link className="hover:text-blue-600 transition-colors block" href="/viec-lam">
                  Tìm kiếm việc làm
                </Link>
              </li>
              <li>
                <Link className="hover:text-blue-600 transition-colors block" href="/cam-nang-nghe-nghiep">
                  Cẩm nang sự nghiệp
                </Link>
              </li>
              <li>
                <Link className="hover:text-blue-600 transition-colors block" href="/ung-vien/cv">
                  Mẫu CV chuyên nghiệp
                </Link>
              </li>
              <li>
                <Link className="hover:text-blue-600 transition-colors block" href="/cong-cu/tinh-luong-gross-net">
                  Công cụ tính lương Gross - Net
                </Link>
              </li>
              <li>
                <Link className="hover:text-blue-600 transition-colors block" href="/ai-career">
                  Trợ lý Hướng nghiệp AI
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Dành cho bạn */}
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-4">
              <Users className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Dành cho bạn</span>
            </div>
            <ul className="space-y-2.5 text-[13px] text-[#0F172A] list-none p-0 m-0 font-normal">
              <li>
                <Link
                  href="/ung-vien/ho-so"
                  className="hover:text-blue-600 transition-colors block text-[#0F172A]"
                >
                  Ứng viên
                </Link>
              </li>
              <li>
                <Link
                  href="/nha-tuyen-dung"
                  className="hover:text-blue-600 transition-colors block text-[#0F172A]"
                >
                  Nhà tuyển dụng
                </Link>
              </li>
              <li>
                <Link
                  href="/ung-vien/cv/builder"
                  className="hover:text-blue-600 transition-colors block text-[#0F172A]"
                >
                  Tạo CV ngay
                </Link>
              </li>
              <li>
                <Link
                  href="/doanh-nghiep/tin-tuyen-dung/them-moi"
                  className="hover:text-blue-600 transition-colors block text-[#0F172A]"
                >
                  Đăng tin tuyển dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Hỗ trợ */}
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-4">
              <Headphones className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Hỗ trợ</span>
            </div>
            <ul className="space-y-3 text-[13px] text-slate-600 list-none p-0 m-0 font-normal">
              <li>
                <a
                  href="mailto:contact@careza.vn"
                  className="flex items-center gap-2.5 hover:text-blue-600 transition-colors group"
                >
                  <Mail className="w-4 h-4 text-blue-600 shrink-0 group-hover:scale-105 transition-transform" />
                  <span>contact@careza.vn</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:0848482247"
                  className="flex items-center gap-2.5 hover:text-blue-600 transition-colors group"
                >
                  <Phone className="w-4 h-4 text-blue-600 shrink-0 group-hover:scale-105 transition-transform" />
                  <span>(0848) 482247</span>
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-slate-500">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Thứ 2 – Thứ 6 <br /> 08:30 – 17:30</span>

              </li>
            </ul>
            <div className="pt-3">
              <Link
                href="/dieu-khoan"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full border border-blue-200/90 bg-blue-50/70 hover:bg-blue-100/90 text-blue-700 text-xs font-medium transition-all shadow-2xs group"
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Trung tâm hỗ trợ</span>
                <ArrowRight className="w-3 h-3 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Cột 5: Chính sách */}
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-4">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Chính sách</span>
            </div>
            <ul className="space-y-2.5 text-[13px] text-[#0F172A] list-none p-0 m-0 font-normal">
              <li>
                <Link className="text-[#0F172A] hover:text-blue-600 transition-colors block" href="/dieu-khoan">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link className="text-[#0F172A] hover:text-blue-600 transition-colors block" href="/chinh-sach">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link className="text-[#0F172A] hover:text-blue-600 transition-colors block" href="/dieu-khoan">
                  Quy chế hoạt động
                </Link>
              </li>
              <li>
                <Link className="text-[#0F172A] hover:text-blue-600 transition-colors block" href="/chinh-sach">
                  Chính sách cookie
                </Link>
              </li>
              <li>
                <Link className="text-[#0F172A] hover:text-blue-600 transition-colors block" href="/chinh-sach">
                  Giải quyết khiếu nại
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 6: Nhận tin tuyển dụng mới */}
          <div className="bg-gradient-to-br from-[#ebf3ff] via-[#f4f8fe] to-[#e4efff] border border-blue-100/90 rounded-2xl p-4 sm:p-5 shadow-2xs relative overflow-hidden">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-1.5">
              <Send className="w-4 h-4 text-blue-600 -rotate-12 shrink-0" />
              <span>Nhận tin tuyển dụng mới</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed mb-3.5 font-normal">
              Đăng ký để nhận gợi ý việc làm phù hợp và các cập nhật mới nhất từ CAREZA.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2.5">
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200/90 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0d47a1] hover:bg-[#0a3880] active:scale-[0.99] text-white font-medium text-xs py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70"
              >
                <span>Đăng ký ngay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Thanh cuối Footer */}
        <div className="mt-5 pt-4 border-t border-slate-200/70 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            {/* Bản quyền */}
            <div className="font-medium text-slate-600 text-center lg:text-left">
              © 2026 <strong className="text-slate-800 font-bold">CAREZA</strong>. Tất cả quyền được bảo lưu.
            </div>

            {/* Các điểm nhấn ngắn về nền tảng */}
            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Việc làm uy tín</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Ứng viên chất lượng</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Thông tin an toàn</span>
              </div>
            </div>

            {/* Ngôn ngữ */}
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Tiếng Việt</span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
