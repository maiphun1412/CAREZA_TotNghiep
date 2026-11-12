"use client";

import React, { useState } from "react";
import { Dropdown, Modal, DatePicker, Button, message } from "antd";
import type { MenuProps } from "antd";
import { Download, Calendar, Check, FileSpreadsheet } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

export interface ExportColumnDef {
  header: string;
  key?: string;
  render?: (item: any, index: number) => string | number;
}

export interface CarezaExportReportProps {
  buttonText?: string;
  reportTitle?: string;
  companyName?: string;
  recruiterName?: string;
  data: any[];
  columns: ExportColumnDef[];
  dateField?: string; // Tên trường ngày trong item (ví dụ "publishedAt" hoặc "createdAt")
  filenamePrefix?: string;
  extraStats?: { label: string; value: any }[];
  className?: string;
}

type PresetKey = "today" | "week" | "month" | "6months" | "year" | "custom";

export function CarezaExportReport({
  buttonText = "Xuất báo cáo",
  reportTitle = "BÁO CÁO TUYỂN DỤNG - CAREZA",
  companyName = "Doanh nghiệp tuyển dụng",
  recruiterName = "Nhà tuyển dụng",
  data,
  columns,
  dateField = "publishedAt",
  filenamePrefix = "careza_bao_cao_tuyen_dung",
  extraStats = [],
  className,
}: CarezaExportReportProps) {
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customRange, setCustomRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);

  // Lọc dữ liệu theo khoảng ngày bắt đầu - kết thúc
  const filterDataByRange = (start: Dayjs, end: Dayjs) => {
    const s = start.startOf("day").valueOf();
    const e = end.endOf("day").valueOf();

    return data.filter((item) => {
      const val = item[dateField] || item.created_at || item.published_at || item.createdAt;
      if (!val || val === "-") return true; // Nếu không có ngày cụ thể thì vẫn giữ trong báo cáo

      let itemTime = 0;
      if (typeof val === "string" && val.includes("/")) {
        // Định dạng dd/mm/yyyy
        const parts = val.split("/");
        if (parts.length === 3) {
          const d = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          const y = parseInt(parts[2], 10);
          itemTime = new Date(y, m, d).getTime();
        }
      } else {
        itemTime = new Date(val).getTime();
      }

      if (isNaN(itemTime)) return true;
      return itemTime >= s && itemTime <= e;
    });
  };

  // Tạo và tải file Excel XML (.xlsx)
  const generateAndDownloadExcel = (filteredData: any[], timeRangeLabel: string, startStr: string, endStr: string) => {
    if (filteredData.length === 0) {
      message.warning(`Không có dữ liệu trong khoảng thời gian: ${timeRangeLabel}`);
      return;
    }

    const escapeXML = (str: any) => {
      if (str === null || str === undefined) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };

    const headers = columns.map((col) => col.header);
    const rows = filteredData.map((item, idx) => {
      return columns.map((col) => {
        if (col.render) {
          return col.render(item, idx);
        }
        if (col.key) {
          return item[col.key] ?? "";
        }
        return "";
      });
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="ReportTitle">
   <Font ss:FontName="Calibri" ss:Size="16" ss:Bold="1" ss:Color="#1254B8"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="MetaLabel">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#52627A"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="MetaValue">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#17233B"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="TableHeader">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1254B8" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="TableCell">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#17233B"/>
  </Style>
  <Style ss:ID="TableCellCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#17233B"/>
  </Style>
  <Style ss:ID="TableCellNumber">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#17233B"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="BaoCao">
  <Table>
   <Row ss:Height="28">
    <Cell ss:StyleID="ReportTitle" ss:MergeAcross="${Math.max(headers.length - 1, 4)}"><Data ss:Type="String">${escapeXML(reportTitle)}</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Doanh nghiệp:</Data></Cell>
    <Cell ss:StyleID="MetaValue" ss:MergeAcross="2"><Data ss:Type="String">${escapeXML(companyName)}</Data></Cell>
    <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Khoảng thời gian:</Data></Cell>
    <Cell ss:StyleID="MetaValue" ss:MergeAcross="${Math.max(headers.length - 5, 1)}"><Data ss:Type="String">${escapeXML(timeRangeLabel)}</Data></Cell>
   </Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Người xuất:</Data></Cell>
    <Cell ss:StyleID="MetaValue" ss:MergeAcross="2"><Data ss:Type="String">${escapeXML(recruiterName)}</Data></Cell>
    <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Thời gian xuất:</Data></Cell>
    <Cell ss:StyleID="MetaValue" ss:MergeAcross="${Math.max(headers.length - 5, 1)}"><Data ss:Type="String">${escapeXML(new Date().toLocaleString("vi-VN"))}</Data></Cell>
   </Row>`;

    if (extraStats && extraStats.length > 0) {
      xml += `
   <Row ss:Height="20">
    <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Thống kê:</Data></Cell>
    <Cell ss:StyleID="MetaValue" ss:MergeAcross="${Math.max(headers.length - 2, 3)}"><Data ss:Type="String">${escapeXML(extraStats.map((s) => `${s.label}: ${s.value}`).join("  |  "))}</Data></Cell>
   </Row>`;
    }

    xml += `
   <Row ss:Height="12"/>
   <Row ss:Height="24">`;
    headers.forEach((h) => {
      xml += `
    <Cell ss:StyleID="TableHeader"><Data ss:Type="String">${escapeXML(h)}</Data></Cell>`;
    });
    xml += `
   </Row>`;

    rows.forEach((r) => {
      xml += `
   <Row ss:Height="20">`;
      r.forEach((cellVal) => {
        const isNum = typeof cellVal === "number";
        const styleId = isNum ? "TableCellNumber" : "TableCell";
        const type = isNum ? "Number" : "String";
        xml += `
    <Cell ss:StyleID="${styleId}"><Data ss:Type="${type}">${escapeXML(cellVal)}</Data></Cell>`;
      });
      xml += `
   </Row>`;
    });

    xml += `
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filenamePrefix}_${startStr}_${endStr}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    message.success(`Đã xuất thành công ${filteredData.length} bản ghi sang file Excel (.xlsx)!`);
  };

  // Xử lý khi chọn từ Dropdown
  const handleSelectPreset = (key: PresetKey) => {
    const now = dayjs();
    let start: Dayjs;
    let end: Dayjs = now;
    let label = "";

    switch (key) {
      case "today":
        start = now.startOf("day");
        end = now.endOf("day");
        label = `Hôm nay (${now.format("DD/MM/YYYY")})`;
        break;
      case "week":
        start = now.startOf("week");
        end = now.endOf("week");
        label = `Tuần này (${start.format("DD/MM")} - ${end.format("DD/MM/YYYY")})`;
        break;
      case "month":
        start = now.startOf("month");
        end = now.endOf("month");
        label = `Tháng này (${now.format("MM/YYYY")})`;
        break;
      case "6months":
        start = now.subtract(6, "month").startOf("day");
        end = now.endOf("day");
        label = `6 tháng gần nhất (${start.format("DD/MM/YYYY")} - ${end.format("DD/MM/YYYY")})`;
        break;
      case "year":
        start = now.startOf("year");
        end = now.endOf("year");
        label = `Năm nay (${now.format("YYYY")})`;
        break;
      case "custom":
        setIsCustomModalOpen(true);
        return;
      default:
        return;
    }

    const filtered = filterDataByRange(start, end);
    generateAndDownloadExcel(
      filtered,
      label,
      start.format("YYYYMMDD"),
      end.format("YYYYMMDD")
    );
  };

  // Xác nhận xuất khoảng ngày tùy chọn
  const handleConfirmCustomExport = () => {
    if (!customRange || !customRange[0] || !customRange[1]) {
      message.error("Vui lòng chọn ngày bắt đầu và kết thúc!");
      return;
    }

    const start = customRange[0];
    const end = customRange[1];
    const label = `Từ ${start.format("DD/MM/YYYY")} đến ${end.format("DD/MM/YYYY")}`;

    const filtered = filterDataByRange(start, end);
    generateAndDownloadExcel(
      filtered,
      label,
      start.format("YYYYMMDD"),
      end.format("YYYYMMDD")
    );
    setIsCustomModalOpen(false);
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "month",
      label: (
        <div className="flex items-center justify-between w-full gap-2 text-[12.5px] font-semibold text-[#155EEF]">
          <span>Tháng này (Mặc định)</span>
          <span className="text-[10.5px] font-normal text-slate-500">{dayjs().format("MM/YYYY")}</span>
        </div>
      ),
      onClick: () => handleSelectPreset("month"),
    },
    {
      type: "divider",
      style: { margin: "2px 0" },
    },
    {
      key: "today",
      label: (
        <div className="flex items-center justify-between w-full gap-2 text-[12.5px] text-slate-700">
          <span>Theo ngày (Hôm nay)</span>
          <span className="text-[10.5px] text-slate-400">{dayjs().format("DD/MM")}</span>
        </div>
      ),
      onClick: () => handleSelectPreset("today"),
    },
    {
      key: "week",
      label: (
        <div className="flex items-center justify-between w-full gap-2 text-[12.5px] text-slate-700">
          <span>Tuần này</span>
          <span className="text-[10.5px] text-slate-400">7 ngày</span>
        </div>
      ),
      onClick: () => handleSelectPreset("week"),
    },
    {
      key: "6months",
      label: (
        <div className="flex items-center justify-between w-full gap-2 text-[12.5px] text-slate-700">
          <span>6 tháng gần nhất</span>
          <span className="text-[10.5px] text-slate-400">Nửa năm</span>
        </div>
      ),
      onClick: () => handleSelectPreset("6months"),
    },
    {
      key: "year",
      label: (
        <div className="flex items-center justify-between w-full gap-2 text-[12.5px] text-slate-700">
          <span>Năm nay</span>
          <span className="text-[10.5px] text-slate-400">{dayjs().format("YYYY")}</span>
        </div>
      ),
      onClick: () => handleSelectPreset("year"),
    },
    {
      type: "divider",
      style: { margin: "2px 0" },
    },
    {
      key: "custom",
      label: (
        <div className="flex items-center gap-2 w-full text-[12.5px] text-[#155EEF] font-medium">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>Tùy chọn khoảng ngày...</span>
        </div>
      ),
      onClick: () => handleSelectPreset("custom"),
    },
  ];

  return (
    <>
      <Dropdown
        menu={{
          items: menuItems,
          className: "[&_.ant-dropdown-menu-item]:!min-h-[35px] [&_.ant-dropdown-menu-item]:!h-[35px] [&_.ant-dropdown-menu-item]:!py-1.5 [&_.ant-dropdown-menu-item]:!px-3 [&_.ant-dropdown-menu-item-divider]:!my-0.5 min-w-[195px]",
        }}
        placement="bottomRight"
        arrow={{ pointAtCenter: true }}
        trigger={["click"]}
      >
        <button
          type="button"
          className={`h-[34px] px-3.5 rounded-lg bg-white hover:bg-slate-50 text-[#17233B] hover:text-[#155EEF] font-medium text-xs border border-[#CBD5E1] shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-98 ${className || ""}`}
        >
          <Download className="w-3.5 h-3.5 text-[#475569]" />
          <span>{buttonText}</span>
        </button>
      </Dropdown>

      {/* Modal Tùy chọn khoảng ngày */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-[15px] font-bold text-[#17233B] pb-1 border-b border-slate-100">
            <FileSpreadsheet className="w-4 h-4 text-[#155EEF]" />
            <span>Xuất báo cáo Excel theo khoảng thời gian</span>
          </div>
        }
        open={isCustomModalOpen}
        onCancel={() => setIsCustomModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsCustomModalOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleConfirmCustomExport}
            className="bg-[#155EEF] hover:bg-[#1047B8]"
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Tải file Excel (.xlsx)
          </Button>,
        ]}
        width={460}
        centered
      >
        <div className="py-4 space-y-4">
          <p className="text-xs text-slate-600 m-0">
            Chọn ngày bắt đầu và kết thúc để trích xuất dữ liệu tuyển dụng thật:
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#17233B] block">
              Khoảng thời gian:
            </label>
            <RangePicker
              value={customRange}
              onChange={(dates) => setCustomRange(dates as any)}
              format="DD/MM/YYYY"
              className="w-full h-[38px] rounded-lg border-[#CBD5E1]"
              presets={[
                { label: "Hôm nay", value: [dayjs().startOf("day"), dayjs().endOf("day")] },
                { label: "Tuần này", value: [dayjs().startOf("week"), dayjs().endOf("week")] },
                { label: "Tháng này", value: [dayjs().startOf("month"), dayjs().endOf("month")] },
                { label: "6 tháng", value: [dayjs().subtract(6, "month"), dayjs()] },
                { label: "Năm nay", value: [dayjs().startOf("year"), dayjs().endOf("year")] },
              ]}
            />
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11.5px] text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span className="font-medium text-slate-500">Định dạng file:</span>
              <strong className="text-[#155EEF]">Microsoft Excel (.xlsx)</strong>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-500">Số lượng tin hiện có:</span>
              <strong className="text-[#17233B]">{data.length} tin tuyển dụng</strong>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

