"use client";

import React from "react";
import { ResumeData, ResumeTheme, CVTemplateId } from "../../types";
import { ContentTab } from "./content-tab";
import { TemplatesTab } from "./templates-tab";
import { DesignTab } from "./design-tab";
import { SectionsTab } from "./sections-tab";
import { AiTab } from "./ai-tab";
import {
  FileTextOutlined,
  AppstoreOutlined,
  BgColorsOutlined,
  UnorderedListOutlined,
  RobotOutlined,
} from "@ant-design/icons";

interface SidebarContainerProps {
  data: ResumeData;
  activeTab: "content" | "templates" | "design" | "sections" | "ai";
  setActiveTab: (tab: "content" | "templates" | "design" | "sections" | "ai") => void;
  // Personal Info
  onUpdatePersonalInfo: (field: keyof ResumeData["personalInfo"], val: string) => void;
  // Template
  onSelectTemplate: (tplId: CVTemplateId) => void;
  // Theme
  onUpdateTheme: (updater: Partial<ResumeTheme>) => void;
  onResetTheme: () => void;
  // Sections
  onToggleSectionVisibility: (id: string) => void;
  onMoveSection: (id: string, direction: "up" | "down") => void;
  onAddCustomSection: (title: string) => void;
  onRemoveSection: (id: string) => void;
  // Items
  onAddExperience: () => void;
  onUpdateExperience: (id: string, updates: any) => void;
  onRemoveExperience: (id: string) => void;
  onAddEducation: () => void;
  onUpdateEducation: (id: string, updates: any) => void;
  onRemoveEducation: (id: string) => void;
  onAddSkill: (name?: string, level?: number) => void;
  onUpdateSkill: (id: string, updates: any) => void;
  onRemoveSkill: (id: string) => void;
  onAddProject: () => void;
  onUpdateProject: (id: string, updates: any) => void;
  onRemoveProject: (id: string) => void;
  onAddCertificate: () => void;
  onUpdateCertificate: (id: string, updates: any) => void;
  onRemoveCertificate: (id: string) => void;
  // Profile Sync
  onAutofill: () => void;
  isLoadingProfile: boolean;
  // Controlled Collapse
  activeCollapseKeys?: string[];
  onChangeCollapseKeys?: (keys: string[]) => void;
  // Giai đoạn 3: AI
  currentCvId: number | null;
  aiEvaluation: any;
  isEvaluating: boolean;
  evalError: string | null;
  isEvaluationOutdated: boolean;
  onRunEvaluation: () => void;
  aiMatch: any;
  isMatching: boolean;
  matchError: string | null;
  onRunMatch: (params: { jobId?: number | null; jdText?: string }) => void;
  onNavigateSection: (sectionId: string) => void;
}

export function SidebarContainer({
  data,
  activeTab,
  setActiveTab,
  onUpdatePersonalInfo,
  onSelectTemplate,
  onUpdateTheme,
  onResetTheme,
  onToggleSectionVisibility,
  onMoveSection,
  onAddCustomSection,
  onRemoveSection,
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
  currentCvId,
  aiEvaluation,
  isEvaluating,
  evalError,
  isEvaluationOutdated,
  onRunEvaluation,
  aiMatch,
  isMatching,
  matchError,
  onRunMatch,
  onNavigateSection,
}: SidebarContainerProps) {
  const tabs = [
    { key: "content", label: "Nội dung", icon: <FileTextOutlined /> },
    { key: "templates", label: "Mẫu CV", icon: <AppstoreOutlined /> },
    { key: "design", label: "Thiết kế", icon: <BgColorsOutlined /> },
    { key: "sections", label: "Bố cục", icon: <UnorderedListOutlined /> },
    { key: "ai", label: "AI Đánh giá", icon: <RobotOutlined /> },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-white border-r border-slate-200">
      {/* Tab navigation buttons */}
      <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1 shrink-0 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const isAiTab = tab.key === "ai";
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2 px-1.5 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer border-none whitespace-nowrap ${
                isActive
                  ? isAiTab
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs"
                    : "bg-white text-[#0062ff] shadow-xs"
                  : isAiTab
                  ? "bg-blue-50/70 text-blue-700 hover:bg-blue-100/60"
                  : "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Body Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        {activeTab === "content" && (
          <ContentTab
            data={data}
            onUpdatePersonalInfo={onUpdatePersonalInfo}
            onAddExperience={onAddExperience}
            onUpdateExperience={onUpdateExperience}
            onRemoveExperience={onRemoveExperience}
            onAddEducation={onAddEducation}
            onUpdateEducation={onUpdateEducation}
            onRemoveEducation={onRemoveEducation}
            onAddSkill={onAddSkill}
            onUpdateSkill={onUpdateSkill}
            onRemoveSkill={onRemoveSkill}
            onAddProject={onAddProject}
            onUpdateProject={onUpdateProject}
            onRemoveProject={onRemoveProject}
            onAddCertificate={onAddCertificate}
            onUpdateCertificate={onUpdateCertificate}
            onRemoveCertificate={onRemoveCertificate}
            onAutofill={onAutofill}
            isLoadingProfile={isLoadingProfile}
            activeCollapseKeys={activeCollapseKeys}
            onChangeCollapseKeys={onChangeCollapseKeys}
          />
        )}

        {activeTab === "templates" && (
          <TemplatesTab
            currentTemplateId={data.theme.templateId}
            onSelectTemplate={onSelectTemplate}
          />
        )}

        {activeTab === "design" && (
          <DesignTab
            theme={data.theme}
            onUpdateTheme={onUpdateTheme}
            onResetTheme={onResetTheme}
          />
        )}

        {activeTab === "sections" && (
          <SectionsTab
            sections={data.sections}
            onToggleVisibility={onToggleSectionVisibility}
            onMoveSection={onMoveSection}
            onAddCustomSection={onAddCustomSection}
            onRemoveSection={onRemoveSection}
          />
        )}

        {activeTab === "ai" && (
          <AiTab
            data={data}
            currentCvId={currentCvId}
            onNavigateSection={onNavigateSection}
            aiEvaluation={aiEvaluation}
            isEvaluating={isEvaluating}
            evalError={evalError}
            isEvaluationOutdated={isEvaluationOutdated}
            onRunEvaluation={onRunEvaluation}
            aiMatch={aiMatch}
            isMatching={isMatching}
            matchError={matchError}
            onRunMatch={onRunMatch}
          />
        )}
      </div>
    </div>
  );
}
