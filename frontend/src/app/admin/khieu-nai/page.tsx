"use client";

import { useState, useEffect, useCallback } from "react";
import { Table, Tag, Button, Input, Select, Space, Modal, Form, Tabs, App } from "antd";
import {
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  ShieldCheck,
  FileCheck,
} from "lucide-react";
import { adminService } from "@/services/admin.service";

function AdminComplaintsContent() {
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState<"complaints" | "moderation_cases">("complaints");

  // Complaints / Reports
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    dismissed: 0,
  });

  // Moderation cases
  const [cases, setCases] = useState<any[]>([]);
  const [loadingCases, setLoadingCases] = useState(false);
  const [caseTargetFilter, setCaseTargetFilter] = useState("all");

  // Process modal
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [processForm] = Form.useForm();

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getReports({
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchText.trim() || undefined,
        page_size: 50,
      });
      if (res?.data) {
        setComplaints(res.data.items || []);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch {
      message.error("Không thể tải danh sách khiếu nại & báo cáo.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchText, message]);

  const fetchModerationCases = useCallback(async () => {
    setLoadingCases(true);
    try {
      const res = await adminService.getModerationCases({
        target_type: caseTargetFilter !== "all" ? caseTargetFilter : undefined,
        page_size: 50,
      });
      if (res?.data) {
        setCases(res.data.items || []);
      }
    } catch {
      message.error("Không thể tải lịch sử kiểm duyệt.");
    } finally {
      setLoadingCases(false);
    }
  }, [caseTargetFilter, message]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  useEffect(() => {
    if (activeTab === "moderation_cases") {
      fetchModerationCases();
    }
  }, [activeTab, fetchModerationCases]);

  const handleOpenProcess = (record: any) => {
    setSelectedItem(record);
    processForm.resetFields();
    processForm.setFieldsValue({
      action: "resolve",
      note: "Đã xác minh thông tin khiếu nại và hoàn tất xử lý.",
    });
    setProcessModalOpen(true);
  };

  const handleConfirmProcess = async (values: { action: "resolve" | "dismiss"; note: string }) => {
    if (!selectedItem) return;
    setSubmitting(true);
    try {
      await adminService.resolveReport(selectedItem.id, {
        action: values.action,
        note: values.note,
      });
      message.success(`Đã xử lý khiếu nại #KN-${selectedItem.id} thành công!`);
      setProcessModalOpen(false);
      fetchComplaints();
      fetchModerationCases();
    } catch {
      message.error("Không thể xử lý khiếu nại.");
    } finally {
      setSubmitting(false);
    }
  };

  const complaintColumns = [
    {
      title: "Mã KN",
      dataIndex: "id",
      key: "id",
      render: (id: number) => <span className="font-bold text-slate-700">KN-{id}</span>,
    },
    {
      title: "Người gửi",
      key: "sender",
      render: (_: any, r: any) => (
        <div>
          <span className="font-semibold text-slate-800 block">{r.reporter_name}</span>
          <Tag color={r.reporter_type === "employer" ? "purple" : "cyan"} className="mt-0.5">
            {r.reporter_type === "employer" ? "Nhà tuyển dụng" : "Ứng viên"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Đối tượng liên quan",
      key: "target",
      render: (_: any, r: any) => (
        <div>
          <Tag color="blue">{(r.target_type || "other").toUpperCase()}</Tag>
          <span className="font-medium text-slate-800">{r.target_name}</span>
        </div>
      ),
    },
    {
      title: "Nội dung khiếu nại",
      key: "reason",
      render: (_: any, r: any) => (
        <div className="max-w-md">
          <div className="font-semibold text-slate-900">{r.reason}</div>
          {r.details && <div className="text-xs text-slate-500 line-clamp-2">{r.details}</div>}
        </div>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "created_at",
      key: "created_at",
      render: (d: string) => (
        <span className="text-xs text-slate-500">
          {d ? new Date(d).toLocaleString("vi-VN") : "—"}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s: string) => {
        if (s === "pending") return <Tag color="gold">Chờ xử lý</Tag>;
        if (s === "resolved") return <Tag color="green">Đã giải quyết</Tag>;
        return <Tag color="default">Đã bác bỏ</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      align: "right" as const,
      render: (_: any, record: any) => (
        <Button
          size="small"
          type={record.status === "pending" ? "primary" : "default"}
          className={record.status === "pending" ? "bg-[#0062ff]" : ""}
          onClick={() => handleOpenProcess(record)}
        >
          {record.status === "pending" ? "Xem & Xử lý" : "Xem lại"}
        </Button>
      ),
    },
  ];

  const caseColumns = [
    {
      title: "Mã HS",
      dataIndex: "id",
      key: "id",
      render: (id: number) => <span className="font-mono font-bold text-slate-600">#MC-{id}</span>,
    },
    {
      title: "Loại đối tượng",
      dataIndex: "target_type",
      key: "target_type",
      render: (t: string) => <Tag color="geekblue">{(t || "").toUpperCase()}</Tag>,
    },
    {
      title: "Đối tượng",
      dataIndex: "target_name",
      key: "target_name",
      render: (name: string) => <span className="font-semibold text-slate-800">{name}</span>,
    },
    {
      title: "Quyết định",
      dataIndex: "status",
      key: "status",
      render: (s: string) => (
        <Tag color={s === "approve" || s === "resolved" ? "green" : "volcano"}>
          {(s || "").toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Lý do / Ghi chú",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Người duyệt",
      dataIndex: "reviewer_name",
      key: "reviewer_name",
    },
    {
      title: "Thời gian duyệt",
      dataIndex: "reviewed_at",
      key: "reviewed_at",
      render: (d: string) => (
        <span className="text-xs text-slate-500">
          {d ? new Date(d).toLocaleString("vi-VN") : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 m-0">
            Giải quyết Khiếu nại &amp; Hồ sơ Kiểm duyệt
          </h1>
          <p className="text-sm text-slate-500 m-0 mt-1">
            Tiếp nhận, phân xử khiếu nại từ Ứng viên &amp; Nhà tuyển dụng, lưu vết toàn bộ quyết định kiểm duyệt
          </p>
        </div>
        <Button
          icon={<RefreshCw size={15} />}
          onClick={() => {
            fetchComplaints();
            if (activeTab === "moderation_cases") fetchModerationCases();
          }}
        >
          Làm mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase m-0">Đang chờ xử lý</p>
            <p className="text-2xl font-extrabold text-slate-900 m-0">
              {summary.pending} vụ việc
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase m-0">Tổng số tiếp nhận</p>
            <p className="text-2xl font-extrabold text-slate-900 m-0">{summary.total} vụ việc</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase m-0">Đã giải quyết</p>
            <p className="text-2xl font-extrabold text-slate-900 m-0">
              {summary.resolved + summary.dismissed} vụ việc
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs">
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as "complaints" | "moderation_cases")}
          items={[
            {
              key: "complaints",
              label: (
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <ShieldCheck size={15} /> Danh sách Khiếu nại ({summary.total})
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">
                  <Space className=" flex-wrap">
                    <Input
                      placeholder="Tìm kiếm nội dung khiếu nại..."
                      prefix={<Search size={16} className="text-slate-400" />}
                      className="w-72"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      allowClear
                    />
                    <Select
                      value={statusFilter}
                      onChange={setStatusFilter}
                      className="w-44"
                      options={[
                        { value: "all", label: "Tất cả trạng thái" },
                        { value: "pending", label: "Chờ xử lý" },
                        { value: "resolved", label: "Đã giải quyết" },
                        { value: "dismissed", label: "Đã bác bỏ" },
                      ]}
                    />
                  </Space>
                  <Table
                    dataSource={complaints}
                    columns={complaintColumns}
                    rowKey="id"
                    loading={loading}
                  />
                </div>
              ),
            },
            {
              key: "moderation_cases",
              label: (
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <FileCheck size={15} /> Hồ sơ Kiểm duyệt (Moderation Cases)
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">
                  <Select
                    value={caseTargetFilter}
                    onChange={setCaseTargetFilter}
                    className="w-52"
                    options={[
                      { value: "all", label: "Tất cả đối tượng" },
                      { value: "job", label: "Tin tuyển dụng (Job)" },
                      { value: "company", label: "Doanh nghiệp (Company)" },
                      { value: "review", label: "Đánh giá (Review)" },
                    ]}
                  />
                  <Table
                    dataSource={cases}
                    columns={caseColumns}
                    rowKey="id"
                    loading={loadingCases}
                  />
                </div>
              ),
            },
          ]}
        />
      </div>

      <Modal
        title={`Xử lý khiếu nại #KN-${selectedItem?.id}`}
        open={processModalOpen}
        onCancel={() => setProcessModalOpen(false)}
        onOk={() => processForm.submit()}
        confirmLoading={submitting}
        okText="Lưu quyết định xử lý"
        cancelText="Đóng"
      >
        {selectedItem && (
          <div className="space-y-2 text-xs p-3.5 bg-slate-50 rounded-xl mb-4">
            <div>
              <span className="text-slate-500">Người gửi:</span>{" "}
              <strong>
                {selectedItem.reporter_name} ({selectedItem.reporter_email})
              </strong>
            </div>
            <div>
              <span className="text-slate-500">Đối tượng liên quan:</span>{" "}
              <strong>
                [{selectedItem.target_type?.toUpperCase()}] {selectedItem.target_name}
              </strong>
            </div>
            <div>
              <span className="text-slate-500">Nội dung khiếu nại:</span>{" "}
              <strong className="text-rose-600">{selectedItem.reason}</strong>
            </div>
            {selectedItem.details && (
              <div>
                <span className="text-slate-500">Chi tiết:</span> {selectedItem.details}
              </div>
            )}
          </div>
        )}
        <Form form={processForm} layout="vertical" onFinish={handleConfirmProcess}>
          <Form.Item
            name="action"
            label="Quyết định phân xử"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: "resolve", label: "Chấp nhận khiếu nại & Xử lý vi phạm (Resolve)" },
                { value: "dismiss", label: "Bác bỏ khiếu nại do không đủ căn cứ (Dismiss)" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="note"
            label="Nội dung phản hồi / Biên bản xử lý"
            rules={[{ required: true, message: "Vui lòng nhập nội dung phản hồi" }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập kết luận phân xử của Admin..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default function AdminComplaintsPage() {
  return (
    <App>
      <AdminComplaintsContent />
    </App>
  );
}
