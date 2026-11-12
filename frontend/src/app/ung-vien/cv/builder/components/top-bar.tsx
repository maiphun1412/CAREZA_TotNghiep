"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button, Tooltip, Dropdown, MenuProps } from "antd";
import {
  UndoOutlined,
  RedoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
  DownloadOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
  CopyOutlined,
  HistoryOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { FileText } from "lucide-react";

interface TopBarProps {
  title: string;
  onUpdateTitle: (newTitle: string) => void;
  // History
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  lastSavedTime: string;
  // Zoom
  zoomLevel: number;
  onUpdateZoom: (zoom: number) => void;
  // Actions
  onResetTheme: () => void;
  onOpenPreviewModal: () => void;
  // Save & Export (Giai đoạn 2)
  isSaving?: boolean;
  saveStatus?: "idle" | "saving" | "saved" | "error";
  onSave?: (options?: { isDraft?: boolean; createNewVersion?: boolean }) => void;
  onDuplicate?: () => void;
  onExportPdf?: () => void;
  isExportingPdf?: boolean;
  currentCvId?: string | null;
  totalCvCount?: number;
  isMaxCvReached?: boolean;
}

export function TopBar({
  title,
  onUpdateTitle,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  lastSavedTime,
  zoomLevel,
  onUpdateZoom,
  onResetTheme,
  onOpenPreviewModal,
  isSaving = false,
  saveStatus = "idle",
  onSave,
  onDuplicate,
  onExportPdf,
  isExportingPdf = false,
  currentCvId,
  totalCvCount = 0,
  isMaxCvReached = false,
}: TopBarProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    if (tempTitle.trim()) {
      onUpdateTitle(tempTitle.trim());
    }
  };

  const zoomOptions = [50, 75, 90, 100, 110, 125, 150];

  const saveMenuItems: MenuProps["items"] = [
    {
      key: "save-normal",
      label: currentCvId ? "Cập nhật CV hiện tại" : "Lưu CV vào hệ thống",
      icon: <SaveOutlined />,
      onClick: () => onSave?.(),
    },
    {
      key: "save-draft",
      label: "Lưu dưới dạng Bản nháp (Draft)",
      icon: <FileText className="w-3.5 h-3.5 inline mr-1 text-slate-500" />,
      onClick: () => onSave?.({ isDraft: true }),
    },
    {
      type: "divider",
    },
    {
      key: "save-version",
      label: "Tạo phiên bản mới (New Version)",
      icon: <HistoryOutlined />,
      disabled: !currentCvId,
      onClick: () => onSave?.({ createNewVersion: true }),
    },
    {
      key: "duplicate",
      label: "Nhân bản CV này (Duplicate)",
      icon: <CopyOutlined />,
      disabled: totalCvCount >= 5,
      onClick: () => onDuplicate?.(),
    },
  ];

  return (
    <header className="w-full bg-white border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-2xs shrink-0 select-none">
      {/* KHỐI TRÁI: BACK + BREADCRUMB + TITLE + STATUS */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <Link
          href="/ung-vien/cv"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs no-underline"
        >
          <ArrowLeftOutlined />
          <span className="hidden sm:inline">Danh sách CV</span>
        </Link>

        <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

        {/* Editable Title */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 px-3 py-1 rounded-xl text-xs font-bold text-slate-800">
          <FileText className="w-3.5 h-3.5 text-[#0062ff] shrink-0" />
          {isEditingTitle ? (
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
              autoFocus
              className="border border-blue-400 outline-hidden bg-white px-1.5 py-0.5 rounded text-xs font-bold w-40 sm:w-52"
            />
          ) : (
            <span
              onClick={() => {
                setTempTitle(title);
                setIsEditingTitle(true);
              }}
              className="cursor-pointer hover:text-blue-600 truncate max-w-[150px] sm:max-w-[220px]"
              title="Nhấp để đổi tên bản CV"
            >
              {title}
            </span>
          )}
          <EditOutlined
            onClick={() => {
              setTempTitle(title);
              setIsEditingTitle(!isEditingTitle);
            }}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          />
        </div>

        {/* Trạng thái lưu Backend / Local */}
        {saveStatus === "saving" && (
          <div className="flex items-center gap-1.5 text-blue-600 text-xs font-bold bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200">
            <LoadingOutlined spin />
            <span>Đang lưu...</span>
          </div>
        )}

        {saveStatus === "saved" && (
          <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
            <CheckCircleOutlined />
            <span>Đã lưu {lastSavedTime}</span>
          </div>
        )}

        {saveStatus === "error" && (
          <div
            onClick={() => onSave?.()}
            className="cursor-pointer flex items-center gap-1 text-rose-600 text-xs font-bold bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200 hover:bg-rose-100"
            title="Lỗi khi lưu lên máy chủ. Bấm để thử lại."
          >
            <ExclamationCircleOutlined />
            <span>Lỗi lưu (Thử lại)</span>
          </div>
        )}

        {saveStatus === "idle" && lastSavedTime && (
          <div className="hidden md:flex items-center gap-1 text-slate-500 text-xs font-medium bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
            <CheckCircleOutlined className="text-slate-400" />
            <span>{lastSavedTime}</span>
          </div>
        )}

        {/* Cảnh báo đạt giới hạn 5 CV */}
        {isMaxCvReached && (
          <Tooltip title="Bạn đã lưu tối đa 5 CV trên CAREZA. Bạn vẫn có thể thoải mái thiết kế và bấm 'Xuất PDF' về máy tính. Vui lòng xóa một CV không còn sử dụng nếu muốn lưu bản CV này lên hệ thống.">
            <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 cursor-help shadow-2xs">
              <ExclamationCircleOutlined className="text-amber-500" />
              <span>Đã lưu 5/5 CV (Đạt giới hạn)</span>
            </div>
          </Tooltip>
        )}
      </div>

      {/* KHỐI PHẢI: ACTIONS (UNDO/REDO, ZOOM, RESET, SAVE, EXPORT PDF) */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Undo / Redo */}
        <div className="hidden sm:flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5">
          <Tooltip title="Hoàn tác (Undo)">
            <Button
              type="text"
              size="small"
              icon={<UndoOutlined />}
              disabled={!canUndo}
              onClick={onUndo}
              className="w-7 h-7 flex items-center justify-center text-slate-700"
            />
          </Tooltip>
          <Tooltip title="Làm lại (Redo)">
            <Button
              type="text"
              size="small"
              icon={<RedoOutlined />}
              disabled={!canRedo}
              onClick={onRedo}
              className="w-7 h-7 flex items-center justify-center text-slate-700"
            />
          </Tooltip>
        </div>

        {/* Zoom Controls */}
        <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-xl px-1.5 py-0.5 text-xs font-bold text-slate-700">
          <Button
            type="text"
            size="small"
            icon={<ZoomOutOutlined />}
            disabled={zoomLevel <= 50}
            onClick={() => onUpdateZoom(Math.max(50, zoomLevel - 10))}
            className="w-6 h-6 flex items-center justify-center"
          />

          <Dropdown
            menu={{
              items: zoomOptions.map((z) => ({
                key: String(z),
                label: `${z}%`,
                onClick: () => onUpdateZoom(z),
              })),
            }}
            trigger={["click"]}
          >
            <span className="cursor-pointer px-1.5 py-0.5 hover:bg-slate-200/50 rounded">
              {zoomLevel}%
            </span>
          </Dropdown>

          <Button
            type="text"
            size="small"
            icon={<ZoomInOutlined />}
            disabled={zoomLevel >= 150}
            onClick={() => onUpdateZoom(Math.min(150, zoomLevel + 10))}
            className="w-6 h-6 flex items-center justify-center"
          />
        </div>

        {/* Reset Theme */}
        <Tooltip title="Khôi phục thiết kế gốc của mẫu">
          <Button
            size="middle"
            icon={<ReloadOutlined />}
            onClick={onResetTheme}
            className="text-xs font-semibold rounded-xl hidden xl:inline-flex items-center"
          >
            Reset
          </Button>
        </Tooltip>

        {/* Fullscreen Preview Modal Button */}
        <Tooltip title="Xem trước bản in trên toàn màn hình">
          <Button
            icon={<FullscreenOutlined />}
            onClick={onOpenPreviewModal}
            className="text-xs font-semibold rounded-xl hidden sm:inline-flex items-center"
          >
            Xem trước
          </Button>
        </Tooltip>

        {/* NÚT LƯU CV + DROPDOWN OPTIONS */}
        {onSave && (
          <div className="inline-flex rounded-xl shadow-xs overflow-hidden">
            <Button
              type="primary"
              icon={isSaving ? <LoadingOutlined /> : <SaveOutlined />}
              loading={isSaving}
              onClick={() => onSave()}
              className="bg-[#0062ff] hover:bg-blue-700 text-xs font-bold rounded-r-none h-8.5 px-3 border-r border-blue-400"
            >
              {currentCvId ? "Lưu CV" : "Lưu CV mới"}
            </Button>
            <Dropdown menu={{ items: saveMenuItems }} trigger={["click"]} placement="bottomRight">
              <Button
                type="primary"
                icon={<DownOutlined className="text-[10px]" />}
                className="bg-[#0062ff] hover:bg-blue-700 rounded-l-none h-8.5 px-2 text-xs"
              />
            </Dropdown>
          </div>
        )}

        {/* NÚT XUẤT PDF CHUẨN A4 */}
        {onExportPdf && (
          <Button
            type="primary"
            icon={isExportingPdf ? <LoadingOutlined /> : <DownloadOutlined />}
            loading={isExportingPdf}
            onClick={onExportPdf}
            className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold rounded-xl h-8.5 px-3.5 shadow-xs"
          >
            Xuất PDF
          </Button>
        )}
      </div>
    </header>
  );
}
