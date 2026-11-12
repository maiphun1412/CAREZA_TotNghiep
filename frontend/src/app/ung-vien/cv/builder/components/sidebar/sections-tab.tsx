"use client";

import React, { useState } from "react";
import { SectionConfig } from "../../types";
import { Switch, Button, Input, Popconfirm } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined,
  DeleteOutlined,
  HolderOutlined,
} from "@ant-design/icons";

interface SectionsTabProps {
  sections: SectionConfig[];
  onToggleVisibility: (id: string) => void;
  onMoveSection: (id: string, direction: "up" | "down") => void;
  onAddCustomSection: (title: string) => void;
  onRemoveSection: (id: string) => void;
}

export function SectionsTab({
  sections,
  onToggleVisibility,
  onMoveSection,
  onAddCustomSection,
  onRemoveSection,
}: SectionsTabProps) {
  const [newTitle, setNewTitle] = useState("");

  const handleAdd = () => {
    if (newTitle.trim()) {
      onAddCustomSection(newTitle.trim());
      setNewTitle("");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-black text-slate-800 m-0">Quản lý các Mục trong CV</h3>
        <p className="text-xs text-slate-500 m-0 mt-1">
          Bật/tắt để ẩn hoặc hiện mục trên trang in; bấm mũi tên để đổi vị trí hiển thị.
        </p>
      </div>

      {/* Danh sách các section hiện có */}
      <div className="space-y-2">
        {sections.map((sec, index) => {
          const isFirst = index === 0;
          const isLast = index === sections.length - 1;

          return (
            <div
              key={sec.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                sec.visible
                  ? "bg-white border-slate-200 shadow-2xs"
                  : "bg-slate-100/70 border-slate-200 text-slate-400 opacity-70"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <HolderOutlined className="text-slate-400 cursor-grab" />
                <span className="text-xs font-bold text-slate-800 truncate">{sec.title}</span>
                {sec.type === "custom" && (
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                    Tùy chỉnh
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Di chuyển lên/xuống */}
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowUpOutlined />}
                  disabled={isFirst}
                  onClick={() => onMoveSection(sec.id, "up")}
                  className="w-7 h-7"
                />
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowDownOutlined />}
                  disabled={isLast}
                  onClick={() => onMoveSection(sec.id, "down")}
                  className="w-7 h-7"
                />

                {/* Ẩn / Hiện */}
                <Switch
                  size="small"
                  checked={sec.visible}
                  onChange={() => onToggleVisibility(sec.id)}
                />

                {/* Xóa nếu là custom section */}
                {sec.type === "custom" && (
                  <Popconfirm title="Xóa mục tùy chỉnh này?" onConfirm={() => onRemoveSection(sec.id)}>
                    <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                  </Popconfirm>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Thêm mục tùy chỉnh mới */}
      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
        <label className="text-xs font-bold text-slate-800 block">Thêm mục mới vào CV</label>
        <div className="flex gap-2">
          <Input
            placeholder="Ví dụ: Giải thưởng, Hoạt động ngoại khóa..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            size="small"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="small"
            onClick={handleAdd}
            className="bg-[#0062ff]"
          >
            Thêm
          </Button>
        </div>
      </div>
    </div>
  );
}
