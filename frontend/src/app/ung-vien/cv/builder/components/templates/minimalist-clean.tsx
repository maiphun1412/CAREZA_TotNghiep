"use client";

import React from "react";
import { ResumeData } from "../../types";
import { PaginatedPageData } from "../../utils/pagination";
import { EditableText } from "./editable-text";
import { DecorativeDivider } from "./decorations";

interface MinimalistCleanProps {
  data: ResumeData;
  pageData?: PaginatedPageData;
  onUpdatePersonalInfo: (field: keyof ResumeData["personalInfo"], val: string) => void;
  onUpdateExperience: (id: string, updates: any) => void;
  onUpdateEducation: (id: string, updates: any) => void;
  onUpdateSkill: (id: string, updates: any) => void;
  onUpdateProject: (id: string, updates: any) => void;
  onUpdateCertificate: (id: string, updates: any) => void;
}

export function MinimalistCleanTemplate({
  data,
  pageData,
  onUpdatePersonalInfo,
  onUpdateExperience,
  onUpdateEducation,
  onUpdateSkill,
  onUpdateProject,
  onUpdateCertificate,
}: MinimalistCleanProps) {
  const { personalInfo, sections, theme } = data;
  const isSectionVisible = (id: string) => sections.find((s) => s.id === id)?.visible ?? true;

  const isFirstPage = !pageData || pageData.pageIndex === 0;
  const experiences = pageData ? pageData.experiences : data.experiences;
  const educations = pageData ? pageData.educations : data.educations;
  const projects = pageData ? pageData.projects : data.projects;
  const skills = pageData ? pageData.skills : data.skills;
  const certificates = pageData ? pageData.certificates : data.certificates;

  const spacingClass =
    theme.spacing === "compact" ? "space-y-3.5" : theme.spacing === "spacious" ? "space-y-6" : "space-y-4.5";

  return (
    <div
      className={`w-full h-full p-8 sm:p-12 bg-white text-slate-800 relative overflow-hidden ${spacingClass}`}
      style={{ fontFamily: theme.fontFamily }}
    >
      {/* HEADER (Chỉ hiện ở Trang 1) */}
      {isFirstPage ? (
        <header className="flex justify-between items-start pb-4">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-slate-900 m-0">
              <EditableText
                value={personalInfo.fullName}
                placeholder="Họ và Tên"
                onChange={(v) => onUpdatePersonalInfo("fullName", v)}
              />
            </h1>
            <div className="text-sm font-medium tracking-wide mt-1 text-slate-500">
              <EditableText
                value={personalInfo.jobTitle}
                placeholder="Chuyên môn / Vị trí nghề nghiệp"
                onChange={(v) => onUpdatePersonalInfo("jobTitle", v)}
              />
            </div>
          </div>

          {/* Contact info list */}
          {isSectionVisible("info") && (
            <div className="text-right text-xs text-slate-500 space-y-1">
              <div>
                <EditableText
                  value={personalInfo.email}
                  placeholder="email@domain.com"
                  onChange={(v) => onUpdatePersonalInfo("email", v)}
                />
              </div>
              <div>
                <EditableText
                  value={personalInfo.phone}
                  placeholder="Số điện thoại"
                  onChange={(v) => onUpdatePersonalInfo("phone", v)}
                />
              </div>
              <div>
                <EditableText
                  value={personalInfo.address}
                  placeholder="Địa chỉ cư trú"
                  onChange={(v) => onUpdatePersonalInfo("address", v)}
                />
              </div>
              {personalInfo.website && (
                <div>
                  <EditableText
                    value={personalInfo.website}
                    placeholder="Website"
                    onChange={(v) => onUpdatePersonalInfo("website", v)}
                  />
                </div>
              )}
            </div>
          )}
        </header>
      ) : (
        /* Mini Continued Header ở Trang 2, 3 */
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 text-xs text-slate-400 mb-2">
          <span className="font-semibold text-slate-700">
            {personalInfo.fullName} • {personalInfo.jobTitle}
          </span>
          <span className="italic">Trang {pageData ? pageData.pageIndex + 1 : 2} / {pageData?.totalPages || 2}</span>
        </div>
      )}

      {isFirstPage && (
        <DecorativeDivider decorations={theme.decorations} primaryColor={theme.primaryColor} className="mb-4 mt-0" />
      )}

      {/* SUMMARY */}
      {isFirstPage && isSectionVisible("summary") && (personalInfo.summary || personalInfo.summary === "") && (
        <section className="grid grid-cols-12 gap-6">
          <div className="col-span-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Giới thiệu
          </div>
          <div className="col-span-9 text-xs leading-relaxed text-slate-700 text-justify">
            <EditableText
              value={personalInfo.summary}
              placeholder="Mô tả định hướng, giá trị bản thân trong công việc..."
              onChange={(v) => onUpdatePersonalInfo("summary", v)}
              multiline
            />
          </div>
        </section>
      )}

      {/* WORK EXPERIENCE */}
      {isSectionVisible("experience") && experiences.length > 0 && (
        <section className="grid grid-cols-12 gap-6 pt-1">
          <div className="col-span-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Kinh nghiệm {pageData && pageData.pageIndex > 0 ? "(Tiếp)" : ""}
          </div>
          <div className="col-span-9 space-y-3.5">
            {experiences.map((exp) => (
              <div key={exp.id} className="space-y-0.5 text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-slate-900 text-sm">
                    <EditableText
                      value={exp.position}
                      placeholder="Vị trí làm việc"
                      onChange={(v) => onUpdateExperience(exp.id, { position: v })}
                    />
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {exp.startDate} - {exp.isCurrent ? "Hiện tại" : exp.endDate}
                  </span>
                </div>
                <div className="text-slate-500 font-medium">
                  <EditableText
                    value={exp.company}
                    placeholder="Công ty"
                    onChange={(v) => onUpdateExperience(exp.id, { company: v })}
                  />
                </div>
                <div className="text-slate-600 leading-relaxed pt-0.5">
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
        </section>
      )}

      {/* EDUCATION */}
      {isSectionVisible("education") && educations.length > 0 && (
        <section className="grid grid-cols-12 gap-6 pt-2">
          <div className="col-span-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Học vấn
          </div>
          <div className="col-span-9 space-y-2.5">
            {educations.map((edu) => (
              <div key={edu.id} className="space-y-0.5 text-xs">
                <div className="flex justify-between items-baseline font-semibold text-slate-900">
                  <EditableText
                    value={edu.school}
                    placeholder="Trường đào tạo"
                    onChange={(v) => onUpdateEducation(edu.id, { school: v })}
                  />
                  <span className="text-[11px] text-slate-400 font-normal">
                    {edu.startDate} - {edu.endDate}
                  </span>
                </div>
                <div className="text-slate-500">
                  <EditableText
                    value={edu.major}
                    placeholder="Ngành học"
                    onChange={(v) => onUpdateEducation(edu.id, { major: v })}
                  />
                  {edu.gpa && <span className="ml-2 font-medium">• GPA: {edu.gpa}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SKILLS */}
      {isSectionVisible("skills") && skills.length > 0 && (
        <section className="grid grid-cols-12 gap-6 pt-2">
          <div className="col-span-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Kỹ năng
          </div>
          <div className="col-span-9 flex flex-wrap gap-2 text-xs">
            {skills.map((sk) => (
              <span
                key={sk.id}
                className="bg-slate-50 text-slate-700 px-2.5 py-1 rounded border border-slate-200"
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
        <section className="grid grid-cols-12 gap-6 pt-2">
          <div className="col-span-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Dự án
          </div>
          <div className="col-span-9 space-y-2.5">
            {projects.map((proj) => (
              <div key={proj.id} className="space-y-0.5 text-xs">
                <div className="flex justify-between font-semibold text-slate-900">
                  <EditableText
                    value={proj.name}
                    placeholder="Tên dự án"
                    onChange={(v) => onUpdateProject(proj.id, { name: v })}
                  />
                  <span className="text-[11px] text-slate-400 font-normal">
                    {proj.startDate} - {proj.endDate}
                  </span>
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

      {/* CERTIFICATES */}
      {isSectionVisible("certificates") && certificates.length > 0 && (
        <section className="grid grid-cols-12 gap-6 pt-2">
          <div className="col-span-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Chứng chỉ
          </div>
          <div className="col-span-9 space-y-2 text-xs">
            {certificates.map((cert) => (
              <div key={cert.id} className="flex justify-between">
                <span className="font-semibold text-slate-800">
                  <EditableText
                    value={cert.name}
                    placeholder="Tên chứng chỉ"
                    onChange={(v) => onUpdateCertificate(cert.id, { name: v })}
                  />
                  <span className="text-slate-400 font-normal ml-2">— {cert.issuer}</span>
                </span>
                <span className="text-slate-400 text-[11px]">{cert.issueDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
