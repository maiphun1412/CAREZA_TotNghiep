"use client";

import * as React from "react";
import { ASSESSMENTS_CATALOG, AssessmentType } from "../data/assessment-types";
import {
  Brain,
  Compass,
  Layers,
  Users,
  Clock,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface AssessmentSelectorProps {
  onSelectAssessment: (type: AssessmentType) => void;
}

export function AssessmentSelector({ onSelectAssessment }: AssessmentSelectorProps) {
  const getIcon = (type: AssessmentType) => {
    switch (type) {
      case "mbti":
        return <Brain className="w-4 h-4 text-[#0062ff]" />;
      case "riasec":
        return <Compass className="w-4 h-4 text-[#059669]" />;
      case "bigfive":
        return <Layers className="w-4 h-4 text-[#7c3aed]" />;
      case "disc":
        return <Users className="w-4 h-4 text-[#d97706]" />;
    }
  };

  const getIconBg = (type: AssessmentType) => {
    switch (type) {
      case "mbti":
        return "bg-blue-50 border-blue-100";
      case "riasec":
        return "bg-emerald-50 border-emerald-100";
      case "bigfive":
        return "bg-purple-50 border-purple-100";
      case "disc":
        return "bg-amber-50 border-amber-100";
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Header danh mục gọn gàng */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4.5 bg-[#0062ff] rounded-full" />
          <h2 className="text-sm sm:text-base font-bold text-slate-900 m-0">
            Chọn bài trắc nghiệm phù hợp với bạn
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          4 bài trắc nghiệm chuẩn hóa quốc tế
        </span>
      </div>

      {/* Grid 4 Cards (2 cột, 2 hàng) - Chiều cao 165–170px đồng bộ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ASSESSMENTS_CATALOG.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 hover:border-[#0062ff] hover:shadow-2xs transition-all p-4 flex flex-col justify-between h-[168px] sm:h-[172px] group"
          >
            {/* Top Content: Tiêu đề, Badge, Mô tả và Đặc điểm */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg ${getIconBg(item.id)} border flex items-center justify-center shrink-0`}>
                    {getIcon(item.id)}
                  </div>
                  <h3 className="text-[15px] sm:text-base font-bold text-slate-900 m-0 group-hover:text-[#0062ff] transition-colors leading-tight">
                    {item.name}
                  </h3>
                </div>

                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200/80 shrink-0">
                  {item.badge}
                </span>
              </div>

              {/* Mô tả ngắn 1 dòng */}
              <p className="text-xs text-slate-500 leading-relaxed m-0 line-clamp-1">
                {item.tagline}
              </p>

              {/* 2 đặc điểm nổi bật */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-slate-600 font-medium">
                {item.features.slice(0, 2).map((feat, idx) => (
                  <span key={idx} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{feat}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Footer Content: Thông số và Nút bắt đầu căn thẳng hàng */}
            <div className="pt-2.5 mt-auto border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.questionCount} câu</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.estimatedMinutes}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => onSelectAssessment(item.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer border-none shrink-0"
              >
                <span>Bắt đầu bài trắc nghiệm</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

