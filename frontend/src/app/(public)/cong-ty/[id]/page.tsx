"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Spin, Empty } from "antd";
import dynamic from "next/dynamic";

const CompanyLocationMap = dynamic(
  () => import("@/components/shared/CompanyLocationMap"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded p-6 text-center space-y-2" style={{ minHeight: "165px" }}>
        <Spin size="small" />
        <span className="text-slate-400 text-xs">Đang tải bản đồ...</span>
      </div>
    )
  }
);

// Mock Company Detail Fallback
const MOCK_COMPANY_DETAIL: Record<string, any> = {
  fpt: {
    id: "fpt",
    name: "FPT Software",
    industry: "Công nghệ thông tin",
    logo: "",
    coverImage: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1800&q=86",
    location: "Hà Nội, Việt Nam",
    website: "https://fpt-software.com",
    size: "5.000+ nhân sự",
    foundedYear: "1999",
    taxCode: "0101778163",
    isVerified: true,
    slogan: "Kiến tạo công nghệ – Nâng tầm cuộc sống",
    description: "FPT Software là công ty thành viên của Tập đoàn FPT, cung cấp dịch vụ và giải pháp công nghệ cho khách hàng toàn cầu. Chúng tôi tiên phong trong chuyển đổi số, AI, Cloud, Automotive, IoT... với đội ngũ kỹ sư tài năng và môi trường làm việc sáng tạo.",
    email: "info@fpt.com",
    phone: "(024) 7300 7300",
    stats: {
      experience: "25+ năm",
      size: "5.000+",
      jobsCount: 24,
      branchesCount: 6,
    },
    branches: [
      { name: "Hà Nội (Trụ sở chính)", address: "Tòa nhà FPT, Cầu Giấy, Hà Nội", phone: "(024) 7300 7300", email: "hanoi@fpt.com" },
      { name: "Đà Nẵng", address: "Lô 2A, KCN Hòa Cầm, Đà Nẵng", phone: "(0236) 7300 730", email: "danang@fpt.com" },
      { name: "TP. Hồ Chí Minh", address: "Lô E2, Đường D1, Khu CNC, Thủ Đức", phone: "(028) 7300 7300", email: "hcm@fpt.com" },
      { name: "Cần Thơ", address: "KCN Trà Nóc 2, Cần Thơ", phone: "(0292) 7300 730", email: "cantho@fpt.com" },
    ],
    jobs: [
      { id: "job-1", title: "Senior UX Designer", salary: "$2,000 - $3,200", location: "Hà Nội", type: "Hybrid", matchScore: 98 },
      { id: "job-2", title: "Frontend Developer (React)", salary: "$1,800 - $2,800", location: "Hồ Chí Minh", type: "Hybrid", matchScore: 90 },
      { id: "job-3", title: "Product Manager", salary: "$2,500 - $4,000", location: "Hà Nội", type: "Hybrid", matchScore: 90 },
      { id: "job-4", title: "QA Engineer", salary: "$1,200 - $1,800", location: "Đà Nẵng", type: "On-site", matchScore: 93 },
    ]
  },
  vng: {
    id: "vng",
    name: "VNG Corporation",
    industry: "Công nghệ thông tin",
    logo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=150&h=150&q=80",
    coverImage: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1800&q=86",
    location: "TP. Hồ Chí Minh, Việt Nam",
    website: "https://vng.com.vn",
    size: "2.000+ nhân sự",
    foundedYear: "2004",
    taxCode: "0303886556",
    isVerified: true,
    slogan: "Kiến tạo công nghệ và Phát triển con người",
    description: "VNG là một trong những tập đoàn công nghệ hàng đầu Việt Nam, đi tiên phong trong lĩnh vực nội dung số, giải trí trực tuyến và dịch vụ điện toán đám mây. Chúng tôi tự hào sở hữu các sản phẩm hàng chục triệu người dùng như Zalo, ZaloPay, Zing MP3.",
    email: "info@vng.com.vn",
    phone: "(028) 3962 3888",
    stats: {
      experience: "20+ năm",
      size: "2.000+",
      jobsCount: 18,
      branchesCount: 3,
    },
    branches: [
      { name: "VNG Campus (Trụ sở chính)", address: "Đường số 13, Khu chế xuất Tân Thuận, Quận 7, TP. Hồ Chí Minh", phone: "(028) 3962 3888", email: "hcm@vng.com" },
      { name: "Hà Nội Office", address: "Tòa nhà TNR, 54A Nguyễn Chí Thanh, Láng Thượng, Đống Đa, Hà Nội", phone: "(024) 3786 8866", email: "hanoi@vng.com" },
    ],
    jobs: [
      { id: "job-1", title: "Senior Fullstack Engineer (React/NestJS)", salary: "35 - 50 triệu", location: "TP. Hồ Chí Minh", type: "Hybrid", matchScore: 98 },
      { id: "job-2", title: "DevOps Engineer (AWS/Kubernetes)", salary: "25 - 40 triệu", location: "TP. Hồ Chí Minh", type: "Full-time", matchScore: 90 },
    ]
  },
  momo: {
    id: "momo",
    name: "MOMO FinTech",
    industry: "Công nghệ tài chính",
    logo: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=150&h=150&q=80",
    coverImage: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1000&h=300&q=80",
    location: "TP. Hồ Chí Minh, Việt Nam",
    website: "https://momo.vn",
    size: "1.500+ nhân sự",
    foundedYear: "2007",
    taxCode: "0305202868",
    isVerified: true,
    slogan: "Ví điện tử số 1 Việt Nam",
    description: "MoMo là ví điện tử số 1 Việt Nam và là một trong những FinTech Unicorn hàng đầu tại Đông Nam Á. Chúng tôi xây dựng môi trường sáng tạo, trao quyền và tập trung vào đổi mới công nghệ để tạo ra những thay đổi tích cực cho xã hội.",
    email: "hotro@momo.vn",
    phone: "1900 5454 41",
    stats: {
      experience: "17 năm",
      size: "1.500+",
      jobsCount: 15,
      branchesCount: 2,
    },
    branches: [
      { name: "TP. Hồ Chí Minh (Trụ sở chính)", address: "Tòa nhà Phú Mỹ Hưng, Quận 7, TP. Hồ Chí Minh", phone: "1900 5454 41", email: "hcm@momo.vn" },
      { name: "Hà Nội Office", address: "Tòa nhà Geleximco, Đống Đa, Hà Nội", phone: "(024) 3765 4321", email: "hanoi@momo.vn" },
    ],
    jobs: [
      { id: "job-3", title: "UI/UX Designer (Mobile & Web App)", salary: "20 - 30 triệu", location: "TP. Hồ Chí Minh", type: "Full-time", matchScore: 98 },
    ]
  }
};

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const companyId = resolvedParams.id;
  
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [activeBranchIdx, setActiveBranchIdx] = useState(0);

  useEffect(() => {
    const fetchCompanyDetail = async () => {
      setLoading(true);
      try {
        // Thực hiện API call nếu có
        const response = await fetch(`/api/companies/${companyId}`).then(res => res.json()).catch(() => null);
        if (response && response.data) {
          setCompany(response.data);
        } else {
          const lowerId = companyId.toLowerCase();
          setCompany(MOCK_COMPANY_DETAIL[lowerId] || MOCK_COMPANY_DETAIL.fpt);
        }
      } catch (err) {
        const lowerId = companyId.toLowerCase();
        setCompany(MOCK_COMPANY_DETAIL[lowerId] || MOCK_COMPANY_DETAIL.fpt);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetail();
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40 flex-1 bg-[#f8fbff]">
        <Spin size="large" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex justify-center items-center py-40 flex-1 bg-[#f8fbff]">
        <Empty description="Không tìm thấy thông tin công ty." />
      </div>
    );
  }

  // Fallback branch list
  const branches = company.branches || [
    { name: "Hà Nội (Trụ sở chính)", address: company.location || "Tòa nhà FPT, Cầu Giấy, Hà Nội", phone: company.phone || "(024) 7300 7300", email: company.email || "info@company.com" }
  ];

  // Dynamic jobs mapping
  const jobs = company.jobs || [];

  return (
    <div className="company-detail-page-wrapper flex-1 w-full bg-[#f8fbff]">
      {/* FontAwesome Link */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"/>

      <style dangerouslySetInnerHTML={{ __html: `
        .company-detail-page-wrapper {
          --primary: #0F52BA;
          --primary-2: #075ee8;
          --navy: #061b4f;
          --cyan: #11b7c8;
          --text: #101828;
          --muted: #475467;
          --line: #e5eaf3;
          --soft: #f6f9ff;
          --green: #008c73;
          --shadow: 0 10px 30px rgba(15, 55, 120, .05);
          --radius: 18px;
          
          font-family: var(--font-be-vietnam), "Be Vietnam Pro", sans-serif;
          color: var(--text);
          background: #f5f8ff;
        }

        .company-detail-page-wrapper a {
          text-decoration: none;
          color: inherit;
        }

        .company-detail-page-wrapper button {
          font-family: inherit;
          cursor: pointer;
        }

        .hero {
          background: #fff;
          overflow: hidden;
          position: relative;
        }

        .hero-cover {
          height: 310px;
          background:
            linear-gradient(to bottom, rgba(255,255,255,0) 50%, #fff 100%),
            url('https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1800&q=86') center/cover no-repeat;
        }

        .breadcrumb {
          position: absolute;
          top: 30px;
          left: max(32px, calc((100vw - 1440px)/2));
          font-size: 13px;
          color: var(--muted);
          z-index: 3;
          font-weight: 500;
        }

        .breadcrumb i {
          font-size: 9px;
          margin: 0 8px;
          color: #98a2b3;
        }

        .company-main {
          margin-top: -116px;
          position: relative;
          z-index: 5;
          display: grid;
          grid-template-columns: 200px 1fr 310px;
          gap: 28px;
          align-items: end;
          padding-bottom: 22px;
        }

        .company-logo {
          width: 190px;
          height: 190px;
          border-radius: 18px;
          background: #fff;
          border: 1px solid #e7ebf3;
          box-shadow: var(--shadow);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 36px;
          color: #0b4fae;
          text-align: center;
          line-height: 1.05;
        }

        .fpt-mark {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .fpt-boxes {
          display: flex;
          gap: 4px;
          transform: skew(-10deg);
        }

        .fpt-box {
          width: 42px;
          height: 42px;
          border-radius: 5px;
          color: #fff;
          display: grid;
          place-items: center;
          font-size: 23px;
          font-style: italic;
        }

        .fpt-box:nth-child(1) { background: #1260b7; }
        .fpt-box:nth-child(2) { background: #f47c20; }
        .fpt-box:nth-child(3) { background: #38a84c; }
        
        .software {
          font-size: 26px;
          font-weight: 500;
          color: #0857b8;
        }

        .company-title {
          padding: 0 0 12px;
        }

        .verified {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid rgba(15, 82, 186, 0.2);
          background: rgba(15, 82, 186, 0.05);
          color: var(--primary);
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 14px;
        }

        .company-title h1 {
          font-size: 36px;
          margin: 0 0 10px;
          font-weight: 800;
          line-height: 1.15;
          color: var(--text);
        }

        .check {
          color: var(--primary);
          font-size: 18px;
        }

        .slogan {
          font-size: 16px;
          color: var(--muted);
          margin-bottom: 20px;
          font-weight: 500;
        }

        .meta {
          display: flex;
          gap: 28px;
          flex-wrap: wrap;
          color: var(--muted);
          font-size: 13px;
          font-weight: 500;
        }

        .meta span {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .meta i {
          color: var(--primary);
        }

        .hero-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-bottom: 10px;
        }

        .btn {
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 700;
          font-size: 14px;
          border: 1px solid #cbd5e1;
          background: #fff;
          color: var(--primary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn.primary {
          color: #fff;
          border: none;
          background: var(--primary);
          box-shadow: 0 8px 20px rgba(15, 82, 186, .2);
        }

        .page {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 310px;
          gap: 28px;
          padding: 10px 0 60px;
        }

        .left-col {
          min-width: 0;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 18px 20px;
          box-shadow: 0 8px 24px rgba(22, 60, 120, .05);
          margin-bottom: 16px;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px 8px;
        }

        .stat-ico {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(15, 82, 186, 0.08);
          color: var(--primary);
          display: grid;
          place-items: center;
          font-size: 18px;
        }

        .stat b {
          display: block;
          font-size: 20px;
          font-weight: 800;
          color: var(--text);
        }

        .stat small {
          font-size: 12px;
          color: var(--muted);
        }

        .card {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 14px;
          box-shadow: 0 8px 24px rgba(22, 60, 120, .045);
          margin-bottom: 16px;
        }

        .card-body {
          padding: 22px 24px;
        }

        .section-title {
          font-size: 18px;
          margin: 0 0 18px;
          font-weight: 800;
          color: var(--text);
        }

        .about-grid {
          display: grid;
          grid-template-columns: 1.6fr .95fr;
          gap: 28px;
          align-items: center;
        }

        .about p {
          font-size: 14px;
          line-height: 1.8;
          color: var(--muted);
          margin: 0 0 12px;
        }

        .more {
          color: var(--primary);
          font-weight: 700;
          font-size: 12px;
        }

        .video {
          height: 160px;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          background:
            linear-gradient(0deg, rgba(2,19,64,.72), rgba(11,48,110,.25)),
            url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80') center/cover;
        }

        .play {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          background: #fff;
          color: var(--primary);
          display: grid;
          place-items: center;
          font-size: 18px;
        }

        .video-label {
          position: absolute;
          left: 16px;
          bottom: 14px;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
        }

        .culture {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .culture-item {
          border: 1px solid #edf1f8;
          border-radius: 12px;
          padding: 18px;
          min-height: 145px;
          background: linear-gradient(145deg, #fff, #fbfdff);
        }

        .culture-icon {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: rgba(15, 82, 186, 0.08);
          color: var(--primary);
          font-size: 20px;
          margin-bottom: 14px;
        }

        .culture-item:nth-child(2) .culture-icon { color: #ff8b23; background: #fff4e8; }
        .culture-item:nth-child(3) .culture-icon { color: #ff5470; background: #fff0f3; }
        .culture-item:nth-child(4) .culture-icon { color: #724cf2; background: #f3efff; }

        .culture-item b {
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
        }

        .culture-item p {
          font-size: 12px;
          line-height: 1.6;
          color: var(--muted);
          margin: 8px 0 0;
        }

        .benefits {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
        }

        .benefit {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .benefit .circle {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          background: #fff4ed;
          color: #ff6d2e;
          border: 1px solid #ffe0d3;
        }

        .benefit:nth-child(2) .circle { background: #eef7ff; color: #2f82ef; }
        .benefit:nth-child(3) .circle { background: #edf9f3; color: #1ca367; }
        .benefit:nth-child(4) .circle { background: #fff7ea; color: #f39a1d; }
        .benefit:nth-child(5) .circle { background: #edf5ff; color: #3481df; }
        .benefit:nth-child(6) .circle { background: #f5efff; color: #8654ec; }

        .benefit b {
          font-size: 12px;
          font-weight: 700;
          color: var(--text);
          display: block;
        }

        .benefit small {
          font-size: 11px;
          color: var(--muted);
        }

        .gallery {
          display: grid;
          grid-template-columns: 1.25fr 1fr 1fr;
          grid-template-rows: 128px 86px;
          gap: 8px;
        }

        .gallery img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }

        .gallery .big {
          grid-row: 1/3;
        }

        .gallery .wide {
          grid-column: 2/4;
        }

        .branch-wrap {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 22px;
        }

        .branch-item {
          display: flex;
          gap: 10px;
          padding: 13px 14px;
          border-radius: 10px;
          margin-bottom: 7px;
          border: 1px solid transparent;
          font-size: 12px;
        }

        .branch-item.active {
          border-color: rgba(15, 82, 186, 0.2);
          background: rgba(15, 82, 186, 0.05);
          box-shadow: inset 3px 0 0 var(--primary);
        }

        .branch-item i {
          color: var(--primary);
          margin-top: 3px;
        }

        .branch-item b {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 3px;
        }

        .branch-item span {
          color: var(--muted);
          line-height: 1.4;
        }

        .map {
          height: 165px;
          border-radius: 10px;
          position: relative;
          overflow: hidden;
        }

        .pin {
          position: absolute;
          left: 43%;
          top: 38%;
          width: 34px;
          height: 34px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          background: #e63a38;
          display: grid;
          place-items: center;
          box-shadow: 0 5px 14px rgba(230,58,56,.25);
        }

        .pin i {
          transform: rotate(45deg);
          color: #fff;
        }

        .map-label {
          position: absolute;
          left: 50%;
          top: 48%;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 6px 18px rgba(0,0,0,.08);
          padding: 8px 10px;
          font-size: 11px;
        }

        .branch-info {
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 12px 14px;
          margin-top: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .branch-info strong {
          font-size: 13px;
          color: var(--text);
        }

        .branch-info .line {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          margin-top: 7px;
          font-size: 12px;
          color: var(--muted);
        }

        .route {
          padding: 9px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          color: var(--primary);
          background: #fff;
          font-weight: 700;
          font-size: 12px;
          white-space: nowrap;
        }

        .jobs-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .jobs-title-row a {
          font-size: 12px;
          color: var(--primary);
          font-weight: 700;
        }

        .jobs {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .job {
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          padding: 14px;
          background: #fff;
        }

        .job h4 {
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 12px;
          min-height: 32px;
        }

        .job p {
          font-size: 12px;
          color: var(--muted);
          margin: 6px 0;
        }

        .match {
          float: right;
          font-size: 11px;
          padding: 4px 7px;
          border-radius: 999px;
          color: var(--green);
          background: rgba(0, 140, 115, 0.08);
          border: 1px solid rgba(0, 140, 115, 0.15);
          font-weight: 700;
        }

        .jobs-footer {
          text-align: center;
          margin-top: 22px;
        }

        .outline {
          padding: 10px 18px;
          border: 1px solid #cbd5e1;
          color: var(--primary);
          background: #fff;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
        }

        .side-card {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 20px;
          margin-bottom: 16px;
          box-shadow: 0 8px 24px rgba(22, 60, 120, .04);
        }

        .side-card h3 {
          font-size: 16px;
          font-weight: 800;
          color: var(--text);
          margin: 0 0 18px;
        }

        .info-row {
          display: grid;
          grid-template-columns: 28px 1fr;
          gap: 10px;
          margin-bottom: 18px;
        }

        .info-row i {
          color: var(--primary);
          font-size: 15px;
          margin-top: 3px;
        }

        .info-row small {
          display: block;
          color: var(--muted);
          font-size: 11px;
          margin-bottom: 3px;
          font-weight: 500;
        }

        .info-row span {
          font-size: 13px;
          line-height: 1.5;
          color: var(--text);
          font-weight: 600;
        }

        .info-row a {
          font-size: 13px;
          color: var(--primary);
          font-weight: 600;
        }

        .socials {
          display: flex;
          gap: 12px;
        }

        .social {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: rgba(15, 82, 186, 0.08);
          color: var(--primary);
          font-size: 13px;
        }

        .social.youtube {
          background: rgba(15, 82, 186, 0.08);
          color: var(--primary);
        }

        .social.tiktok {
          background: rgba(15, 82, 186, 0.08);
          color: var(--primary);
        }

        .candidate-card {
          color: #fff;
          background:
            radial-gradient(circle at 100% 0, rgba(69,186,255,.55), transparent 32%),
            linear-gradient(135deg, #0a4bc8, #1b62ec 58%, #2c4dda);
          border: none;
          overflow: hidden;
        }

        .candidate-card h3 {
          color: #fff;
          margin-bottom: 12px;
        }

        .candidate-card p {
          font-size: 13px;
          line-height: 1.7;
          color: #e7efff;
        }

        .candidate-card .btn-white {
          width: 100%;
          height: 46px;
          border: none;
          border-radius: 8px;
          background: #fff;
          color: #165edb;
          font-size: 12px;
          font-weight: 800;
          margin-top: 8px;
        }

        .award {
          display: flex;
          gap: 11px;
          padding: 12px 0;
          border-bottom: 1px solid #f0f3f8;
          font-size: 12px;
          line-height: 1.45;
          color: var(--muted);
        }

        .award:last-child {
          border-bottom: 0;
        }

        .award .medal {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(15, 82, 186, 0.08);
          color: var(--primary);
          display: grid;
          place-items: center;
          flex: 0 0 auto;
        }

        .award:nth-of-type(2) .medal { background: #fff5e8; color: #f39a20; }
        .award:nth-of-type(3) .medal { background: #fff0f3; color: #ef4b6a; }

        .related .company {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f2f4f8;
        }

        .related .company:last-child {
          border-bottom: 0;
        }

        .mini-logo {
          width: 40px;
          height: 40px;
          border-radius: 99px;
          background: #f5f7fb;
          border: 1px solid #cbd5e1;
          display: grid;
          place-items: center;
          font-size: 9px;
          font-weight: 800;
          color: var(--primary);
          flex: 0 0 auto;
        }

        .company .name {
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
        }

        .company small {
          font-size: 11px;
          color: var(--muted);
        }

        @media(max-width: 1180px){
          .company-main { grid-template-columns: 160px 1fr 260px; }
          .company-logo { width: 155px; height: 155px; }
          .page { grid-template-columns: 1fr; }
          .right-col { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
          .side-card { margin-bottom: 0; }
        }

        @media(max-width: 900px){
          .company-main { grid-template-columns: 120px 1fr; }
          .hero-actions { grid-column: 1/3; flex-direction: row; }
          .hero-actions .btn { flex: 1; }
          .company-logo { width: 120px; height: 120px; }
          .software { font-size: 18px; }
          .fpt-box { width: 30px; height: 30px; font-size: 16px; }
          .company-title h1 { font-size: 26px; }
          .stats { grid-template-columns: repeat(2, 1fr); }
          .culture { grid-template-columns: repeat(2, 1fr); }
          .benefits { grid-template-columns: repeat(3, 1fr); }
          .jobs { grid-template-columns: repeat(2, 1fr); }
          .branch-wrap { grid-template-columns: 1fr; }
        }

        @media(max-width: 640px){
          .company-main { margin-top: -90px; grid-template-columns: 1fr; }
          .company-logo { width: 105px; height: 105px; }
          .hero-cover { height: 260px; }
          .company-title { padding: 0; }
          .hero-actions { grid-column: 1; flex-direction: column; }
          .meta { gap: 12px; }
          .stats { grid-template-columns: 1fr; }
          .about-grid { grid-template-columns: 1fr; }
          .culture { grid-template-columns: 1fr; }
          .benefits { grid-template-columns: repeat(2, 1fr); }
          .gallery { grid-template-columns: 1fr 1fr; grid-template-rows: 150px 100px 100px; }
          .gallery .big { grid-row: auto; grid-column: 1/3; }
          .gallery .wide { grid-column: 1/3; }
          .jobs { grid-template-columns: 1fr; }
          .right-col { grid-template-columns: 1fr; }
          .breadcrumb { left: 16px; top: 82px; }
        }
      `}} />

      {/* HERO */}
      <section className="hero">
        <div className="breadcrumb">
          Trang chủ <i className="fa-solid fa-chevron-right"></i>
          Công ty <i className="fa-solid fa-chevron-right"></i>
          <b>{company.name}</b>
        </div>

        <div className="hero-cover" style={{ backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0) 50%, #fff 100%), url(${company.coverImage || company.cover || "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1800&q=86"})` }}></div>

        <div className="container company-main">
          <div className="company-logo overflow-hidden">
            {companyId === "fpt" || company.name?.toLowerCase().includes("fpt") ? (
              <div className="fpt-mark">
                <div className="fpt-boxes">
                  <div className="fpt-box">F</div>
                  <div className="fpt-box">P</div>
                  <div className="fpt-box">T</div>
                </div>
                <div className="software">Software</div>
              </div>
            ) : company.logo ? (
              <img src={company.logo} alt={company.name} className="w-full h-full object-contain p-4 rounded-xl" />
            ) : (
              <div className="text-2xl font-black text-[#0b57e3]">{company.name?.substring(0, 3).toUpperCase()}</div>
            )}
          </div>

          <div className="company-title">
            <div className="verified"><i className="fa-solid fa-circle-check"></i> Verified Company</div>
            <h1 className="flex items-center gap-2">
              {company.name} <i className="fa-solid fa-circle-check check"></i>
            </h1>
            <div className="slogan">{company.slogan || "Kiến tạo công nghệ – Nâng tầm cuộc sống"}</div>
            <div className="meta">
              <span><i className="fa-regular fa-building"></i> {company.industry || "Công nghệ thông tin"}</span>
              <span><i className="fa-solid fa-users"></i> {company.size || "5.000+ nhân sự"}</span>
              <span><i className="fa-regular fa-calendar"></i> {company.foundedYear || "1999"}</span>
              <span><i className="fa-solid fa-location-dot"></i> {company.location || "Hà Nội, Việt Nam"}</span>
              <span><i className="fa-solid fa-globe"></i> {company.website ? company.website.replace("https://", "") : "fpt-software.com"}</span>
            </div>
          </div>

          <div className="hero-actions">
            <button className="btn"><i className="fa-regular fa-circle-plus"></i> Theo dõi công ty</button>
            <button className="btn primary" onClick={() => {
              const element = document.getElementById("jobs-section");
              if (element) {
                element.scrollIntoView({ behavior: "smooth" });
              }
            }}>
              Xem việc đang tuyển
            </button>
          </div>
        </div>

        {/* TAB BAR NAVIGATION */}
        <div className="border-t border-slate-100 bg-white/80 backdrop-blur-sm sticky top-[72px] z-20">
          <div className="container flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none text-xs font-bold">
            <button
              onClick={() => document.getElementById("overview")?.scrollIntoView({ behavior: "smooth" })}
              className="px-4 py-2 rounded-xl text-slate-700 hover:text-primary hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              Tổng quan
            </button>
            <button
              onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
              className="px-4 py-2 rounded-xl text-slate-700 hover:text-primary hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              Giới thiệu
            </button>
            <button
              onClick={() => document.getElementById("culture")?.scrollIntoView({ behavior: "smooth" })}
              className="px-4 py-2 rounded-xl text-slate-700 hover:text-primary hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              Văn hóa & Môi trường
            </button>
            <button
              onClick={() => document.getElementById("jobs-section")?.scrollIntoView({ behavior: "smooth" })}
              className="px-4 py-2 rounded-xl text-slate-700 hover:text-primary hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              Việc làm đang tuyển ({jobs.length > 0 ? jobs.length : 24})
            </button>
            <button
              onClick={() => document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" })}
              className="px-4 py-2 rounded-xl text-slate-700 hover:text-primary hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              Đánh giá & Chi nhánh
            </button>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <main className="container page">
        {/* LEFT COLUMN */}
        <div className="left-col">
          {/* STATS / OVERVIEW */}
          <section className="stats" id="overview">
            <div className="stat">
              <div className="stat-ico"><i className="fa-regular fa-building"></i></div>
              <div>
                <b>{company.foundedYear ? `${new Date().getFullYear() - parseInt(company.foundedYear)}+ năm` : "25+ năm"}</b>
                <small>Kinh nghiệm</small>
              </div>
            </div>
            <div className="stat">
              <div className="stat-ico"><i className="fa-solid fa-users"></i></div>
              <div><b>{company.size || "5.000+"}</b><small>Nhân sự</small></div>
            </div>
            <div className="stat">
              <div className="stat-ico"><i className="fa-solid fa-briefcase"></i></div>
              <div><b>{jobs.length > 0 ? jobs.length : 24}</b><small>Việc đang tuyển</small></div>
            </div>
            <div className="stat">
              <div className="stat-ico"><i className="fa-solid fa-location-dot"></i></div>
              <div><b>{branches.length}</b><small>Chi nhánh</small></div>
            </div>
          </section>

          {/* ABOUT */}
          <section className="card about" id="about">
            <div className="card-body about-grid">
              <div>
                <h2 className="section-title">Về chúng tôi</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed" style={{ color: "#51617e" }}>
                  {company.description || "FPT Software là công ty thành viên của Tập đoàn FPT, cung cấp dịch vụ và giải pháp công nghệ cho khách hàng toàn cầu. Chúng tôi tiên phong trong chuyển đổi số, AI, Cloud, Automotive, IoT... với đội ngũ kỹ sư tài năng và môi trường làm việc sáng tạo."}
                </p>
                <a className="more" href="#">Xem thêm <i className="fa-solid fa-chevron-down"></i></a>
              </div>
              <div className="video">
                <div className="play"><i className="fa-solid fa-play"></i></div>
                <div className="video-label">{company.name}<br />in 2 minutes</div>
              </div>
            </div>
          </section>

          {/* CULTURE */}
          <section className="card" id="culture">
            <div className="card-body">
              <h2 className="section-title">Văn hóa & môi trường làm việc</h2>
              <div className="culture">
                <div className="culture-item">
                  <div className="culture-icon"><i className="fa-solid fa-people-group"></i></div>
                  <b>Làm việc linh hoạt</b>
                  <p>Môi trường linh hoạt, tin tưởng và trao quyền cho mỗi cá nhân phát triển tối đa.</p>
                </div>
                <div className="culture-item">
                  <div className="culture-icon"><i className="fa-solid fa-rocket"></i></div>
                  <b>Không ngừng đổi mới</b>
                  <p>Luôn khuyến khích sáng tạo, nghiên cứu và ứng dụng công nghệ mới.</p>
                </div>
                <div className="culture-item">
                  <div className="culture-icon"><i className="fa-regular fa-heart"></i></div>
                  <b>Quan tâm con người</b>
                  <p>Đặt con người làm trung tâm với nhiều hoạt động chăm sóc sức khỏe và tinh thần.</p>
                </div>
                <div className="culture-item">
                  <div className="culture-icon"><i className="fa-solid fa-globe"></i></div>
                  <b>Vươn tầm thế giới</b>
                  <p>Cơ hội làm việc với dự án quốc tế và đồng nghiệp toàn cầu.</p>
                </div>
              </div>
            </div>
          </section>

          {/* BENEFITS */}
          <section className="card">
            <div className="card-body">
              <h2 className="section-title">Phúc lợi nổi bật</h2>
              <div className="benefits">
                <div className="benefit">
                  <div className="circle"><i className="fa-solid fa-sack-dollar"></i></div>
                  <div><b>Thưởng KPI</b><small>hấp dẫn</small></div>
                </div>
                <div className="benefit">
                  <div className="circle"><i className="fa-regular fa-heart"></i></div>
                  <div><b>Bảo hiểm sức khỏe</b><small>cao cấp</small></div>
                </div>
                <div className="benefit">
                  <div className="circle"><i className="fa-solid fa-umbrella-beach"></i></div>
                  <div><b>Nghỉ phép</b><small>15 ngày/năm</small></div>
                </div>
                <div className="benefit">
                  <div className="circle"><i className="fa-solid fa-clipboard-check"></i></div>
                  <div><b>Đào tạo & phát triển</b><small>chuyên môn</small></div>
                </div>
                <div className="benefit">
                  <div className="circle"><i className="fa-solid fa-building"></i></div>
                  <div><b>Trang thiết bị</b><small>hiện đại</small></div>
                </div>
                <div className="benefit">
                  <div className="circle"><i className="fa-solid fa-mountain-sun"></i></div>
                  <div><b>Team building</b><small>du lịch hằng năm</small></div>
                </div>
              </div>
            </div>
          </section>

          {/* GALLERY */}
          <section className="card">
            <div className="card-body">
              <h2 className="section-title">Thư viện hình ảnh</h2>
              <div className="gallery">
                <img className="big" src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80" alt="" />
                <img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=700&q=80" alt="" />
                <img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=700&q=80" alt="" />
                <img className="wide" src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80" alt="" />
              </div>
            </div>
          </section>

          {/* BRANCHES / REVIEWS */}
          <section className="card" id="reviews-section">
            <div className="card-body">
              <h2 className="section-title">Chi nhánh & địa điểm</h2>
              <div className="branch-wrap">
                <div>
                  {branches.map((br: any, idx: number) => (
                    <div 
                      key={idx} 
                      className={`branch-item cursor-pointer ${activeBranchIdx === idx ? "active" : ""}`}
                      onClick={() => setActiveBranchIdx(idx)}
                    >
                      <i className="fa-solid fa-building"></i>
                      <div><b>{br.name}</b><span>{br.address}</span></div>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="map" style={{ background: "none", border: "none", padding: 0 }}>
                    <CompanyLocationMap
                      key={`${companyId}-${activeBranchIdx}`}
                      companyName={company.name}
                      address={branches[activeBranchIdx]?.address}
                      latitude={branches[activeBranchIdx]?.latitude}
                      longitude={branches[activeBranchIdx]?.longitude}
                    />
                  </div>
                  <div className="branch-info">
                    <div>
                      <strong>Thông tin chi nhánh</strong>
                      <div className="line">
                        <span><i className="fa-solid fa-location-dot"></i> {branches[activeBranchIdx]?.address}</span>
                        <span><i className="fa-solid fa-phone"></i> {branches[activeBranchIdx]?.phone || company.phone || "(024) 7300 7300"}</span>
                        <span><i className="fa-solid fa-envelope"></i> {branches[activeBranchIdx]?.email || company.email || "info@company.com"}</span>
                      </div>
                    </div>
                    <button 
                      className="route"
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branches[activeBranchIdx]?.address)}`, "_blank")}
                    >
                      <i className="fa-solid fa-map"></i> Chỉ đường
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* JOBS SECTION */}
          <section className="card" id="jobs-section">
            <div className="card-body">
              <div className="jobs-title-row mb-4">
                <h2 className="section-title m-0">Việc làm đang tuyển tại {company.name}</h2>
                <Link href="/viec-lam" className="text-[#1262e7] font-bold text-xs">Xem tất cả ({jobs.length > 0 ? jobs.length : 24})</Link>
              </div>

              {jobs.length === 0 ? (
                <Empty description="Hiện tại chưa có việc làm nào đăng tuyển." />
              ) : (
                <div className="jobs">
                  {jobs.map((jb: any) => (
                    <article className="job" key={jb.id}>
                      <Link href={`/viec-lam/${jb.id}`}>
                        <h4 className="hover:text-blue-600 transition-colors font-bold text-xs text-[#17264b]">{jb.title}</h4>
                      </Link>
                      <p><i className="fa-solid fa-sack-dollar"></i> {jb.salary || jb.salaryText || "Thỏa thuận"}</p>
                      <p><i className="fa-solid fa-location-dot"></i> {jb.location}</p>
                      <p><i className="fa-solid fa-tag"></i> {jb.type || "Full-time"} <span className="match">{jb.matchScore || 90}% Match</span></p>
                    </article>
                  ))}
                </div>
              )}

              <div className="jobs-footer">
                <Link href="/viec-lam">
                  <button className="outline">Xem tất cả công việc</button>
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN SIDEBAR */}
        <aside className="right-col">
          <section className="side-card">
            <h3>Thông tin công ty</h3>
            <div className="info-row">
              <i className="fa-solid fa-network-wired"></i>
              <div><small>Lĩnh vực</small><span>{company.industry || "Công nghệ thông tin"}</span></div>
            </div>
            <div className="info-row">
              <i className="fa-solid fa-users"></i>
              <div><small>Quy mô</small><span>{company.size || "5.000+ nhân sự"}</span></div>
            </div>
            <div className="info-row">
              <i className="fa-regular fa-calendar"></i>
              <div><small>Thành lập</small><span>{company.foundedYear || "1999"}</span></div>
            </div>
            <div className="info-row">
              <i className="fa-solid fa-stamp"></i>
              <div><small>Mã số thuế</small><span>{company.taxCode || "0101778163"}</span></div>
            </div>
            <div className="info-row">
              <i className="fa-solid fa-globe"></i>
              <div><small>Website</small><a href={company.website || "#"} target="_blank" rel="noopener noreferrer">{company.website ? company.website.replace("https://", "") : "fpt-software.com"}</a></div>
            </div>
            <div className="info-row">
              <i className="fa-solid fa-location-dot"></i>
              <div><small>Trụ sở chính</small><span>{branches[0]?.address || company.location}</span></div>
            </div>
            <div className="info-row">
              <i className="fa-regular fa-envelope"></i>
              <div><small>Email</small><a href={`mailto:${company.email || "info@fpt.com"}`}>{company.email || "info@fpt.com"}</a></div>
            </div>
            <div className="info-row">
              <i className="fa-solid fa-phone"></i>
              <div><small>Điện thoại</small><span>{company.phone || "(024) 7300 7300"}</span></div>
            </div>
          </section>

          <section className="side-card">
            <h3>Kết nối với chúng tôi</h3>
            <div className="socials">
              <div className="social"><i className="fa-solid fa-globe"></i></div>
              <div className="social"><i className="fa-brands fa-linkedin-in"></i></div>
              <div className="social"><i className="fa-brands fa-facebook-f"></i></div>
              <div className="social youtube"><i className="fa-brands fa-youtube"></i></div>
              <div className="social tiktok"><i className="fa-brands fa-tiktok"></i></div>
            </div>
          </section>

          <section className="side-card candidate-card">
            <h3>Bạn là ứng viên?</h3>
            <p>Khám phá môi trường làm việc tại {company.name} và tìm cơ hội phù hợp với bạn.</p>
            <button className="btn-white" onClick={() => {
              const element = document.getElementById("jobs-section");
              if (element) {
                element.scrollIntoView({ behavior: "smooth" });
              }
            }}>
              Xem việc đang tuyển <i className="fa-solid fa-arrow-right"></i>
            </button>
          </section>

          <section className="side-card">
            <h3>Giải thưởng & chứng nhận</h3>
            <div className="award"><div className="medal"><i className="fa-solid fa-trophy"></i></div><div>Top 50 Công ty CNTT hàng đầu Việt Nam 2024</div></div>
            <div className="award"><div className="medal"><i className="fa-solid fa-star"></i></div><div>Top 10 Nơi làm việc tốt nhất Việt Nam 2024</div></div>
            <div className="award"><div className="medal"><i className="fa-regular fa-heart"></i></div><div>Top 100 Nhà tuyển dụng được yêu thích nhất 2024</div></div>
            <a className="more" href="#">Xem tất cả</a>
          </section>

          <section className="side-card related">
            <div className="jobs-title-row mb-4">
              <h3 className="m-0">Có thể bạn quan tâm</h3>
              <a href="#" className="text-xs text-primary font-bold hover:underline">Xem tất cả</a>
            </div>
            <div className="company">
              <div className="mini-logo">Viettel</div>
              <div><div className="name">Viettel Solutions</div><small>29 việc đang tuyển</small></div>
            </div>
            <div className="company">
              <div className="mini-logo" style={{ color: "#ff522d" }}>VNG</div>
              <div><div className="name">Công ty Cổ phần VNG</div><small>18 việc đang tuyển</small></div>
            </div>
            <div className="company">
              <div className="mini-logo">TMA</div>
              <div><div className="name">TMA Solutions</div><small>15 việc đang tuyển</small></div>
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}
