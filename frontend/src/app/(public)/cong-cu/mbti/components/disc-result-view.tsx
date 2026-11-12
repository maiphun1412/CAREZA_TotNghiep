'use client';

import * as React from 'react';
import Link from 'next/link';
import { Progress, Button } from 'antd';
import { 
  ThunderboltOutlined, 
  RotateLeftOutlined, 
  InfoCircleOutlined,
  CheckCircleFilled,
  ApartmentOutlined,
  SolutionOutlined,
  AppstoreOutlined,
  TeamOutlined,
  MessageOutlined,
  RiseOutlined
} from '@ant-design/icons';
import { DiscResult, DISC_DIMENSIONS, DiscDimension } from '../data/disc-data';

interface DiscResultViewProps {
  result: DiscResult;
  onRetake: () => void;
  onSwitchAssessment: () => void;
}

export function DiscResultView({ result, onRetake, onSwitchAssessment }: DiscResultViewProps) {
  const profile = result.discProfile;
  const dimensionsList: DiscDimension[] = ["D", "I", "S", "C"];

  return (
    <div className="space-y-6">
      {/* Banner kết quả chính */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-700 via-amber-700 to-rose-700 p-6 md:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold tracking-wide uppercase">
              <ThunderboltOutlined /> Kết quả trắc nghiệm DISC
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Phong cách hành vi chủ đạo: <span className="text-amber-300 underline decoration-amber-400">Nhóm {result.primary} - {profile.vietnameseName}</span>
            </h1>
            <p className="text-orange-100 text-sm md:text-base leading-relaxed">
              Mã phong cách: <strong className="text-white">{result.code}</strong>. {profile.tagline}. Hiểu rõ phong cách DISC giúp bạn tối ưu hóa khả năng giao tiếp, giải quyết xung đột và phát huy tối đa thế mạnh trong đội ngũ.
            </p>
          </div>

          <div className="flex flex-row md:flex-col gap-2.5 shrink-0">
            <Button
              type="primary"
              size="large"
              icon={<RotateLeftOutlined />}
              onClick={onRetake}
              className="!bg-white !text-orange-800 hover:!bg-orange-50 !font-semibold !border-none !rounded-xl !h-11 shadow"
            >
              Làm lại bài
            </Button>
            <Button
              size="large"
              icon={<AppstoreOutlined />}
              onClick={onSwitchAssessment}
              className="!bg-white/15 !text-white hover:!bg-white/25 !font-medium !border-white/30 !rounded-xl !h-11 backdrop-blur-sm"
            >
              Đổi bài trắc nghiệm
            </Button>
          </div>
        </div>

        {/* Tỉ lệ 4 nhóm D - I - S - C */}
        <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {dimensionsList.map((dim) => {
            const info = DISC_DIMENSIONS[dim];
            const percent = result.percentages[dim];
            const isPrimary = dim === result.primary;
            const isSecondary = dim === result.secondary;

            return (
              <div 
                key={dim} 
                className={`p-3 rounded-xl border backdrop-blur-sm transition-all ${
                  isPrimary 
                    ? 'bg-white/25 border-white text-white shadow-md' 
                    : 'bg-white/10 border-white/20 text-orange-100'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold">Nhóm {dim}</span>
                  {isPrimary && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-900 font-bold text-[10px]">
                      Chủ đạo
                    </span>
                  )}
                  {isSecondary && (
                    <span className="px-1.5 py-0.2 rounded bg-white/20 text-white font-bold text-[10px]">
                      Phụ
                    </span>
                  )}
                </div>
                <div className="text-xl font-extrabold text-white">{percent}%</div>
                <div className="text-[11px] opacity-90 truncate">{info.vietnameseName}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phân bổ tỷ lệ DISC chi tiết */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
            <ApartmentOutlined className="text-orange-600" />
            Tỉ lệ phân bổ 4 xu hướng hành vi DISC
          </div>
          <span className="text-xs text-slate-400">Thang điểm tối đa: 24 điểm/nhóm</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dimensionsList.map((dim) => {
            const info = DISC_DIMENSIONS[dim];
            const score = result.scores[dim];
            const percent = result.percentages[dim];
            const isPrimary = dim === result.primary;

            return (
              <div 
                key={dim} 
                className={`p-4 rounded-xl border transition-all ${
                  isPrimary 
                    ? 'border-orange-300 bg-orange-50/40' 
                    : 'border-slate-200 bg-slate-50/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-7 h-7 rounded-lg text-white font-extrabold text-xs flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: info.color }}
                    >
                      {dim}
                    </span>
                    <span className="font-bold text-slate-800 text-sm">
                      {info.vietnameseName} ({info.name})
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-800">
                    {score}/24 <span className="text-xs text-slate-400 font-normal">({percent}%)</span>
                  </span>
                </div>

                <Progress 
                  percent={percent} 
                  showInfo={false}
                  strokeColor={info.color} 
                  trailColor="#e2e8f0" 
                  size={['100%', 8]} 
                />

                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {info.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phong cách giao tiếp & làm việc nhóm */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base border-b border-slate-100 pb-3">
            <MessageOutlined className="text-orange-600" />
            Phong cách giao tiếp đặc trưng
          </div>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            {profile.communicationStyle}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base border-b border-slate-100 pb-3">
            <TeamOutlined className="text-orange-600" />
            Vai trò trong đội nhóm & Môi trường làm việc
          </div>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            {profile.teamworkRole}. Môi trường lý tưởng: {profile.idealEnvironment}
          </p>
        </div>
      </div>

      {/* Điểm mạnh & Điểm cần phát triển */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base border-b border-slate-100 pb-3">
            <CheckCircleFilled className="text-emerald-500" />
            Điểm mạnh vượt trội
          </div>
          <div className="space-y-2">
            {profile.strengths.map((str: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>{str}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base border-b border-slate-100 pb-3">
            <RiseOutlined className="text-amber-500" />
            Điểm cần rèn luyện & phát triển
          </div>
          <div className="space-y-2">
            {profile.growthAreas.map((area: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{area}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vị trí gợi ý */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
            <SolutionOutlined className="text-orange-600" />
            Vị trí nghề nghiệp gợi ý cho nhóm {result.primary} ({profile.vietnameseName})
          </div>
          <Link href="/viec-lam" className="text-xs text-orange-600 hover:text-orange-700 font-medium">
            Tìm việc làm ngay →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {profile.suggestedCareers.map((c: { title: string; field: string }, idx: number) => (
            <div 
              key={idx} 
              className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-orange-400 hover:shadow-sm transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-[10px] font-bold text-orange-600 uppercase block">{c.field}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-orange-700">{c.title}</span>
              </div>
              <Link 
                href={`/viec-lam?keyword=${encodeURIComponent(c.title)}`}
                className="text-xs text-orange-600 hover:text-orange-700 shrink-0 ml-2"
              >
                Tìm việc →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Khuyến cáo khoa học */}
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-amber-900 text-xs leading-relaxed">
        <InfoCircleOutlined className="text-amber-600 text-base mt-0.5 shrink-0" />
        <div>
          <span className="font-bold">Khuyến cáo khoa học:</span> DISC phản ánh xu hướng phong cách hành vi và giao tiếp tự nhiên trong môi trường làm việc, không đánh giá trí thông minh, năng lực chuyên môn hay đạo đức làm việc. Mỗi cá nhân đều là sự kết hợp linh hoạt của cả 4 yếu tố tùy theo hoàn cảnh thực tế.
        </div>
      </div>
    </div>
  );
}
