'use client';

import * as React from 'react';
import Link from 'next/link';
import { Progress, Button } from 'antd';
import { 
  CompassOutlined, 
  RotateLeftOutlined, 
  InfoCircleOutlined,
  CheckCircleFilled,
  ApartmentOutlined,
  SolutionOutlined,
  AppstoreOutlined,
  ReadOutlined
} from '@ant-design/icons';
import { RiasecResult, RIASEC_GROUPS, RiasecGroup } from '../data/riasec-data';

interface RiasecResultViewProps {
  result: RiasecResult;
  onRetake: () => void;
  onSwitchAssessment: () => void;
}

export function RiasecResultView({ result, onRetake, onSwitchAssessment }: RiasecResultViewProps) {
  const primaryGroup = result.primaryGroup;
  const groupsList: RiasecGroup[] = ["R", "I", "A", "S", "E", "C"];

  return (
    <div className="space-y-6">
      {/* Banner kết quả chính */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-700 to-sky-700 p-6 md:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold tracking-wide uppercase">
              <CompassOutlined /> Kết quả trắc nghiệm Holland / RIASEC
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Mã Holland của bạn: <span className="text-amber-300 underline decoration-amber-400">{result.hollandCode}</span>
            </h1>
            <p className="text-emerald-100 text-sm md:text-base leading-relaxed">
              Bạn có xu hướng nghề nghiệp chủ đạo kết hợp giữa ba nhóm{' '}
              <strong className="text-white">
                {result.top3.map(code => `${RIASEC_GROUPS[code].vietnameseName} (${code})`).join(' - ')}
              </strong>.
              Khám phá các gợi ý môi trường làm việc và nghề nghiệp phù hợp dưới đây.
            </p>
          </div>

          <div className="flex flex-row md:flex-col gap-2.5 shrink-0">
            <Button
              type="primary"
              size="large"
              icon={<RotateLeftOutlined />}
              onClick={onRetake}
              className="!bg-white !text-emerald-800 hover:!bg-emerald-50 !font-semibold !border-none !rounded-xl !h-11 shadow"
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

        {/* Top 3 huy hiệu nhóm */}
        <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {result.top3.map((code, idx) => {
            const info = RIASEC_GROUPS[code];
            const score = result.scores[code];
            const percent = result.percentages[code];
            return (
              <div 
                key={code} 
                className="p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-amber-400 text-slate-900 font-extrabold text-sm flex items-center justify-center shadow">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-white text-sm">
                      {info.vietnameseName} ({code})
                    </div>
                    <div className="text-xs text-emerald-200">Điểm: {score}/20 ({percent}%)</div>
                  </div>
                </div>
                <CheckCircleFilled className="text-emerald-400 text-lg" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Biểu đồ phân bổ điểm 6 nhóm */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
            <ApartmentOutlined className="text-emerald-600" />
            Phổ điểm 6 nhóm sở thích nghề nghiệp RIASEC
          </div>
          <span className="text-xs text-slate-400">Thang điểm tối đa: 20 điểm/nhóm</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {groupsList.map((code) => {
            const info = RIASEC_GROUPS[code];
            const score = result.scores[code];
            const percent = result.percentages[code];
            const isTop = result.top3.includes(code);

            return (
              <div 
                key={code} 
                className={`p-3.5 rounded-xl border transition-all ${
                  isTop 
                    ? 'border-emerald-300 bg-emerald-50/40' 
                    : 'border-slate-200 bg-slate-50/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-6 h-6 rounded-md text-white font-bold text-xs flex items-center justify-center"
                      style={{ backgroundColor: info.color }}
                    >
                      {code}
                    </span>
                    <span className="font-semibold text-slate-800 text-sm">
                      {info.vietnameseName}
                    </span>
                    {isTop && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        Top nhóm
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-slate-700">
                    {score}/20 <span className="text-xs text-slate-400 font-normal">({percent}%)</span>
                  </span>
                </div>
                <Progress 
                  percent={percent} 
                  showInfo={false}
                  strokeColor={info.color} 
                  trailColor="#e2e8f0" 
                  size={['100%', 8]} 
                />
                <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                  {info.tagline}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chi tiết phân tích nhóm hàng đầu */}
      {primaryGroup && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base border-b border-slate-100 pb-3">
            <ReadOutlined className="text-emerald-600" />
            Phân tích chi tiết nhóm nổi bật nhất: {primaryGroup.vietnameseName} ({primaryGroup.code})
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" /> Đặc điểm tính cách & phong cách
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {primaryGroup.description}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-600" /> Môi trường làm việc lý tưởng
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {primaryGroup.workEnvironment}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Danh mục nghề nghiệp gợi ý */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
            <SolutionOutlined className="text-emerald-600" />
            Nhóm ngành nghề gợi ý phù hợp với mã Holland {result.hollandCode}
          </div>
          <Link href="/viec-lam" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
            Tìm việc làm liên quan →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {primaryGroup?.suggestedCareers.map((c, idx) => (
            <div 
              key={idx} 
              className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-emerald-400 hover:shadow-sm transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase block">{c.field}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-emerald-700">{c.title}</span>
              </div>
              <Link 
                href={`/viec-lam?keyword=${encodeURIComponent(c.title)}`}
                className="text-xs text-emerald-600 group-hover:text-emerald-700 shrink-0 ml-2"
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
          <span className="font-bold">Khuyến cáo khoa học:</span> Kết quả trắc nghiệm Holland / RIASEC mang giá trị tham khảo định hướng nghề nghiệp, phản ánh mức độ quan tâm và hứng thú của bạn tại thời điểm hiện tại. Không sử dụng kết quả này làm tiêu chí tuyệt đối để đánh giá năng lực hoặc loại trừ cơ hội nghề nghiệp.
        </div>
      </div>
    </div>
  );
}
