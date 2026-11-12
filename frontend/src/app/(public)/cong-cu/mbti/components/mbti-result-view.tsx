'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Progress, Button } from 'antd';
import {
  ExperimentOutlined,
  RotateLeftOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
  ArrowRightOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  AimOutlined,
  CompassOutlined
} from '@ant-design/icons';
import { MbtiScoreResult } from '../data/mbti-data';

interface MbtiResultViewProps {
  result: MbtiScoreResult;
  onRetake: () => void;
  onSwitchAssessment: () => void;
}

export function MbtiResultView({ result, onRetake, onSwitchAssessment }: MbtiResultViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'strengths' | 'growth' | 'work'>('overview');
  const profile = result.profile;

  return (
    <div className="space-y-6">
      {/* Header Kết Quả Lớn */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#4f9cf8] p-6 md:p-8 text-white shadow-md">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold tracking-wide uppercase border border-white/30">
                  <CompassOutlined /> Kết quả trắc nghiệm MBTI Careza
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  Nhóm tính cách của bạn: <span className="text-amber-300 underline decoration-amber-400">{profile.code}</span> – {profile.name}
                </h1>
                  <p className="text-blue-50 text-sm md:text-base leading-relaxed">
                    {profile.tagline}. Tìm hiểu chi tiết 4 trục tâm lý và khám phá nhóm nghề nghiệp phát huy tối đa tiềm năng cá nhân.
                  </p>
              </div>

              <div className="flex flex-row md:flex-col gap-2.5 shrink-0">
                <Button
                  type="primary"
                  size="large"
                  icon={<RotateLeftOutlined />}
                  onClick={onRetake}
                  className="!bg-white !text-[#2563eb] hover:!bg-blue-50 !font-bold !border-none !rounded-xl !h-11 shadow-sm"
                >
                  Làm lại bài
                </Button>
                <Button
                  size="large"
                  icon={<AppstoreOutlined />}
                  onClick={onSwitchAssessment}
                  className="!bg-white/15 !text-white hover:!bg-white/25 !font-medium !border-white/30 !rounded-xl !h-11 backdrop-blur-xs"
                >
                  Đổi bài trắc nghiệm
                </Button>
              </div>
            </div>

            {/* 4 Trục Phổ Điểm Nhanh */}
            <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-center">
                <div className="text-[11px] text-blue-200 font-semibold">Trục Năng Lượng</div>
                <div className="text-lg font-extrabold text-white">
                  {result.percentI >= 50 ? `I: ${result.percentI}%` : `E: ${result.percentE}%`}
                </div>
                <div className="text-[10px] text-blue-100">{result.percentI >= 50 ? 'Hướng nội' : 'Hướng ngoại'}</div>
              </div>

              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-center">
                <div className="text-[11px] text-blue-200 font-semibold">Trục Nhận Thức</div>
                <div className="text-lg font-extrabold text-white">
                  {result.percentN >= 50 ? `N: ${result.percentN}%` : `S: ${result.percentS}%`}
                </div>
                <div className="text-[10px] text-blue-100">{result.percentN >= 50 ? 'Trực giác' : 'Cảm nhận'}</div>
              </div>

              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-center">
                <div className="text-[11px] text-blue-200 font-semibold">Trục Quyết Định</div>
                <div className="text-lg font-extrabold text-white">
                  {result.percentT >= 50 ? `T: ${result.percentT}%` : `F: ${result.percentF}%`}
                </div>
                <div className="text-[10px] text-blue-100">{result.percentT >= 50 ? 'Lý trí' : 'Cảm xúc'}</div>
              </div>

              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-center">
                <div className="text-[11px] text-blue-200 font-semibold">Trục Lối Sống</div>
                <div className="text-lg font-extrabold text-white">
                  {result.percentJ >= 50 ? `J: ${result.percentJ}%` : `P: ${result.percentP}%`}
                </div>
                <div className="text-[10px] text-blue-100">{result.percentJ >= 50 ? 'Nguyên tắc' : 'Linh hoạt'}</div>
              </div>
            </div>
          </div>

          {/* 4 Trục Tính Cách Chi Tiết (Dimension Scores) */}
          <div className="space-y-4 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
            <h3 className="text-sm font-black text-slate-800 m-0 uppercase tracking-wide flex items-center gap-2">
              <AimOutlined className="text-[#2563eb]" />
              Tỷ lệ 4 trục tính cách tâm lý:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Trục E - I */}
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between font-bold text-xs">
                  <span className={result.percentI >= 50 ? "text-[#2563eb]" : "text-slate-500"}>
                    Hướng nội (I): {result.percentI}%
                  </span>
                  <span className={result.percentE > 50 ? "text-[#2563eb]" : "text-slate-500"}>
                    Hướng ngoại (E): {result.percentE}%
                  </span>
                </div>
                <Progress
                  percent={result.percentI}
                  showInfo={false}
                  strokeColor="#2563eb"
                  trailColor="#dbeafe"
                  size={['100%', 8]}
                />
              </div>

              {/* Trục S - N */}
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between font-bold text-xs">
                  <span className={result.percentN >= 50 ? "text-purple-600" : "text-slate-500"}>
                    Trực giác (N): {result.percentN}%
                  </span>
                  <span className={result.percentS > 50 ? "text-purple-600" : "text-slate-500"}>
                    Cảm nhận (S): {result.percentS}%
                  </span>
                </div>
                <Progress
                  percent={result.percentN}
                  showInfo={false}
                  strokeColor="#9333ea"
                  trailColor="#f3e8ff"
                  size={['100%', 8]}
                />
              </div>

              {/* Trục T - F */}
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between font-bold text-xs">
                  <span className={result.percentT >= 50 ? "text-sky-600" : "text-slate-500"}>
                    Lý trí (T): {result.percentT}%
                  </span>
                  <span className={result.percentF > 50 ? "text-sky-600" : "text-slate-500"}>
                    Cảm xúc (F): {result.percentF}%
                  </span>
                </div>
                <Progress
                  percent={result.percentT}
                  showInfo={false}
                  strokeColor="#0284c7"
                  trailColor="#e0f2fe"
                  size={['100%', 8]}
                />
              </div>

              {/* Trục J - P */}
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between font-bold text-xs">
                  <span className={result.percentJ >= 50 ? "text-emerald-600" : "text-slate-500"}>
                    Nguyên tắc (J): {result.percentJ}%
                  </span>
                  <span className={result.percentP > 50 ? "text-emerald-600" : "text-slate-500"}>
                    Linh hoạt (P): {result.percentP}%
                  </span>
                </div>
                <Progress
                  percent={result.percentJ}
                  showInfo={false}
                  strokeColor="#059669"
                  trailColor="#d1fae5"
                  size={['100%', 8]}
                />
              </div>
            </div>
          </div>

          {/* Tabs Chi Tiết Kết Quả */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-[#2563eb] text-white shadow-2xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Tổng quan
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("strengths")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "strengths"
                    ? "bg-[#2563eb] text-white shadow-2xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Điểm mạnh
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("growth")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "growth"
                    ? "bg-[#2563eb] text-white shadow-2xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Điểm cần phát triển
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("work")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "work"
                    ? "bg-[#2563eb] text-white shadow-2xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Môi trường làm việc
              </button>
            </div>

            <div className="text-[13px] sm:text-[13.5px] text-slate-700 leading-[1.6] min-h-[90px]">
              {activeTab === "overview" && <p className="m-0 leading-[1.6]">{profile.overview}</p>}
              {activeTab === "strengths" && (
                <ul className="space-y-2 pl-4 m-0 list-disc leading-[1.6]">
                  {profile.strengths.map((s, idx) => (
                    <li key={idx}><strong>{s}</strong></li>
                  ))}
                </ul>
              )}
              {activeTab === "growth" && (
                <ul className="space-y-2 pl-4 m-0 list-disc leading-[1.6]">
                  {profile.growthAreas.map((g, idx) => (
                    <li key={idx}>{g}</li>
                  ))}
                </ul>
              )}
              {activeTab === "work" && (
                <div className="space-y-3 leading-[1.6]">
                  <p className="m-0"><strong>Môi trường lý tưởng:</strong> {profile.workEnvironment}</p>
                  <p className="m-0"><strong>Phong cách làm việc nhóm:</strong> {profile.teamworkStyle}</p>
                </div>
              )}
            </div>
          </div>

          {/* Gợi Ý Nghề Nghiệp */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-800 m-0">
                  Gợi ý vị trí & lĩnh vực nghề nghiệp phù hợp
                </h3>
                <p className="text-xs text-slate-500 m-0 mt-0.5">
                  Các vị trí công việc tối ưu hóa năng lượng tự nhiên của nhóm {profile.code}:
                </p>
              </div>
              <Link href="/viec-lam" className="text-xs text-[#2563eb] hover:underline font-bold inline-flex items-center gap-1">
                <span>Xem việc làm</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {profile.suggestedCareers.map((c, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50/80 hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-200 transition-all space-y-1.5 group"
                >
                  <span className="text-[10.5px] font-bold text-[#2563eb] uppercase tracking-wide block">
                    {c.field}
                  </span>
                  <h4 className="text-xs sm:text-[13px] font-bold text-slate-800 group-hover:text-[#2563eb] m-0">
                    {c.title}
                  </h4>
                  <Link
                    href={`/viec-lam?keyword=${encodeURIComponent(c.title)}`}
                    className="text-[11.5px] font-semibold text-[#2563eb] hover:underline inline-flex items-center gap-1 pt-1"
                  >
                    <span>Tìm việc vị trí này</span>
                    <ArrowRightOutlined className="text-[10px]" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Khuyến cáo khoa học */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-amber-900 text-xs sm:text-[12.5px] leading-[1.6]">
            <InfoCircleOutlined className="text-amber-600 text-base mt-0.5 shrink-0" />
            <div>
              <span className="font-bold">Khuyến cáo khoa học:</span> MBTI là công cụ thấu hiểu sở thích và thiên hướng tâm lý cá nhân, không đánh giá đúng - sai hay mức độ thông minh. Không dùng kết quả để ấn định năng lực hay thay thế các thẩm định nghề nghiệp chuyên sâu.
            </div>
          </div>
        </div>
        );
}

