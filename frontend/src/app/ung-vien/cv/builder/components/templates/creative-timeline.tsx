"use client";

import React from "react";
import { ResumeData } from "../../types";
import { PaginatedPageData } from "../../utils/pagination";
import { EditableText } from "./editable-text";
import { DecorativeDivider, DecorativeHeaderPattern } from "./decorations";
import { Mail, Phone, MapPin, Globe, Sparkles } from "lucide-react";

interface CreativeTimelineProps {
  data: ResumeData;
  pageData?: PaginatedPageData;
  onUpdatePersonalInfo: (field: keyof ResumeData["personalInfo"], val: string) => void;
  onUpdateExperience: (id: string, updates: any) => void;
  onUpdateEducation: (id: string, updates: any) => void;
  onUpdateSkill: (id: string, updates: any) => void;
  onUpdateProject: (id: string, updates: any) => void;
  onUpdateCertificate: (id: string, updates: any) => void;
}

export function CreativeTimelineTemplate({
  data,
  pageData,
  onUpdatePersonalInfo,
  onUpdateExperience,
  onUpdateEducation,
  onUpdateSkill,
  onUpdateProject,
}: CreativeTimelineProps) {
  const { personalInfo, sections, theme } = data;
  const isSectionVisible = (id: string) => sections.find((s) => s.id === id)?.visible ?? true;

  const isFirstPage = !pageData || pageData.pageIndex === 0;
  const experiences = pageData ? pageData.experiences : data.experiences;
  const educations = pageData ? pageData.educations : data.educations;
  const projects = pageData ? pageData.projects : data.projects;
  const skills = pageData ? pageData.skills : data.skills;

  const spacingClass =
    theme.spacing === "compact" ? "space-y-3" : theme.spacing === "spacious" ? "space-y-6" : "space-y-4";

  return (
    <div
      className={`w-full h-full p-8 bg-white text-slate-800 relative overflow-hidden ${spacingClass}`}
      style={{ fontFamily: theme.fontFamily }}
    >
      {/* CREATIVE BANNER HEADER (Chỉ ở Trang 1) */}
      {isFirstPage ? (
        <header
          className="p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.secondaryColor || "#f5f3ff"} 0%, #ffffff 100%)`,
            border: `1px solid ${theme.primaryColor}30`,
          }}
        >
          <DecorativeHeaderPattern decorations={theme.decorations} primaryColor={theme.primaryColor} />

          <div className="flex items-center gap-4 z-10">
            {theme.showAvatar && (
              <div
                className={`w-20 h-20 shrink-0 overflow-hidden border-2 shadow-md bg-white flex items-center justify-center ${
                  theme.avatarStyle === "circle"
                    ? "rounded-full"
                    : theme.avatarStyle === "rounded"
                    ? "rounded-xl"
                    : "rounded-none"
                }`}
                style={{ borderColor: theme.primaryColor }}
              >
                {personalInfo.avatarUrl ? (
                  <img
                    src={personalInfo.avatarUrl}
                    alt={personalInfo.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-black text-slate-300">
                    {personalInfo.fullName ? personalInfo.fullName.charAt(0).toUpperCase() : "CV"}
                  </span>
                )}
              </div>
            )}

            <div>
              <div
                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1"
                style={{ backgroundColor: `${theme.primaryColor}15`, color: theme.primaryColor }}
              >
                <Sparkles className="w-3 h-3" />
                <span>Hồ sơ năng lực sáng tạo</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 m-0">
                <EditableText
                  value={personalInfo.fullName}
                  placeholder="Họ Và Tên Ứng Viên"
                  onChange={(v) => onUpdatePersonalInfo("fullName", v)}
                />
              </h1>
              <div className="text-xs font-bold tracking-wide mt-0.5" style={{ color: theme.primaryColor }}>
                <EditableText
                  value={personalInfo.jobTitle}
                  placeholder="Vị trí ứng tuyển"
                  onChange={(v) => onUpdatePersonalInfo("jobTitle", v)}
                />
              </div>
            </div>
          </div>

          {/* Contact badges */}
          {isSectionVisible("info") && (
            <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-600 shrink-0 z-10">
              <div className="flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-lg border border-slate-200">
                <Mail className="w-3 h-3" style={{ color: theme.primaryColor }} />
                <EditableText
                  value={personalInfo.email}
                  placeholder="Email"
                  onChange={(v) => onUpdatePersonalInfo("email", v)}
                />
              </div>
              <div className="flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-lg border border-slate-200">
                <Phone className="w-3 h-3" style={{ color: theme.primaryColor }} />
                <EditableText
                  value={personalInfo.phone}
                  placeholder="Điện thoại"
                  onChange={(v) => onUpdatePersonalInfo("phone", v)}
                />
              </div>
              <div className="flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-lg border border-slate-200">
                <MapPin className="w-3 h-3" style={{ color: theme.primaryColor }} />
                <EditableText
                  value={personalInfo.address}
                  placeholder="Địa chỉ"
                  onChange={(v) => onUpdatePersonalInfo("address", v)}
                />
              </div>
              <div className="flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-lg border border-slate-200">
                <Globe className="w-3 h-3" style={{ color: theme.primaryColor }} />
                <EditableText
                  value={personalInfo.website}
                  placeholder="Website"
                  onChange={(v) => onUpdatePersonalInfo("website", v)}
                />
              </div>
            </div>
          )}
        </header>
      ) : (
        /* Mini header trang tiếp theo */
        <div className="flex justify-between items-center pb-2 border-b border-slate-200 text-xs text-slate-500 mb-2">
          <span className="font-bold text-slate-800">
            {personalInfo.fullName} • Timeline sự nghiệp
          </span>
          <span className="italic">Trang {pageData ? pageData.pageIndex + 1 : 2} / {pageData?.totalPages || 2}</span>
        </div>
      )}

      {/* SUMMARY */}
      {isFirstPage && isSectionVisible("summary") && (personalInfo.summary || personalInfo.summary === "") && (
        <section className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
          <p className="text-xs leading-relaxed text-slate-700 m-0 text-justify">
            <EditableText
              value={personalInfo.summary}
              placeholder="Giới thiệu bản thân, phong cách làm việc sáng tạo..."
              onChange={(v) => onUpdatePersonalInfo("summary", v)}
              multiline
            />
          </p>
        </section>
      )}

      {/* TIMELINE WORK EXPERIENCE */}
      {isSectionVisible("experience") && experiences.length > 0 && (
        <section className="space-y-3">
          <h2
            className="text-xs font-black uppercase tracking-wider flex items-center gap-2"
            style={{ color: theme.primaryColor }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
            Hành trình sự nghiệp {pageData && pageData.pageIndex > 0 ? "(Tiếp theo)" : ""}
          </h2>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {experiences.map((exp) => (
              <div key={exp.id} className="relative group text-xs">
                {/* Timeline node */}
                <span
                  className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-transform group-hover:scale-125"
                  style={{ borderColor: theme.primaryColor }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
                </span>

                <div className="flex justify-between items-baseline font-bold">
                  <span className="text-sm text-slate-900">
                    <EditableText
                      value={exp.position}
                      placeholder="Vị trí làm việc"
                      onChange={(v) => onUpdateExperience(exp.id, { position: v })}
                    />
                  </span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${theme.primaryColor}15`, color: theme.primaryColor }}
                  >
                    {exp.startDate} - {exp.isCurrent ? "Hiện tại" : exp.endDate}
                  </span>
                </div>

                <div className="font-semibold text-slate-600 mt-0.5">
                  <EditableText
                    value={exp.company}
                    placeholder="Công ty"
                    onChange={(v) => onUpdateExperience(exp.id, { company: v })}
                  />
                </div>

                <div className="text-slate-700 leading-relaxed mt-1">
                  <EditableText
                    value={exp.description}
                    placeholder="Mô tả kết quả và trải nghiệm..."
                    onChange={(v) => onUpdateExperience(exp.id, { description: v })}
                    multiline
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* EDUCATION & SKILLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Education Timeline */}
        {isSectionVisible("education") && educations.length > 0 && (
          <section className="space-y-2">
            <h2
              className="text-xs font-black uppercase tracking-wider flex items-center gap-2"
              style={{ color: theme.primaryColor }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
              Học vấn
            </h2>
            <div className="relative pl-5 space-y-3 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {educations.map((edu) => (
                <div key={edu.id} className="relative text-xs">
                  <span
                    className="absolute -left-5 top-1 w-3 h-3 rounded-full border-2 bg-white"
                    style={{ borderColor: theme.primaryColor }}
                  />
                  <div className="font-bold text-slate-900">
                    <EditableText
                      value={edu.school}
                      placeholder="Trường"
                      onChange={(v) => onUpdateEducation(edu.id, { school: v })}
                    />
                  </div>
                  <div className="text-slate-600">
                    <EditableText
                      value={edu.major}
                      placeholder="Chuyên ngành"
                      onChange={(v) => onUpdateEducation(edu.id, { major: v })}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {edu.startDate} - {edu.endDate}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Pills */}
        {isSectionVisible("skills") && skills.length > 0 && (
          <section className="space-y-2">
            <h2
              className="text-xs font-black uppercase tracking-wider flex items-center gap-2"
              style={{ color: theme.primaryColor }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
              Kỹ năng & Chuyên môn
            </h2>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {skills.map((sk) => (
                <span
                  key={sk.id}
                  className="px-2.5 py-1 rounded-xl border font-semibold flex items-center gap-1.5 text-xs"
                  style={{
                    borderColor: `${theme.primaryColor}40`,
                    backgroundColor: `${theme.primaryColor}08`,
                  }}
                >
                  <EditableText
                    value={sk.name}
                    placeholder="Kỹ năng"
                    onChange={(v) => onUpdateSkill(sk.id, { name: v })}
                  />
                  <span className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <span
                        key={lvl}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: lvl <= sk.level ? theme.primaryColor : "#cbd5e1",
                        }}
                      />
                    ))}
                  </span>
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* PROJECTS */}
      {isSectionVisible("projects") && projects.length > 0 && (
        <section className="space-y-2">
          <h2
            className="text-xs font-black uppercase tracking-wider flex items-center gap-2"
            style={{ color: theme.primaryColor }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
            Dự án nổi bật
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {projects.map((proj) => (
              <div key={proj.id} className="p-2.5 rounded-xl border border-slate-200 bg-white text-xs space-y-0.5">
                <div className="font-bold text-slate-900 flex justify-between">
                  <EditableText
                    value={proj.name}
                    placeholder="Tên dự án"
                    onChange={(v) => onUpdateProject(proj.id, { name: v })}
                  />
                  <span className="text-[10px] text-slate-400 font-normal">{proj.startDate}</span>
                </div>
                <div className="text-[11px] text-slate-500 italic">
                  <EditableText
                    value={proj.role}
                    placeholder="Vai trò"
                    onChange={(v) => onUpdateProject(proj.id, { role: v })}
                  />
                </div>
                <div className="text-slate-600 leading-relaxed">
                  <EditableText
                    value={proj.description}
                    placeholder="Mô tả dự án"
                    onChange={(v) => onUpdateProject(proj.id, { description: v })}
                    multiline
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
