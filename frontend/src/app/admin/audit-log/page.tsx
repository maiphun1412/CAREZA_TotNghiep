"use client";

import { useState, useEffect, useCallback } from "react";
import { Table, Tag, Input, Select, Button, Modal, message } from "antd";
import { Search, Download, RefreshCw, Eye } from "lucide-react";
import { adminService, AdminAuditLogItem } from "@/services/admin.service";

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AdminAuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [entityType, setEntityType] = useState<string>("");

  const [selectedLog, setSelectedLog] = useState<AdminAuditLogItem | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getAuditLogs({
        page,
        page_size: pageSize,
        search: searchTerm || undefined,
        entity_type: entityType || undefined,
      });
      setLogs(res.data?.items || res.data?.results || []);
      setTotal(res.data?.pagination?.total ?? res.data?.total ?? 0);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Không thể tải nhật ký hoạt động hệ thống.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm, entityType]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExportCsv = () => {
    if (!logs.length) {
      message.warning("Không có dữ liệu nhật ký để xuất.");
      return;
    }
    const headers = ["ID", "Action", "Actor Email", "Actor Name", "Entity Type", "Entity ID", "Time"];
    const rows = logs.map((l) => [
      l.id,
      `"${(l.action || "").replace(/"/g, '""')}"`,
      `"${(l.actor_email || "").replace(/"/g, '""')}"`,
      `"${(l.actor_name || "").replace(/"/g, '""')}"`,
      `"${(l.entity_type || "").replace(/"/g, '""')}"`,
      `"${String(l.entity_id ?? "").replace(/"/g, '""')}"`,
      `"${l.created_at || ""}"`,
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `careza_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      title: "Mã Log",
      dataIndex: "id",
      key: "id",
      width: 90,
      render: (id: number) => (
        <span className="font-mono text-xs font-bold text-slate-700">LOG-{id}</span>
      ),
    },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      render: (text: string) => <span className="font-bold text-slate-800 text-xs">{text}</span>,
    },
    {
      title: "Người thực hiện",
      key: "actor",
      render: (_: any, r: AdminAuditLogItem) => (
        <div>
          <div className="text-xs font-semibold text-slate-800">{r.actor_name || "Hệ thống"}</div>
          <div className="text-[11px] text-slate-500">{r.actor_email || "—"}</div>
        </div>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "actor_role",
      key: "actor_role",
      render: (role: string) => (
        <Tag
          color={role === "admin" ? "purple" : role === "employer" ? "blue" : "default"}
          className="font-semibold text-[10.5px] uppercase m-0"
        >
          {role || "system"}
        </Tag>
      ),
    },
    {
      title: "Đối tượng tác động",
      key: "target",
      render: (_: any, r: AdminAuditLogItem) => (
        <span className="text-xs text-slate-700 font-medium">
          {r.entity_type ? `${r.entity_type} #${r.entity_id || "—"}` : "—"}
        </span>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "created_at",
      key: "created_at",
      render: (text: string) => (
        <span className="text-xs text-slate-500">
          {text ? new Date(text).toLocaleString("vi-VN") : "—"}
        </span>
      ),
    },
    {
      title: "Chi tiết",
      key: "detail",
      align: "right" as const,
      render: (_: any, r: AdminAuditLogItem) => (
        <Button
          size="small"
          icon={<Eye className="w-3.5 h-3.5" />}
          onClick={() => setSelectedLog(r)}
          className="text-xs font-semibold rounded-lg"
        >
          Xem
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0">
            Nhật ký hệ thống (Audit Logs)
          </h1>
          <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
            Lịch sử thao tác quản trị viên và các sự kiện vận hành quan trọng ({total} bản ghi)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={fetchLogs}
            loading={loading}
            className="text-xs font-semibold rounded-xl h-9"
          >
            Làm mới
          </Button>
          <Button
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportCsv}
            className="text-xs font-bold rounded-xl h-9"
          >
            Xuất file CSV
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <Input
            prefix={<Search className="w-3.5 h-3.5 text-slate-400" />}
            placeholder="Tìm theo hành động, loại đối tượng, người thực hiện..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            allowClear
            className="max-w-md text-xs rounded-xl h-9"
          />
          <Select
            value={entityType}
            onChange={(val) => {
              setEntityType(val);
              setPage(1);
            }}
            className="w-48 text-xs h-9"
            options={[
              { value: "", label: "Tất cả đối tượng" },
              { value: "user", label: "Người dùng (user)" },
              { value: "company", label: "Doanh nghiệp (company)" },
              { value: "job", label: "Tin tuyển dụng (job)" },
              { value: "report", label: "Báo cáo vi phạm (report)" },
              { value: "review", label: "Đánh giá (review)" },
              { value: "plan", label: "Gói dịch vụ (plan)" },
              { value: "setting", label: "Cài đặt hệ thống (setting)" },
            ]}
          />
        </div>

        <Table
          dataSource={logs}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </div>

      <Modal
        title={
          <span className="text-sm font-black text-slate-900">
            Chi tiết Nhật ký #{selectedLog?.id} — {selectedLog?.action}
          </span>
        }
        open={!!selectedLog}
        onCancel={() => setSelectedLog(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedLog(null)}>
            Đóng
          </Button>,
        ]}
      >
        {selectedLog && (
          <div className="space-y-2.5 text-xs pt-2">
            <div>
              <span className="font-bold text-slate-600">Người thực hiện: </span>
              <span className="text-slate-900">
                {selectedLog.actor_name} ({selectedLog.actor_email || "system"})
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-600">Đối tượng: </span>
              <span className="text-slate-900">
                {selectedLog.entity_type} #{selectedLog.entity_id || "—"}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-600">Thời gian: </span>
              <span className="text-slate-900">
                {selectedLog.created_at
                  ? new Date(selectedLog.created_at).toLocaleString("vi-VN")
                  : "—"}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-600 block mb-1">Dữ liệu thay đổi (Changes):</span>
              <pre className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] font-mono overflow-auto max-h-60">
                {JSON.stringify(selectedLog.changes || {}, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
