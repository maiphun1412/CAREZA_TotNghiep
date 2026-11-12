"use client";

import React from "react";
import { ResumeData } from "../../types";
import { PaginatedPageData } from "../../utils/pagination";
import { EditableText } from "./editable-text";
import { DecorativeDivider, DecorativeHeaderPattern } from "./decorations";
import { Mail, Phone, MapPin, Globe, Briefcase, GraduationCap, Award, Star } from "lucide-react";

interface InfographicBoldProps {
  data: ResumeData;
  pageData?: PaginatedPageData;
  onUpdatePersonalInfo: (field: keyof ResumeData["personalInfo"], val: string) => void;
  onUpdateExperience: (id: string, updates: any) => void;
  onUpdateEducation: (id: string, updates: any) => void;
  onUpdateSkill: (id: string, updates: any) => void;
  onUpdateProject: (id: string, updates: any) => void;
  onUpdateCertificate: (id: string, updates: any) => void;
}

export function InfographicBoldTemplate({
  data,
  pageData,
  onUpdatePersonalInfo,
  onUpdateExperience,
  onUpdateEducation,
  onUpdateSkill,
  onUpdateProject,
  onUpdateCertificate,
}: InfographicBoldProps) {
  const { personalInfo, sections, theme } = data;
  const isSectionVisible = (id: string) => sections.find((s) => s.id === id)?.visible ?? true;

  const isFirstPage = !pageData || pageData.pageIndex === 0;
  const experiences = pageData ? pageData.experiences : data.experiences;
  const educations = pageData ? pageData.educations : data.educations;
  const projects = pageData ? pageData.projects : data.projects;
  const skills = pageData ? pageData.sidebarSkills : data.skills;
  const certificates = pageData ? pageData.sidebarCertificates : data.certificates;

  const spacingClass =
    theme.spacing === "compact" ? "space-y-2.5" : theme.spacing === "spacious" ? "space-y-5" : "space-y-3.5";

  return (
    <div
      className="w-full h-full bg-slate-50 text-slate-800 relative overflow-hidden"
      style={{ fontFamily: theme.fontFamily }}
    >
      {/* HERO BOLD HEADER (Chỉ ở Trang 1) */}
      {isFirstPage ? (
        <header
          className="p-6 text-white shadow-md relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.primaryColor}dd 100%)`,
          }}
        >
          <DecorativeHeaderPattern decorations={theme.decorations} primaryColor="#ffffff" />

          <div className="flex flex-col md:flex-row items-center gap-5 z-10 relative">
            {theme.showAvatar && (
              <div
                className={`w-24 h-24 shrink-0 overflow-hidden border-4 border-white/90 shadow-lg bg-white/20 flex items-center justify-center ${
                  theme.avatarStyle === "circle"
                    ? "rounded-full"
                    : theme.avatarStyle === "rounded"
                    ? "rounded-2xl"
                    : "rounded-none"
                }`}
              >
                {personalInfo.avatarUrl ? (
                  <img
                    src={personalInfo.avatarUrl}
                    alt={personalInfo.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-black text-white">
                    {personalInfo.fullName ? personalInfo.fullName.charAt(0).toUpperCase() : "CV"}
                  </span>
                )}
              </div>
            )}

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-black tracking-tight text-white m-0">
                <EditableText
                  value={personalInfo.fullName}
                  placeholder="HỌ VÀ TÊN ỨNG VIÊN"
                  onChange={(v) => onUpdatePersonalInfo("fullName", v)}
                  className="text-white"
                />
              </h1>
              <div className="text-xs font-bold tracking-wider uppercase text-white/90 mt-1">
                <EditableText
                  value={personalInfo.jobTitle}
                  placeholder="CHUYÊN MÔN / VỊ TRÍ ỨNG TUYỂN"
                  onChange={(v) => onUpdatePersonalInfo("jobTitle", v)}
                  className="text-white/90"
                />
              </div>

              {/* Contacts bar */}
              {isSectionVisible("info") && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-white/90 mt-2.5 pt-2 border-t border-white/20">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-white/80" />
                    <EditableText
                      value={personalInfo.email}
                      placeholder="email@domain.com"
                      onChange={(v) => onUpdatePersonalInfo("email", v)}
                      className="text-white/90"
                    />
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-white/80" />
                    <EditableText
                      value={personalInfo.phone}
                      placeholder="Số điện thoại"
                      onChange={(v) => onUpdatePersonalInfo("phone", v)}
                      className="text-white/90"
                    />
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-white/80" />
                    <EditableText
                      value={personalInfo.address}
                      placeholder="Địa chỉ"
                      onChange={(v) => onUpdatePersonalInfo("address", v)}
                      className="text-white/90"
                    />
                  </span>
                  {personalInfo.website && (
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-white/80" />
                      <EditableText
                        value={personalInfo.website}
                        placeholder="Website"
                        onChange={(v) => onUpdatePersonalInfo("website", v)}
                        className="text-white/90"
                      />
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
      ) : (
        /* Mini header tiếp nối */
        <div
          className="p-3 text-white flex justify-between items-center text-xs font-bold"
          style={{ backgroundColor: theme.primaryColor }}
        >
          <span>
            {personalInfo.fullName} • {personalInfo.jobTitle}
          </span>
          <span className="opacity-90 font-normal">Trang {pageData ? pageData.pageIndex + 1 : 2} / {pageData?.totalPages || 2}</span>
        </div>
      )}

      {/* BODY CARDS */}
      <div className={`p-6 ${spacingClass}`}>
        {/* SUMMARY CARD */}
        {isFirstPage && isSectionVisible("summary") && (personalInfo.summary || personalInfo.summary === "") && (
          <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200/80">
            <h2
              className="text-xs font-black uppercase tracking-wider mb-1 flex items-center gap-1.5"
              style={{ color: theme.primaryColor }}
            >
              <Star className="w-3.5 h-3.5" />
              Tổng quan năng lực
            </h2>
            <p className="text-xs leading-relaxed text-slate-700 m-0 text-justify">
              <EditableText
                value={personalInfo.summary}
                placeholder="Giới thiệu bản thân và mục tiêu nghề nghiệp..."
                onChange={(v) => onUpdatePersonalInfo("summary", v)}
                multiline
              />
            </p>
          </div>
        )}

        {/* 2 CỘT NỘI DUNG CHÍNH */}
        <div className="grid grid-cols-12 gap-4 items-start">
          {/* CỘT TRÁI (7/12) - KINH NGHIỆM */}
          <div className="col-span-7 space-y-3">
            {isSectionVisible("experience") && experiences.length > 0 && (
              <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 space-y-2.5">
                <h2
                  className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 pb-1"
                  style={{ color: theme.primaryColor }}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Kinh nghiệm làm việc {pageData && pageData.pageIndex > 0 ? "(Tiếp theo)" : ""}
                </h2>
                <DecorativeDivider decorations={theme.decorations} primaryColor={theme.primaryColor} className="my-0" />
                {experiences.map((exp) => (
                  <div key={exp.id} className="text-xs space-y-1">
                    <div className="flex justify-between items-baseline font-bold text-slate-900">
                      <span className="text-sm">
                        <EditableText
                          value={exp.position}
                          placeholder="Vị trí"
                          onChange={(v) => onUpdateExperience(exp.id, { position: v })}
                        />
                      </span>
                      <span className="text-[10px] font-normal text-slate-500">
                        {exp.startDate} - {exp.isCurrent ? "Hiện tại" : exp.endDate}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-600">
                      <EditableText
                        value={exp.company}
                        placeholder="Công ty"
                        onChange={(v) => onUpdateExperience(exp.id, { company: v })}
                      />
                    </div>
                    <div className="text-slate-700 leading-relaxed pt-0.5">
                      <EditableText
                        value={exp.description}
                        placeholder="Mô tả công việc..."
                        onChange={(v) => onUpdateExperience(exp.id, { description: v })}
                        multiline
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Dự án */}
            {isSectionVisible("projects") && projects.length > 0 && (
              <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 space-y-2">
                <h2
                  className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 pb-1"
                  style={{ color: theme.primaryColor }}
                >
                  Dự án thực hiện
                </h2>
                <DecorativeDivider decorations={theme.decorations} primaryColor={theme.primaryColor} className="my-0" />
                {projects.map((proj) => (
                  <div key={proj.id} className="text-xs space-y-0.5">
                    <div className="font-bold text-slate-900 flex justify-between">
                      <EditableText
                        value={proj.name}
                        placeholder="Tên dự án"
                        onChange={(v) => onUpdateProject(proj.id, { name: v })}
                      />
                      <span className="text-[10px] text-slate-500">{proj.startDate}</span>
                    </div>
                    <div className="text-slate-700 leading-relaxed">
                      <EditableText
                        value={proj.description}
                        placeholder="Mô tả..."
                        onChange={(v) => onUpdateProject(proj.id, { description: v })}
                        multiline
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CỘT PHẢI (5/12) - KỸ NĂNG, HỌC VẤN, CHỨNG CHỈ */}
          <div className="col-span-5 space-y-3">
            {/* Visual Skill Bars */}
            {isFirstPage && isSectionVisible("skills") && skills.length > 0 && (
              <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 space-y-2">
                <h2
                  className="text-xs font-black uppercase tracking-wider pb-1"
                  style={{ color: theme.primaryColor }}
                >
                  Kỹ năng trực quan
                </h2>
                <DecorativeDivider decorations={theme.decorations} primaryColor={theme.primaryColor} className="my-0" />
                <div className="space-y-2">
                  {skills.map((sk) => (
                    <div key={sk.id} className="text-xs space-y-1">
                      <div className="flex justify-between font-bold text-slate-800">
                        <EditableText
                          value={sk.name}
                          placeholder="Kỹ năng"
                          onChange={(v) => onUpdateSkill(sk.id, { name: v })}
                        />
                        <span className="text-[10px]" style={{ color: theme.primaryColor }}>
                          {sk.level * 20}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(sk.level / 5) * 100}%`,
                            backgroundColor: theme.primaryColor,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Học vấn Card */}
            {isSectionVisible("education") && educations.length > 0 && (
              <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 space-y-2">
                <h2
                  className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 pb-1"
                  style={{ color: theme.primaryColor }}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  Học vấn
                </h2>
                <DecorativeDivider decorations={theme.decorations} primaryColor={theme.primaryColor} className="my-0" />
                {educations.map((edu) => (
                  <div key={edu.id} className="text-xs space-y-0.5">
                    <div className="font-bold text-slate-900">
                      <EditableText
                        value={edu.school}
                        placeholder="Trường đào tạo"
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
            )}

            {/* Chứng chỉ Card */}
            {isFirstPage && isSectionVisible("certificates") && certificates.length > 0 && (
              <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 space-y-1.5">
                <h2
                  className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 pb-1"
                  style={{ color: theme.primaryColor }}
                >
                  <Award className="w-3.5 h-3.5" />
                  Chứng chỉ
                </h2>
                <DecorativeDivider decorations={theme.decorations} primaryColor={theme.primaryColor} className="my-0" />
                {certificates.map((cert) => (
                  <div key={cert.id} className="text-xs">
                    <div className="font-bold text-slate-900">
                      <EditableText
                        value={cert.name}
                        placeholder="Chứng chỉ"
                        onChange={(v) => onUpdateCertificate(cert.id, { name: v })}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {cert.issuer} ({cert.issueDate})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
