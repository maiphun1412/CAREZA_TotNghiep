"use client";

import Link from "next/link";
import { Button, Card, Row, Col } from "antd";
import {
  RocketOutlined,
  FilterOutlined,
  DashboardOutlined,
  ArrowRightOutlined,
  MessageOutlined
} from "@ant-design/icons";
import MouseSpotlight from "@/components/common/mouse-spotlight";

export default function RecruiterLandingPage() {
  return (
    <div className="w-full bg-[#f5f8ff] py-12 flex-1 relative overflow-hidden" style={{ fontFamily: "var(--font-be-vietnam), 'Be Vietnam Pro', sans-serif" }}>
      <MouseSpotlight size={600} color="rgba(15, 82, 186, 0.03)" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 1. Hero Banner */}
        <div className="relative overflow-hidden bg-white/45 backdrop-blur-[2px] border border-white/80 rounded-[48px] p-8 sm:p-16 mb-12 text-slate-800 shadow-lg">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -left-24 w-[350px] h-[350px] rounded-full bg-blue-300/10 blur-[100px]" />
            <div className="absolute top-10 right-[-100px] w-[350px] h-[350px] rounded-full bg-cyan-300/10 blur-[100px]" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-3/5 space-y-6">
              <span className="bg-blue-100 text-blue-800 text-xs font-extrabold uppercase px-4 py-1.5 rounded-full tracking-wider">
                Giải pháp Tuyển dụng Thời đại AI
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight m-0">
                Tìm kiếm tài năng <br />
                <span className="text-primary">Nhanh chóng & Hiệu quả</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                Careza kết nối doanh nghiệp của bạn với hơn 1.2 triệu ứng viên chất lượng cao. Hệ thống tích hợp Trí tuệ nhân tạo (AI) giúp tối ưu hóa 80% thời gian tuyển dụng của bạn.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/dang-ky?type=COMPANY">
                  <Button
                    type="primary"
                    size="large"
                    className="bg-primary text-white h-12 rounded-xl font-bold px-8 shadow-md shadow-blue-600/10 flex items-center gap-2 border-none"
                  >
                    Bắt đầu miễn phí <ArrowRightOutlined />
                  </Button>
                </Link>
                <Link href="/dang-nhap">
                  <Button
                    size="large"
                    className="h-12 rounded-xl font-bold px-8 border border-blue-100 hover:border-primary text-slate-700 bg-white"
                  >
                    Đăng nhập doanh nghiệp
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:w-2/5 w-full flex justify-center">
              <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-blue-100/50 w-full max-w-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                    <RocketOutlined className="text-2xl" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 m-0">Đăng tin tức thì</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Đăng tin tuyển dụng và tiếp cận ứng viên ngay trong 10 phút. Hệ thống duyệt bài tự động bằng AI siêu tốc.
                  </p>
                  <div className="h-px bg-slate-100 my-4" />
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Ứng viên đề xuất:</span>
                    <span className="text-emerald-600 font-extrabold">+95 Hồ sơ mới/ngày</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Features Grid */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 m-0">Công cụ Tuyển dụng Đột phá</h2>
            <p className="text-slate-500 text-xs mt-2 font-semibold">Careza đồng hành cùng doanh nghiệp số hóa toàn diện quy trình tuyển dụng</p>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card className="border-blue-100/50 shadow-sm rounded-[32px] hover:shadow-md transition-all h-full bg-white">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center shadow-sm">
                    <FilterOutlined className="text-xl" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800 m-0">AI Sàng lọc CV (Smart Filter)</h3>
                  <p className="text-xs text-slate-500 leading-relaxed m-0">
                    Thuật toán AI tự động đối sánh kỹ năng, kinh nghiệm của ứng viên với JD để xếp hạng hồ sơ chính xác, loại bỏ CV rác.
                  </p>
                </div>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card className="border-blue-100/50 shadow-sm rounded-[32px] hover:shadow-md transition-all h-full bg-white">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center shadow-sm">
                    <DashboardOutlined className="text-xl" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800 m-0">Hệ thống ATS Toàn diện</h3>
                  <p className="text-xs text-slate-500 leading-relaxed m-0">
                    Quản lý phễu ứng tuyển ứng viên (Pipeline), lên lịch phỏng vấn tự động, gửi email phản hồi chuyên nghiệp chỉ với 1 click.
                  </p>
                </div>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card className="border-blue-100/50 shadow-sm rounded-[32px] hover:shadow-md transition-all h-full bg-white">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center shadow-sm">
                    <MessageOutlined className="text-xl" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800 m-0">AI Bot Tự Động Phỏng Vấn</h3>
                  <p className="text-xs text-slate-500 leading-relaxed m-0">
                    Hệ thống AI Chatbot và AI Voice hỗ trợ phỏng vấn sơ loại ứng viên, báo cáo điểm số chi tiết trước khi gặp trực tiếp HR.
                  </p>
                </div>
              </Card>
            </Col>
          </Row>
        </div>

        {/* 3. Stats & Quality */}
        <div className="bg-white/60 border border-blue-100/40 rounded-[48px] p-8 sm:p-12 mb-16 text-center shadow-sm">
          <Row gutter={[32, 32]}>
            <Col xs={12} md={6}>
              <div className="space-y-1">
                <h3 className="text-3xl sm:text-4xl font-black text-primary m-0">12.000+</h3>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-extrabold">Doanh nghiệp sử dụng</p>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="space-y-1">
                <h3 className="text-3xl sm:text-4xl font-black text-primary m-0">1.2 triệu</h3>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-extrabold">Ứng viên tiềm năng</p>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="space-y-1">
                <h3 className="text-3xl sm:text-4xl font-black text-primary m-0">98%</h3>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-extrabold">Hài lòng về dịch vụ</p>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div className="space-y-1">
                <h3 className="text-3xl sm:text-4xl font-black text-primary m-0">80%</h3>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-extrabold">Giảm thời gian tuyển dụng</p>
              </div>
            </Col>
          </Row>
        </div>

        {/* 4. Pricing / Package Introduction */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 m-0">Khởi đầu Tuyển dụng Số ngay hôm nay</h2>

          <div className="pt-4">
            <Link href="/dang-ky?type=COMPANY">
              <Button
                type="primary"
                size="large"
                className="bg-primary text-white h-14 rounded-2xl font-black px-12 shadow-xl shadow-primary/20 hover:scale-105 transition-all cursor-pointer border-none"
              >
                Tạo tài khoản nhà tuyển dụng miễn phí
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
