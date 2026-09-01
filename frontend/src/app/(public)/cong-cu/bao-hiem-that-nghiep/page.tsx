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
    1: false,
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
    }, 250);
  };

  return (
    <div className="w-full max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-[38px] pb-12 pt-2 bg-[#f7faff] min-h-screen space-y-4">
      {/* ======================================================== */}
      {/* 1. HERO COMPACT: BẢO HIỂM THẤT NGHIỆP                     */}
      {/* ======================================================== */}
      <div className="relative w-full rounded-2xl overflow-hidden min-h-[135px] sm:min-h-[145px] lg:min-h-[150px] bg-gradient-to-r from-[#eaf2ff] via-[#f0f6ff] to-[#e4efff] border border-blue-100/90 shadow-2xs p-4 sm:p-5 lg:p-6 flex flex-col justify-between">
        {/* Right Calligraphy & 3D Shield/Clipboard Visual */}
        <div className="absolute top-0 right-0 h-full w-[48%] md:w-[42%] pointer-events-none select-none overflow-hidden hidden sm:block">
          <div className="relative w-full h-full flex items-center justify-end pr-8">
            {/* Calligraphy text */}
            <div className="absolute top-3.5 left-2 z-10 text-left -rotate-6 pointer-events-none">
              <span className="font-serif italic text-sm sm:text-base font-bold text-[#0062ff] block leading-tight drop-shadow-2xs">
                Bảo hiểm thất nghiệp
              </span>
              <span className="font-serif italic text-sm sm:text-base font-bold text-[#0062ff] block leading-tight drop-shadow-2xs">
                Đồng hành cùng bạn
              </span>
            </div>

            {/* Visual 3D Shield & Clipboard & Coins */}
            <div className="flex items-center gap-2.5 relative z-0 pr-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 border-2 border-yellow-200 shadow-md flex items-center justify-center text-amber-950 font-black text-xs -rotate-12 translate-y-3">
                ₫
              </div>

              {/* 3D Shield */}
              <div className="w-16 h-20 bg-gradient-to-br from-[#0062ff] via-[#0052db] to-[#003da6] rounded-2xl shadow-lg border-2 border-blue-300/40 p-2 flex flex-col items-center justify-center text-white rotate-6 relative overflow-hidden">
                <ShieldCheck className="w-9 h-9 text-white drop-shadow-xs" />
              </div>

              {/* Floating Card */}
              <div className="w-16 h-22 bg-white rounded-xl border border-blue-200 shadow-md p-1.5 flex flex-col justify-between text-center -rotate-6">
                <span className="text-[9px] font-black text-[#0062ff] uppercase block">Quyền lợi</span>
                <span className="text-[9px] font-black text-emerald-600 uppercase block">Cơ hội mới</span>
                <div className="w-full h-0.5 bg-blue-100 my-0.5" />
                <span className="text-[8px] font-bold text-slate-500 block leading-tight">Tương lai tốt hơn</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Bên Trái */}
        <div className="relative z-10 max-w-2xl space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-[#0062ff] transition-colors">
              Trang chủ
            </Link>
            <span>›</span>
            <Link href="/cong-cu" className="hover:text-[#0062ff] transition-colors">
              Công cụ
            </Link>
            <span>›</span>
            <span className="text-[#0062ff] font-semibold">Tính bảo hiểm thất nghiệp</span>
          </div>

          <div className="flex items-center gap-3 pt-0.5">
            <div className="w-10 h-10 rounded-xl bg-[#0062ff] text-white flex items-center justify-center shadow-xs shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0 leading-tight">
                  Tính bảo hiểm thất nghiệp
                </h1>
                <span className="bg-blue-100/70 text-[#0062ff] text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200/80 hidden sm:inline-block">
                  An tâm hôm nay, vững bước ngày mai
                </span>
              </div>
              <p className="text-xs text-slate-600 font-normal m-0 mt-0.5 leading-relaxed">
                Ước tính nhanh mức trợ cấp thất nghiệp, kiểm tra điều kiện hưởng và hiểu rõ quyền lợi của bạn theo quy định hiện hành.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MODE/TAB NGHIỆP VỤ (3 TABS)                            */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => setActiveBhtnTab("quick")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeBhtnTab === "quick"
              ? "bg-[#0062ff] text-white shadow-xs"
              : "bg-white text-slate-700 hover:text-[#0062ff] hover:bg-blue-50/50 border border-slate-200"
          }`}
        >
          Tính nhanh
        </button>

        <button
          type="button"
          onClick={() => setActiveBhtnTab("conditions")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeBhtnTab === "conditions"
              ? "bg-[#0062ff] text-white shadow-xs"
              : "bg-white text-slate-700 hover:text-[#0062ff] hover:bg-blue-50/50 border border-slate-200"
          }`}
        >
          Kiểm tra điều kiện
        </button>

        <button
          type="button"
          onClick={() => setActiveBhtnTab("guide")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeBhtnTab === "guide"
              ? "bg-[#0062ff] text-white shadow-xs"
              : "bg-white text-slate-700 hover:text-[#0062ff] hover:bg-blue-50/50 border border-slate-200"
          }`}
        >
          Hướng dẫn & Quy trình
        </button>
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN LAYOUT: INPUT (42%) | RESULT (33%) | SIDEBAR (25%)*/}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4.5 pt-1 items-start">
        {/* ==================== CỘT 1: NHẬP THÔNG TIN (5/12 cols) ==================== */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#E5ECF6] shadow-2xs space-y-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-800 m-0">
              1. Nhập thông tin
            </h2>
            <p className="text-xs text-slate-500 font-normal m-0 mt-0.5">
              Điền đầy đủ thông tin để hệ thống tính toán chính xác mức trợ cấp thất nghiệp của bạn
            </p>
          </div>

          {/* Hình thức nhập lương đóng BHTN */}
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-semibold text-slate-700 block">
              Hình thức nhập lương đóng BHTN
            </span>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="radio"
                  name="calcMethod"
                  checked={calcMethod === "average"}
                  onChange={() => setCalcMethod("average")}
                  className="text-[#0062ff]"
                />
                <span>Nhập mức lương bình quân 6 tháng</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="radio"
                  name="calcMethod"
                  checked={calcMethod === "monthly"}
                  onChange={() => setCalcMethod("monthly")}
                  className="text-[#0062ff]"
                />
                <span>Nhập chi tiết 6 tháng gần nhất</span>
              </label>
            </div>
          </div>

          {/* Form 2 Cột Desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Field 1: Mức lương đóng BHTN */}
            {calcMethod === "average" ? (
              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-xs font-semibold text-slate-700 block">
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
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 focus:border-[#0062ff] focus:outline-hidden text-xs font-semibold text-slate-800 pr-14"
                  />
                  <span className="absolute right-3 text-xs font-bold text-slate-400 pointer-events-none">
                    VNĐ
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 sm:col-span-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-700 block">
                  Lương đóng BHTN 6 tháng gần nhất:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((m, idx) => (
                    <div key={m} className="space-y-1">
                      <label className="text-[10.5px] text-slate-500 font-medium">Tháng {m}</label>
                      <input
                        type="text"
                        value={formatCurrency(monthlySalaries[idx])}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          const updated = [...monthlySalaries];
                          updated[idx] = raw ? parseInt(raw, 10) : 0;
                          setMonthlySalaries(updated);
                        }}
                        className="w-full px-2 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-semibold text-slate-800"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Field 2: Tổng thời gian đã đóng BHTN */}
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Tổng thời gian đã đóng BHTN <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min={0}
                  max={480}
                  value={totalMonths}
                  onChange={(e) => setTotalMonths(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 focus:border-[#0062ff] focus:outline-hidden text-xs font-semibold text-slate-800 pr-16"
                />
                <span className="absolute right-3 text-xs font-bold text-slate-400 pointer-events-none">
                  Tháng
                </span>
              </div>
              <p className="text-[10px] text-slate-400 m-0">
                Bao gồm cả thời gian đóng BHTN ở các công ty trước đây
              </p>
            </div>

            {/* Field 3: Loại hợp đồng lao động */}
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Loại hợp đồng lao động <span className="text-rose-500">*</span>
              </label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 focus:border-[#0062ff] focus:outline-hidden text-xs font-semibold text-slate-800"
              >
                <option value="indefinite">Hợp đồng không xác định thời hạn</option>
                <option value="fixed">Hợp đồng xác định thời hạn (12-36 tháng)</option>
                <option value="seasonal">Hợp đồng mùa vụ / công việc dưới 12 tháng</option>
              </select>
            </div>

            {/* Field 4: Lý do chấm dứt hợp đồng */}
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Lý do chấm dứt hợp đồng <span className="text-rose-500">*</span>
              </label>
              <select
                value={terminationReason}
                onChange={(e) => setTerminationReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 focus:border-[#0062ff] focus:outline-hidden text-xs font-semibold text-slate-800"
              >
                <option value="voluntary">Chấm dứt hợp đồng theo nhu cầu cá nhân</option>
                <option value="expired">Hết hạn hợp đồng lao động</option>
                <option value="restructure">Doanh nghiệp giải thể / cơ cấu lại</option>
                <option value="illegal">Đơn phương chấm dứt HĐLĐ trái pháp luật</option>
                <option value="pension">Nghỉ việc hưởng lương hưu</option>
              </select>
            </div>

            {/* Field 5: Ngày chấm dứt hợp đồng */}
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Ngày chấm dứt hợp đồng <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="date"
                  value={terminationDate}
                  onChange={(e) => setTerminationDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 focus:border-[#0062ff] focus:outline-hidden text-xs font-semibold text-slate-800"
                />
              </div>
            </div>

            {/* Field 6: Tỉnh/Thành phố nộp hồ sơ */}
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Tỉnh/Thành phố nộp hồ sơ <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedRegionId}
                onChange={(e) => setSelectedRegionId(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 focus:border-[#0062ff] focus:outline-hidden text-xs font-semibold text-slate-800"
              >
                {REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 m-0">
                Dùng để xác định mức lương tối thiểu vùng (nếu có)
              </p>
            </div>
          </div>

          {/* Card Lưu ý quan trọng */}
          <div className="bg-[#f0f7ff] rounded-xl p-3.5 border border-[#dbeafe] space-y-1.5">
            <h4 className="text-xs font-bold text-[#0062ff] m-0 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#0062ff]" />
              <span>Lưu ý quan trọng</span>
            </h4>
            <ul className="text-[11px] text-slate-600 space-y-1 pl-4 m-0 leading-relaxed list-disc">
              <li>Bạn cần nộp hồ sơ trong thời hạn 03 tháng kể từ ngày chấm dứt hợp đồng lao động.</li>
              <li>Mức trợ cấp được tính dựa trên mức lương bình quân 6 tháng đóng BHTN, thời gian đóng và quy định hiện hành.</li>
              <li>Kết quả chỉ mang tính tham khảo, vui lòng đối chiếu với cơ quan BHXH.</li>
            </ul>
          </div>

          {/* Nút Tính BHTN */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isCalculating}
              onClick={handleCalculate}
              className="w-full py-3 rounded-xl bg-[#0062ff] hover:bg-[#0047ba] disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>{isCalculating ? "Đang kiểm tra & tính toán..." : "Kiểm tra điều kiện & Tính trợ cấp"}</span>
            </button>
          </div>
        </div>

        {/* ==================== CỘT 2: KẾT QUẢ ƯỚC TÍNH (4/12 cols) ==================== */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-[#E5ECF6] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-800 m-0">
              2. Kết quả ước tính
            </h2>
            <span className="text-[10px] text-slate-400 font-medium">
              Đơn vị: VNĐ
            </span>
          </div>

          {/* Card Trạng thái đủ điều kiện */}
          {bhtnResult.isEligible ? (
            <div className="bg-[#f0fdf4] rounded-2xl p-3.5 border border-[#bbf7d0] flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-emerald-900 m-0 leading-tight">
                  Bạn đủ điều kiện hưởng trợ cấp thất nghiệp
                </h4>
                <p className="text-[10.5px] text-emerald-700 font-normal m-0 leading-tight">
                  Dựa trên thông tin bạn cung cấp, bạn đáp ứng các điều kiện hưởng trợ cấp thất nghiệp theo quy định hiện hành.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-amber-900 m-0 leading-tight">
                  Chưa đủ điều kiện hưởng trợ cấp thất nghiệp
                </h4>
                <p className="text-[10.5px] text-amber-700 font-normal m-0 leading-tight">
                  {bhtnResult.ineligibilityReason}
                </p>
              </div>
            </div>
          )}

          {/* Khối Lương trợ cấp hàng tháng Xanh Pastel Lớn */}
          <div className="bg-[#f0fdf4] rounded-2xl p-4 border border-[#bbf7d0] space-y-2">
            <span className="text-xs font-bold text-emerald-800 block">
              Mức trợ cấp hàng tháng
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
              {formatCurrency(bhtnResult.monthlyBenefit)}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-200/60">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 block">Thời gian hưởng</span>
                <span className="text-xs font-bold text-slate-800 block">
                  {bhtnResult.benefitMonths} tháng
                </span>
              </div>
              <div className="space-y-0.5 text-right">
                <span className="text-[10px] text-slate-500 block">Tổng trợ cấp dự kiến</span>
                <span className="text-xs font-bold text-[#0062ff] block">
                  {formatCurrency(bhtnResult.totalBenefit)}
                </span>
              </div>
            </div>
          </div>

          {/* Chi tiết tính toán */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold text-slate-800 m-0">Chi tiết tính toán</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Mức lương bình quân 6 tháng</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(bhtnResult.computedAvgSalary)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Tỷ lệ trợ cấp (60%)</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(bhtnResult.rawMonthlyBenefit)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Giới hạn mức hưởng theo quy định</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(bhtnResult.maxCap)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-800 font-bold pt-1 border-t border-slate-100">
                <span>Mức trợ cấp thực tế/tháng</span>
                <span className="text-emerald-700">
                  {formatCurrency(bhtnResult.monthlyBenefit)}
                </span>
              </div>
            </div>
          </div>

          {/* Thông tin bổ sung */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 m-0">Thông tin bổ sung</h4>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>Thời gian đã đóng BHTN</span>
                </span>
                <span className="font-semibold text-slate-800">{totalMonths} tháng</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  <span>Số tháng được hưởng trợ cấp</span>
                </span>
                <span className="font-semibold text-slate-800">{bhtnResult.benefitMonths} tháng</span>
              </div>
              <div className="space-y-0.5 pt-0.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-amber-500 font-bold">⏰</span>
                    <span>Ngày hết hạn nộp hồ sơ</span>
                  </span>
                  <span className="font-bold text-slate-800">{bhtnResult.deadlineDateStr}</span>
                </div>
                <span className="text-[10px] text-slate-400 block pl-5">
                  (Trong vòng 03 tháng kể từ ngày chấm dứt HĐLĐ)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== CỘT 3: RIGHT SIDEBAR (3/12 cols) ==================== */}
        <div className="lg:col-span-3 space-y-3.5">
          {/* Card 1: 💡 Bạn có biết? */}
          <div className="bg-[#fffdf5] rounded-2xl p-4 border border-[#fde68a] shadow-2xs space-y-2.5">
            <h3 className="text-xs font-bold text-slate-800 m-0 flex items-center gap-1.5">
              <span>💡</span>
              <span>Bạn có biết?</span>
            </h3>
            <ul className="space-y-2 text-[11px] text-slate-700 pl-0 list-none m-0 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">✓</span>
                <span>BHTN giúp người lao động giảm bớt khó khăn tài chính khi mất việc làm.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Mức trợ cấp hàng tháng bằng 60% mức lương bình quân 6 tháng đóng BHTN.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Thời gian hưởng từ 3 đến 12 tháng tùy thuộc thời gian đóng BHTN.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Hãy nộp hồ sơ đúng thời hạn để đảm bảo quyền lợi của mình.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Công cụ liên quan */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5ECF6] shadow-2xs space-y-2.5">
            <h3 className="text-xs font-bold text-slate-800 m-0">
              Công cụ liên quan
            </h3>
            <div className="space-y-1.5">
              <Link
                href="/cong-cu"
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-blue-50/60 border border-transparent hover:border-blue-200 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                    <Calculator className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11.5px] font-semibold text-slate-700 group-hover:text-[#0062ff] truncate">
                    Tính lương Gross - Net
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0062ff] group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>

              <Link
                href="/cong-cu/mbti"
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-purple-50/60 border border-transparent hover:border-purple-200 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Brain className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11.5px] font-semibold text-slate-700 group-hover:text-purple-700 truncate">
                    Trắc nghiệm MBTI / Tính cách
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>

              <Link
                href="/ai-career"
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-blue-50/60 border border-transparent hover:border-blue-200 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11.5px] font-semibold text-slate-700 group-hover:text-[#0062ff] truncate">
                    Trợ lý AI Career & Phỏng vấn
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0062ff] group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            </div>
          </div>

          {/* Card 3: Cần hỗ trợ? */}
          <div className="bg-[#f0f7ff] rounded-2xl p-4 border border-[#dbeafe] shadow-2xs space-y-2.5 relative overflow-hidden">
            <div>
              <h4 className="text-xs font-bold text-slate-800 m-0">Cần hỗ trợ?</h4>
              <p className="text-[10.5px] text-slate-600 font-normal m-0 mt-0.5 leading-tight">
                Đội ngũ Careza luôn sẵn sàng đồng hành cùng bạn.
              </p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => message.info("Tổng đài Careza: 1900 6868")}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#0062ff] font-bold text-[11px] border border-blue-200 shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>Liên hệ hỗ trợ</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0062ff] flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. SECTION ACCORDION: TÌM HIỂU THÊM VỀ BHTN                */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5ECF6] shadow-2xs space-y-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-800 m-0">
          Tìm hiểu thêm về bảo hiểm thất nghiệp
        </h3>

        <div className="space-y-2 pt-1">
          {/* Accordion 1 */}
          <div className="border border-slate-200/80 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion(1)}
              className="w-full px-4 py-3 bg-slate-50/60 hover:bg-slate-100/70 flex items-center justify-between transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#0062ff]" />
                <span className="text-xs font-semibold text-slate-800">
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
              <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in">
                Người lao động làm việc theo hợp đồng lao động không xác định thời hạn, hợp đồng xác định thời hạn hoặc hợp đồng theo mùa vụ từ đủ 03 tháng trở lên đã tham gia đóng BHTN đầy đủ theo quy định.
              </div>
            )}
          </div>

          {/* Accordion 2 */}
          <div className="border border-slate-200/80 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion(2)}
              className="w-full px-4 py-3 bg-slate-50/60 hover:bg-slate-100/70 flex items-center justify-between transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#0062ff]" />
                <span className="text-xs font-semibold text-slate-800">
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
              <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100 space-y-1.5 animate-in fade-in">
                <p className="m-0">• Đã chấm dứt HĐLĐ hoặc HĐLV (không áp dụng với trường hợp đơn phương chấm dứt HĐLĐ trái pháp luật hoặc hưởng lương hưu).</p>
                <p className="m-0">• Đã đóng BHTN từ đủ 12 tháng trở lên trong thời gian 24 tháng trước khi chấm dứt HĐLĐ.</p>
                <p className="m-0">• Đã nộp hồ sơ hưởng BHTN tại Trung tâm dịch vụ việc làm trong thời hạn 03 tháng kể từ ngày chấm dứt HĐLĐ.</p>
                <p className="m-0">• Chưa tìm được việc làm sau 15 ngày kể từ ngày nộp hồ sơ.</p>
              </div>
            )}
          </div>

          {/* Accordion 3 */}
          <div className="border border-slate-200/80 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion(3)}
              className="w-full px-4 py-3 bg-slate-50/60 hover:bg-slate-100/70 flex items-center justify-between transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#0062ff]" />
                <span className="text-xs font-semibold text-slate-800">
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
              <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100 space-y-1.5 animate-in fade-in">
                <p className="m-0">• Đề nghị hưởng trợ cấp thất nghiệp theo mẫu do Bộ Lao động - Thương binh và Xã hội quy định.</p>
                <p className="m-0">• Bản chính hoặc bản sao có chứng thực của HĐLĐ đã hết hạn hoặc quyết định thôi việc.</p>
                <p className="m-0">• Sổ Bảo hiểm xã hội bản chính đã chốt thời gian đóng BHTN.</p>
                <p className="m-0">• Căn cước công dân và thông tin tài khoản ngân hàng để nhận trợ cấp.</p>
              </div>
            )}
          </div>

          {/* Accordion 4 */}
          <div className="border border-slate-200/80 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion(4)}
              className="w-full px-4 py-3 bg-slate-50/60 hover:bg-slate-100/70 flex items-center justify-between transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#0062ff]" />
                <span className="text-xs font-semibold text-slate-800">
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
              <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100 space-y-1.5 animate-in fade-in">
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
      {/* 5. CTA BANNER CUỐI TRANG: CHỦ ĐỘNG HIỂU RÕ QUYỀN LỢI      */}
      {/* ======================================================== */}
      <div className="relative w-full rounded-2xl overflow-hidden min-h-[100px] sm:min-h-[115px] bg-gradient-to-r from-[#edf5ff] via-[#f4f8ff] to-[#e4efff] border border-blue-100 shadow-2xs p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
        <div className="space-y-1 max-w-lg z-10">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 m-0 leading-tight">
            Chủ động hiểu rõ quyền lợi<br className="hidden sm:inline" /> Vững vàng cho tương lai
          </h3>
          <p className="text-xs text-slate-600 font-normal m-0 leading-relaxed">
            Careza đồng hành cùng bạn trên mọi chặng đường sự nghiệp.
          </p>
        </div>

        {/* Decorative Calligraphy & Shield Visual */}
        <div className="flex items-center gap-5 z-10 shrink-0 pr-2">
          <div className="flex items-center gap-2 relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 border-2 border-yellow-200 shadow-xs flex items-center justify-center text-amber-950 font-black text-xs -rotate-12">
              ₫
            </div>
            <div className="w-12 h-14 bg-gradient-to-br from-[#0062ff] to-[#0047ba] rounded-xl shadow-md flex items-center justify-center text-white rotate-6">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="text-right -rotate-3 pointer-events-none select-none">
            <span className="font-serif italic text-xs sm:text-sm font-bold text-[#0062ff] block leading-tight">
              An tâm
            </span>
            <span className="font-serif italic text-xs sm:text-sm font-bold text-[#0062ff] block leading-tight">
              Phát triển
            </span>
            <span className="font-serif italic text-xs sm:text-sm font-bold text-[#0062ff] block leading-tight">
              Bền vững
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
