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
    <div className="w-full max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 xl:px-[38px] pb-12 pt-2 bg-[#f7faff] min-h-screen space-y-4">
      {/* 1. HERO COMPACT */}
      <div className="relative w-full rounded-2xl overflow-hidden min-h-[135px] sm:min-h-[145px] lg:min-h-[150px] bg-gradient-to-r from-[#eaf2ff] via-[#f0f6ff] to-[#e4efff] border border-blue-100/90 shadow-2xs p-4 sm:p-5 lg:p-6 flex flex-col justify-between">
        <div className="absolute top-0 right-0 h-full w-[46%] md:w-[42%] pointer-events-none select-none overflow-hidden hidden sm:block">
          <div className="relative w-full h-full flex items-center justify-end pr-8">
            <div className="absolute top-3.5 left-2 z-10 text-left -rotate-6 pointer-events-none">
              <span className="font-serif italic text-sm sm:text-base font-bold text-[#0062ff] block leading-tight drop-shadow-2xs">
                Hiểu rõ thu nhập
              </span>
              <span className="font-serif italic text-sm sm:text-base font-bold text-[#0062ff] block leading-tight drop-shadow-2xs">
                Chủ động tương lai
              </span>
            </div>
            <div className="flex items-center gap-2.5 relative z-0 pr-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 border-2 border-yellow-200 shadow-md flex items-center justify-center text-amber-950 font-black text-xs -rotate-12 translate-y-3">
                ₫
              </div>
              <div className="w-20 h-24 bg-gradient-to-br from-[#0062ff] via-[#0052db] to-[#003da6] rounded-2xl shadow-lg border-2 border-blue-300/40 p-2 flex flex-col justify-between text-white rotate-6 relative overflow-hidden">
                <div className="w-full h-5 bg-blue-100/90 rounded-md shadow-inner flex items-center justify-end px-1.5">
                  <span className="text-[9px] font-mono font-bold text-slate-800">12,055,000</span>
                </div>
                <div className="grid grid-cols-3 gap-1 pt-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <div key={n} className="h-3 rounded-xs bg-white/30 flex items-center justify-center text-[7px] font-bold">
                      {n}
                    </div>
                  ))}
                </div>
                <div className="w-full h-3 rounded-xs bg-emerald-400/90 flex items-center justify-center text-[7px] font-bold text-emerald-950">
                  =
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 border-2 border-yellow-200 shadow-md flex items-center justify-center text-amber-950 font-black text-xs rotate-12 -translate-y-2">
                ₫
              </div>
              <div className="w-14 h-20 bg-white rounded-xl border border-blue-200 shadow-md p-1.5 flex flex-col justify-between text-center -rotate-6">
                <span className="text-[9px] font-black text-[#0062ff] uppercase block">Gross</span>
                <span className="text-[9px] font-black text-emerald-600 uppercase block">Net</span>
                <div className="w-full h-0.5 bg-blue-100 my-0.5" />
                <span className="text-[8px] font-bold text-slate-500 block leading-tight">Bright Career</span>
              </div>
            </div>
          </div>
        </div>

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
            <span className="text-[#0062ff] font-semibold">Tính lương Gross - Net</span>
          </div>
          <div className="flex items-center gap-3 pt-0.5">
            <div className="w-10 h-10 rounded-xl bg-[#0062ff] text-white flex items-center justify-center shadow-xs shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0 leading-tight">
                  Tính lương Gross - Net
                </h1>
                <span className="bg-blue-100/70 text-[#0062ff] text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200/80 hidden sm:inline-block">
                  Công cụ hữu ích cho mọi người đi làm
                </span>
              </div>
              <p className="text-xs text-slate-600 font-normal m-0 mt-0.5 leading-relaxed">
                Tính nhanh thu nhập thực nhận, hiểu rõ các khoản khấu trừ và chi phí doanh nghiệp.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MODE SWITCHER */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => setCalcMode("gross-to-net")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            calcMode === "gross-to-net"
              ? "bg-[#0062ff] text-white shadow-xs"
              : "bg-white text-slate-700 hover:text-[#0062ff] hover:bg-blue-50/50 border border-slate-200"
          }`}
        >
          Tính từ Gross (Biết lương gross)
        </button>
        <button
          type="button"
          onClick={() => setCalcMode("net-to-gross")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            calcMode === "net-to-gross"
              ? "bg-[#0062ff] text-white shadow-xs"
              : "bg-white text-slate-700 hover:text-[#0062ff] hover:bg-blue-50/50 border border-slate-200"
          }`}
        >
          Tính từ Net (Biết lương thực nhận)
        </button>
        <button
          type="button"
          onClick={() => setCalcMode("compare")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            calcMode === "compare"
              ? "bg-[#0062ff] text-white shadow-xs"
              : "bg-white text-slate-700 hover:text-[#0062ff] hover:bg-blue-50/50 border border-slate-200"
          }`}
        >
          So sánh nhanh
        </button>
      </div>

      {/* 3. MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4.5 pt-1 items-start">
        {/* Form 5 cols */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#E5ECF6] shadow-2xs space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-slate-800 m-0">
            Nhập thông tin
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-semibold text-slate-700 block">
                {calcMode === "net-to-gross" ? "Mức lương Net thực nhận" : "Mức lương Gross hàng tháng"}{" "}
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
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 focus:border-[#0062ff] focus:outline-hidden text-xs font-semibold text-slate-800 pr-14"
                />
                <span className="absolute right-3 text-xs font-bold text-slate-400 pointer-events-none">
                  VNĐ
                </span>
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Khu vực làm việc
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
            </div>

            <div className="space-y-2 sm:col-span-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Hình thức đóng bảo hiểm
              </label>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="radio"
                    name="insuranceType"
                    checked={insuranceType === "full"}
                    onChange={() => setInsuranceType("full")}
                    className="text-[#0062ff]"
                  />
                  <span>
                    <strong>Đóng đầy đủ</strong> (BHXH, BHYT, BHTN)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="radio"
                    name="insuranceType"
                    checked={insuranceType === "none"}
                    onChange={() => setInsuranceType("none")}
                    className="text-[#0062ff]"
                  />
                  <span>Không đóng BHXH</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="radio"
                    name="insuranceType"
                    checked={insuranceType === "custom"}
                    onChange={() => setInsuranceType("custom")}
                    className="text-[#0062ff]"
                  />
                  <span>Tùy chỉnh</span>
                </label>
              </div>
              {insuranceType === "custom" && (
                <div className="pt-1">
                  <input
                    type="text"
                    value={formatCurrency(customInsuranceSalary)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      setCustomInsuranceSalary(raw ? parseInt(raw, 10) : 0);
                    }}
                    placeholder="Lương đóng bảo hiểm..."
                    className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <span>Giảm trừ gia cảnh</span>
                <Tooltip title="Mức giảm trừ bản thân là 11.000.000đ/tháng theo Luật Thuế TNCN">
                  <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                </Tooltip>
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  readOnly
                  value="11.000.000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 pr-14 cursor-not-allowed"
                />
                <span className="absolute right-3 text-xs font-bold text-slate-400 pointer-events-none">
                  VNĐ
                </span>
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Số người phụ thuộc (4.400.000đ/người)
              </label>
              <div className="flex items-center gap-3 w-36 bg-slate-50 border border-slate-200 rounded-xl p-1 justify-between">
                <button
                  type="button"
                  onClick={handleDecreaseDependents}
                  className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-slate-800">{dependents}</span>
                <button
                  type="button"
                  onClick={handleIncreaseDependents}
                  className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => message.success("Đã cập nhật kết quả tính toán!")}
              className="w-full py-3 rounded-xl bg-[#0062ff] hover:bg-[#0047ba] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>Tính ngay</span>
            </button>
          </div>
        </div>

        {/* Result 4 cols */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-[#E5ECF6] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-800 m-0">
              Kết quả ước tính
            </h2>
            <span className="text-[10px] text-slate-400 font-medium">
              Đơn vị: VNĐ/tháng
            </span>
          </div>

          <div className="bg-[#f0fdf4] rounded-2xl p-4 border border-[#bbf7d0] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 block">
                Lương thực nhận (Net)
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                Giảm ~{calculationResult.decreasePercent.toFixed(1)}%
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
              {formatCurrency(calculationResult.net)}
            </div>
            <span className="text-[10px] text-emerald-700 font-medium block">
              so với lương Gross
            </span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
              <span className="font-semibold text-slate-700">Lương Gross</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(calculationResult.gross)}
              </span>
            </div>

            <div className="space-y-2 pt-0.5">
              <div className="flex items-center justify-between text-xs font-bold text-rose-600 bg-rose-50/70 px-2.5 py-1 rounded-lg">
                <span>Các khoản khấu trừ ({formatCurrency(calculationResult.totalDeductions)})</span>
              </div>
              <div className="space-y-1.5 pl-1 pr-1 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-rose-500 font-bold">🛡</span>
                    <span>BHXH (8%)</span>
                  </span>
                  <span className="font-medium text-slate-800">
                    {formatCurrency(calculationResult.bhxh)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-rose-500 font-bold">🛡</span>
                    <span>BHYT (1.5%)</span>
                  </span>
                  <span className="font-medium text-slate-800">
                    {formatCurrency(calculationResult.bhyt)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-rose-500 font-bold">🛡</span>
                    <span>BHTN (1%)</span>
                  </span>
                  <span className="font-medium text-slate-800">
                    {formatCurrency(calculationResult.bhtn)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 pt-0.5">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-rose-500 font-bold">🛡</span>
                    <span>Thuế TNCN</span>
                  </span>
                  <span className="font-medium text-slate-800">
                    {formatCurrency(calculationResult.pitTax)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-blue-500 font-bold">👤</span>
                  <span>Giảm trừ gia cảnh</span>
                </span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(calculationResult.totalDeduction)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-blue-500 font-bold">👥</span>
                  <span>Số người phụ thuộc</span>
                </span>
                <span className="font-semibold text-slate-800">{dependents}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar 3 cols */}
        <div className="lg:col-span-3 space-y-3.5">
          <div className="bg-[#fffdf5] rounded-2xl p-4 border border-[#fde68a] shadow-2xs space-y-2.5">
            <h3 className="text-xs font-bold text-slate-800 m-0 flex items-center gap-1.5">
              <span>💡</span>
              <span>Hiểu thêm về Gross - Net</span>
            </h3>
            <ul className="space-y-2 text-[11px] text-slate-700 pl-0 list-none m-0 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">✓</span>
                <span>
                  <strong>Lương Gross</strong> là tổng thu nhập trước khi khấu trừ các khoản bảo hiểm và thuế TNCN.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">✓</span>
                <span>
                  <strong>Lương Net</strong> là số tiền bạn thực nhận hàng tháng.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Các tỷ lệ bảo hiểm và thuế được tính theo quy định hiện hành.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#E5ECF6] shadow-2xs space-y-2.5">
            <h3 className="text-xs font-bold text-slate-800 m-0">
              Công cụ liên quan
            </h3>
            <div className="space-y-1.5">
              <Link
                href="/cong-cu/bao-hiem-that-nghiep"
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50/60 border border-transparent hover:border-emerald-200 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11.5px] font-semibold text-slate-700 group-hover:text-emerald-700 truncate">
                    Tính bảo hiểm thất nghiệp
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
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

      {/* 4. CÔNG THỨC TÍNH NHANH */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5ECF6] shadow-2xs space-y-3">
        <h3 className="text-xs sm:text-sm font-bold text-slate-800 m-0">
          Công thức tính nhanh
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 items-center">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center space-y-1">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center mx-auto text-xs font-bold">
              <Calculator className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-800 block">Lương Gross</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center space-y-0.5">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center mx-auto text-xs font-bold">
              -
            </div>
            <span className="text-xs font-bold text-slate-800 block">BHXH</span>
            <span className="text-[10px] text-slate-500 font-normal block">8% lương Gross</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center space-y-0.5">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center mx-auto text-xs font-bold">
              -
            </div>
            <span className="text-xs font-bold text-slate-800 block">BHYT</span>
            <span className="text-[10px] text-slate-500 font-normal block">1.5% lương Gross</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center space-y-0.5">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center mx-auto text-xs font-bold">
              -
            </div>
            <span className="text-xs font-bold text-slate-800 block">BHTN</span>
            <span className="text-[10px] text-slate-500 font-normal block">1% lương Gross</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center space-y-0.5">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center mx-auto text-xs font-bold">
              -
            </div>
            <span className="text-xs font-bold text-slate-800 block">Thuế TNCN</span>
            <span className="text-[10px] text-slate-500 font-normal block">Theo biểu thuế lũy tiến</span>
          </div>
          <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-center space-y-0.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-xs font-bold">
              =
            </div>
            <span className="text-xs font-bold text-emerald-800 block">Lương Net</span>
            <span className="text-[10px] text-emerald-600 font-normal block">Thực nhận hàng tháng</span>
          </div>
        </div>
      </div>
    </div>
  );
}
