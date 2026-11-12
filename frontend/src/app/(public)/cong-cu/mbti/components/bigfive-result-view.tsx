'use client';

import * as React from 'react';
import Link from 'next/link';
import { Progress, Button } from 'antd';
import { 
  ExperimentOutlined, 
  RotateLeftOutlined, 
  InfoCircleOutlined,
  ApartmentOutlined,
  SolutionOutlined,
  AppstoreOutlined,
  ReadOutlined,
  CheckCircleFilled
} from '@ant-design/icons';
import { BigFiveResult, OCEAN_DIMENSIONS, OceanDimension } from '../data/bigfive-data';

interface BigFiveResultViewProps {
  result: BigFiveResult;
  onRetake: () => void;
  onSwitchAssessment: () => void;
}

export function BigFiveResultView({ result, onRetake, onSwitchAssessment }: BigFiveResultViewProps) {
  const dimensionsList: OceanDimension[] = ["O", "C", "E", "A", "N"];

  return (
    <div className="space-y-6">
      {/* Banner kết quả chính */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-800 via-indigo-800 to-blue-800 p-6 md:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold tracking-wide uppercase">
              <ExperimentOutlined /> Kết quả trắc nghiệm Big Five / OCEAN
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Hồ sơ 5 nhân tố tính cách nền tảng của bạn
            </h1>
            <p className="text-purple-100 text-sm md:text-base leading-relaxed">
              Mô hình 5 nhân tố lớn (OCEAN) là hệ thống đánh giá tính cách có cơ sở thực nghiệm vững chắc hàng đầu trong tâm lý học hiện đại, giúp bạn thấu hiểu phong cách tư duy và cách tương tác xã hội.
            </p>
          </div>

          <div className="flex flex-row md:flex-col gap-2.5 shrink-0">
            <Button
              type="primary"
              size="large"
              icon={<RotateLeftOutlined />}
              onClick={onRetake}
              className="!bg-white !text-purple-800 hover:!bg-purple-50 !font-semibold !border-none !rounded-xl !h-11 shadow"
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

        {/* Tóm tắt 5 nhân tố */}
        <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {dimensionsList.map((dim) => {
            const info = OCEAN_DIMENSIONS[dim];
            const percent = result.percentages[dim];
            const level = result.levels[dim];
            return (
              <div 
                key={dim} 
                className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-center space-y-1"
              >
                <div className="text-xs text-purple-200 font-semibold">{dim} - {info.vietnameseName}</div>
                <div className="text-xl font-extrabold text-white">{percent}%</div>
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-white/20 text-white">
                  Mức {level}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chi tiết 5 đặc điểm tính cách */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
            <ApartmentOutlined className="text-purple-600" />
            Phân tích chi tiết 5 khía cạnh tính cách OCEAN
          </div>
          <span className="text-xs text-slate-400">Thang điểm: 6 – 30 điểm/nhân tố</span>
        </div>

        <div className="space-y-4">
          {dimensionsList.map((dim) => {
            const info = OCEAN_DIMENSIONS[dim];
            const rawScore = result.rawScores[dim];
            const percent = result.percentages[dim];
            const level = result.levels[dim];

            const traitText = level === "Cao" ? info.highTrait : level === "Thấp" ? info.lowTrait : "Bạn có sự cân bằng linh hoạt, thể hiện hành vi tùy theo từng bối cảnh cụ thể.";

            return (
              <div 
                key={dim} 
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span 
                      className="w-7 h-7 rounded-lg text-white font-extrabold text-xs flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: info.color }}
                    >
                      {dim}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        {info.vietnameseName} ({info.name})
                      </h4>
                      <p className="text-xs text-slate-500">{info.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                      Mức {level}
                    </span>
                    <span className="font-extrabold text-sm text-slate-800">
                      {rawScore}/30 <span className="text-xs text-slate-500 font-normal">({percent}%)</span>
                    </span>
                  </div>
                </div>

                <Progress 
                  percent={percent} 
                  showInfo={false}
                  strokeColor={info.color} 
                  trailColor="#e2e8f0" 
                  size={['100%', 8]} 
                />

                <div className="p-3 rounded-lg bg-white border border-slate-100 text-xs text-slate-700 leading-relaxed space-y-1">
                  <div>
                    <strong className="text-purple-800">Đặc điểm biểu hiện: </strong>
                    {traitText}
                  </div>
                  <div>
                    <strong className="text-slate-700">Tác động trong công việc: </strong>
                    {info.workImpact}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vị trí nghề nghiệp đề xuất */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
            <SolutionOutlined className="text-purple-600" />
            Các vai trò nghề nghiệp tham khảo theo phổ điểm Big Five
          </div>
          <Link href="/viec-lam" className="text-xs text-purple-600 hover:text-purple-700 font-medium">
            Tìm việc làm ngay →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {dimensionsList.flatMap(d => OCEAN_DIMENSIONS[d].suggestedRoles.slice(0, 2)).slice(0, 6).map((role, idx) => (
            <div 
              key={idx} 
              className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-purple-400 hover:shadow-sm transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center text-xs font-bold group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  {idx + 1}
                </span>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-purple-700">
                  {role}
                </span>
              </div>
              <Link 
                href={`/viec-lam?keyword=${encodeURIComponent(role)}`}
                className="text-xs text-purple-600 hover:text-purple-800"
              >
                Khám phá →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Khuyến cáo khoa học */}
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-amber-900 text-xs leading-relaxed">
        <InfoCircleOutlined className="text-amber-600 text-base mt-0.5 shrink-0" />
        <div>
          <span className="font-bold">Khuyến cáo khoa học:</span> Điểm số Big Five đo lường các xu hướng hành vi ổn định tương đối theo thời gian nhưng không cố định vĩnh viễn. Kết quả nhằm phục vụ mục đích thấu hiểu bản thân và phát triển kỹ năng cá nhân, không nên dùng để quy kết hoặc hạn chế tiềm năng học hỏi của cá nhân.
        </div>
      </div>
    </div>
  );
}
