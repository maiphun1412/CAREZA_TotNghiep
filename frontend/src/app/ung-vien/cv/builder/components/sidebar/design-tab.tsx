"use client";

import React from "react";
import { ResumeTheme } from "../../types";
import { COLOR_PALETTES, CV_FONTS } from "../../constants";
import { Select, Radio, Switch, Button, Popconfirm } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

interface DesignTabProps {
  theme: ResumeTheme;
  onUpdateTheme: (updater: Partial<ResumeTheme>) => void;
  onResetTheme: () => void;
}

export function DesignTab({ theme, onUpdateTheme, onResetTheme }: DesignTabProps) {
  return (
    <div className="space-y-6">
      {/* 1. MÀU SẮC CHỦ ĐẠO */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Màu sắc chủ đạo (Theme Color)
        </label>
        <div className="grid grid-cols-4 gap-2">
          {COLOR_PALETTES.map((pal) => {
            const isSelected = theme.primaryColor.toLowerCase() === pal.primary.toLowerCase();
            return (
              <button
                key={pal.name}
                type="button"
                onClick={() =>
                  onUpdateTheme({
                    primaryColor: pal.primary,
                    secondaryColor: pal.secondary,
                  })
                }
                className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${isSelected
                    ? "border-blue-600 bg-blue-50/50 shadow-2xs font-bold"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
              >
                <div
                  className="w-6 h-6 rounded-full shadow-xs border border-white"
                  style={{ backgroundColor: pal.primary }}
                />
                <span className="text-[10px] text-slate-700 leading-tight text-center">{pal.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tùy chỉnh màu tự chọn */}
        <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <span className="font-semibold text-slate-700">Tùy chọn mã màu riêng:</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={theme.primaryColor}
              onChange={(e) => onUpdateTheme({ primaryColor: e.target.value })}
              className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0"
            />
            <span className="font-mono text-slate-600 text-xs uppercase">{theme.primaryColor}</span>
          </div>
        </div>
      </div>

      {/* 2. FONT CHỮ */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Kiểu chữ (Font tiếng Việt)
        </label>
        <Select
          value={theme.fontFamily}
          onChange={(val) => onUpdateTheme({ fontFamily: val })}
          className="w-full"
          options={CV_FONTS.map((f) => ({ label: f.name, value: f.value }))}
        />

      </div>

      {/* 3. KÍCH THƯỚC CHỮ */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Cỡ chữ hiển thị
        </label>
        <Radio.Group
          value={theme.fontSize}
          onChange={(e) => onUpdateTheme({ fontSize: e.target.value })}
          buttonStyle="solid"
          className="w-full flex"
        >
          <Radio.Button value="small" className="flex-1 text-center text-xs">
            Nhỏ (Nén)
          </Radio.Button>
          <Radio.Button value="normal" className="flex-1 text-center text-xs">
            Vừa (Chuẩn)
          </Radio.Button>
          <Radio.Button value="large" className="flex-1 text-center text-xs">
            Lớn (Thoáng)
          </Radio.Button>
        </Radio.Group>
      </div>

      {/* 4. KHOẢNG CÁCH DÒNG & ĐOẠN */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Khoảng cách bố cục (Spacing)
        </label>
        <Radio.Group
          value={theme.spacing}
          onChange={(e) => onUpdateTheme({ spacing: e.target.value })}
          buttonStyle="solid"
          className="w-full flex"
        >
          <Radio.Button value="compact" className="flex-1 text-center text-xs">
            Chặt chẽ
          </Radio.Button>
          <Radio.Button value="normal" className="flex-1 text-center text-xs">
            Tiêu chuẩn
          </Radio.Button>
          <Radio.Button value="spacious" className="flex-1 text-center text-xs">
            Rộng rãi
          </Radio.Button>
        </Radio.Group>
      </div>

      {/* 5. CẤU HÌNH ẢNH ĐẠI DIỆN */}
      <div className="space-y-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">Hiển thị ảnh đại diện</span>
          <Switch
            checked={theme.showAvatar}
            onChange={(checked) => onUpdateTheme({ showAvatar: checked })}
          />
        </div>

        {theme.showAvatar && (
          <div className="space-y-1.5 pt-2 border-t border-slate-200">
            <span className="text-[11px] font-semibold text-slate-600 block">Kiểu dáng khung ảnh:</span>
            <Radio.Group
              value={theme.avatarStyle}
              onChange={(e) => onUpdateTheme({ avatarStyle: e.target.value })}
              size="small"
              className="flex"
            >
              <Radio.Button value="circle" className="flex-1 text-center text-xs">
                Tròn
              </Radio.Button>
              <Radio.Button value="rounded" className="flex-1 text-center text-xs">
                Bo góc
              </Radio.Button>
              <Radio.Button value="square" className="flex-1 text-center text-xs">
                Vuông
              </Radio.Button>
            </Radio.Group>
          </div>
        )}
      </div>

      {/* 6. HỌA TIẾT & TRANG TRÍ CÓ KIỂM SOÁT */}
      <div className="space-y-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Họa tiết & Trang trí có kiểm soát
        </label>

        {/* Kiểu đường kẻ */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-600 block">Kiểu đường kẻ (Divider):</span>
          <Select
            value={theme.decorations?.dividerStyle || "solid"}
            onChange={(val) =>
              onUpdateTheme({
                decorations: { ...theme.decorations, dividerStyle: val },
              })
            }
            className="w-full"
            size="small"
            options={[
              { label: "Nét liền (Solid)", value: "solid" },
              { label: "Nét đứt (Dashed)", value: "dashed" },
              { label: "Chấm bi (Dotted)", value: "dotted" },
              { label: "Đường đôi (Double)", value: "double" },
              { label: "Dải màu (Gradient)", value: "gradient" },
              { label: "Không đường kẻ (None)", value: "none" },
            ]}
          />
        </div>

        {/* Họa tiết Header */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-600 block">Điểm nhấn tiêu đề (Pattern):</span>
          <Select
            value={theme.decorations?.headerPattern || "accent-corner"}
            onChange={(val) =>
              onUpdateTheme({
                decorations: { ...theme.decorations, headerPattern: val },
              })
            }
            className="w-full"
            size="small"
            options={[
              { label: "Góc nhấn thương hiệu (Accent Corner)", value: "accent-corner" },
              { label: "Dải banner trên đỉnh (Top Banner)", value: "top-banner" },
              { label: "Họa tiết chấm bi (Dots Pattern)", value: "dots" },
              { label: "Khối hình học (Geometric)", value: "geometric" },
              { label: "Tối giản không họa tiết (None)", value: "none" },
            ]}
          />
        </div>

        {/* Kiểu viền thẻ */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-600 block">Khung viền nội dung (Cards):</span>
          <Radio.Group
            value={theme.decorations?.cardBorder || "subtle"}
            onChange={(e) =>
              onUpdateTheme({
                decorations: { ...theme.decorations, cardBorder: e.target.value },
              })
            }
            size="small"
            className="flex w-full"
          >
            <Radio.Button value="none" className="flex-1 text-center text-xs">
              Phẳng
            </Radio.Button>
            <Radio.Button value="subtle" className="flex-1 text-center text-xs">
              Mờ nhẹ
            </Radio.Button>
            <Radio.Button value="accent" className="flex-1 text-center text-xs">
              Màu nhấn
            </Radio.Button>
            <Radio.Button value="bordered" className="flex-1 text-center text-xs">
              Viền đậm
            </Radio.Button>
          </Radio.Group>
        </div>
      </div>

      {/* 7. RESET THEME */}
      <div className="pt-2">
        <Popconfirm
          title="Khôi phục thiết kế mặc định?"
          description="Màu sắc, font và khoảng cách sẽ trở về cấu hình gốc của mẫu hiện tại."
          onConfirm={onResetTheme}
          okText="Đồng ý"
          cancelText="Hủy"
        >
          <Button block icon={<ReloadOutlined />} danger className="text-xs font-semibold">
            Khôi phục thiết kế gốc
          </Button>
        </Popconfirm>
      </div>
    </div>
  );
}
