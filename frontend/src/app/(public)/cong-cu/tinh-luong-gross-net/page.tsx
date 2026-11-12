"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { message, Tooltip } from "antd";
import {
  Calculator,
  ShieldCheck,
  Info,
  ArrowRight,
  Minus,
  Plus,
  Bot,
  Brain,
  Headphones,
} from "lucide-react";

// ==================== HẰNG SỐ PHÁP LÝ & THUẾ HIỆN HÀNH ====================
const TAX_BRACKETS = [
  { level: 1, max: 5000000, rate: 0.05, subtract: 0 },
  { level: 2, max: 10000000, rate: 0.1, subtract: 250000 },
  { level: 3, max: 18000000, rate: 0.15, subtract: 750000 },
  { level: 4, max: 32000000, rate: 0.2, subtract: 1650000 },
  { level: 5, max: 52000000, rate: 0.25, subtract: 3250000 },
  { level: 6, max: 80000000, rate: 0.3, subtract: 5850000 },
  { level: 7, max: Infinity, rate: 0.35, subtract: 9850000 },
];

const REGIONS = [
  { id: 1, name: "Hà Nội", regionName: "Vùng I (Hà Nội, TP.HCM, Hải Phòng...)", minSalary: 4960000 },
  { id: 2, name: "TP. Hồ Chí Minh", regionName: "Vùng I (TP.HCM)", minSalary: 4960000 },
  { id: 3, name: "Đà Nẵng, Cần Thơ", regionName: "Vùng II (Đà Nẵng, Cần Thơ, Nha Trang...)", minSalary: 4410000 },
  { id: 4, name: "Thành phố trực thuộc tỉnh", regionName: "Vùng III (Các TP trực thuộc tỉnh)", minSalary: 3860000 },
  { id: 5, name: "Khu vực còn lại", regionName: "Vùng IV (Các khu vực còn lại)", minSalary: 3450000 },
];

const MAX_INSURANCE_BASE = 46800000;
const PERSONAL_DEDUCTION = 11000000;
const DEPENDENT_DEDUCTION = 4400000;

const formatCurrency = (num: number | undefined | null) => {
  if (typeof num !== "number" || isNaN(num) || !isFinite(num)) return "0";
  return new Intl.NumberFormat("vi-VN").format(Math.round(num));
};

export default function GrossNetPage() {
  const [calcMode, setCalcMode] = useState<"gross-to-net" | "net-to-gross" | "compare">("gross-to-net");
  const [salaryInput, setSalaryInput] = useState<number>(15000000);
  const [selectedRegionId, setSelectedRegionId] = useState<number>(1);
  const [insuranceType, setInsuranceType] = useState<"full" | "none" | "custom">("full");
  const [customInsuranceSalary, setCustomInsuranceSalary] = useState<number>(5000000);
  const [dependents, setDependents] = useState<number>(0);

  const handleIncreaseDependents = () => setDependents((prev) => Math.min(20, prev + 1));
  const handleDecreaseDependents = () => setDependents((prev) => Math.max(0, prev - 1));

  const calculationResult = useMemo(() => {
    const rawSalary = Math.max(0, salaryInput || 0);
    const currentRegion = REGIONS.find((r) => r.id === selectedRegionId) || REGIONS[0];
    const maxBHTN = currentRegion.minSalary * 20;
    const totalDeduction = PERSONAL_DEDUCTION + dependents * DEPENDENT_DEDUCTION;

    if (calcMode === "gross-to-net" || calcMode === "compare") {
      const gross = rawSalary;
      let insBase = 0;
      if (insuranceType === "full") insBase = gross;
      else if (insuranceType === "custom") insBase = customInsuranceSalary;

      const insBaseBHXH_BHYT = Math.min(insBase, MAX_INSURANCE_BASE);
      const insBaseBHTN = Math.min(insBase, maxBHTN);

      const bhxh = insuranceType === "none" ? 0 : insBaseBHXH_BHYT * 0.08;
      const bhyt = insuranceType === "none" ? 0 : insBaseBHXH_BHYT * 0.015;
      const bhtn = insuranceType === "none" ? 0 : insBaseBHTN * 0.01;
      const totalInsurance = bhxh + bhyt + bhtn;

      const incomeBeforeTax = Math.max(0, gross - totalInsurance);
      const taxableIncome = Math.max(0, incomeBeforeTax - totalDeduction);

      let pitTax = 0;
      if (taxableIncome > 0) {
        let remaining = taxableIncome;
        let prevMax = 0;
        for (let i = 0; i < TAX_BRACKETS.length; i++) {
          const b = TAX_BRACKETS[i];
          const span = b.max === Infinity ? remaining : Math.min(remaining, b.max - prevMax);
          if (span > 0) {
            pitTax += span * b.rate;
            remaining -= span;
            prevMax = b.max;
          } else {
            break;
          }
        }
      }

      const totalDeductions = totalInsurance + pitTax;
      const net = Math.max(0, gross - totalDeductions);
      const decreasePercent = gross > 0 ? ((gross - net) / gross) * 100 : 0;

      return {
        gross,
        net,
        bhxh,
        bhyt,
        bhtn,
        totalInsurance,
        incomeBeforeTax,
        taxableIncome,
        pitTax,
        totalDeduction,
        totalDeductions,
        decreasePercent,
      };
    } else {
      const targetNet = rawSalary;
      let convertedIncome = targetNet - totalDeduction;
      let taxableIncome = 0;

      if (convertedIncome > 0) {
        if (convertedIncome <= 4750000) taxableIncome = convertedIncome / 0.95;
        else if (convertedIncome <= 9250000) taxableIncome = (convertedIncome - 250000) / 0.9;
        else if (convertedIncome <= 16050000) taxableIncome = (convertedIncome - 750000) / 0.85;
        else if (convertedIncome <= 27250000) taxableIncome = (convertedIncome - 1650000) / 0.8;
        else if (convertedIncome <= 42250000) taxableIncome = (convertedIncome - 3250000) / 0.75;
        else if (convertedIncome <= 61850000) taxableIncome = (convertedIncome - 5850000) / 0.7;
        else taxableIncome = (convertedIncome - 9850000) / 0.65;
      }

      const incomeBeforeTax = Math.max(targetNet, taxableIncome + totalDeduction);
      const pitTax = Math.max(0, incomeBeforeTax - targetNet);

      let gross = incomeBeforeTax;
      let bhxh = 0;
      let bhyt = 0;
      let bhtn = 0;
      let totalInsurance = 0;

      if (insuranceType === "full") {
        const rate = 0.08 + 0.015 + 0.01;
        gross = incomeBeforeTax / (1 - rate);
        if (gross > MAX_INSURANCE_BASE) {
          const fixedInsurance = MAX_INSURANCE_BASE * 0.095 + Math.min(gross, maxBHTN) * 0.01;
          gross = incomeBeforeTax + fixedInsurance;
        }
        const insBaseBHXH = Math.min(gross, MAX_INSURANCE_BASE);
        const insBaseBHTN = Math.min(gross, maxBHTN);
        bhxh = insBaseBHXH * 0.08;
        bhyt = insBaseBHXH * 0.015;
        bhtn = insBaseBHTN * 0.01;
        totalInsurance = bhxh + bhyt + bhtn;
      } else if (insuranceType === "custom") {
        const insBaseBHXH = Math.min(customInsuranceSalary, MAX_INSURANCE_BASE);
        const insBaseBHTN = Math.min(customInsuranceSalary, maxBHTN);
        bhxh = insBaseBHXH * 0.08;
        bhyt = insBaseBHXH * 0.015;
        bhtn = insBaseBHTN * 0.01;
        totalInsurance = bhxh + bhyt + bhtn;
        gross = incomeBeforeTax + totalInsurance;
      }

      const totalDeductions = totalInsurance + pitTax;
      const decreasePercent = gross > 0 ? ((gross - targetNet) / gross) * 100 : 0;

      return {
        gross,
        net: targetNet,
        bhxh,
        bhyt,
        bhtn,
        totalInsurance,
        incomeBeforeTax,
        taxableIncome,
        pitTax,
        totalDeduction,
        totalDeductions,
        decreasePercent,
      };
    }
  }, [salaryInput, selectedRegionId, insuranceType, customInsuranceSalary, dependents, calcMode]);

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
        <span className="text-[#0062ff] font-semibold">Tính lương Gross - Net</span>
      </nav>

      {/* ======================================================== */}
      {/* 2. HERO BANNER: THU GỌN CHIỀU CAO 110-120PX, GRADIENT XANH CAREZA */}
      {/* ======================================================== */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#4f9cf8] border border-blue-300/40 shadow-md shadow-blue-600/10 px-6 sm:px-8 py-3.5 sm:py-4 flex flex-col md:flex-row items-center justify-between gap-4 min-h-[110px] md:min-h-[116px]">
        {/* Subtle decorative background glow */}
        <div className="absolute -right-8 -bottom-10 w-52 h-52 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-32 h-32 rounded-full bg-sky-200/15 blur-xl pointer-events-none" />

        {/* Nội dung bên trái: Tiêu đề + Badge cùng 1 hàng */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 sm:gap-3.5">
          <h1 className="text-xl sm:text-2xl md:text-[25px] font-black text-white tracking-tight m-0 leading-tight drop-shadow-2xs">
            Tính lương Gross - Net
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#1d4ed8] text-xs font-bold shadow-xs shrink-0 border border-white/90">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2563eb]" />
            <span>Chuẩn Thuế TNCN & BHXH 2026</span>
          </span>
        </div>

        {/* Minh họa vector phẳng bên phải: 2 thẻ trắng thu gọn */}
        <div className="relative z-10 hidden md:flex items-center gap-3 shrink-0">
          {/* Card 1: Quy đổi chuẩn */}
          <div className="bg-white rounded-xl py-2 px-3.5 border border-white/90 shadow-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-[#0062ff] flex items-center justify-center shrink-0">
              <Calculator className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10.5px] font-bold text-slate-500 block leading-tight">
                Quy đổi hai chiều
              </span>
              <span className="text-xs sm:text-[13px] font-black text-[#0062ff] block leading-tight mt-0.5">
                Gross ↔ Net chính xác
              </span>
            </div>
          </div>

          {/* Card 2: Giảm trừ gia cảnh */}
          <div className="bg-white rounded-xl py-2 px-3.5 border border-white/90 shadow-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10.5px] font-bold text-slate-500 block leading-tight">
                Giảm trừ bản thân
              </span>
              <span className="text-xs sm:text-[13px] font-black text-slate-900 block leading-tight mt-0.5">
                11.000.000 VNĐ/tháng
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. CHỌN CHẾ ĐỘ QUY ĐỔI (3 TABS RÕ RÀNG, ACTIVE NỔI BẬT) */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center gap-2 !mt-5">
        <button
          type="button"
          onClick={() => setCalcMode("gross-to-net")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${calcMode === "gross-to-net"
            ? "bg-[#0062ff] text-white shadow-xs"
            : "bg-white text-slate-700 hover:text-[#0062ff] hover:bg-blue-50/60 border border-slate-200"
            }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Tính từ Gross (Lương tổng)</span>
        </button>

        <button
          type="button"
          onClick={() => setCalcMode("net-to-gross")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${calcMode === "net-to-gross"
            ? "bg-[#0062ff] text-white shadow-xs"
            : "bg-white text-slate-700 hover:text-[#0062ff] hover:bg-blue-50/60 border border-slate-200"
            }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Tính từ Net (Thực nhận)</span>
        </button>

        <button
          type="button"
          onClick={() => setCalcMode("compare")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${calcMode === "compare"
            ? "bg-[#0062ff] text-white shadow-xs"
            : "bg-white text-slate-700 hover:text-[#0062ff] hover:bg-blue-50/60 border border-slate-200"
            }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>So sánh chi tiết</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 4. MAIN LAYOUT: FORM (5 cols) | RESULT (4 cols) | SIDEBAR (3 cols) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start pt-0.5">
        {/* ==================== CỘT 1: NHẬP THÔNG TIN (5/12 cols) ==================== */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="pb-1.5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-black text-slate-900 m-0">
              1. Nhập thông tin lương
            </h2>
            <span className="text-xs text-slate-500 font-medium">Đơn vị: VNĐ</span>
          </div>

          <div className="space-y-3.5">
            {/* Lương Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                {calcMode === "net-to-gross" ? "Mức lương Net thực nhận mong muốn" : "Mức lương Gross hàng tháng"}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={formatCurrency(salaryInput)}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setSalaryInput(raw ? parseInt(raw, 10) : 0);
                  }}
                  className="w-full h-10 px-3.5 bg-white rounded-xl border border-slate-200 focus:border-[#0062ff] focus:outline-hidden text-xs sm:text-sm font-semibold text-slate-900 pr-14 transition-colors"
                />
                <span className="absolute right-3.5 text-xs font-bold text-slate-400 pointer-events-none">
                  VNĐ
                </span>
              </div>
            </div>

            {/* 2 Cột: Khu vực + Giảm trừ bản thân */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Khu vực làm việc <span className="text-rose-500">*</span>
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

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Giảm trừ bản thân</span>
                  <Tooltip title="Mức giảm trừ bản thân là 11.000.000đ/tháng theo Luật Thuế TNCN">
                    <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                  </Tooltip>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    readOnly
                    value="11.000.000"
                    className="w-full h-10 px-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 pr-14 cursor-not-allowed"
                  />
                  <span className="absolute right-3.5 text-xs font-bold text-slate-400 pointer-events-none">
                    VNĐ
                  </span>
                </div>
              </div>
            </div>

            {/* Người phụ thuộc */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Số người phụ thuộc (4.400.000đ/người/tháng)
              </label>
              <div className="flex items-center gap-3 w-40 bg-slate-50 border border-slate-200 rounded-xl p-1 justify-between">
                <button
                  type="button"
                  onClick={handleDecreaseDependents}
                  className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs sm:text-sm font-bold text-slate-900">{dependents} người</span>
                <button
                  type="button"
                  onClick={handleIncreaseDependents}
                  className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Hình thức đóng BH */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-700 block">
                Mức lương đóng bảo hiểm
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label
                  className={`flex items - center gap - 2 px - 3 py - 2 rounded - xl border text - xs font - semibold cursor - pointer transition - all ${insuranceType === "full"
                    ? "border-[#0062ff] bg-blue-50/60 text-[#0062ff]"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    } `}
                >
                  <input
                    type="radio"
                    name="insuranceType"
                    checked={insuranceType === "full"}
                    onChange={() => setInsuranceType("full")}
                    className="accent-[#0062ff]"
                  />
                  <span>Đóng đầy đủ</span>
                </label>

                <label
                  className={`flex items - center gap - 2 px - 3 py - 2 rounded - xl border text - xs font - semibold cursor - pointer transition - all ${insuranceType === "none"
                    ? "border-[#0062ff] bg-blue-50/60 text-[#0062ff]"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    } `}
                >
                  <input
                    type="radio"
                    name="insuranceType"
                    checked={insuranceType === "none"}
                    onChange={() => setInsuranceType("none")}
                    className="accent-[#0062ff]"
                  />
                  <span>Không đóng BH</span>
                </label>

                <label
                  className={`flex items - center gap - 2 px - 3 py - 2 rounded - xl border text - xs font - semibold cursor - pointer transition - all ${insuranceType === "custom"
                    ? "border-[#0062ff] bg-blue-50/60 text-[#0062ff]"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    } `}
                >
                  <input
                    type="radio"
                    name="insuranceType"
                    checked={insuranceType === "custom"}
                    onChange={() => setInsuranceType("custom")}
                    className="accent-[#0062ff]"
                  />
                  <span>Tùy chỉnh</span>
                </label>
              </div>

              {insuranceType === "custom" && (
                <div className="pt-1.5">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={formatCurrency(customInsuranceSalary)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        setCustomInsuranceSalary(raw ? parseInt(raw, 10) : 0);
                      }}
                      placeholder="Nhập mức lương đóng bảo hiểm..."
                      className="w-full h-10 px-3.5 bg-white rounded-xl border border-slate-200 focus:border-[#0062ff] text-xs font-semibold text-slate-900 pr-14"
                    />
                    <span className="absolute right-3.5 text-xs font-bold text-slate-400 pointer-events-none">
                      VNĐ
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Lưu ý nhỏ */}
            <div className="bg-blue-50/60 rounded-xl p-3.5 border border-blue-200/80 space-y-1.5">
              <h4 className="text-xs font-bold text-[#0062ff] m-0 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#0062ff] shrink-0" />
                <span>Quy định mức đóng tối đa 2026</span>
              </h4>
              <p className="text-[12px] text-slate-600 m-0 leading-relaxed font-normal">
                Mức lương đóng BHXH, BHYT tối đa là 20 lần mức lương cơ sở (46.800.000đ). Mức đóng BHTN tối đa là 20 lần mức lương tối thiểu vùng.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => message.success("Đã tính toán chi tiết thu nhập!")}
            className="w-full h-10.5 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer border-none"
          >
            <Calculator className="w-4 h-4" />
            <span>Quy đổi & Cập nhật kết quả</span>
          </button>
        </div>

        {/* ==================== CỘT 2: KẾT QUẢ ƯỚC TÍNH (4/12 cols) ==================== */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="pb-1.5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-black text-slate-900 m-0">
              2. Kết quả ước tính
            </h2>
            <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
              Đơn vị: VNĐ
            </span>
          </div>

          {/* Card Lương Net thực nhận */}
          <div className="bg-emerald-50/90 rounded-xl p-4 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                {calcMode === "net-to-gross" ? "Lương Net (Thực nhận)" : "Lương thực nhận (Net)"}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-200/60">
                {calcMode === "net-to-gross"
                  ? `Khấu trừ ~${calculationResult.decreasePercent.toFixed(1)}% `
                  : `Giảm ~${calculationResult.decreasePercent.toFixed(1)}% `}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight tabular-nums">
              {formatCurrency(calculationResult.net)} <span className="text-sm font-bold text-slate-500">VNĐ</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-emerald-200/60">
              <span>Lương Gross tương ứng:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {formatCurrency(calculationResult.gross)} VNĐ
              </span>
            </div>
          </div>

          {/* Chi tiết khấu trừ: Rõ ràng, thoáng, căn gióng đều */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h4 className="text-sm sm:text-[15px] font-bold text-slate-900 m-0">
                Chi tiết các khoản khấu trừ
              </h4>
              <span className="text-xs font-bold text-rose-600">
                - {formatCurrency(calculationResult.totalDeductions)} VNĐ
              </span>
            </div>

            <div className="space-y-2 text-[13px] sm:text-[13.5px]">
              <div className="flex items-center justify-between text-slate-600 py-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span>BHXH (8%)</span>
                </span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(calculationResult.bhxh)} VNĐ
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 py-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span>BHYT (1.5%)</span>
                </span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(calculationResult.bhyt)} VNĐ
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 py-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span>BHTN (1%)</span>
                </span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(calculationResult.bhtn)} VNĐ
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 py-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>Thuế TNCN</span>
                </span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(calculationResult.pitTax)} VNĐ
                </span>
              </div>
            </div>
          </div>

          {/* Giảm trừ gia cảnh info */}
          <div className="space-y-2.5 pt-2.5 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 m-0 pb-1 border-b border-slate-100">
              Mức giảm trừ áp dụng
            </h4>
            <div className="space-y-2 text-[13px]">
              <div className="flex items-center justify-between text-slate-600">
                <span>Tổng mức giảm trừ gia cảnh</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {formatCurrency(calculationResult.totalDeduction)} VNĐ
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Số người phụ thuộc</span>
                <span className="font-bold text-slate-900 tabular-nums">{dependents} người</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Thu nhập chịu thuế tính ra</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {formatCurrency(calculationResult.taxableIncome)} VNĐ
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== CỘT 3: RIGHT SIDEBAR (3/12 cols) ==================== */}
        <div className="lg:col-span-3 space-y-3.5">
          {/* Card 1: Hiểu thêm về Gross - Net */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
            <h3 className="text-sm sm:text-[15px] font-black text-slate-900 m-0 flex items-center gap-2 pb-1 border-b border-slate-100">
              <Info className="w-4 h-4 text-[#0062ff] shrink-0" />
              <span>Hiểu thêm về Gross - Net</span>
            </h3>
            <ul className="space-y-3 text-[13px] sm:text-[13.5px] text-slate-700 pl-0 list-none m-0 leading-[1.6] font-normal">
              <li className="flex items-start gap-2.5">
                <span className="text-[#0062ff] font-bold text-sm shrink-0 mt-0.5">✓</span>
                <span>
                  <strong>Lương Gross:</strong> Tổng thu nhập trước khi trừ các khoản bảo hiểm và thuế TNCN.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#0062ff] font-bold text-sm shrink-0 mt-0.5">✓</span>
                <span>
                  <strong>Lương Net:</strong> Số tiền thực tế người lao động nhận vào tài khoản hàng tháng.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#0062ff] font-bold text-sm shrink-0 mt-0.5">✓</span>
                <span>
                  <strong>Người phụ thuộc:</strong> Giúp giảm thêm 4.400.000đ/tháng trước khi tính thuế TNCN.
                </span>
              </li>
            </ul>
          </div>

          {/* Card 2: Công cụ liên quan */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 m-0 pb-1 border-b border-slate-100">
              Công cụ liên quan
            </h3>
            <div className="space-y-1.5">
              <Link
                href="/cong-cu/bao-hiem-that-nghiep"
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/70 border border-transparent hover:border-blue-200 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-[#0062ff] truncate">
                    Tính bảo hiểm thất nghiệp
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


        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. CÔNG THỨC QUY ĐỔI GROSS - NET                         */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
        <div className="pb-1 border-b border-slate-100">
          <h3 className="text-sm sm:text-base font-black text-slate-900 m-0">
            Công thức quy đổi lương Gross - Net
          </h3>
          <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
            Các khoản khấu trừ bắt buộc của người lao động trước khi nhận lương Net
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3 items-center pt-1">
          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/90 text-center space-y-1">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center mx-auto text-xs font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900 block">Lương Gross</span>
            <span className="text-[11px] text-slate-500 font-medium block">Thu nhập thỏa thuận</span>
          </div>

          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/90 text-center space-y-0.5">
            <span className="text-base font-black text-rose-500 block leading-tight">-</span>
            <span className="text-xs font-bold text-slate-900 block">BHXH (8%)</span>
            <span className="text-[11px] text-slate-500 font-medium block">Tối đa 3.744.000đ</span>
          </div>

          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/90 text-center space-y-0.5">
            <span className="text-base font-black text-rose-500 block leading-tight">-</span>
            <span className="text-xs font-bold text-slate-900 block">BHYT (1.5%)</span>
            <span className="text-[11px] text-slate-500 font-medium block">Tối đa 702.000đ</span>
          </div>

          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/90 text-center space-y-0.5">
            <span className="text-base font-black text-rose-500 block leading-tight">-</span>
            <span className="text-xs font-bold text-slate-900 block">BHTN (1%)</span>
            <span className="text-[11px] text-slate-500 font-medium block">Tối đa vùng (992.000đ)</span>
          </div>

          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/90 text-center space-y-0.5">
            <span className="text-base font-black text-amber-500 block leading-tight">-</span>
            <span className="text-xs font-bold text-slate-900 block">Thuế TNCN</span>
            <span className="text-[11px] text-slate-500 font-medium block">Biểu lũy tiến 7 bậc</span>
          </div>

          <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 text-center space-y-0.5">
            <span className="text-base font-black text-emerald-600 block leading-tight">=</span>
            <span className="text-xs font-bold text-emerald-900 block">Lương Net</span>
            <span className="text-[11px] text-emerald-700 font-medium block">Thực nhận vào tài khoản</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. CTA BANNER CUỐI TRANG: ĐỒNG HÀNH CÙNG CAREZA          */}
      {/* ======================================================== */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-50/70 via-white to-blue-50/50 border border-blue-200/90 shadow-2xs p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-[#0062ff] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 m-0 leading-tight">
              Minh bạch thu nhập · Nâng tầm giá trị bản thân
            </h3>
            <p className="text-xs text-slate-600 font-medium m-0 mt-0.5 leading-relaxed">
              Careza kết nối việc làm với mức đãi ngộ hấp dẫn và môi trường phát triển sự nghiệp bền vững.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/viec-lam"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all"
          >
            <span>Khám phá việc làm lương cao</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
