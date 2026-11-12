"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { message } from "antd";
import {
  Calculator,
  ShieldCheck,
  Info,
  ArrowRight,
  Check,
  Bot,
  Brain,
  Headphones,
  Calendar,
  FileText,
  AlertCircle,
  Plus,
  ChevronUp,
  Clock,
  CheckCircle2,
  BookOpen,
  Lightbulb,
} from "lucide-react";

// ==================== 4 VÙNG LƯƠNG TỐI THIỂU THEO QUY ĐỊNH ====================
const REGIONS = [
  { id: 1, name: "Hà Nội", regionName: "Vùng I (Hà Nội, TP.HCM, Hải Phòng...)", minSalary: 4960000 },
  { id: 2, name: "TP. Hồ Chí Minh", regionName: "Vùng I (TP.HCM)", minSalary: 4960000 },
  { id: 3, name: "Đà Nẵng, Cần Thơ", regionName: "Vùng II (Đà Nẵng, Cần Thơ, Nha Trang...)", minSalary: 4410000 },
  { id: 4, name: "Thành phố trực thuộc tỉnh", regionName: "Vùng III (Các TP trực thuộc tỉnh)", minSalary: 3860000 },
  { id: 5, name: "Khu vực còn lại", regionName: "Vùng IV (Các khu vực còn lại)", minSalary: 3450000 },
];

const formatCurrency = (num: number | undefined | null) => {
  if (typeof num !== "number" || isNaN(num) || !isFinite(num)) return "0";
  return new Intl.NumberFormat("vi-VN").format(Math.round(num));
};

export default function UnemploymentInsurancePage() {
  const [activeBhtnTab, setActiveBhtnTab] = useState<"quick" | "conditions" | "guide">("quick");
  const [calcMethod, setCalcMethod] = useState<"average" | "monthly">("average");
  const [avgSalary, setAvgSalary] = useState<number>(12000000);
  const [monthlySalaries, setMonthlySalaries] = useState<number[]>([
    12000000, 12000000, 12000000, 12000000, 12000000, 12000000,
  ]);
  const [totalMonths, setTotalMonths] = useState<number>(36);
  const [contractType, setContractType] = useState<string>("indefinite");
  const [terminationReason, setTerminationReason] = useState<string>("voluntary");
  const [terminationDate, setTerminationDate] = useState<string>("2025-08-31");
  const [selectedRegionId, setSelectedRegionId] = useState<number>(1);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<{ [key: number]: boolean }>({
    1: true,
    2: false,
    3: false,
    4: false,
  });

  const toggleAccordion = (id: number) => {
    setOpenAccordion((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Tính mức lương bình quân 6 tháng
  const computedAvgSalary = useMemo(() => {
    if (calcMethod === "average") return Math.max(0, avgSalary || 0);
    const sum = monthlySalaries.reduce((acc, curr) => acc + (curr || 0), 0);
    return Math.round(sum / 6);
  }, [calcMethod, avgSalary, monthlySalaries]);

  // Tính kết quả BHTN theo Luật Việc Làm
  const bhtnResult = useMemo(() => {
    const region = REGIONS.find((r) => r.id === selectedRegionId) || REGIONS[0];
    const maxCap = region.minSalary * 5; // Tối đa 5 lần lương tối thiểu vùng theo Luật

    let isEligible = true;
    let ineligibilityReason = "";

    if (totalMonths < 12) {
      isEligible = false;
      ineligibilityReason = "Thời gian đóng BHTN chưa đủ 12 tháng theo quy định.";
    } else if (terminationReason === "illegal") {
      isEligible = false;
      ineligibilityReason = "Đơn phương chấm dứt hợp đồng trái pháp luật không đủ điều kiện hưởng BHTN.";
    } else if (terminationReason === "pension") {
      isEligible = false;
      ineligibilityReason = "Nghỉ việc hưởng chế độ hưu trí không thuộc diện hưởng trợ cấp thất nghiệp.";
    }

    // Thời gian hưởng: Đóng từ 12-36 tháng hưởng 3 tháng; cứ thêm 12 tháng hưởng thêm 1 tháng, tối đa 12 tháng
    let benefitMonths = 0;
    if (isEligible) {
      if (totalMonths >= 12 && totalMonths <= 36) {
        benefitMonths = 3;
      } else if (totalMonths > 36) {
        benefitMonths = Math.min(12, 3 + Math.floor((totalMonths - 36) / 12));
      }
    }

    // Mức hưởng hàng tháng: 60% mức lương bình quân 6 tháng, tối đa không quá 5 lần lương tối thiểu vùng
    const rawMonthlyBenefit = computedAvgSalary * 0.6;
    const monthlyBenefit = isEligible ? Math.min(rawMonthlyBenefit, maxCap) : 0;
    const totalBenefit = monthlyBenefit * benefitMonths;

    // Ngày hết hạn nộp hồ sơ (3 tháng sau ngày chấm dứt HĐLĐ)
    let deadlineDateStr = "30/11/2025";
    try {
      if (terminationDate) {
        const d = new Date(terminationDate);
        d.setMonth(d.getMonth() + 3);
        deadlineDateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
      }
    } catch {
      deadlineDateStr = "3 tháng sau ngày nghỉ việc";
    }

    return {
      isEligible,
      ineligibilityReason,
      benefitMonths,
      computedAvgSalary,
      rawMonthlyBenefit,
      maxCap,
      monthlyBenefit,
      totalBenefit,
      deadlineDateStr,
    };
  }, [computedAvgSalary, totalMonths, terminationReason, selectedRegionId, terminationDate]);

  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      message.success("Đã tính toán mức trợ cấp thất nghiệp!");
    }, 200);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 pb-12 pt-2 bg-[#f7faff] min-h-screen space-y-2.5">
      {/* ======================================================== */}
      {/* 1. BREADCRUMB ĐỘC LẬP NGOÀI BANNER                       */}
      {/* ======================================================== */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Link href="/" className="text-slate-500 hover:text-[#0062ff] transition-colors">
          Trang chủ
        </Link>
        <span className="text-slate-400">/</span>
        <Link href="/cong-cu" className="text-slate-500 hover:text-[#0062ff] transition-colors">
          Công cụ
        </Link>
        <span className="text-slate-400">/</span>
        <span className="text-[#0062ff] font-semibold">Tính bảo hiểm thất nghiệp</span>
      </nav>

      {/* ======================================================== */}
      {/* 2. HERO BANNER: THU GỌN CHIỀU CAO 110-120PX, CĂN GIỮA DỌC */}
      {/* ======================================================== */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#4f9cf8] border border-blue-300/40 shadow-md shadow-blue-600/10 px-6 sm:px-8 py-3.5 sm:py-4 flex flex-col md:flex-row items-center justify-between gap-4 min-h-[110px] md:min-h-[116px]">
        {/* Subtle decorative background glow */}
        <div className="absolute -right-8 -bottom-10 w-52 h-52 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-32 h-32 rounded-full bg-sky-200/15 blur-xl pointer-events-none" />

        {/* Nội dung bên trái: Tiêu đề + Badge cùng 1 hàng */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 sm:gap-3.5">
          <h1 className="text-xl sm:text-2xl md:text-[25px] font-black text-white tracking-tight m-0 leading-tight drop-shadow-2xs">
            Tính bảo hiểm thất nghiệp
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#1d4ed8] text-xs font-bold shadow-xs shrink-0 border border-white/90">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2563eb]" />
            <span>Chuẩn Luật Việc làm & BHXH</span>
          </span>
        </div>

        {/* Minh họa vector phẳng bên phải: Thẻ nền trắng thu gọn chiều cao */}
        <div className="relative z-10 hidden md:flex items-center gap-3 shrink-0">
          {/* Card 1: Mức hưởng tiêu chuẩn */}
          <div className="bg-white rounded-xl py-2 px-3.5 border border-white/90 shadow-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-[#0062ff] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10.5px] font-bold text-slate-500 block leading-tight">
                Mức hưởng trợ cấp
              </span>
              <span className="text-xs sm:text-[13px] font-black text-[#0062ff] block leading-tight mt-0.5">
                60% lương bình quân
              </span>
            </div>
          </div>

          {/* Card 2: Thời hạn hồ sơ */}
          <div className="bg-white rounded-xl py-2 px-3.5 border border-white/90 shadow-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10.5px] font-bold text-slate-500 block leading-tight">
                Thời hạn nộp hồ sơ
              </span>
              <span className="text-xs sm:text-[13px] font-black text-slate-900 block leading-tight mt-0.5">
                Trong 03 tháng
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. CHỌN TAB CHỨC NĂNG (3 TABS RÕ RÀNG, ACTIVE NỔI BẬT)   */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center gap-2 !mt-5">
        <button
          type="button"
          onClick={() => setActiveBhtnTab("quick")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeBhtnTab === "quick"
            ? "bg-[#0062ff] text-white shadow-xs"
            : "bg-white text-slate-700 hover:text-[#0062ff] hover:bg-blue-50/60 border border-slate-200"
            }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Tính nhanh</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveBhtnTab("conditions")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeBhtnTab === "conditions"
            ? "bg-[#0062ff] text-white shadow-xs"
            : "bg-white text-slate-700 hover:text-[#0062ff] hover:bg-blue-50/60 border border-slate-200"
            }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Kiểm tra điều kiện</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveBhtnTab("guide")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeBhtnTab === "guide"
            ? "bg-[#0062ff] text-white shadow-xs"
            : "bg-white text-slate-700 hover:text-[#0062ff] hover:bg-blue-50/60 border border-slate-200"
            }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Hướng dẫn & Quy trình</span>
        </button>
      </div>

      {/* Panel bổ trợ tương ứng với tab đang chọn */}
      {activeBhtnTab === "conditions" && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-blue-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 m-0 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0062ff]" />
              <span>Bảng kiểm tra 4 điều kiện hưởng bảo hiểm thất nghiệp</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">Đối chiếu dữ liệu vừa nhập</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className={`p-3.5 rounded-xl border ${totalMonths >= 12 ? "bg-emerald-50/70 border-emerald-200" : "bg-rose-50/70 border-rose-200"}`}>
              <div className="flex items-center gap-1.5 font-bold mb-1">
                {totalMonths >= 12 ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
                <span className={totalMonths >= 12 ? "text-emerald-900" : "text-rose-900"}>
                  1. Thời gian đóng BHTN
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed m-0">
                Đã đóng: <strong>{totalMonths} tháng</strong> ({totalMonths >= 12 ? "Đạt chuẩn ≥ 12 tháng" : "Chưa đủ tối thiểu 12 tháng"})
              </p>
            </div>

            <div className={`p-3.5 rounded-xl border ${terminationReason !== "illegal" && terminationReason !== "pension" ? "bg-emerald-50/70 border-emerald-200" : "bg-rose-50/70 border-rose-200"}`}>
              <div className="flex items-center gap-1.5 font-bold mb-1">
                {terminationReason !== "illegal" && terminationReason !== "pension" ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
                <span className={terminationReason !== "illegal" && terminationReason !== "pension" ? "text-emerald-900" : "text-rose-900"}>
                  2. Chấm dứt HĐLĐ
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed m-0">
                {terminationReason === "illegal"
                  ? "Trái luật (Không được hưởng)"
                  : terminationReason === "pension"
                    ? "Nghỉ hưu (Không thuộc diện)"
                    : "Chấm dứt hợp pháp theo luật"}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border bg-blue-50/70 border-blue-200">
              <div className="flex items-center gap-1.5 font-bold mb-1 text-blue-900">
                <Clock className="w-4 h-4 text-[#0062ff]" />
                <span>3. Hạn nộp hồ sơ</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed m-0">
                Trước ngày: <strong>{bhtnResult.deadlineDateStr}</strong> (Trong vòng 03 tháng)
              </p>
            </div>

            <div className="p-3.5 rounded-xl border bg-slate-50/80 border-slate-200">
              <div className="flex items-center gap-1.5 font-bold mb-1 text-slate-900">
                <Info className="w-4 h-4 text-slate-500" />
                <span>4. Trạng thái việc làm</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed m-0">
                Chưa tìm được việc sau 15 ngày kể từ ngày nộp đủ hồ sơ
              </p>
            </div>
          </div>
        </div>
      )}

      {activeBhtnTab === "guide" && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-blue-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 m-0 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#0062ff]" />
              <span>Quy trình 4 bước nhận trợ cấp thất nghiệp</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">Trung tâm Dịch vụ Việc làm</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-1.5">
              <span className="inline-block px-2 py-0.5 rounded-md bg-[#0062ff] text-white font-bold text-[11px]">
                Bước 1
              </span>
              <h4 className="text-xs font-bold text-slate-900 m-0">Nộp hồ sơ</h4>
              <p className="text-xs text-slate-600 leading-relaxed m-0">
                Nộp đủ hồ sơ trong vòng 03 tháng tại Trung tâm Dịch vụ Việc làm nơi muốn nhận trợ cấp.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-1.5">
              <span className="inline-block px-2 py-0.5 rounded-md bg-[#0062ff] text-white font-bold text-[11px]">
                Bước 2
              </span>
              <h4 className="text-xs font-bold text-slate-900 m-0">Nhận quyết định</h4>
              <p className="text-xs text-slate-600 leading-relaxed m-0">
                Trong vòng 20 ngày làm việc kể từ ngày nộp đủ hồ sơ hợp lệ, nhận Quyết định hưởng trợ cấp.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-1.5">
              <span className="inline-block px-2 py-0.5 rounded-md bg-[#0062ff] text-white font-bold text-[11px]">
                Bước 3
              </span>
              <h4 className="text-xs font-bold text-slate-900 m-0">Nhận tiền chi trả</h4>
              <p className="text-xs text-slate-600 leading-relaxed m-0">
                Cơ quan BHXH chi trả tiền trợ cấp tháng đầu trong 05 ngày qua tài khoản ngân hàng (ATM).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-1.5">
              <span className="inline-block px-2 py-0.5 rounded-md bg-[#0062ff] text-white font-bold text-[11px]">
                Bước 4
              </span>
              <h4 className="text-xs font-bold text-slate-900 m-0">Thông báo việc làm</h4>
              <p className="text-xs text-slate-600 leading-relaxed m-0">
                Hàng tháng đến Trung tâm DVVL thông báo về tình hình tìm kiếm việc làm theo lịch hẹn.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. MAIN LAYOUT: INPUT (5 cols) | RESULT (4 cols) | SIDEBAR (3 cols) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ==================== CỘT 1: NHẬP THÔNG TIN (5/12 cols) ==================== */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="pb-1.5 border-b border-slate-100">
            <h2 className="text-sm sm:text-base font-black text-slate-900 m-0 flex items-center gap-2">
              <span>1. Nhập thông tin đóng BHTN</span>
            </h2>

          </div>

          {/* Hình thức nhập lương đóng BHTN */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 block">
              Hình thức nhập lương đóng BHTN
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${calcMethod === "average"
                  ? "border-[#0062ff] bg-blue-50/60 text-[#0062ff]"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
              >
                <input
                  type="radio"
                  name="calcMethod"
                  checked={calcMethod === "average"}
                  onChange={() => setCalcMethod("average")}
                  className="accent-[#0062ff]"
                />
                <span>Lương bình quân 6 tháng</span>
              </label>

              <label
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${calcMethod === "monthly"
                  ? "border-[#0062ff] bg-blue-50/60 text-[#0062ff]"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
              >
                <input
                  type="radio"
                  name="calcMethod"
                  checked={calcMethod === "monthly"}
                  onChange={() => setCalcMethod("monthly")}
                  className="accent-[#0062ff]"
                />
                <span>Chi tiết 6 tháng gần nhất</span>
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            {/* Field 1: Mức lương đóng BHTN */}
            {calcMethod === "average" ? (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Mức lương bình quân 6 tháng liền kề <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={formatCurrency(avgSalary)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      setAvgSalary(raw ? parseInt(raw, 10) : 0);
                    }}
                    className="w-full h-10 px-3.5 bg-white rounded-xl border border-slate-200 focus:border-[#0062ff] focus:outline-hidden text-xs font-semibold text-slate-900 pr-14 transition-colors"
                  />
                  <span className="absolute right-3.5 text-xs font-bold text-slate-400 pointer-events-none">
                    VNĐ
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200/90">
                <span className="text-xs font-bold text-slate-700 block">
                  Lương đóng BHTN từng tháng:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((m, idx) => (
                    <div key={m} className="space-y-1">
                      <label className="text-xs text-slate-600 font-semibold">Tháng {m}</label>
                      <input
                        type="text"
                        value={formatCurrency(monthlySalaries[idx])}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          const updated = [...monthlySalaries];
                          updated[idx] = raw ? parseInt(raw, 10) : 0;
                          setMonthlySalaries(updated);
                        }}
                        className="w-full h-9 px-2.5 bg-white rounded-lg border border-slate-200 text-xs font-semibold text-slate-900"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form 2 Cột */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Field 2: Tổng thời gian đã đóng BHTN */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Tổng thời gian đóng BHTN <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min={0}
                    max={480}
                    value={totalMonths}
                    onChange={(e) => setTotalMonths(parseInt(e.target.value, 10) || 0)}
                    className="w-full h-10 px-3.5 bg-white rounded-xl border border-slate-200 focus:border-[#0062ff] focus:outline-hidden text-xs font-semibold text-slate-900 pr-16 transition-colors"
                  />
                  <span className="absolute right-3.5 text-xs font-bold text-slate-400 pointer-events-none">
                    Tháng
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-500 font-medium m-0 leading-normal">
                  Gồm cả thời gian ở các công ty trước
                </p>
              </div>

              {/* Field 3: Ngày chấm dứt hợp đồng */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Ngày chấm dứt hợp đồng <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="date"
                    value={terminationDate}
                    onChange={(e) => setTerminationDate(e.target.value)}
                    className="w-full h-10 px-3.5 bg-white rounded-xl border border-slate-200 focus:border-[#0062ff] focus:outline-hidden text-xs font-semibold text-slate-900 transition-colors"
                  />
                </div>
                <p className="text-[11.5px] text-slate-500 font-medium m-0 leading-normal">
                  Căn cứ tính hạn nộp hồ sơ (3 tháng)
                </p>
              </div>

              {/* Field 4: Loại hợp đồng lao động */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Loại hợp đồng lao động <span className="text-rose-500">*</span>
                </label>
                <select
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value)}
                  className="w-full h-10 px-3 bg-white rounded-xl border border-slate-200 focus:border-[#0062ff] focus:outline-hidden text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  <option value="indefinite">HĐ không xác định thời hạn</option>
                  <option value="fixed">HĐ xác định thời hạn (12-36 tháng)</option>
                  <option value="seasonal">HĐ mùa vụ / dưới 12 tháng</option>
                </select>
              </div>

              {/* Field 5: Tỉnh/Thành phố nộp hồ sơ */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Khu vực nộp hồ sơ <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedRegionId}
                  onChange={(e) => setSelectedRegionId(parseInt(e.target.value, 10))}
                  className="w-full h-10 px-3 bg-white rounded-xl border border-slate-200 focus:border-[#0062ff] focus:outline-hidden text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  {REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Field 6: Lý do chấm dứt hợp đồng */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Lý do chấm dứt hợp đồng <span className="text-rose-500">*</span>
              </label>
              <select
                value={terminationReason}
                onChange={(e) => setTerminationReason(e.target.value)}
                className="w-full h-10 px-3.5 bg-white rounded-xl border border-slate-200 focus:border-[#0062ff] focus:outline-hidden text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <option value="voluntary">Chấm dứt hợp đồng theo thỏa thuận / nhu cầu cá nhân</option>
                <option value="expired">Hết hạn hợp đồng lao động</option>
                <option value="restructure">Doanh nghiệp giải thể / cơ cấu lại tổ chức</option>
                <option value="illegal">Đơn phương chấm dứt HĐLĐ trái pháp luật</option>
                <option value="pension">Nghỉ việc hưởng lương hưu</option>
              </select>
            </div>
          </div>

          {/* Card Lưu ý quan trọng: Tăng font chữ và khoảng cách bullet */}
          <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-200/80 space-y-2.5">
            <h4 className="text-sm font-bold text-[#0062ff] m-0 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#0062ff] shrink-0" />
              <span>Lưu ý quan trọng</span>
            </h4>
            <ul className="text-[13px] sm:text-[13.5px] text-slate-700 space-y-2 pl-4.5 m-0 leading-[1.6] list-disc font-normal">
              <li>
                Cần nộp hồ sơ trong thời hạn <strong className="text-slate-900 font-bold">03 tháng</strong> kể từ ngày chấm dứt HĐLĐ.
              </li>
              <li>
                Mức hưởng hàng tháng tối đa không quá <strong className="text-slate-900 font-bold">5 lần mức lương tối thiểu vùng</strong>.
              </li>
            </ul>
          </div>

          {/* Nút Tính BHTN */}
          <button
            type="button"
            disabled={isCalculating}
            onClick={handleCalculate}
            className="w-full h-10.5 rounded-xl bg-[#0062ff] hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer border-none"
          >
            <Calculator className="w-4 h-4" />
            <span>{isCalculating ? "Đang tính toán..." : "Kiểm tra điều kiện & Tính trợ cấp"}</span>
          </button>
        </div>

        {/* ==================== CỘT 2: KẾT QUẢ ƯỚC TÍNH (4/12 cols) ==================== */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <h2 className="text-sm sm:text-base font-black text-slate-900 m-0">
              2. Kết quả ước tính
            </h2>
            <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
              Đơn vị: VNĐ
            </span>
          </div>

          {/* Card Trạng thái đủ điều kiện */}
          {bhtnResult.isEligible ? (
            <div className="bg-emerald-50/90 rounded-xl p-3.5 border border-emerald-200 flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="text-xs font-bold text-emerald-900 m-0 leading-tight">
                  Đủ điều kiện hưởng trợ cấp
                </h4>
                <p className="text-xs text-emerald-700 font-medium m-0 leading-relaxed">
                  Bạn đáp ứng các điều kiện hưởng trợ cấp thất nghiệp theo quy định hiện hành.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50/90 rounded-xl p-3.5 border border-amber-200 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 min-w-0">
                <h4 className="text-xs font-bold text-amber-900 m-0 leading-tight">
                  Chưa đủ điều kiện hưởng trợ cấp
                </h4>
                <p className="text-xs text-amber-700 font-medium m-0 leading-relaxed">
                  {bhtnResult.ineligibilityReason}
                </p>
              </div>
            </div>
          )}

          {/* Khối Lương trợ cấp hàng tháng: Làm nổi bật có kiểm soát, nền xám nhạt thanh lịch */}
          <div className="bg-slate-50/90 rounded-xl p-4 border border-slate-200 space-y-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Mức trợ cấp hàng tháng
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#0062ff] tracking-tight">
              {formatCurrency(bhtnResult.monthlyBenefit)} <span className="text-sm font-bold text-slate-500">VNĐ</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-500 block">Thời gian hưởng</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                  {bhtnResult.benefitMonths} tháng
                </span>
              </div>
              <div className="space-y-0.5 text-right">
                <span className="text-xs font-semibold text-slate-500 block">Tổng trợ cấp dự kiến</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-600 block">
                  {formatCurrency(bhtnResult.totalBenefit)} VNĐ
                </span>
              </div>
            </div>
          </div>

          {/* Chi tiết tính toán: Thoáng hơn, chữ to rõ ràng, căn gióng đều 2 bên */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm sm:text-[15px] font-bold text-slate-900 m-0 pb-1 border-b border-slate-100">
              Chi tiết tính toán
            </h4>
            <div className="space-y-2.5 text-[13px] sm:text-[13.5px]">
              <div className="flex items-center justify-between text-slate-600 py-0.5">
                <span>Lương bình quân 6 tháng</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(bhtnResult.computedAvgSalary)} VNĐ
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 py-0.5">
                <span>Tỷ lệ hưởng theo luật (60%)</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(bhtnResult.rawMonthlyBenefit)} VNĐ
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 py-0.5">
                <span>Mức trần tối đa vùng ({REGIONS.find((r) => r.id === selectedRegionId)?.name})</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(bhtnResult.maxCap)} VNĐ
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-900 font-bold pt-2.5 border-t border-slate-100">
                <span className="text-[13.5px] sm:text-sm">Mức trợ cấp thực tế/tháng</span>
                <span className="text-[#0062ff] text-base font-black tabular-nums">
                  {formatCurrency(bhtnResult.monthlyBenefit)} VNĐ
                </span>
              </div>
            </div>
          </div>

          {/* Thông tin bổ sung / Mốc thời gian: Khoảng cách dòng thoáng, font chữ rõ ràng */}
          <div className="space-y-3 pt-2.5 border-t border-slate-100">
            <h4 className="text-sm sm:text-[15px] font-bold text-slate-900 m-0 pb-1 border-b border-slate-100">
              Mốc thời gian quan trọng
            </h4>
            <div className="space-y-2.5 text-[13px] sm:text-[13.5px]">
              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-2 text-slate-700 font-medium">
                  <Calendar className="w-4 h-4 text-[#0062ff] shrink-0" />
                  <span>Thời gian đã đóng BHTN</span>
                </span>
                <span className="font-bold text-slate-900 tabular-nums">{totalMonths} tháng</span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs sm:text-[13px] font-bold text-amber-900">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Hạn chót nộp hồ sơ:</span>
                  </span>
                  <span className="font-bold text-amber-900 tabular-nums text-xs sm:text-[13px]">
                    {bhtnResult.deadlineDateStr}
                  </span>
                </div>
                <p className="text-[12.5px] sm:text-[13px] text-amber-800/90 font-medium m-0 pl-6 leading-[1.6]">
                  Trong thời hạn 03 tháng kể từ ngày nghỉ việc
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== CỘT 3: RIGHT SIDEBAR (3/12 cols) ==================== */}
        <div className="lg:col-span-3 space-y-3.5">
          {/* Card 1: Bạn có biết?: Tăng font chữ mô tả (13.5px - 14px), line-height 1.6, giãn cách các ý 11-12px */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
            <h3 className="text-sm sm:text-[15px] font-black text-slate-900 m-0 flex items-center gap-2 pb-1 border-b border-slate-100">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Bạn có biết?</span>
            </h3>
            <ul className="space-y-3 text-[13px] sm:text-[13.5px] text-slate-700 pl-0 list-none m-0 leading-[1.6] font-normal">
              <li className="flex items-start gap-2.5">
                <span className="text-[#0062ff] font-bold text-sm shrink-0 mt-0.5">✓</span>
                <span>BHTN hỗ trợ tài chính kịp thời khi người lao động chưa tìm được việc mới.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#0062ff] font-bold text-sm shrink-0 mt-0.5">✓</span>
                <span>Mức hưởng bằng 60% lương bình quân đóng BHTN của 06 tháng liền kề.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#0062ff] font-bold text-sm shrink-0 mt-0.5">✓</span>
                <span>Thời gian hưởng từ 3 đến 12 tháng tùy thuộc vào tổng thời gian đóng góp.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#0062ff] font-bold text-sm shrink-0 mt-0.5">✓</span>
                <span>Người hưởng BHTN được hỗ trợ tư vấn, giới thiệu việc làm và học nghề miễn phí.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Công cụ liên quan */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 m-0">
              Công cụ liên quan
            </h3>
            <div className="space-y-1.5">
              <Link
                href="/cong-cu/tinh-luong-gross-net"
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/70 border border-transparent hover:border-blue-200 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-[#0062ff] truncate">
                    Tính lương Gross - Net
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0062ff] group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>

              <Link
                href="/cong-cu/mbti"
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-purple-50/70 border border-transparent hover:border-purple-200 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Brain className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-purple-700 truncate">
                    Trắc nghiệm tính cách MBTI
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>

              <Link
                href="/ai-career"
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/70 border border-transparent hover:border-blue-200 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-[#0062ff] truncate">
                    Trợ lý AI Hướng nghiệp
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0062ff] group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            </div>
          </div>

          {/* Card 3: Cần hỗ trợ? (Tư vấn chính sách BHXH) */}
          <div className="bg-blue-50/50 rounded-2xl p-4 sm:p-5 border border-blue-200/70 shadow-2xs space-y-2.5">
            <div>
              <h4 className="text-sm font-bold text-slate-900 m-0 pb-1 border-b border-blue-100">Tư vấn chính sách BHXH</h4>
              <p className="text-[13px] sm:text-[13.5px] text-slate-600 font-normal m-0 mt-2 leading-[1.6]">
                Liên hệ tổng đài hoặc Trung tâm Dịch vụ Việc làm gần nhất để được giải đáp hồ sơ.
              </p>
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => message.info("Tổng đài hỗ trợ BHXH Việt Nam: 1900 9068")}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50 text-[#0062ff] font-bold text-xs border border-blue-200 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Tổng đài 1900 9068</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. SECTION ACCORDION: TÌM HIỂU THÊM VỀ BHTN                */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
        <div className="pb-1 border-b border-slate-100">
          <h3 className="text-sm sm:text-base font-black text-slate-900 m-0">
            Tìm hiểu thêm về bảo hiểm thất nghiệp
          </h3>

        </div>

        <div className="space-y-2 pt-0.5">
          {/* Accordion 1 */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion(1)}
              className="w-full px-4 py-3 bg-slate-50/70 hover:bg-slate-100/70 flex items-center justify-between transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#0062ff]" />
                <span className="text-xs font-bold text-slate-900">
                  Đối tượng được hưởng trợ cấp thất nghiệp
                </span>
              </div>
              {openAccordion[1] ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <Plus className="w-4 h-4 text-slate-400" />
              )}
            </button>
            {openAccordion[1] && (
              <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                Người lao động làm việc theo hợp đồng lao động không xác định thời hạn, hợp đồng xác định thời hạn hoặc hợp đồng theo mùa vụ từ đủ 03 tháng trở lên đã tham gia đóng BHTN đầy đủ theo quy định của pháp luật.
              </div>
            )}
          </div>

          {/* Accordion 2 */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion(2)}
              className="w-full px-4 py-3 bg-slate-50/70 hover:bg-slate-100/70 flex items-center justify-between transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#0062ff]" />
                <span className="text-xs font-bold text-slate-900">
                  Điều kiện hưởng trợ cấp thất nghiệp
                </span>
              </div>
              {openAccordion[2] ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <Plus className="w-4 h-4 text-slate-400" />
              )}
            </button>
            {openAccordion[2] && (
              <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100 space-y-1.5">
                <p className="m-0">• Đã chấm dứt HĐLĐ hoặc HĐLV (không áp dụng với trường hợp đơn phương chấm dứt HĐLĐ trái pháp luật hoặc hưởng lương hưu).</p>
                <p className="m-0">• Đã đóng BHTN từ đủ 12 tháng trở lên trong thời gian 24 tháng trước khi chấm dứt HĐLĐ.</p>
                <p className="m-0">• Đã nộp hồ sơ hưởng BHTN tại Trung tâm dịch vụ việc làm trong thời hạn 03 tháng kể từ ngày chấm dứt HĐLĐ.</p>
                <p className="m-0">• Chưa tìm được việc làm sau 15 ngày kể từ ngày nộp hồ sơ.</p>
              </div>
            )}
          </div>

          {/* Accordion 3 */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion(3)}
              className="w-full px-4 py-3 bg-slate-50/70 hover:bg-slate-100/70 flex items-center justify-between transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#0062ff]" />
                <span className="text-xs font-bold text-slate-900">
                  Hồ sơ và thủ tục nhận trợ cấp
                </span>
              </div>
              {openAccordion[3] ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <Plus className="w-4 h-4 text-slate-400" />
              )}
            </button>
            {openAccordion[3] && (
              <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100 space-y-1.5">
                <p className="m-0">• Đơn đề nghị hưởng trợ cấp thất nghiệp theo mẫu quy định.</p>
                <p className="m-0">• Bản chính hoặc bản sao có chứng thực của HĐLĐ đã hết hạn hoặc quyết định thôi việc.</p>
                <p className="m-0">• Sổ Bảo hiểm xã hội bản chính đã chốt thời gian đóng BHTN.</p>
                <p className="m-0">• Căn cước công dân và thông tin tài khoản ngân hàng chính chủ để nhận trợ cấp.</p>
              </div>
            )}
          </div>

          {/* Accordion 4 */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion(4)}
              className="w-full px-4 py-3 bg-slate-50/70 hover:bg-slate-100/70 flex items-center justify-between transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#0062ff]" />
                <span className="text-xs font-bold text-slate-900">
                  Quy trình nhận trợ cấp thất nghiệp
                </span>
              </div>
              {openAccordion[4] ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <Plus className="w-4 h-4 text-slate-400" />
              )}
            </button>
            {openAccordion[4] && (
              <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100 space-y-1.5">
                <p className="m-0">• <strong>Bước 1:</strong> Nộp đủ hồ sơ trong vòng 03 tháng tại Trung tâm Dịch vụ Việc làm.</p>
                <p className="m-0">• <strong>Bước 2:</strong> Nhận Quyết định hưởng trợ cấp thất nghiệp trong vòng 20 ngày làm việc.</p>
                <p className="m-0">• <strong>Bước 3:</strong> Nhận tiền chi trả qua thẻ ATM ngân hàng theo từng tháng.</p>
                <p className="m-0">• <strong>Bước 4:</strong> Thông báo tình hình tìm kiếm việc làm hàng tháng theo lịch hẹn.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. CTA BANNER CUỐI TRANG: ĐỒNG HÀNH SỰ NGHIỆP CÙNG CAREZA*/}
      {/* ======================================================== */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-50/70 via-white to-blue-50/50 border border-blue-200/90 shadow-2xs p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-[#0062ff] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 m-0 leading-tight">
              Chủ động hiểu rõ quyền lợi · Vững vàng cho tương lai
            </h3>
            <p className="text-xs text-slate-600 font-medium m-0 mt-0.5 leading-relaxed">
              Careza đồng hành cùng bạn tìm kiếm cơ hội việc làm mới nhanh chóng và phù hợp nhất.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/viec-lam"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all"
          >
            <span>Tìm việc làm ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
