"use client";

import React, { useMemo } from "react";
import { ResumeData } from "../../types";
import { paginateCvContent } from "../../utils/pagination";
import { TemplateRenderer } from "../templates/template-renderer";

interface A4CanvasProps {
  data: ResumeData;
  zoomLevel: number;
  onUpdatePersonalInfo: (field: keyof ResumeData["personalInfo"], val: string) => void;
  onUpdateExperience: (id: string, updates: any) => void;
  onUpdateEducation: (id: string, updates: any) => void;
  onUpdateSkill: (id: string, updates: any) => void;
  onUpdateProject: (id: string, updates: any) => void;
  onUpdateCertificate: (id: string, updates: any) => void;
}

// Kích thước chuẩn 1 trang A4 ở 96 DPI: 794px × 1123px (210mm × 297mm)
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;
const PAGE_GAP_PX = 32;

export function A4Canvas({
  data,
  zoomLevel,
  onUpdatePersonalInfo,
  onUpdateExperience,
  onUpdateEducation,
  onUpdateSkill,
  onUpdateProject,
  onUpdateCertificate,
}: A4CanvasProps) {
  // Tính toán phân bổ nội dung sang nhiều trang A4 riêng biệt (Tự động tính lại khi đổi nội dung, font, cỡ chữ, spacing)
  const pages = useMemo(() => {
    return paginateCvContent(data);
  }, [data]);

  const totalPages = pages.length;
  const scale = zoomLevel / 100;

  // Tổng chiều cao vùng vẽ nhiều trang có khoảng cách giữa các trang
  const totalUnscaledHeight = totalPages * A4_HEIGHT_PX + (totalPages - 1) * PAGE_GAP_PX;

  return (
    <div className="w-full h-full flex flex-col items-center justify-start overflow-auto p-4 sm:p-8 bg-slate-300/70 min-h-screen">
      {/* Thanh trạng thái khổ giấy & tổng số trang kiểu Google Docs */}
      <div className="mb-4 sticky top-0 z-20 flex items-center justify-between gap-4 text-xs font-semibold text-slate-700 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-md border border-slate-300">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Khổ in: Chuẩn A4 (210 × 297 mm)</span>
        </span>
        <span className="text-slate-300">|</span>
        <span className="text-blue-600 font-extrabold">
          Tổng số trang: {totalPages} {totalPages > 1 ? "trang A4 rời" : "trang A4"}
        </span>
        <span className="text-slate-300">|</span>
        <span>Thu phóng: {zoomLevel}%</span>
      </div>

      {/* Vùng canvas scale cho nhiều trang A4 */}
      <div
        style={{
          width: `${A4_WIDTH_PX * scale}px`,
          height: `${totalUnscaledHeight * scale}px`,
          position: "relative",
          transition: "width 0.2s ease, height 0.2s ease",
        }}
      >
        <div
          style={{
            width: `${A4_WIDTH_PX}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0,
          }}
          className="flex flex-col"
        >
          {pages.map((page, index) => {
            const pageNumber = index + 1;

            return (
              <div
                key={page.pageIndex}
                style={{
                  width: `${A4_WIDTH_PX}px`,
                  height: `${A4_HEIGHT_PX}px`,
                  marginBottom: index < totalPages - 1 ? `${PAGE_GAP_PX}px` : "0px",
                }}
                className="relative bg-white shadow-2xl rounded-xs overflow-hidden border border-slate-300 shrink-0 select-text"
              >
                {/* Nhãn nhận diện trang trên góc trái */}
                <div className="absolute top-2 left-4 z-10 text-[9px] uppercase tracking-widest font-extrabold text-slate-300 pointer-events-none select-none">
                  CAREZA CV • TRANG A4 {pageNumber} / {totalPages}
                </div>

                {/* Render Template với dữ liệu phân trang */}
                <div className="w-full h-full">
                  <TemplateRenderer
                    data={data}
                    pageData={page}
                    onUpdatePersonalInfo={onUpdatePersonalInfo}
                    onUpdateExperience={onUpdateExperience}
                    onUpdateEducation={onUpdateEducation}
                    onUpdateSkill={onUpdateSkill}
                    onUpdateProject={onUpdateProject}
                    onUpdateCertificate={onUpdateCertificate}
                  />
                </div>

                {/* Footer số trang góc phải dưới chuẩn văn bản */}
                <div className="absolute bottom-2 right-6 text-[10px] text-slate-400 font-mono select-none pointer-events-none z-10">
                  Trang {pageNumber} / {totalPages}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
