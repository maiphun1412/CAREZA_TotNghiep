"use client";

import React from "react";
import { ResumeData } from "../../types";
import { PaginatedPageData } from "../../utils/pagination";
import { EditableText } from "./editable-text";
import { DecorativeDivider } from "./decorations";

interface CompactDenseProps {
  data: ResumeData;
  pageData?: PaginatedPageData;
  onUpdatePersonalInfo: (field: keyof ResumeData["personalInfo"], val: string) => void;
  onUpdateExperience: (id: string, updates: any) => void;
  onUpdateEducation: (id: string, updates: any) => void;
  onUpdateSkill: (id: string, updates: any) => void;
  onUpdateProject: (id: string, updates: any) => void;
  onUpdateCertificate: (id: string, updates: any) => void;
}

export function CompactDenseTemplate({
  data,
  pageData,
  onUpdatePersonalInfo,
  onUpdateExperience,
  onUpdateEducation,
  onUpdateSkill,
  onUpdateProject,
  onUpdateCertificate,
}: CompactDenseProps) {
  const { personalInfo, sections, theme } = data;
  const isSectionVisible = (id: string) => sections.find((s) => s.id === id)?.visible ?? true;

  const isFirstPage = !pageData || pageData.pageIndex === 0;
  const experiences = pageData ? pageData.experiences : data.experiences;
  const educations = pageData ? pageData.educations : data.educations;
  const projects = pageData ? pageData.projects : data.projects;
  const skills = pageData ? pageData.sidebarSkills : data.skills;
  const certificates = pageData ? pageData.sidebarCertificates : data.certificates;

  return (
    <div
      className="w-full h-full p-6 bg-white text-slate-800 space-y-2.5 relative overflow-hidden"
      style={{ fontFamily: theme.fontFamily }}
    >
      {/* COMPACT HEADER (Chỉ hiện ở Trang 1) */}
      {isFirstPage ? (
        <header className="flex justify-between items-center pb-1">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight m-0" style={{ color: theme.primaryColor }}>
              <EditableText
                value={personalInfo.fullName}
                placeholder="HỌ VÀ TÊN"
                onChange={(v) => onUpdatePersonalInfo("fullName", v)}
              />
            </h1>
            <div className="text-xs font-bold text-slate-700 uppercase">
              <EditableText
                value={personalInfo.jobTitle}
                placeholder="VỊ TRÍ ỨNG TUYỂN"
                onChange={(v) => onUpdatePersonalInfo("jobTitle", v)}
              />
            </div>
          </div>

          {/* Compact Contact items */}
          {isSectionVisible("info") && (
            <div className="text-right text-[11px] text-slate-600 leading-tight">
              <div>
                <EditableText
                  value={personalInfo.email}
                  placeholder="email@domain.com"
                  onChange={(v) => onUpdatePersonalInfo("email", v)}
                />{" "}
                |{" "}
                <EditableText
                  value={personalInfo.phone}
                  placeholder="0912 345 678"
                  onChange={(v) => onUpdatePersonalInfo("phone", v)}
                />
              </div>
              <div>
                <EditableText
                  value={personalInfo.address}
                  placeholder="Địa chỉ"
                  onChange={(v) => onUpdatePersonalInfo("address", v)}
                />
                {personalInfo.website && (
                  <>
                    {" "}
                    |{" "}
                    <EditableText
                      value={personalInfo.website}
                      placeholder="Website"
                      onChange={(v) => onUpdatePersonalInfo("website", v)}
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </header>
      ) : (
        /* Mini header trang tiếp nối */
        <div className="flex justify-between items-center pb-2 border-b border-slate-200 text-xs text-slate-500 mb-1">
          <span className="font-bold text-slate-800">
            {personalInfo.fullName} • {personalInfo.jobTitle}
          </span>
          <span className="italic">Trang {pageData ? pageData.pageIndex + 1 : 2} / {pageData?.totalPages || 2}</span>
        </div>
      )}

      {isFirstPage && (
        <DecorativeDivider decorations={theme.decorations} primaryColor={theme.primaryColor} className="my-1" />
      )}

      {/* SUMMARY */}
      {isFirstPage && isSectionVisible("summary") && (personalInfo.summary || personalInfo.summary === "") && (
        <section className="text-[11px] text-slate-700 leading-relaxed text-justify">
          <EditableText
            value={personalInfo.summary}
            placeholder="Tóm tắt ngắn gọn kỹ năng và kinh nghiệm trọng tâm..."
            onChange={(v) => onUpdatePersonalInfo("summary", v)}
            multiline
          />
        </section>
      )}

      {/* 2-COLUMN DENSE GRID */}
      <div className="grid grid-cols-12 gap-3.5 items-start">
        {/* CỘT CHÍNH (7/12) - KINH NGHIỆM & DỰ ÁN */}
        <div className="col-span-7 space-y-2.5">
          {/* Work Experience */}
          {isSectionVisible("experience") && experiences.length > 0 && (
            <section className="space-y-1">
              <h2
                className="text-[11px] font-black uppercase tracking-wider pb-0.5"
                style={{ color: theme.primaryColor }}
              >
                Kinh nghiệm làm việc {pageData && pageData.pageIndex > 0 ? "(Tiếp)" : ""}
              </h2>
              <DecorativeDivider decorations={theme.decorations} primaryColor={theme.primaryColor} className="my-0" />
              {experiences.map((exp) => (
                <div key={exp.id} className="text-[11px] space-y-0.5">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>
                      <EditableText
                        value={exp.position}
                        placeholder="Vị trí"
                        onChange={(v) => onUpdateExperience(exp.id, { position: v })}
                      />
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      {exp.startDate} - {exp.isCurrent ? "Nay" : exp.endDate}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-600 italic">
                    <EditableText
                      value={exp.company}
                      placeholder="Công ty"
                      onChange={(v) => onUpdateExperience(exp.id, { company: v })}
                    />
                  </div>
                  <div className="text-slate-700 leading-snug">
                    <EditableText
                      value={exp.description}
                      placeholder="Mô tả công việc..."
                      onChange={(v) => onUpdateExperience(exp.id, { description: v })}
                      multiline
                    />
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Projects */}
          {isSectionVisible("projects") && projects.length > 0 && (
            <section className="space-y-1">
              <h2
                className="text-[11px] font-black uppercase tracking-wider pb-0.5"
                style={{ color: theme.primaryColor }}
              >
                Dự án nổi bật
              </h2>
              <DecorativeDivider decorations={theme.decorations} primaryColor={theme.primaryColor} className="my-0" />
              {projects.map((proj) => (
                <div key={proj.id} className="text-[11px] space-y-0.5">
                  <div className="flex justify-between font-bold text-slate-900">
                    <EditableText
                      value={proj.name}
                      placeholder="Tên dự án"
                      onChange={(v) => onUpdateProject(proj.id, { name: v })}
                    />
                    <span className="text-[10px] text-slate-500 font-normal">{proj.startDate}</span>
                  </div>
                  <div className="text-slate-700 leading-snug">
                    <EditableText
                      value={proj.description}
                      placeholder="Mô tả dự án..."
                      onChange={(v) => onUpdateProject(proj.id, { description: v })}
                      multiline
                    />
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>

        {/* CỘT PHỤ (5/12) - HỌC VẤN, KỸ NĂNG, CHỨNG CHỈ */}
        <div className="col-span-5 space-y-2.5">
          {/* Education */}
          {isSectionVisible("education") && educations.length > 0 && (
            <section className="space-y-1">
              <h2
                className="text-[11px] font-black uppercase tracking-wider pb-0.5"
                style={{ color: theme.primaryColor }}
              >
                Học vấn
              </h2>
              <DecorativeDivider decorations={theme.decorations} primaryColor={theme.primaryColor} className="my-0" />
              {educations.map((edu) => (
                <div key={edu.id} className="text-[11px] space-y-0.5">
                  <div className="font-bold text-slate-900">
                    <EditableText
                      value={edu.school}
                      placeholder="Trường"
                      onChange={(v) => onUpdateEducation(edu.id, { school: v })}
                    />
                  </div>
                  <div className="text-slate-600 flex justify-between">
                    <span>
                      <EditableText
                        value={edu.major}
                        placeholder="Chuyên ngành"
                        onChange={(v) => onUpdateEducation(edu.id, { major: v })}
                      />
                    </span>
                    <span className="text-[10px] text-slate-500">{edu.endDate}</span>
                  </div>
                  {edu.gpa && <div className="text-[10px] text-slate-500">GPA: {edu.gpa}</div>}
                </div>
              ))}
            </section>
          )}

          {/* Skills */}
          {isFirstPage && isSectionVisible("skills") && skills.length > 0 && (
            <section className="space-y-1">
              <h2
                className="text-[11px] font-black uppercase tracking-wider pb-0.5"
                style={{ color: theme.primaryColor }}
              >
                Kỹ năng chuyên môn
              </h2>
              <DecorativeDivider decorations={theme.decorations} primaryColor={theme.primaryColor} className="my-0" />
              <div className="flex flex-wrap gap-1 text-[10px]">
                {skills.map((sk) => (
                  <span
                    key={sk.id}
                    className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200 font-medium"
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

          {/* Certificates */}
          {isFirstPage && isSectionVisible("certificates") && certificates.length > 0 && (
            <section className="space-y-1">
              <h2
                className="text-[11px] font-black uppercase tracking-wider pb-0.5"
                style={{ color: theme.primaryColor }}
              >
                Chứng chỉ
              </h2>
              <DecorativeDivider decorations={theme.decorations} primaryColor={theme.primaryColor} className="my-0" />
              {certificates.map((cert) => (
                <div key={cert.id} className="text-[11px]">
                  <div className="font-semibold text-slate-900">
                    <EditableText
                      value={cert.name}
                      placeholder="Tên chứng chỉ"
                      onChange={(v) => onUpdateCertificate(cert.id, { name: v })}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {cert.issuer} ({cert.issueDate})
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
