"use client";

import React, { useState } from "react";
import {
  Modal,
  Radio,
  Select,
  Input,
  Progress,
  Tag,
  Tooltip,
  App,
} from "antd";
import {
  Crown,
  Check,
  Star,
  Zap,
  ShieldCheck,
  CreditCard,
  Download,
  Calendar,
  FileText,
  Clock,
  ArrowRight,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  DollarSign,
  Layers,
  Search,
  Filter,
  Eye,
  AlertCircle,
  Percent,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

// =====================================================================
// DATA TYPES & INTERFACES
// =====================================================================

export type BillingCycle = "monthly" | "yearly";

export interface PricingPlan {
  id: string;
  name: string;
  subtitle: string;
  monthlyPrice: number;
  yearlyPrice: number;
  isContact?: boolean;
  isPopular?: boolean;
  isCurrent?: boolean;
  iconBg: string;
  iconColor: string;
  icon: React.ElementType;
  features: string[];
}

export interface InvoiceItem {
  id: string;
  code: string;
  date: string;
  amount: string;
  planName: string;
  cycle: string;
  status: "paid" | "pending" | "failed";
}

export interface TransactionItem {
  id: string;
  code: string;
  content: string;
  planName: string;
  date: string;
  method: string;
  amount: string;
  status: "success" | "pending" | "failed";
}

// =====================================================================
// INITIAL DATA
// =====================================================================

const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    subtitle: "Phù hợp với doanh nghiệp nhỏ",
    monthlyPrice: 1490000,
    yearlyPrice: 14300000,
    iconBg: "bg-emerald-50 text-emerald-600",
    iconColor: "text-emerald-600",
    icon: Zap,
    features: [
      "Đăng tối đa 10 tin tuyển dụng",
      "Lưu trữ 1.000 hồ sơ ứng viên",
      "Tìm kiếm hồ sơ cơ bản",
      "Chat với ứng viên",
      "Báo cáo cơ bản",
      "Hỗ trợ qua email",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    subtitle: "Dành cho doanh nghiệp đang phát triển",
    monthlyPrice: 3490000,
    yearlyPrice: 33500000,
    iconBg: "bg-blue-50 text-[#0062ff]",
    iconColor: "text-[#0062ff]",
    icon: Layers,
    features: [
      "Đăng tối đa 30 tin tuyển dụng",
      "Lưu trữ 5.000 hồ sơ ứng viên",
      "Tìm kiếm hồ sơ nâng cao",
      "Pipeline tuyển dụng",
      "Lịch phỏng vấn",
      "Báo cáo nâng cao",
      "Hỗ trợ ưu tiên",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    subtitle: "Tối ưu cho doanh nghiệp lớn",
    monthlyPrice: 6990000,
    yearlyPrice: 67100000,
    isPopular: true,
    isCurrent: true,
    iconBg: "bg-purple-50 text-purple-600",
    iconColor: "text-purple-600",
    icon: Star,
    features: [
      "Đăng tin không giới hạn",
      "Lưu trữ không giới hạn hồ sơ",
      "Tìm kiếm hồ sơ nâng cao",
      "Pipeline tuyển dụng",
      "Lịch phỏng vấn",
      "Báo cáo nâng cao",
      "Quản lý team & phân quyền",
      "Hỗ trợ 24/7",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    subtitle: "Giải pháp toàn diện cho tập đoàn",
    monthlyPrice: 0,
    yearlyPrice: 0,
    isContact: true,
    iconBg: "bg-amber-50 text-amber-600",
    iconColor: "text-amber-600",
    icon: Crown,
    features: [
      "Tất cả tính năng Premium",
      "Tích hợp API",
      "SSO & Bảo mật nâng cao",
      "Account Manager riêng",
      "Báo cáo tùy chỉnh",
      "Hỗ trợ 24/7",
    ],
  },
];

const COMPARISON_ROWS = [
  { feature: "Số lượng tin tuyển dụng", starter: "10 tin", pro: "30 tin", premium: "Không giới hạn", enterprise: "Không giới hạn" },
  { feature: "Lưu trữ hồ sơ ứng viên", starter: "1.000 hồ sơ", pro: "5.000 hồ sơ", premium: "Không giới hạn", enterprise: "Không giới hạn" },
  { feature: "Tìm kiếm hồ sơ", starter: "Cơ bản", pro: "Nâng cao", premium: "Nâng cao", enterprise: "Nâng cao + AI" },
  { feature: "Pipeline tuyển dụng", starter: "—", pro: "✓", premium: "✓", enterprise: "✓" },
  { feature: "Lịch phỏng vấn", starter: "—", pro: "✓", premium: "✓", enterprise: "✓" },
  { feature: "Báo cáo", starter: "Cơ bản", pro: "Nâng cao", premium: "Nâng cao", enterprise: "Tùy chỉnh" },
  { feature: "Quản lý thành viên", starter: "—", pro: "—", premium: "✓", enterprise: "✓" },
  { feature: "Hỗ trợ", starter: "Email", pro: "Ưu tiên", premium: "24/7", enterprise: "24/7 + AM riêng" },
];

const RECENT_INVOICES: InvoiceItem[] = [
  { id: "inv-1", code: "HD-2024-12-001", date: "12/12/2024", amount: "6.990.000đ", planName: "Premium", cycle: "Theo tháng", status: "paid" },
  { id: "inv-2", code: "HD-2024-11-001", date: "12/11/2024", amount: "6.990.000đ", planName: "Premium", cycle: "Theo tháng", status: "paid" },
  { id: "inv-3", code: "HD-2024-10-001", date: "12/10/2024", amount: "6.990.000đ", planName: "Premium", cycle: "Theo tháng", status: "paid" },
];

const ALL_TRANSACTIONS: TransactionItem[] = [
  { id: "tx-1", code: "GD-884921", content: "Gia hạn gói Premium (1 tháng)", planName: "Premium", date: "12/12/2024 09:30", method: "Thẻ VISA (..4242)", amount: "6.990.000đ", status: "success" },
  { id: "tx-2", code: "GD-771203", content: "Gia hạn gói Premium (1 tháng)", planName: "Premium", date: "12/11/2024 08:45", method: "Thẻ VISA (..4242)", amount: "6.990.000đ", status: "success" },
  { id: "tx-3", code: "GD-660142", content: "Nâng cấp gói Professional -> Premium", planName: "Premium", date: "12/10/2024 14:15", method: "Chuyển khoản VNPay", amount: "6.990.000đ", status: "success" },
  { id: "tx-4", code: "GD-554219", content: "Đăng ký gói Professional (1 tháng)", planName: "Professional", date: "12/09/2024 10:00", method: "Ví MoMo", amount: "3.490.000đ", status: "success" },
];

// =====================================================================
// MAIN COMPONENT
// =====================================================================

export default function EmployerBillingPage() {
  const { message } = App.useApp();
  const { user } = useAuthStore();

  const recruiterName = user?.fullName || "Mai Phương";

  // State
  const [activeTab, setActiveTab] = useState<"plans" | "billing" | "transactions" | "invoices" | "payment_methods">("plans");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  // Upgrade / Change Plan Modal
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<PricingPlan | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Selected Invoice Modal
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Add Payment Method Modal
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);

  // Format Currency
  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + "đ";
  };

  const handleSelectPlan = (plan: PricingPlan) => {
    if (plan.isCurrent) return;
    if (plan.isContact) {
      message.info("Đang kết nối tới chuyên viên tư vấn Enterprise...");
      return;
    }
    setSelectedPlanForUpgrade(plan);
    setIsUpgradeModalOpen(true);
  };

  return (
    <div className="space-y-4 w-full font-sans pb-16 bg-[#F7F9FC] -m-3 sm:-m-4 lg:-m-5 p-3 sm:p-4 lg:p-5">
      {/* ======================================================== */}
      {/* 1. TOP HEADER                                            */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-transparent">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 m-0 tracking-tight leading-tight">
            Gói dịch vụ &amp; Thanh toán
          </h1>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TOP NAVIGATION TABS (5 TABS)                          */}
      {/* ======================================================== */}
      <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-bold text-slate-500 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("plans")}
          className={`pb-2.5 transition-colors cursor-pointer shrink-0 relative ${
            activeTab === "plans" ? "text-[#0062ff] font-black" : "hover:text-slate-800"
          }`}
        >
          <span>Gói dịch vụ</span>
          {activeTab === "plans" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("billing")}
          className={`pb-2.5 transition-colors cursor-pointer shrink-0 relative ${
            activeTab === "billing" ? "text-[#0062ff] font-black" : "hover:text-slate-800"
          }`}
        >
          <span>Thanh toán</span>
          {activeTab === "billing" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("transactions")}
          className={`pb-2.5 transition-colors cursor-pointer shrink-0 relative ${
            activeTab === "transactions" ? "text-[#0062ff] font-black" : "hover:text-slate-800"
          }`}
        >
          <span>Lịch sử giao dịch</span>
          {activeTab === "transactions" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("invoices")}
          className={`pb-2.5 transition-colors cursor-pointer shrink-0 relative ${
            activeTab === "invoices" ? "text-[#0062ff] font-black" : "hover:text-slate-800"
          }`}
        >
          <span>Hóa đơn</span>
          {activeTab === "invoices" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("payment_methods")}
          className={`pb-2.5 transition-colors cursor-pointer shrink-0 relative ${
            activeTab === "payment_methods" ? "text-[#0062ff] font-black" : "hover:text-slate-800"
          }`}
        >
          <span>Phương thức thanh toán</span>
          {activeTab === "payment_methods" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0062ff] rounded-full" />
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* 3. TAB 1: GÓI DỊCH VỤ (MAIN VIEW)                        */}
      {/* ======================================================== */}
      {activeTab === "plans" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4.5 items-start">
          {/* ==================================================== */}
          {/* LEFT COLUMN: PRICING & COMPARISONS (75% / col-span-9)*/}
          {/* ==================================================== */}
          <div className="xl:col-span-8 2xl:col-span-9 space-y-4">
            {/* 3.1 Billing Cycle Selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">Thanh toán</span>
              <div className="inline-flex items-center bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs gap-1">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    billingCycle === "monthly"
                      ? "bg-blue-50 text-[#0062ff] border border-blue-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full border ${billingCycle === "monthly" ? "border-[#0062ff] bg-[#0062ff]" : "border-slate-300"}`} />
                  <span>Theo tháng</span>
                  <span className="px-1.5 py-0.2 rounded bg-blue-100/70 text-[#0062ff] text-[10px] font-bold">
                    Tiết kiệm 0%
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    billingCycle === "yearly"
                      ? "bg-blue-50 text-[#0062ff] border border-blue-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full border ${billingCycle === "yearly" ? "border-[#0062ff] bg-[#0062ff]" : "border-slate-300"}`} />
                  <span>Theo năm</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                    Tiết kiệm 20%
                  </span>
                </button>
              </div>
            </div>

            {/* 3.2 4 Pricing Cards (One Row) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-3.5 items-stretch">
              {PRICING_PLANS.map((plan) => {
                const IconComp = plan.icon;
                const isCurrent = plan.isCurrent;
                const isPopular = plan.isPopular;
                const displayPrice =
                  billingCycle === "monthly"
                    ? formatPrice(plan.monthlyPrice) + "/tháng"
                    : formatPrice(plan.yearlyPrice) + "/năm";

                return (
                  <div
                    key={plan.id}
                    className={`relative bg-white rounded-2xl p-4.5 border transition-all flex flex-col justify-between space-y-4 ${
                      isPopular
                        ? "border-2 border-[#0062ff] shadow-md ring-2 ring-blue-100"
                        : "border-slate-200/90 shadow-2xs hover:border-blue-300"
                    }`}
                  >
                    {/* Popular Badge */}
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#0062ff] text-white font-bold text-[10px] uppercase tracking-wider shadow-xs">
                        PHỔ BIẾN NHẤT
                      </div>
                    )}

                    {/* Top Content */}
                    <div className="space-y-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl ${plan.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                          <IconComp className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-[17px] font-black text-slate-900 m-0">
                            {plan.name}
                          </h3>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 font-medium m-0 leading-normal min-h-[38px] flex items-center">
                        {plan.subtitle}
                      </p>

                      <div className="py-1">
                        {plan.isContact ? (
                          <span className="text-lg sm:text-xl font-black text-slate-900 block">
                            Liên hệ
                          </span>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="text-lg sm:text-xl font-black text-slate-900 block leading-tight">
                              {displayPrice}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* CTA Button */}
                      <div>
                        {isCurrent ? (
                          <button
                            type="button"
                            disabled
                            className="w-full py-2.5 rounded-xl bg-[#0062ff] text-white font-bold text-xs sm:text-[13px] shadow-xs cursor-default flex items-center justify-center gap-1.5"
                          >
                            <span>Đang sử dụng</span>
                          </button>
                        ) : plan.isContact ? (
                          <button
                            type="button"
                            onClick={() => handleSelectPlan(plan)}
                            className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-[13px] border border-slate-200 shadow-2xs cursor-pointer transition-colors"
                          >
                            Liên hệ tư vấn
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSelectPlan(plan)}
                            className="w-full py-2.5 rounded-xl bg-white hover:bg-blue-50 text-[#0062ff] font-bold text-xs sm:text-[13px] border border-blue-200 shadow-2xs cursor-pointer transition-colors"
                          >
                            Chọn gói
                          </button>
                        )}
                      </div>

                      {/* Feature List */}
                      <div className="pt-2.5 border-t border-slate-100 space-y-2.5">
                        {plan.features.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-slate-700">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-xs font-medium leading-relaxed">
                              {feat}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3.3 Bottom Row: Feature Comparison (58%) & Upgrade Benefits (42%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch pt-1">
              {/* Feature Comparison Table (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 m-0 pb-1.5 border-b border-slate-100">
                    SO SÁNH TÍNH NĂNG
                  </h3>

                  <div className="overflow-x-auto pt-1">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-[11.5px] font-bold text-slate-500">
                          <th className="py-2.5">Tính năng</th>
                          <th className="py-2.5 text-center">Starter</th>
                          <th className="py-2.5 text-center">Professional</th>
                          <th className="py-2.5 text-center text-[#0062ff] font-black">Premium</th>
                          <th className="py-2.5 text-center">Enterprise</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {COMPARISON_ROWS.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 font-bold text-slate-900 text-xs">
                              {row.feature}
                            </td>
                            <td className="py-2.5 text-center text-slate-500 text-[11.5px] font-medium">
                              {row.starter}
                            </td>
                            <td className="py-2.5 text-center text-slate-700 font-semibold text-[11.5px]">
                              {row.pro === "✓" ? (
                                <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                              ) : (
                                row.pro
                              )}
                            </td>
                            <td className="py-2.5 text-center text-[#0062ff] font-black text-[11.5px] bg-blue-50/50">
                              {row.premium === "✓" ? (
                                <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                              ) : (
                                row.premium
                              )}
                            </td>
                            <td className="py-2.5 text-center text-slate-800 font-bold text-[11.5px]">
                              {row.enterprise === "✓" ? (
                                <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                              ) : (
                                row.enterprise
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Upgrade Benefits & CTA (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 m-0 pb-1.5 border-b border-slate-100">
                    LỢI ÍCH KHI NÂNG CẤP
                  </h3>

                  <div className="space-y-3 text-xs">
                    {/* Item 1 */}
                    <div className="flex items-center gap-3 p-3 bg-purple-50/70 rounded-xl border border-purple-100/80 min-h-[58px]">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-2xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-black text-slate-900 block text-xs">
                          Tiếp cận ứng viên chất lượng cao
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium block leading-snug mt-0.5">
                          Sử dụng công cụ tìm kiếm nâng cao để tiếp cận đúng ứng viên phù hợp.
                        </span>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="flex items-center gap-3 p-3 bg-orange-50/70 rounded-xl border border-orange-100/80 min-h-[58px]">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 shadow-2xs">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-black text-slate-900 block text-xs">
                          Tiết kiệm thời gian tuyển dụng
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium block leading-snug mt-0.5">
                          Tự động hóa quy trình và quản lý hiệu quả hơn.
                        </span>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div className="flex items-center gap-3 p-3 bg-blue-50/70 rounded-xl border border-blue-100/80 min-h-[58px]">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-black text-slate-900 block text-xs">
                          Báo cáo &amp; Phân tích chuyên sâu
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium block leading-snug mt-0.5">
                          Đưa ra quyết định tuyển dụng dựa trên dữ liệu chính xác.
                        </span>
                      </div>
                    </div>

                    {/* Item 4 */}
                    <div className="flex items-center gap-3 p-3 bg-emerald-50/70 rounded-xl border border-emerald-100/80 min-h-[58px]">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-black text-slate-900 block text-xs">
                          Hỗ trợ chuyên nghiệp 24/7
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium block leading-snug mt-0.5">
                          Đội ngũ hỗ trợ luôn sẵn sàng đồng hành cùng bạn.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom CTA Box */}
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl flex items-center justify-between gap-2 mt-2">
                  <div className="min-w-0">
                    <span className="font-black text-slate-900 text-xs block">
                      Cần tư vấn gói dịch vụ phù hợp?
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      Đội ngũ Careza sẽ giúp bạn chọn gói tối ưu nhất.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => message.info("Đang mở hộp thoại tư vấn doanh nghiệp...")}
                    className="px-3 py-1.5 bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-[11px] rounded-lg shadow-2xs shrink-0 cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <span>Liên hệ tư vấn</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* RIGHT SIDEBAR: CURRENT PLAN, USAGE, INVOICE (25%)    */}
          {/* ==================================================== */}
          <div className="xl:col-span-4 2xl:col-span-3 space-y-4 sticky top-4 max-h-[calc(100vh-80px)] overflow-y-auto pr-0.5">
            {/* ---------------- 1. GÓI DỊCH VỤ HIỆN TẠI ----------- */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                  GÓI DỊCH VỤ HIỆN TẠI
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Star className="w-3 h-3" />
                  </div>
                  <span className="text-sm font-black text-slate-900">Premium</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold text-[10px]">
                  Đang sử dụng
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-medium block">
                  Hiệu lực đến: 12/12/2026 (còn 245 ngày)
                </span>
                <span className="text-lg font-black text-slate-900 block leading-tight">
                  6.990.000đ<span className="text-xs text-slate-400 font-medium">/tháng</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => message.info("Mở trang quản lý tài khoản gói dịch vụ")}
                className="w-full py-2 bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer block text-center"
              >
                Quản lý gói dịch vụ
              </button>

              {/* Monthly Quota Progress */}
              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Sử dụng trong tháng <span className="text-slate-400 font-normal">(01/12 - 31/12)</span>
                </span>

                {/* Quota 1 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10.5px] font-bold">
                    <span className="text-slate-600">Tin tuyển dụng</span>
                    <span className="text-emerald-600">32 / Không giới hạn</span>
                  </div>
                  <Progress percent={100} strokeColor="#10b981" showInfo={false} size="small" />
                </div>

                {/* Quota 2 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10.5px] font-bold">
                    <span className="text-slate-600">Hồ sơ ứng viên</span>
                    <span className="text-blue-600">2.450 / Không giới hạn</span>
                  </div>
                  <Progress percent={65} strokeColor="#0062ff" showInfo={false} size="small" />
                </div>

                {/* Quota 3 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10.5px] font-bold">
                    <span className="text-slate-600">Tìm kiếm nâng cao</span>
                    <span className="text-purple-600">156 / Không giới hạn</span>
                  </div>
                  <Progress percent={40} strokeColor="#a855f7" showInfo={false} size="small" />
                </div>

                {/* Quota 4 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10.5px] font-bold">
                    <span className="text-slate-600">Dung lượng lưu trữ</span>
                    <span className="text-amber-600">12.4 GB / Không giới hạn</span>
                  </div>
                  <Progress percent={25} strokeColor="#f59e0b" showInfo={false} size="small" />
                </div>
              </div>
            </div>

            {/* ---------------- 2. HÓA ĐƠN GẦN NHẤT --------------- */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                  HÓA ĐƠN GẦN NHẤT
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab("invoices")}
                  className="text-[#0062ff] hover:underline font-bold text-[11px] cursor-pointer"
                >
                  Xem tất cả
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                {RECENT_INVOICES.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setIsInvoiceModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-100 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-[11px] block leading-tight">
                          {inv.code}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {inv.date}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-slate-900 text-xs block">
                        {inv.amount}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold block">
                        ● Đã thanh toán
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ---------------- 3. PHƯƠNG THỨC THANH TOÁN ---------- */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                  PHƯƠNG THỨC THANH TOÁN
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab("payment_methods")}
                  className="text-[#0062ff] hover:underline font-bold text-[11px] cursor-pointer"
                >
                  Thay đổi
                </button>
              </div>

              {/* Saved Card View */}
              <div className="p-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm tracking-wider text-blue-400">VISA</span>
                  <span className="px-1.5 py-0.2 rounded bg-white/20 text-white text-[9px] font-bold">
                    Mặc định
                  </span>
                </div>

                <span className="font-mono tracking-widest text-xs block text-slate-300">
                  •••• •••• •••• 4242
                </span>

                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Hết hạn: 12/2026</span>
                  <span>Google Vietnam</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddPaymentModalOpen(true)}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-dashed border-slate-300 transition-colors cursor-pointer flex items-center justify-center gap-1 mt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm phương thức thanh toán mới</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. TAB 2: THANH TOÁN (OVERVIEW)                          */}
      {/* ======================================================== */}
      {activeTab === "billing" && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 m-0">
              Tổng quan thanh toán &amp; Hóa đơn
            </h3>
            <span className="text-xs text-slate-400">Kỳ thanh toán: Tháng 12/2024</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-center">
              <span className="text-[11px] font-bold text-slate-500">Tổng chi phí tháng này</span>
              <span className="text-xl font-black text-slate-900 block">6.990.000đ</span>
              <span className="text-[10px] text-emerald-600 font-bold">Đã thanh toán đủ</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-center">
              <span className="text-[11px] font-bold text-slate-500">Kỳ thanh toán tiếp theo</span>
              <span className="text-xl font-black text-[#0062ff] block">12/01/2025</span>
              <span className="text-[10px] text-slate-400">Tự động gia hạn</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-center">
              <span className="text-[11px] font-bold text-slate-500">Phương thức mặc định</span>
              <span className="text-xl font-black text-slate-900 block">VISA ..4242</span>
              <span className="text-[10px] text-emerald-600 font-bold">Đang hoạt động</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-center">
              <span className="text-[11px] font-bold text-slate-500">Số hóa đơn đã lưu</span>
              <span className="text-xl font-black text-purple-600 block">12 hóa đơn</span>
              <span className="text-[10px] text-slate-400">Xem trong mục Hóa đơn</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. TAB 3: LỊCH SỬ GIAO DỊCH                              */}
      {/* ======================================================== */}
      {activeTab === "transactions" && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 m-0">
              Lịch sử giao dịch tuyển dụng
            </h3>
            <button
              type="button"
              onClick={() => message.info("Đang xuất lịch sử giao dịch...")}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất Excel</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10.5px] font-bold text-slate-400 uppercase">
                  <th className="py-2.5">MÃ GIAO DỊCH</th>
                  <th className="py-2.5">NỘI DUNG</th>
                  <th className="py-2.5">GÓI</th>
                  <th className="py-2.5">THỜI GIAN</th>
                  <th className="py-2.5">PHƯƠNG THỨC</th>
                  <th className="py-2.5 text-right">SỐ TIỀN</th>
                  <th className="py-2.5 text-right">TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {ALL_TRANSACTIONS.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="py-3 font-mono font-bold text-[#0062ff]">{tx.code}</td>
                    <td className="py-3 font-bold text-slate-900">{tx.content}</td>
                    <td className="py-3">
                      <Tag color="purple">{tx.planName}</Tag>
                    </td>
                    <td className="py-3 text-slate-500">{tx.date}</td>
                    <td className="py-3 text-slate-600">{tx.method}</td>
                    <td className="py-3 text-right font-black text-slate-900">{tx.amount}</td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                        Thành công
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. TAB 4: HÓA ĐƠN                                        */}
      {/* ======================================================== */}
      {activeTab === "invoices" && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900 m-0">
                Quản lý hóa đơn dịch vụ
              </h3>
              <p className="text-xs text-slate-400 m-0 mt-0.5">
                Quản lý và tải xuống hóa đơn điện tử cho doanh nghiệp.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10.5px] font-bold text-slate-400 uppercase">
                  <th className="py-2.5">MÃ HÓA ĐƠN</th>
                  <th className="py-2.5">KỲ THANH TOÁN</th>
                  <th className="py-2.5">NGÀY PHÁT HÀNH</th>
                  <th className="py-2.5">GÓI DỊCH VỤ</th>
                  <th className="py-2.5 text-right">TỔNG TIỀN</th>
                  <th className="py-2.5 text-right">TRẠNG THÁI</th>
                  <th className="py-2.5 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {RECENT_INVOICES.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="py-3 font-mono font-bold text-[#0062ff]">{inv.code}</td>
                    <td className="py-3 font-bold text-slate-800">{inv.cycle}</td>
                    <td className="py-3 text-slate-500">{inv.date}</td>
                    <td className="py-3">
                      <Tag color="purple">{inv.planName}</Tag>
                    </td>
                    <td className="py-3 text-right font-black text-slate-900">{inv.amount}</td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                        Đã thanh toán
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setIsInvoiceModalOpen(true);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                        >
                          Xem
                        </button>
                        <button
                          type="button"
                          onClick={() => message.success(`Đang tải hóa đơn ${inv.code} định dạng PDF...`)}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-[#0062ff] font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                        >
                          Tải PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. TAB 5: PHƯƠNG THỨC THANH TOÁN                         */}
      {/* ======================================================== */}
      {activeTab === "payment_methods" && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 m-0">
              Phương thức thanh toán đã liên kết
            </h3>
            <button
              type="button"
              onClick={() => setIsAddPaymentModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm phương thức</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* Card 1: Default Visa */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-sm space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="font-black text-base text-blue-400">VISA</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  Mặc định
                </span>
              </div>
              <span className="font-mono text-sm tracking-widest block text-slate-200">
                •••• •••• •••• 4242
              </span>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Hết hạn: 12/2026</span>
                <span>Google Vietnam</span>
              </div>
            </div>

            {/* Card 2: MoMo Wallet */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-pink-600">Ví MoMo</span>
                <button
                  type="button"
                  onClick={() => message.success("Đã đổi MoMo thành phương thức thanh toán mặc định")}
                  className="text-[#0062ff] hover:underline font-bold text-xs cursor-pointer"
                >
                  Đặt mặc định
                </button>
              </div>
              <span className="font-bold text-slate-800 text-xs block">
                090****888
              </span>
              <span className="text-[10px] text-slate-400 block">Đã liên kết</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. MODAL: NÂNG CẤP / THAY ĐỔI GÓI                        */}
      {/* ======================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Sparkles className="w-5 h-5 text-[#0062ff]" />
            <span>Xác nhận thay đổi gói dịch vụ</span>
          </div>
        }
        open={isUpgradeModalOpen}
        onCancel={() => setIsUpgradeModalOpen(false)}
        footer={null}
        width={480}
        centered
      >
        {selectedPlanForUpgrade && (
          <div className="space-y-4 pt-2 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="space-y-0.5">
                <span className="text-slate-400 text-[11px] block">Gói hiện tại</span>
                <span className="font-black text-slate-900 text-xs">Premium</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <div className="space-y-0.5 text-right">
                <span className="text-slate-400 text-[11px] block">Gói mới</span>
                <span className="font-black text-[#0062ff] text-xs">
                  {selectedPlanForUpgrade.name}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Chu kỳ thanh toán:</span>
                <span className="font-bold text-slate-900">
                  {billingCycle === "monthly" ? "Theo tháng (1 tháng)" : "Theo năm (12 tháng)"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Tạm tính:</span>
                <span className="font-bold text-slate-900">
                  {billingCycle === "monthly"
                    ? formatPrice(selectedPlanForUpgrade.monthlyPrice)
                    : formatPrice(selectedPlanForUpgrade.yearlyPrice)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Thuế VAT (10%):</span>
                <span className="font-bold text-slate-900">
                  {billingCycle === "monthly"
                    ? formatPrice(Math.round(selectedPlanForUpgrade.monthlyPrice * 0.1))
                    : formatPrice(Math.round(selectedPlanForUpgrade.yearlyPrice * 0.1))}
                </span>
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-black text-slate-900">
                <span>Tổng thanh toán:</span>
                <span className="text-[#0062ff]">
                  {billingCycle === "monthly"
                    ? formatPrice(Math.round(selectedPlanForUpgrade.monthlyPrice * 1.1))
                    : formatPrice(Math.round(selectedPlanForUpgrade.yearlyPrice * 1.1))}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsUpgradeModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsUpgradeModalOpen(false);
                  message.success(`Đã đăng ký chuyển sang gói ${selectedPlanForUpgrade.name} thành công!`);
                }}
                className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold shadow-sm cursor-pointer"
              >
                Tiếp tục thanh toán
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* 9. MODAL: XEM HÓA ĐƠN CHI TIẾT                           */}
      {/* ======================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <FileText className="w-5 h-5 text-[#0062ff]" />
            <span>Chi tiết hóa đơn điện tử</span>
          </div>
        }
        open={isInvoiceModalOpen}
        onCancel={() => setIsInvoiceModalOpen(false)}
        footer={null}
        width={480}
        centered
      >
        {selectedInvoice && (
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Mã hóa đơn:</span>
                <span className="font-mono font-bold text-[#0062ff]">{selectedInvoice.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ngày phát hành:</span>
                <span className="font-bold text-slate-800">{selectedInvoice.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Doanh nghiệp:</span>
                <span className="font-bold text-slate-800">Google Vietnam</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Dịch vụ:</span>
                <span className="font-bold text-slate-900">Gói tuyển dụng {selectedInvoice.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Chu kỳ:</span>
                <span className="font-bold text-slate-900">{selectedInvoice.cycle}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-black text-slate-900">
                <span>Tổng tiền:</span>
                <span className="text-emerald-600">{selectedInvoice.amount}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => message.success(`Đang tải hóa đơn ${selectedInvoice.code}...`)}
                className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải hóa đơn (PDF)</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* 10. MODAL: THÊM PHƯƠNG THỨC THANH TOÁN                   */}
      {/* ======================================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <CreditCard className="w-5 h-5 text-[#0062ff]" />
            <span>Thêm phương thức thanh toán</span>
          </div>
        }
        open={isAddPaymentModalOpen}
        onCancel={() => setIsAddPaymentModalOpen(false)}
        footer={null}
        width={440}
        centered
      >
        <div className="space-y-3.5 pt-2 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Loại phương thức</label>
            <Select
              defaultValue="visa"
              className="w-full text-xs"
              options={[
                { value: "visa", label: "Thẻ Quốc tế (VISA / MasterCard / JCB)" },
                { value: "vnpay", label: "Cổng thanh toán VNPay QR" },
                { value: "momo", label: "Ví điện tử MoMo" },
                { value: "bank", label: "Chuyển khoản ngân hàng" },
              ]}
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Tên chủ thẻ / Tài khoản</label>
            <Input placeholder="VD: NGUYEN VAN A" />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Số thẻ / Số ví</label>
            <Input placeholder="•••• •••• •••• ••••" />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddPaymentModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddPaymentModalOpen(false);
                message.success("Đã liên kết phương thức thanh toán mới thành công!");
              }}
              className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-bold shadow-sm cursor-pointer"
            >
              Lưu liên kết
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
