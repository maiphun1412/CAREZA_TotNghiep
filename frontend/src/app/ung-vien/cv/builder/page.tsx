"use client";

import React, { useState } from "react";
import { useCvBuilder } from "./hooks/use-cv-builder";
import { TopBar } from "./components/top-bar";
import { SidebarContainer } from "./components/sidebar/sidebar-container";
import { A4Canvas } from "./components/preview/a4-canvas";
import { Modal, Segmented } from "antd";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";

export default function CvBuilderPage() {
  const {
    resumeData,
    updateResumeData,
    updatePersonalInfo,
    changeTemplate,
    updateTheme,
    resetTheme,
    undo,
    redo,
    canUndo,
    canRedo,
    lastSavedTime,
    toggleSectionVisibility,
    moveSection,
    addCustomSection,
    removeSection,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addSkill,
    updateSkill,
    removeSkill,
    addProject,
    updateProject,
    removeProject,
    addCertificate,
    updateCertificate,
    removeCertificate,
    autofillFromProfile,
    isLoadingProfile,
    activeTab,
    setActiveTab,
    zoomLevel,
    setZoomLevel,
    // Giai đoạn 2: Lưu & Xuất PDF
    isSaving,
    saveStatus,
    saveCv,
    duplicateCv,
    exportPdf,
    isExportingPdf,
    currentCvId,
    totalCvCount,
    isMaxCvReached,
    // Giai đoạn 3: AI
    activeCollapseKeys,
    setActiveCollapseKeys,
    aiEvaluation,
    isEvaluating,
    evalError,
    isEvaluationOutdated,
    runAiEvaluation,
    aiMatch,
    isMatching,
    matchError,
    runCvJdMatch,
    jumpToSection,
  } = useCvBuilder();

  // Responsive mode trên màn hình nhỏ: "edit" | "preview"
  const [mobileMode, setMobileMode] = useState<"edit" | "preview">("edit");
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  return (
    <div className="w-full h-screen flex flex-col bg-[#f5f8ff] overflow-hidden">
      {/* 1. TOPBAR ĐIỀU KHIỂN CHÍNH */}
      <TopBar
        title={resumeData.title}
        onUpdateTitle={(title) => updateResumeData((prev) => ({ ...prev, title }))}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        lastSavedTime={lastSavedTime}
        zoomLevel={zoomLevel}
        onUpdateZoom={setZoomLevel}
        onResetTheme={resetTheme}
        onOpenPreviewModal={() => setIsPreviewModalOpen(true)}
        isSaving={isSaving}
        saveStatus={saveStatus}
        onSave={saveCv}
        onDuplicate={duplicateCv}
        onExportPdf={exportPdf}
        isExportingPdf={isExportingPdf}
        currentCvId={currentCvId ? String(currentCvId) : null}
        totalCvCount={totalCvCount}
        isMaxCvReached={isMaxCvReached}
      />

      {/* MOBILE SEGMENTED SWITCHER (Chỉ hiển thị trên màn hình nhỏ) */}
      <div className="lg:hidden bg-white p-2 border-b border-slate-200 flex justify-center shrink-0">
        <Segmented
          value={mobileMode}
          onChange={(val) => setMobileMode(val as "edit" | "preview")}
          options={[
            {
              value: "edit",
              label: (
                <span className="flex items-center gap-1.5 font-bold text-xs px-2 py-1">
                  <EditOutlined />
                  <span>Chỉnh sửa nội dung</span>
                </span>
              ),
            },
            {
              value: "preview",
              label: (
                <span className="flex items-center gap-1.5 font-bold text-xs px-2 py-1">
                  <EyeOutlined />
                  <span>Xem trước A4</span>
                </span>
              ),
            },
          ]}
        />
      </div>

      {/* 2. KHÔNG GIAN LÀM VIỆC CHÍNH (STUDIO WORKSPACE) */}
      <div className="flex-1 flex overflow-hidden">
        {/* CỘT TRÁI: SIDEBAR ĐIỀU KHIỂN (Ẩn trên mobile nếu đang ở tab preview) */}
        <aside
          className={`w-full lg:w-[440px] xl:w-[480px] shrink-0 h-full overflow-hidden ${
            mobileMode === "preview" ? "hidden lg:flex" : "flex"
          }`}
        >
          <SidebarContainer
            data={resumeData}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onUpdatePersonalInfo={updatePersonalInfo}
            onSelectTemplate={changeTemplate}
            onUpdateTheme={updateTheme}
            onResetTheme={resetTheme}
            onToggleSectionVisibility={toggleSectionVisibility}
            onMoveSection={moveSection}
            onAddCustomSection={addCustomSection}
            onRemoveSection={removeSection}
            onAddExperience={addExperience}
            onUpdateExperience={updateExperience}
            onRemoveExperience={removeExperience}
            onAddEducation={addEducation}
            onUpdateEducation={updateEducation}
            onRemoveEducation={removeEducation}
            onAddSkill={addSkill}
            onUpdateSkill={updateSkill}
            onRemoveSkill={removeSkill}
            onAddProject={addProject}
            onUpdateProject={updateProject}
            onRemoveProject={removeProject}
            onAddCertificate={addCertificate}
            onUpdateCertificate={updateCertificate}
            onRemoveCertificate={removeCertificate}
            onAutofill={() => autofillFromProfile(false)}
            isLoadingProfile={isLoadingProfile}
            activeCollapseKeys={activeCollapseKeys}
            onChangeCollapseKeys={setActiveCollapseKeys}
            currentCvId={currentCvId}
            aiEvaluation={aiEvaluation}
            isEvaluating={isEvaluating}
            evalError={evalError}
            isEvaluationOutdated={isEvaluationOutdated}
            onRunEvaluation={runAiEvaluation}
            aiMatch={aiMatch}
            isMatching={isMatching}
            matchError={matchError}
            onRunMatch={runCvJdMatch}
            onNavigateSection={jumpToSection}
          />
        </aside>

        {/* CỘT PHẢI: KHU VỰC PREVIEW CANVAS A4 (Ẩn trên mobile nếu đang ở tab edit) */}
        <main
          className={`flex-1 h-full overflow-auto ${
            mobileMode === "edit" ? "hidden lg:flex" : "flex"
          }`}
        >
          <A4Canvas
            data={resumeData}
            zoomLevel={zoomLevel}
            onUpdatePersonalInfo={updatePersonalInfo}
            onUpdateExperience={updateExperience}
            onUpdateEducation={updateEducation}
            onUpdateSkill={updateSkill}
            onUpdateProject={updateProject}
            onUpdateCertificate={updateCertificate}
          />
        </main>
      </div>

      {/* MODAL FULLSCREEN PREVIEW A4 */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <EyeOutlined className="text-blue-600" />
            <span>Xem trước Bản in Chuẩn Khổ Giấy A4</span>
          </div>
        }
        open={isPreviewModalOpen}
        onCancel={() => setIsPreviewModalOpen(false)}
        footer={null}
        width={940}
        styles={{ body: { maxHeight: "80vh", overflowY: "auto", padding: "16px 0", background: "#f1f5f9" } }}
      >
        <A4Canvas
          data={resumeData}
          zoomLevel={100}
          onUpdatePersonalInfo={updatePersonalInfo}
          onUpdateExperience={updateExperience}
          onUpdateEducation={updateEducation}
          onUpdateSkill={updateSkill}
          onUpdateProject={updateProject}
          onUpdateCertificate={updateCertificate}
        />
      </Modal>
    </div>
  );
}
