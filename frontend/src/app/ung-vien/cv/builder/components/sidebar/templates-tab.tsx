"use client";

import React from "react";
import { CVTemplateId } from "../../types";
import { CV_TEMPLATES } from "../../constants";
import { CheckCircleFilled } from "@ant-design/icons";

interface TemplatesTabProps {
  currentTemplateId: CVTemplateId;
  onSelectTemplate: (tplId: CVTemplateId) => void;
}

export function TemplatesTab({ currentTemplateId, onSelectTemplate }: TemplatesTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-black text-slate-800 m-0">Thư viện 6 Mẫu CV Tuyển Dụng</h3>

      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {CV_TEMPLATES.map((tpl) => {
          const isSelected = tpl.id === currentTemplateId;
          return (
            <div
              key={tpl.id}
              onClick={() => onSelectTemplate(tpl.id)}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden ${isSelected
                  ? "border-[#0062ff] bg-blue-50/40 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 bg-white hover:shadow-xs"
                }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 text-blue-600 text-lg">
                  <CheckCircleFilled />
                </div>
              )}

              <div className="flex items-start gap-3">
                {/* Visual Layout Icon Box */}
                <div
                  className="w-12 h-14 rounded-xl flex flex-col justify-between p-1.5 shrink-0 shadow-2xs"
                  style={{ backgroundColor: `${tpl.thumbnailColor}15`, border: `1.5px solid ${tpl.thumbnailColor}` }}
                >
                  <div className="w-full h-2 rounded-xs" style={{ backgroundColor: tpl.thumbnailColor }} />
                  {tpl.id === "modern-two-column" && (
                    <div className="flex gap-1 h-6">
                      <div className="w-1/3 rounded-xs" style={{ backgroundColor: tpl.thumbnailColor }} />
                      <div className="w-2/3 bg-slate-200 rounded-xs" />
                    </div>
                  )}
                  {tpl.id === "classic-executive" && (
                    <div className="space-y-1 h-6">
                      <div className="w-full h-1 bg-slate-300 rounded-xs" />
                      <div className="w-full h-1 bg-slate-300 rounded-xs" />
                      <div className="w-full h-1 bg-slate-300 rounded-xs" />
                    </div>
                  )}
                  {tpl.id === "minimalist-clean" && (
                    <div className="flex gap-1 h-6">
                      <div className="w-1/4 bg-slate-300 rounded-xs" />
                      <div className="w-3/4 bg-slate-200 rounded-xs" />
                    </div>
                  )}
                  {tpl.id === "creative-timeline" && (
                    <div className="flex items-center gap-1 h-6 pl-1">
                      <div className="w-1 h-full rounded-full" style={{ backgroundColor: tpl.thumbnailColor }} />
                      <div className="flex-1 space-y-1">
                        <div className="w-full h-1 bg-slate-300 rounded-xs" />
                        <div className="w-3/4 h-1 bg-slate-300 rounded-xs" />
                      </div>
                    </div>
                  )}
                  {tpl.id === "compact-dense" && (
                    <div className="grid grid-cols-2 gap-1 h-6">
                      <div className="w-full bg-slate-200 rounded-xs" />
                      <div className="w-full bg-slate-200 rounded-xs" />
                    </div>
                  )}
                  {tpl.id === "infographic-bold" && (
                    <div className="space-y-1 h-6">
                      <div className="w-full h-2 rounded-xs" style={{ backgroundColor: tpl.thumbnailColor }} />
                      <div className="w-full h-3 bg-slate-200 rounded-xs" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{tpl.name}</span>
                    <span
                      className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${tpl.thumbnailColor}15`, color: tpl.thumbnailColor }}
                    >
                      {tpl.category}
                    </span>
                  </div>

                  <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                    Bố cục: {tpl.layoutDescription}
                  </div>

                  <p className="text-xs text-slate-500 m-0 mt-1 leading-relaxed line-clamp-2">
                    {tpl.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {tpl.features.map((ft, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        • {ft}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
