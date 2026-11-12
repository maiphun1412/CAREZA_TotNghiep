"use client";

import React from "react";
import { ResumeData } from "../../types";
import { PaginatedPageData } from "../../utils/pagination";
import { EditableText } from "./editable-text";
import { DecorativeDivider } from "./decorations";

interface ClassicExecutiveProps {
  data: ResumeData;
  pageData?: PaginatedPageData;
  onUpdatePersonalInfo: (field: keyof ResumeData["personalInfo"], val: string) => void;
  onUpdateExperience: (id: string, updates: any) => void;
  onUpdateEducation: (id: string, updates: any) => void;
  onUpdateSkill: (id: string, updates: any) => void;
  onUpdateProject: (id: string, updates: any) => void;
  onUpdateCertificate: (id: string, updates: any) => void;
}

export function ClassicExecutiveTemplate({
  data,
  pageData,
  onUpdatePersonalInfo,
  onUpdateExperience,
  onUpdateEducation,
  onUpdateSkill,
  onUpdateProject,
  onUpdateCertificate,
}: ClassicExecutiveProps) {
  const { personalInfo, sections, theme } = data;
  const isSectionVisible = (id: string) => sections.find((s) => s.id === id)?.visible ?? true;

  const isFirstPage = !pageData || pageData.pageIndex === 0;
  const experiences = pageData ? pageData.experiences : data.experiences;
  const educations = pageData ? pageData.educations : data.educations;
  const projects = pageData ? pageData.projects : data.projects;
  const skills = pageData ? pageData.skills : data.skills;
  const certificates = pageData ? pageData.certificates : data.certificates;

  const spacingClass =
    theme.spacing === "compact" ? "space-y-3" : theme.spacing === "spacious" ? "space-y-5" : "space-y-4";

  return (
    <div
      className={`w-full h-full p-8 sm:p-10 bg-white text-slate-800 relative overflow-hidden ${spacingClass}`}
      style={{ fontFamily: theme.fontFamily }}
    >
      {/* 1-COLUMN CENTERED HEADER (Chỉ hiện ở Trang 1) */}
      {isFirstPage ? (
        <header className="text-center pb-2">
          {theme.showAvatar && personalInfo.avatarUrl && (
            <div className="flex justify-center mb-2.5">
              <img
                src={personalInfo.avatarUrl}
                alt="Avatar"
                className={`w-20 h-20 object-cover border border-slate-300 ${
                  theme.avatarStyle === "circle"
                    ? "rounded-full"
                    : theme.avatarStyle === "rounded"
                    ? "rounded-lg"
                    : "rounded-none"
                }`}
              />
            </div>
          )}

          <h1
            className="text-3xl font-extrabold tracking-wide uppercase m-0"
            style={{ color: theme.primaryColor }}
          >
            <EditableText
              value={personalInfo.fullName}
              placeholder="HỌ VÀ TÊN ỨNG VIÊN"
              onChange={(v) => onUpdatePersonalInfo("fullName", v)}
            />
          </h1>
          <div className="text-sm font-semibold tracking-wider text-slate-600 mt-0.5 uppercase">
            <EditableText
              value={personalInfo.jobTitle}
              placeholder="VỊ TRÍ CHUYÊN GIA / QUẢN LÝ"
              onChange={(v) => onUpdatePersonalInfo("jobTitle", v)}
            />
          </div>

          {/* Contact info inline */}
          {isSectionVisible("info") && (
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-2">
              <span>
                <EditableText
                  value={personalInfo.email}
                  placeholder="email@example.com"
                  onChange={(v) => onUpdatePersonalInfo("email", v)}
                />
              </span>
              <span>•</span>
              <span>
                <EditableText
                  value={personalInfo.phone}
                  placeholder="0912 345 678"
                  onChange={(v) => onUpdatePersonalInfo("phone", v)}
                />
              </span>
              <span>•</span>
              <span>
                <EditableText
                  value={personalInfo.address}
                  placeholder="Địa chỉ"
                  onChange={(v) => onUpdatePersonalInfo("address", v)}
                />
              </span>
              {personalInfo.website && (
                <>
                  <span>•</span>
                  <span>
                    <EditableText
                      value={personalInfo.website}
                      placeholder="Website / LinkedIn"
                      onChange={(v) => onUpdatePersonalInfo("website", v)}
                    />
                  </span>
                </>
              )}
            </div>
          )}

          <DecorativeDivider decorations={theme.decorations} primaryColor={theme.primaryColor} className="mt-2 mb-0" />
        </header>
      ) : (
        /* Mini Continued Header ở Trang 2, 3 */
        <div className="flex justify-between items-center pb-2 border-b border-slate-200 text-xs text-slate-500 mb-2">
          <span className="font-bold text-slate-800 uppercase tracking-wider">
            {personalInfo.fullName} • {personalInfo.jobTitle}
          </span>
          <span className="italic">Trang {pageData ? pageData.pageIndex + 1 : 2} / {pageData?.totalPages || 2}</span>
        </div>
      )}

      {/* SUMMARY (Chỉ hiện ở Trang 1) */}
      {isFirstPage && isSectionVisible("summary") && (personalInfo.summary || personalInfo.summary === "") && (
        <section className="space-y-1">
          <h2
            className="text-xs font-black uppercase tracking-widest pb-0.5"
            style={{ color: theme.primaryColor }}
          >
            TÓM TẮT NĂNG LỰC
          </h2>
          <DecorativeDivider decorations={theme.decorations} primaryColor={theme.primaryColor} className="my-0" />
          <p className="text-xs leading-relaxed text-slate-700 m-0 text-justify">
            <EditableText
              value={personalInfo.summary}
              placeholder="Tóm tắt kinh nghiệm làm việc, năng lực lãnh đạo và thành tích nổi bật..."
              onChange={(v) => onUpdatePersonalInfo("summary", v)}
              multiline
            />
          </p>
        </section>
      )}

      {/* WORK EXPERIENCE */}
      {isSectionVisible("experience") && experiences.length > 0 && (
        <section className="space-y-2.5">
          <h2
            className="text-xs font-black uppercase tracking-widest pb-0.5"
            style={{ color: theme.primaryColor }}
          >
            KINH NGHIỆM CHUYÊN MÔN {pageData && pageData.pageIndex > 0 ? "(TIẾP THEO)" : ""}
          </h2>
          <DecorativeDivider decorations={theme.decorations} primaryColor={theme.primaryColor} className="my-0" />
          {experiences.map((exp) => (
            <div key={exp.id} className="space-y-1 text-xs">
              <div className="flex justify-between items-baseline font-bold text-slate-900">
                <span className="text-sm">
                  <EditableText
                    value={exp.position}
                    placeholder="Chức vụ"
                    onChange={(v) => onUpdateExperience(exp.id, { position: v })}
                  />
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  <EditableText
                    value={exp.startDate}
                    placeholder="Bắt đầu"
                    onChange={(v) => onUpdateExperience(exp.id, { startDate: v })}
                  />
                  {" - "}
                  <EditableText
                    value={exp.isCurrent ? "Hiện tại" : exp.endDate}
                    placeholder="Kết thúc"
                    onChange={(v) => onUpdateExperience(exp.id, { endDate: v })}
                  />
                </span>
              </div>
              <div className="text-xs italic text-slate-600 font-semibold">
                <EditableText
                  value={exp.company}
                  placeholder="Tên cơ quan / Doanh nghiệp"
                  onChange={(v) => onUpdateExperience(exp.id, { company: v })}
                />
                {exp.location && <span> | {exp.location}</span>}
              </div>
              <div className="text-slate-700 leading-relaxed text-justify">
                <EditableText
                  value={exp.description}
                  placeholder="Trách nhiệm chính và các đóng góp giá trị..."
                  onChange={(v) => onUpdateExperience(exp.id, { description: v })}
                  multiline
                />
              </div>
            </div>
          ))}
        </section>
      )}

      {/* EDUCATION */}
      {isSectionVisible("education") && educations.length > 0 && (
        <section className="space-y-2">
          <h2
            className="text-xs font-black uppercase tracking-widest pb-0.5"
            style={{ color: theme.primaryColor }}
          >
            HỌC VẤN & BẰNG CẤP
          </h2>
          <DecorativeDivider decorations={theme.decorations} primaryColor={theme.primaryColor} className="my-0" />
          {educations.map((edu) => (
            <div key={edu.id} className="space-y-0.5 text-xs">
              <div className="flex justify-between items-baseline font-bold text-slate-900">
                <span>
                  <EditableText
                    value={edu.school}
                    placeholder="Trường đại học"
                    onChange={(v) => onUpdateEducation(edu.id, { school: v })}
                  />
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
              <div className="text-slate-600">
                <EditableText
                  value={edu.major}
                  placeholder="Chuyên ngành"
                  onChange={(v) => onUpdateEducation(edu.id, { major: v })}
                />
                {edu.gpa && <span className="font-semibold"> • GPA: {edu.gpa}</span>}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* SKILLS */}
      {isSectionVisible("skills") && skills.length > 0 && (
        <section className="space-y-2">
          <h2
            className="text-xs font-black uppercase tracking-widest pb-0.5"
            style={{ color: theme.primaryColor }}
          >
            KỸ NĂNG CỐT LÕI
          </h2>
          <DecorativeDivider decorations={theme.decorations} primaryColor={theme.primaryColor} className="my-0" />
          <div className="flex flex-wrap gap-2 text-xs">
            {skills.map((sk) => (
              <span
                key={sk.id}
                className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded border border-slate-200 font-medium"
              >
                <EditableText
                  value={sk.name}
                  placeholder="Kỹ năng"
                  onChange={(v) => onUpdateSkill(sk.id, { name: v })}
                />
              </span>
            ))}
          </div>
        </section>
      )}

      {/* PROJECTS */}
      {isSectionVisible("projects") && projects.length > 0 && (
        <section className="space-y-2">
          <h2
            className="text-xs font-black uppercase tracking-widest pb-0.5"
            style={{ color: theme.primaryColor }}
          >
            DỰ ÁN TIÊU BIỂU
          </h2>
          <DecorativeDivider decorations={theme.decorations} primaryColor={theme.primaryColor} className="my-0" />
          {projects.map((proj) => (
            <div key={proj.id} className="space-y-1 text-xs">
              <div className="flex justify-between font-bold text-slate-900">
                <EditableText
                  value={proj.name}
                  placeholder="Tên dự án"
                  onChange={(v) => onUpdateProject(proj.id, { name: v })}
                />
                <span className="text-[11px] font-normal text-slate-500">
                  {proj.startDate} - {proj.endDate}
                </span>
              </div>
              <div className="text-slate-700 leading-relaxed">
                <EditableText
                  value={proj.description}
                  placeholder="Mô tả dự án"
                  onChange={(v) => onUpdateProject(proj.id, { description: v })}
                  multiline
                />
              </div>
            </div>
          ))}
        </section>
      )}

      {/* CERTIFICATES */}
      {isSectionVisible("certificates") && certificates.length > 0 && (
        <section className="space-y-2">
          <h2
            className="text-xs font-black uppercase tracking-widest pb-0.5"
            style={{ color: theme.primaryColor }}
          >
            CHỨNG CHỈ HÀNH NGHỀ
          </h2>
          <DecorativeDivider decorations={theme.decorations} primaryColor={theme.primaryColor} className="my-0" />
          <div className="grid grid-cols-2 gap-2 text-xs">
            {certificates.map((cert) => (
              <div key={cert.id} className="border-l-2 pl-2" style={{ borderColor: theme.primaryColor }}>
                <div className="font-bold text-slate-900">
                  <EditableText
                    value={cert.name}
                    placeholder="Tên chứng chỉ"
                    onChange={(v) => onUpdateCertificate(cert.id, { name: v })}
                  />
                </div>
                <div className="text-[11px] text-slate-500">
                  {cert.issuer} {cert.issueDate ? `(${cert.issueDate})` : ""}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
