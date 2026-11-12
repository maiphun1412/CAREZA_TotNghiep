"use client";

import React from "react";
import { ResumeData } from "../../types";
import { PaginatedPageData } from "../../utils/pagination";
import { EditableText } from "./editable-text";
import { DecorativeDivider, DecorativeHeaderPattern } from "./decorations";
import { Mail, Phone, MapPin, Globe, Award, Briefcase, GraduationCap, Code2, FolderGit2 } from "lucide-react";

interface ModernTwoColumnProps {
  data: ResumeData;
  pageData?: PaginatedPageData;
  onUpdatePersonalInfo: (field: keyof ResumeData["personalInfo"], val: string) => void;
  onUpdateExperience: (id: string, updates: any) => void;
  onUpdateEducation: (id: string, updates: any) => void;
  onUpdateSkill: (id: string, updates: any) => void;
  onUpdateProject: (id: string, updates: any) => void;
  onUpdateCertificate: (id: string, updates: any) => void;
}

export function ModernTwoColumnTemplate({
  data,
  pageData,
  onUpdatePersonalInfo,
  onUpdateExperience,
  onUpdateEducation,
  onUpdateSkill,
  onUpdateProject,
  onUpdateCertificate,
}: ModernTwoColumnProps) {
  const { personalInfo, sections, theme } = data;
  const isSectionVisible = (id: string) => sections.find((s) => s.id === id)?.visible ?? true;

  // Lấy dữ liệu phân trang nếu có, nếu không thì lấy toàn bộ
  const isFirstPage = !pageData || pageData.pageIndex === 0;
  const experiences = pageData ? pageData.experiences : data.experiences;
  const educations = pageData ? pageData.educations : data.educations;
  const projects = pageData ? pageData.projects : data.projects;
  const skills = pageData ? pageData.sidebarSkills : data.skills;
  const certificates = pageData ? pageData.sidebarCertificates : data.certificates;

  const avatarRadius =
    theme.avatarStyle === "circle" ? "rounded-full" : theme.avatarStyle === "rounded" ? "rounded-2xl" : "rounded-none";

  const spacingClass =
    theme.spacing === "compact" ? "space-y-2.5" : theme.spacing === "spacious" ? "space-y-5" : "space-y-3.5";

  return (
    <div
      className="w-full h-full flex flex-row text-slate-800 bg-white relative overflow-hidden"
      style={{ fontFamily: theme.fontFamily }}
    >
      {/* Họa tiết trang trí góc đỉnh */}
      {isFirstPage && (
        <DecorativeHeaderPattern
          decorations={theme.decorations}
          primaryColor={theme.primaryColor}
        />
      )}

      {/* CỘT TRÁI - SIDEBAR 34% */}
      <aside
        className="w-[34%] shrink-0 p-6 flex flex-col gap-5 border-r border-slate-200/50"
        style={{ backgroundColor: theme.secondaryColor || "#f1f5f9" }}
      >
        {isFirstPage ? (
          <>
            {/* Avatar */}
            {theme.showAvatar && (
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-32 h-32 overflow-hidden border-4 bg-white shadow-sm flex items-center justify-center ${avatarRadius}`}
                  style={{ borderColor: theme.primaryColor }}
                >
                  {personalInfo.avatarUrl ? (
                    <img
                      src={personalInfo.avatarUrl}
                      alt={personalInfo.fullName || "Avatar"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-black text-slate-300">
                      {personalInfo.fullName ? personalInfo.fullName.charAt(0).toUpperCase() : "CV"}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Thông tin liên hệ */}
            {isSectionVisible("info") && (
              <div className="space-y-2.5">
                <h3
                  className="text-xs font-black uppercase tracking-wider pb-1"
                  style={{ color: theme.primaryColor }}
                >
                  Thông tin liên hệ
                </h3>
                <DecorativeDivider decorations={theme.decorations} primaryColor={theme.primaryColor} className="my-1" />
                <ul className="text-[12px] space-y-2 list-none p-0 m-0">
                  <li className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: theme.primaryColor }} />
                    <EditableText
                      value={personalInfo.email}
                      placeholder="email@example.com"
                      onChange={(v) => onUpdatePersonalInfo("email", v)}
                      className="text-slate-700 break-all"
                    />
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: theme.primaryColor }} />
                    <EditableText
                      value={personalInfo.phone}
                      placeholder="0912 345 678"
                      onChange={(v) => onUpdatePersonalInfo("phone", v)}
                      className="text-slate-700"
                    />
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: theme.primaryColor }} />
                    <EditableText
                      value={personalInfo.address}
                      placeholder="TP. Hồ Chí Minh"
                      onChange={(v) => onUpdatePersonalInfo("address", v)}
                      className="text-slate-700"
                    />
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 shrink-0" style={{ color: theme.primaryColor }} />
                    <EditableText
                      value={personalInfo.website}
                      placeholder="linkedin.com/in/ban"
                      onChange={(v) => onUpdatePersonalInfo("website", v)}
                      className="text-slate-700 break-all"
                    />
                  </li>
                </ul>
              </div>
            )}

            {/* Kỹ năng */}
            {isSectionVisible("skills") && skills.length > 0 && (
              <div className="space-y-2.5">
                <h3
                  className="text-xs font-black uppercase tracking-wider pb-1 flex items-center gap-1.5"
                  style={{ color: theme.primaryColor }}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  Kỹ năng chuyên môn
                </h3>
                <DecorativeDivider decorations={theme.decorations} primaryColor={theme.primaryColor} className="my-1" />
                <div className="space-y-2">
                  {skills.map((sk) => (
                    <div key={sk.id} className="text-xs space-y-1">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <EditableText
                          value={sk.name}
                          placeholder="Tên kỹ năng"
                          onChange={(v) => onUpdateSkill(sk.id, { name: v })}
                        />
                        <span className="text-[10px] text-slate-500">{sk.level}/5</span>
                      </div>
                      <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
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

            {/* Chứng chỉ */}
            {isSectionVisible("certificates") && certificates.length > 0 && (
              <div className="space-y-2.5">
                <h3
                  className="text-xs font-black uppercase tracking-wider pb-1 flex items-center gap-1.5"
                  style={{ color: theme.primaryColor }}
                >
                  <Award className="w-3.5 h-3.5" />
                  Chứng chỉ
                </h3>
                <DecorativeDivider decorations={theme.decorations} primaryColor={theme.primaryColor} className="my-1" />
                <div className="space-y-2">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="text-xs">
                      <div className="font-bold text-slate-800">
                        <EditableText
                          value={cert.name}
                          placeholder="Tên chứng chỉ"
                          onChange={(v) => onUpdateCertificate(cert.id, { name: v })}
                        />
                      </div>
                      <div className="text-[11px] text-slate-500 flex justify-between">
                        <EditableText
                          value={cert.issuer}
                          placeholder="Tổ chức cấp"
                          onChange={(v) => onUpdateCertificate(cert.id, { issuer: v })}
                        />
                        <EditableText
                          value={cert.issueDate}
                          placeholder="Năm cấp"
                          onChange={(v) => onUpdateCertificate(cert.id, { issueDate: v })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Sidebar tiếp nối ở Trang 2, 3 */
          <div className="space-y-4 pt-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-300">
              {personalInfo.fullName || "Hồ sơ ứng viên"}
            </div>
            <div className="text-[10px] text-slate-400 italic leading-relaxed">
              Trang tiếp theo của bản hồ sơ ứng tuyển CAREZA.
            </div>
          </div>
        )}
      </aside>

      {/* CỘT PHẢI - NỘI DUNG CHÍNH 66% */}
      <main className={`flex-1 p-8 ${spacingClass}`}>
        {isFirstPage ? (
          <>
            {/* Header Họ tên & Vị trí */}
            <div className="pb-2">
              <h1 className="text-3xl font-black tracking-tight leading-tight m-0 text-slate-900">
                <EditableText
                  value={personalInfo.fullName}
                  placeholder="HỌ VÀ TÊN ỨNG VIÊN"
                  onChange={(v) => onUpdatePersonalInfo("fullName", v)}
                />
              </h1>
              <div
                className="text-base font-bold uppercase tracking-wider mt-1"
                style={{ color: theme.primaryColor }}
              >
                <EditableText
                  value={personalInfo.jobTitle}
                  placeholder="VỊ TRÍ ỨNG TUYỂN / CHUYÊN MÔN"
                  onChange={(v) => onUpdatePersonalInfo("jobTitle", v)}
                />
              </div>
              <DecorativeDivider decorations={theme.decorations} primaryColor={theme.primaryColor} className="mt-2" />
            </div>

            {/* Giới thiệu bản thân */}
            {isSectionVisible("summary") && (personalInfo.summary || personalInfo.summary === "") && (
              <section className="space-y-1">
                <h2
                  className="text-xs font-black uppercase tracking-wider flex items-center gap-2"
                  style={{ color: theme.primaryColor }}
                >
                  Mục tiêu & Giới thiệu
                </h2>
                <p className="text-[13px] leading-relaxed text-slate-700 m-0 text-justify">
                  <EditableText
                    value={personalInfo.summary}
                    placeholder="Mô tả ngắn gọn về định hướng nghề nghiệp, kinh nghiệm cốt lõi..."
                    onChange={(v) => onUpdatePersonalInfo("summary", v)}
                    multiline
                  />
                </p>
              </section>
            )}
          </>
        ) : (
          /* Mini Header tiếp nối ở Trang 2, 3 */
          <div className="pb-3 border-b flex justify-between items-center text-xs text-slate-400" style={{ borderColor: `${theme.primaryColor}30` }}>
            <span className="font-bold text-slate-700">
              {personalInfo.fullName} • {personalInfo.jobTitle}
            </span>
            <span className="italic font-medium">Tiếp theo (Trang {pageData ? pageData.pageIndex + 1 : 2})</span>
          </div>
        )}

        {/* Kinh nghiệm làm việc (Chỉ render các mục thuộc trang này) */}
        {isSectionVisible("experience") && experiences.length > 0 && (
          <section className="space-y-3">
            <h2
              className="text-xs font-black uppercase tracking-wider flex items-center gap-2 pb-0.5"
              style={{ color: theme.primaryColor }}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Kinh nghiệm làm việc {pageData && pageData.pageIndex > 0 ? "(Tiếp theo)" : ""}
            </h2>
            <DecorativeDivider decorations={theme.decorations} primaryColor={theme.primaryColor} className="my-0" />
            {experiences.map((exp) => (
              <div key={exp.id} className="space-y-1 text-xs">
                <div className="flex flex-wrap items-baseline justify-between font-bold">
                  <span className="text-slate-900 text-sm">
                    <EditableText
                      value={exp.position}
                      placeholder="Chức danh / Vị trí"
                      onChange={(v) => onUpdateExperience(exp.id, { position: v })}
                    />
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
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
                <div className="font-semibold text-slate-600 italic">
                  <EditableText
                    value={exp.company}
                    placeholder="Tên công ty"
                    onChange={(v) => onUpdateExperience(exp.id, { company: v })}
                  />
                  {exp.location && <span> • {exp.location}</span>}
                </div>
                <div className="text-slate-700 leading-relaxed pt-0.5">
                  <EditableText
                    value={exp.description}
                    placeholder="Mô tả công việc thực hiện, kết quả đạt được..."
                    onChange={(v) => onUpdateExperience(exp.id, { description: v })}
                    multiline
                  />
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Học vấn */}
        {isSectionVisible("education") && educations.length > 0 && (
          <section className="space-y-2.5">
            <h2
              className="text-xs font-black uppercase tracking-wider flex items-center gap-2 pb-0.5"
              style={{ color: theme.primaryColor }}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Học vấn
            </h2>
            <DecorativeDivider decorations={theme.decorations} primaryColor={theme.primaryColor} className="my-0" />
            {educations.map((edu) => (
              <div key={edu.id} className="space-y-0.5 text-xs">
                <div className="flex flex-wrap items-baseline justify-between font-bold">
                  <span className="text-slate-900 text-sm">
                    <EditableText
                      value={edu.school}
                      placeholder="Trường đại học / Cao đẳng"
                      onChange={(v) => onUpdateEducation(edu.id, { school: v })}
                    />
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    <EditableText
                      value={edu.startDate}
                      placeholder="Bắt đầu"
                      onChange={(v) => onUpdateEducation(edu.id, { startDate: v })}
                    />
                    {" - "}
                    <EditableText
                      value={edu.endDate}
                      placeholder="Kết thúc"
                      onChange={(v) => onUpdateEducation(edu.id, { endDate: v })}
                    />
                  </span>
                </div>
                <div className="font-medium text-slate-600">
                  <EditableText
                    value={edu.major}
                    placeholder="Chuyên ngành đào tạo"
                    onChange={(v) => onUpdateEducation(edu.id, { major: v })}
                  />
                  {edu.gpa && <span className="ml-2 font-bold">• GPA: {edu.gpa}</span>}
                </div>
                {edu.description && (
                  <p className="text-slate-700 leading-relaxed m-0">
                    <EditableText
                      value={edu.description}
                      placeholder="Mô tả thêm..."
                      onChange={(v) => onUpdateEducation(edu.id, { description: v })}
                      multiline
                    />
                  </p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Dự án */}
        {isSectionVisible("projects") && projects.length > 0 && (
          <section className="space-y-2.5">
            <h2
              className="text-xs font-black uppercase tracking-wider flex items-center gap-2 pb-0.5"
              style={{ color: theme.primaryColor }}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              Dự án tiêu biểu
            </h2>
            <DecorativeDivider decorations={theme.decorations} primaryColor={theme.primaryColor} className="my-0" />
            {projects.map((proj) => (
              <div key={proj.id} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-900">
                    <EditableText
                      value={proj.name}
                      placeholder="Tên dự án"
                      onChange={(v) => onUpdateProject(proj.id, { name: v })}
                    />
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {proj.startDate} - {proj.endDate}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 italic">
                  Vai trò:{" "}
                  <EditableText
                    value={proj.role}
                    placeholder="Trưởng nhóm, Lập trình viên..."
                    onChange={(v) => onUpdateProject(proj.id, { role: v })}
                  />
                </div>
                <div className="text-slate-700 leading-relaxed">
                  <EditableText
                    value={proj.description}
                    placeholder="Mô tả mục tiêu, kết quả dự án..."
                    onChange={(v) => onUpdateProject(proj.id, { description: v })}
                    multiline
                  />
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
