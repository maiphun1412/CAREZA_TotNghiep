"use client";

import React, { useState } from "react";
import { ResumeData } from "../../types";
import { Button, Input, Slider, Checkbox, Collapse, Popconfirm, Tooltip } from "antd";
import {
  UserOutlined,
  BookOutlined,
  ToolOutlined,
  ProjectOutlined,
  SafetyCertificateOutlined,
  PlusOutlined,
  DeleteOutlined,
  SyncOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Briefcase } from "lucide-react";

interface ContentTabProps {
  data: ResumeData;
  onUpdatePersonalInfo: (field: keyof ResumeData["personalInfo"], val: string) => void;
  // Experience
  onAddExperience: () => void;
  onUpdateExperience: (id: string, updates: any) => void;
  onRemoveExperience: (id: string) => void;
  // Education
  onAddEducation: () => void;
  onUpdateEducation: (id: string, updates: any) => void;
  onRemoveEducation: (id: string) => void;
  // Skill
  onAddSkill: (name?: string, level?: number) => void;
  onUpdateSkill: (id: string, updates: any) => void;
  onRemoveSkill: (id: string) => void;
  // Project
  onAddProject: () => void;
  onUpdateProject: (id: string, updates: any) => void;
  onRemoveProject: (id: string) => void;
  // Certificate
  onAddCertificate: () => void;
  onUpdateCertificate: (id: string, updates: any) => void;
  onRemoveCertificate: (id: string) => void;
  // Sync
  onAutofill: () => void;
  isLoadingProfile: boolean;
  activeCollapseKeys?: string[];
  onChangeCollapseKeys?: (keys: string[]) => void;
}

export function ContentTab({
  data,
  onUpdatePersonalInfo,
  onAddExperience,
  onUpdateExperience,
  onRemoveExperience,
  onAddEducation,
  onUpdateEducation,
  onRemoveEducation,
  onAddSkill,
  onUpdateSkill,
  onRemoveSkill,
  onAddProject,
  onUpdateProject,
  onRemoveProject,
  onAddCertificate,
  onUpdateCertificate,
  onRemoveCertificate,
  onAutofill,
  isLoadingProfile,
  activeCollapseKeys,
  onChangeCollapseKeys,
}: ContentTabProps) {
  const { personalInfo, experiences, educations, skills, projects, certificates } = data;
  const [newSkillName, setNewSkillName] = useState("");

  const handleAddNewSkill = () => {
    if (newSkillName.trim()) {
      onAddSkill(newSkillName.trim(), 4);
      setNewSkillName("");
    }
  };

  const collapseItems = [
    {
      key: "info",
      label: (
        <span className="font-bold text-slate-800 flex items-center gap-2">
          <UserOutlined className="text-blue-600" />
          Thông tin cá nhân & Giới thiệu
        </span>
      ),
      children: (
        <div className="space-y-3 pt-1">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Họ và tên *</label>
            <Input
              value={personalInfo.fullName}
              placeholder="Nguyễn Văn A"
              onChange={(e) => onUpdatePersonalInfo("fullName", e.target.value)}
              size="middle"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Vị trí / Chức danh *</label>
            <Input
              value={personalInfo.jobTitle}
              placeholder="Fullstack Developer, Product Designer..."
              onChange={(e) => onUpdatePersonalInfo("jobTitle", e.target.value)}
              size="middle"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Email</label>
              <Input
                value={personalInfo.email}
                placeholder="email@domain.com"
                onChange={(e) => onUpdatePersonalInfo("email", e.target.value)}
                size="middle"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Số điện thoại</label>
              <Input
                value={personalInfo.phone}
                placeholder="0912 345 678"
                onChange={(e) => onUpdatePersonalInfo("phone", e.target.value)}
                size="middle"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Địa chỉ</label>
              <Input
                value={personalInfo.address}
                placeholder="TP. Hồ Chí Minh"
                onChange={(e) => onUpdatePersonalInfo("address", e.target.value)}
                size="middle"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Website / LinkedIn</label>
              <Input
                value={personalInfo.website}
                placeholder="linkedin.com/in/..."
                onChange={(e) => onUpdatePersonalInfo("website", e.target.value)}
                size="middle"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Đường dẫn ảnh đại diện (Avatar URL)</label>
            <Input
              value={personalInfo.avatarUrl}
              placeholder="https://... (URL ảnh)"
              onChange={(e) => onUpdatePersonalInfo("avatarUrl", e.target.value)}
              size="middle"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Tóm tắt giới thiệu bản thân</label>
            <Input.TextArea
              value={personalInfo.summary}
              placeholder="Giới thiệu điểm mạnh, định hướng sự nghiệp..."
              onChange={(e) => onUpdatePersonalInfo("summary", e.target.value)}
              rows={3}
            />
          </div>
        </div>
      ),
    },
    {
      key: "experience",
      label: (
        <span className="font-bold text-slate-800 flex items-center justify-between w-full pr-2">
          <span className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-600" />
            Kinh nghiệm làm việc ({experiences.length})
          </span>
        </span>
      ),
      children: (
        <div className="space-y-4 pt-1">
          {experiences.map((exp, index) => (
            <div key={exp.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 relative">
              <div className="flex justify-between items-center pb-1 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-700">Mục #{index + 1}</span>
                <Popconfirm title="Xóa mục kinh nghiệm này?" onConfirm={() => onRemoveExperience(exp.id)}>
                  <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                </Popconfirm>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Vị trí / Chức vụ"
                  value={exp.position}
                  onChange={(e) => onUpdateExperience(exp.id, { position: e.target.value })}
                  size="small"
                />
                <Input
                  placeholder="Công ty"
                  value={exp.company}
                  onChange={(e) => onUpdateExperience(exp.id, { company: e.target.value })}
                  size="small"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 items-center">
                <Input
                  placeholder="Bắt đầu (vd: 01/2023)"
                  value={exp.startDate}
                  onChange={(e) => onUpdateExperience(exp.id, { startDate: e.target.value })}
                  size="small"
                />
                <Input
                  placeholder="Kết thúc (vd: 12/2024)"
                  value={exp.endDate}
                  disabled={exp.isCurrent}
                  onChange={(e) => onUpdateExperience(exp.id, { endDate: e.target.value })}
                  size="small"
                />
              </div>
              <Checkbox
                checked={exp.isCurrent}
                onChange={(e) => onUpdateExperience(exp.id, { isCurrent: e.target.checked })}
                className="text-xs text-slate-600"
              >
                Đang làm việc tại đây
              </Checkbox>
              <Input.TextArea
                placeholder="Mô tả công việc và thành tựu..."
                value={exp.description}
                onChange={(e) => onUpdateExperience(exp.id, { description: e.target.value })}
                rows={2}
                size="small"
              />
            </div>
          ))}
          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={onAddExperience}
            className="text-emerald-600 border-emerald-300"
          >
            Thêm kinh nghiệm
          </Button>
        </div>
      ),
    },
    {
      key: "education",
      label: (
        <span className="font-bold text-slate-800 flex items-center justify-between w-full pr-2">
          <span className="flex items-center gap-2">
            <BookOutlined className="text-violet-600" />
            Học vấn ({educations.length})
          </span>
        </span>
      ),
      children: (
        <div className="space-y-4 pt-1">
          {educations.map((edu, index) => (
            <div key={edu.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-center pb-1 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-700">Học vấn #{index + 1}</span>
                <Popconfirm title="Xóa mục học vấn này?" onConfirm={() => onRemoveEducation(edu.id)}>
                  <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                </Popconfirm>
              </div>
              <Input
                placeholder="Tên trường (Đại học / Cao đẳng)"
                value={edu.school}
                onChange={(e) => onUpdateEducation(edu.id, { school: e.target.value })}
                size="small"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Chuyên ngành đào tạo"
                  value={edu.major}
                  onChange={(e) => onUpdateEducation(edu.id, { major: e.target.value })}
                  size="small"
                />
                <Input
                  placeholder="GPA (vd: 3.6/4.0)"
                  value={edu.gpa}
                  onChange={(e) => onUpdateEducation(edu.id, { gpa: e.target.value })}
                  size="small"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Bắt đầu (Năm)"
                  value={edu.startDate}
                  onChange={(e) => onUpdateEducation(edu.id, { startDate: e.target.value })}
                  size="small"
                />
                <Input
                  placeholder="Kết thúc (Năm)"
                  value={edu.endDate}
                  onChange={(e) => onUpdateEducation(edu.id, { endDate: e.target.value })}
                  size="small"
                />
              </div>
            </div>
          ))}
          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={onAddEducation}
            className="text-violet-600 border-violet-300"
          >
            Thêm học vấn
          </Button>
        </div>
      ),
    },
    {
      key: "skills",
      label: (
        <span className="font-bold text-slate-800 flex items-center justify-between w-full pr-2">
          <span className="flex items-center gap-2">
            <ToolOutlined className="text-amber-600" />
            Kỹ năng ({skills.length})
          </span>
        </span>
      ),
      children: (
        <div className="space-y-3 pt-1">
          <div className="flex gap-2">
            <Input
              placeholder="Nhập tên kỹ năng mới..."
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddNewSkill()}
              size="small"
            />
            <Button type="primary" size="small" onClick={handleAddNewSkill}>
              Thêm
            </Button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {skills.map((sk) => (
              <div key={sk.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    value={sk.name}
                    onChange={(e) => onUpdateSkill(sk.id, { name: e.target.value })}
                    size="small"
                    variant="borderless"
                    className="p-0 font-medium text-xs text-slate-800"
                  />
                  <div className="flex items-center gap-2">
                    <Slider
                      min={1}
                      max={5}
                      value={sk.level}
                      onChange={(v) => onUpdateSkill(sk.id, { level: v })}
                      className="m-0 flex-1"
                    />
                    <span className="text-[10px] text-slate-400 font-bold w-6 text-right">{sk.level}/5</span>
                  </div>
                </div>
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => onRemoveSkill(sk.id)}
                />
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: "projects",
      label: (
        <span className="font-bold text-slate-800 flex items-center justify-between w-full pr-2">
          <span className="flex items-center gap-2">
            <ProjectOutlined className="text-indigo-600" />
            Dự án ({projects.length})
          </span>
        </span>
      ),
      children: (
        <div className="space-y-4 pt-1">
          {projects.map((proj, index) => (
            <div key={proj.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-center pb-1 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-700">Dự án #{index + 1}</span>
                <Popconfirm title="Xóa dự án này?" onConfirm={() => onRemoveProject(proj.id)}>
                  <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                </Popconfirm>
              </div>
              <Input
                placeholder="Tên dự án"
                value={proj.name}
                onChange={(e) => onUpdateProject(proj.id, { name: e.target.value })}
                size="small"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Vai trò (vd: Frontend Lead)"
                  value={proj.role}
                  onChange={(e) => onUpdateProject(proj.id, { role: e.target.value })}
                  size="small"
                />
                <Input
                  placeholder="Thời gian (vd: 2024)"
                  value={proj.startDate}
                  onChange={(e) => onUpdateProject(proj.id, { startDate: e.target.value })}
                  size="small"
                />
              </div>
              <Input.TextArea
                placeholder="Mô tả công nghệ & kết quả..."
                value={proj.description}
                onChange={(e) => onUpdateProject(proj.id, { description: e.target.value })}
                rows={2}
                size="small"
              />
            </div>
          ))}
          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={onAddProject}
            className="text-indigo-600 border-indigo-300"
          >
            Thêm dự án
          </Button>
        </div>
      ),
    },
    {
      key: "certificates",
      label: (
        <span className="font-bold text-slate-800 flex items-center justify-between w-full pr-2">
          <span className="flex items-center gap-2">
            <SafetyCertificateOutlined className="text-rose-600" />
            Chứng chỉ ({certificates.length})
          </span>
        </span>
      ),
      children: (
        <div className="space-y-4 pt-1">
          {certificates.map((cert, index) => (
            <div key={cert.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-center pb-1 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-700">Chứng chỉ #{index + 1}</span>
                <Popconfirm title="Xóa chứng chỉ này?" onConfirm={() => onRemoveCertificate(cert.id)}>
                  <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                </Popconfirm>
              </div>
              <Input
                placeholder="Tên chứng chỉ"
                value={cert.name}
                onChange={(e) => onUpdateCertificate(cert.id, { name: e.target.value })}
                size="small"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Tổ chức cấp"
                  value={cert.issuer}
                  onChange={(e) => onUpdateCertificate(cert.id, { issuer: e.target.value })}
                  size="small"
                />
                <Input
                  placeholder="Năm cấp"
                  value={cert.issueDate}
                  onChange={(e) => onUpdateCertificate(cert.id, { issueDate: e.target.value })}
                  size="small"
                />
              </div>
            </div>
          ))}
          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={onAddCertificate}
            className="text-rose-600 border-rose-300"
          >
            Thêm chứng chỉ
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Nút đồng bộ từ hồ sơ CAREZA */}
      <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-blue-900 font-medium">
          <InfoCircleOutlined className="text-blue-600 text-sm" />
          <span>Đồng bộ từ hồ sơ cá nhân CAREZA</span>
        </div>
        <Tooltip title="Lấy học vấn, kinh nghiệm và kỹ năng thật từ hồ sơ ứng viên">
          <Button
            type="primary"
            size="small"
            icon={<SyncOutlined spin={isLoadingProfile} />}
            onClick={onAutofill}
            loading={isLoadingProfile}
            className="text-xs font-bold bg-[#0062ff]"
          >
            Điền tự động
          </Button>
        </Tooltip>
      </div>

      {/* Accordion form các section */}
      <Collapse
        items={collapseItems}
        activeKey={activeCollapseKeys}
        defaultActiveKey={["info", "experience"]}
        onChange={(keys) => onChangeCollapseKeys?.(Array.isArray(keys) ? (keys as string[]) : [keys as string])}
        className="bg-white border-slate-200"
      />
    </div>
  );
}
