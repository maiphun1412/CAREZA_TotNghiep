"use client";

import { useState, useEffect, useCallback } from "react";
import { Table, Tag, Button, Space, Select, Input, Tabs, Modal, Form, App, Rate } from "antd";
import {
  CheckCircle,
  XCircle,
  Eye,
  Search,
  RefreshCw,
  Flag,
  MessageSquareWarning,
  EyeOff,
} from "lucide-react";
import { adminService } from "@/services/admin.service";

function AdminReportsContent() {
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState<"reports" | "reviews">("reports");

  // State cho Reports
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportStatus, setReportStatus] = useState("all");
  const [reportTargetType, setReportTargetType] = useState("all");
  const [reportSearch, setReportSearch] = useState("");
  const [reportSummary, setReportSummary] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    dismissed: 0,
  });

  // Modal xử lý Report
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolveAction, setResolveAction] = useState<"resolve" | "dismiss">("resolve");
  const [submittingResolve, setSubmittingResolve] = useState(false);
  const [resolveForm] = Form.useForm();

  // State cho Reviews
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewStatus, setReviewStatus] = useState("all");
  const [reviewSearch, setReviewSearch] = useState("");

  const fetchReports = useCallback(async () => {
    setLoadingReports(true);
    try {
      const res = await adminService.getReports({
        status: reportStatus !== "all" ? reportStatus : undefined,
        target_type: reportTargetType !== "all" ? reportTargetType : undefined,
        search: reportSearch.trim() || undefined,
        page_size: 50,
      });
      if (res?.data) {
        setReports(res.data.items || []);
        if (res.data.summary) {
          setReportSummary(res.data.summary);
        }
      }
    } catch {
      message.error("Không thể tải danh sách báo cáo vi phạm.");
    } finally {
      setLoadingReports(false);
    }
  }, [reportStatus, reportTargetType, reportSearch, message]);

  const fetchReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const res = await adminService.getReviews({
        status: reviewStatus !== "all" ? reviewStatus : undefined,
        search: reviewSearch.trim() || undefined,
        page_size: 50,
      });
      if (res?.data) {
        setReviews(res.data.items || []);
      }
    } catch {
      message.error("Không thể tải danh sách đánh giá công ty.");
    } finally {
      setLoadingReviews(false);
    }
  }, [reviewStatus, reviewSearch, message]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    if (activeTab === "reviews") {
      fetchReviews();
    }
  }, [activeTab, fetchReviews]);

  const openResolveModal = (record: any, action: "resolve" | "dismiss") => {
    setSelectedReport(record);
    setResolveAction(action);
    resolveForm.resetFields();
    resolveForm.setFieldsValue({
      note:
        action === "resolve"
          ? "Đã xác minh vi phạm và xử lý đối tượng bị báo cáo."
          : "Báo cáo không đủ căn cứ vi phạm.",
    });
    setResolveModalOpen(true);
  };

  const handleConfirmResolve = async (values: { note: string }) => {
    if (!selectedReport) return;
    setSubmittingResolve(true);
    try {
      await adminService.resolveReport(selectedReport.id, {
        action: resolveAction,
        note: values.note,
      });
      message.success(
        resolveAction === "resolve"
          ? `Đã xử lý báo cáo #${selectedReport.id}`
          : `Đã bác bỏ báo cáo #${selectedReport.id}`
      );
      setResolveModalOpen(false);
      fetchReports();
    } catch {
      message.error("Không thể cập nhật trạng thái báo cáo.");
    } finally {
      setSubmittingResolve(false);
    }
  };

  const handleModerateReview = async (reviewId: number, action: "approve" | "hide") => {
    try {
      await adminService.moderateReview(reviewId, action);
      message.success(
        action === "approve" ? "Đã phê duyệt hiển thị đánh giá!" : "Đã ẩn đánh giá vi phạm!"
      );
      fetchReviews();
    } catch {
      message.error("Thao tác kiểm duyệt đánh giá thất bại.");
    }
  };

  const reportColumns = [
    {
      title: "Mã",
      dataIndex: "id",
      key: "id",
      render: (id: number) => <span className="font-mono font-bold text-slate-600">#{id}</span>,
    },
    {
      title: "Loại đối tượng",
      dataIndex: "target_type",
      key: "target_type",
      render: (t: string) => <Tag color="blue">{(t || "other").toUpperCase()}</Tag>,
    },
    {
      title: "Đối tượng bị báo cáo",
      dataIndex: "target_name",
      key: "target_name",
      render: (name: string, r: any) => (
        <div>
          <span className="font-semibold text-slate-900 block">{name || `#${r.target_id}`}</span>
          <span className="text-xs text-slate-400">ID: {r.target_id}</span>
        </div>
      ),
    },
    {
      title: "Lý do & Chi tiết",
      key: "reason",
      render: (_: any, r: any) => (
        <div className="max-w-md">
          <div className="font-semibold text-rose-600 text-xs">{r.reason}</div>
          {r.details && <div className="text-xs text-slate-500 line-clamp-2">{r.details}</div>}
        </div>
      ),
    },
    {
      title: "Người báo cáo",
      dataIndex: "reporter_email",
      key: "reporter_email",
      render: (email: string, r: any) => (
        <div>
          <span className="text-xs font-medium text-slate-800 block">{r.reporter_name}</span>
          <span className="text-[11px] text-slate-400">{email}</span>
        </div>
      ),
    },
    {
      title: "Ngày gửi",
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
        if (s === "pending") return <Tag color="orange">Chờ xử lý</Tag>;
        if (s === "resolved") return <Tag color="green">Đã xử lý</Tag>;
        return <Tag color="default">Đã bác bỏ</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      align: "right" as const,
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            icon={<Eye size={14} />}
            onClick={() => openResolveModal(record, "resolve")}
          >
            Chi tiết
          </Button>
          {record.status === "pending" && (
            <>
              <Button
                size="small"
                type="primary"
                className="bg-emerald-600"
                icon={<CheckCircle size={14} />}
                onClick={() => openResolveModal(record, "resolve")}
              >
                Xử lý
              </Button>
              <Button
                size="small"
                danger
                icon={<XCircle size={14} />}
                onClick={() => openResolveModal(record, "dismiss")}
              >
                Bác bỏ
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const reviewColumns = [
    {
      title: "Doanh nghiệp",
      dataIndex: "company_name",
      key: "company_name",
      render: (name: string) => <span className="font-bold text-slate-900">{name}</span>,
    },
    {
      title: "Người đánh giá",
      key: "user",
      render: (_: any, r: any) => (
        <div>
          <div className="text-xs font-semibold text-slate-800">{r.user_name}</div>
          <div className="text-[11px] text-slate-400">{r.user_email}</div>
        </div>
      ),
    },
    {
      title: "Điểm sao",
      dataIndex: "rating",
      key: "rating",
      render: (rating: number) => <Rate disabled defaultValue={rating} className="text-sm" />,
    },
    {
      title: "Nội dung đánh giá",
      key: "content",
      render: (_: any, r: any) => (
        <div className="max-w-md">
          <div className="font-bold text-slate-800 text-xs">{r.title || "Đánh giá công ty"}</div>
          <div className="text-xs text-slate-600 line-clamp-2">{r.content}</div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s: string) =>
        s === "approved" ? (
          <Tag color="green">Đang hiển thị</Tag>
        ) : s === "hidden" ? (
          <Tag color="red">Đã ẩn</Tag>
        ) : (
          <Tag color="gold">Chờ duyệt ({s})</Tag>
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "right" as const,
      render: (_: any, r: any) => (
        <Space>
          {r.status !== "approved" && (
            <Button
              size="small"
              type="primary"
              className="bg-emerald-600"
              icon={<CheckCircle size={14} />}
              onClick={() => handleModerateReview(r.id, "approve")}
            >
              Duyệt hiển thị
            </Button>
          )}
          {r.status !== "hidden" && (
            <Button
              size="small"
              danger
              icon={<EyeOff size={14} />}
              onClick={() => handleModerateReview(r.id, "hide")}
            >
              Ẩn đánh giá
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 m-0">
            Quản lý Báo cáo vi phạm &amp; Đánh giá
          </h1>
          <p className="text-sm text-slate-500 m-0 mt-1">
            Xử lý báo cáo vi phạm từ người dùng và kiểm duyệt đánh giá doanh nghiệp trên hệ thống
          </p>
        </div>
        <Button
          icon={<RefreshCw size={15} />}
          onClick={() => (activeTab === "reports" ? fetchReports() : fetchReviews())}
        >
          Làm mới
        </Button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold">Tổng báo cáo vi phạm</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{reportSummary.total}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-amber-600 font-semibold">Đang chờ xử lý</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{reportSummary.pending}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-emerald-600 font-semibold">Đã xử lý vi phạm</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{reportSummary.resolved}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold">Đã bác bỏ</div>
          <div className="text-2xl font-black text-slate-600 mt-1">{reportSummary.dismissed}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs">
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as "reports" | "reviews")}
          items={[
            {
              key: "reports",
              label: (
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <Flag size={15} /> Báo cáo vi phạm ({reportSummary.total})
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">
                  <div className="flex flex-wrap gap-3">
                    <Input
                      placeholder="Tìm theo lý do, mô tả báo cáo..."
                      prefix={<Search size={15} className="text-slate-400" />}
                      value={reportSearch}
                      onChange={(e) => setReportSearch(e.target.value)}
                      className="w-72"
                      allowClear
                    />
                    <Select
                      value={reportStatus}
                      onChange={setReportStatus}
                      className="w-44"
                      options={[
                        { value: "all", label: "Tất cả trạng thái" },
                        { value: "pending", label: "Chờ xử lý" },
                        { value: "resolved", label: "Đã xử lý" },
                        { value: "dismissed", label: "Đã bác bỏ" },
                      ]}
                    />
                    <Select
                      value={reportTargetType}
                      onChange={setReportTargetType}
                      className="w-44"
                      options={[
                        { value: "all", label: "Mọi loại đối tượng" },
                        { value: "job", label: "Tin tuyển dụng" },
                        { value: "company", label: "Doanh nghiệp" },
                        { value: "review", label: "Đánh giá" },
                        { value: "user", label: "Người dùng" },
                      ]}
                    />
                  </div>
                  <Table
                    dataSource={reports}
                    columns={reportColumns}
                    rowKey="id"
                    loading={loadingReports}
                  />
                </div>
              ),
            },
            {
              key: "reviews",
              label: (
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <MessageSquareWarning size={15} /> Kiểm duyệt Đánh giá Công ty
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">
                  <div className="flex flex-wrap gap-3">
                    <Input
                      placeholder="Tìm theo tiêu đề hoặc nội dung đánh giá..."
                      prefix={<Search size={15} className="text-slate-400" />}
                      value={reviewSearch}
                      onChange={(e) => setReviewSearch(e.target.value)}
                      className="w-72"
                      allowClear
                    />
                    <Select
                      value={reviewStatus}
                      onChange={setReviewStatus}
                      className="w-44"
                      options={[
                        { value: "all", label: "Tất cả trạng thái" },
                        { value: "approved", label: "Đang hiển thị" },
                        { value: "hidden", label: "Đã ẩn" },
                      ]}
                    />
                  </div>
                  <Table
                    dataSource={reviews}
                    columns={reviewColumns}
                    rowKey="id"
                    loading={loadingReviews}
                  />
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Modal xử lý báo cáo */}
      <Modal
        title={
          resolveAction === "resolve"
            ? `Xác nhận xử lý báo cáo #${selectedReport?.id}`
            : `Bác bỏ báo cáo #${selectedReport?.id}`
        }
        open={resolveModalOpen}
        onCancel={() => setResolveModalOpen(false)}
        onOk={() => resolveForm.submit()}
        confirmLoading={submittingResolve}
        okText={resolveAction === "resolve" ? "Xác nhận xử lý" : "Xác nhận bác bỏ"}
        cancelText="Hủy"
        okButtonProps={{ danger: resolveAction === "dismiss" }}
      >
        {selectedReport && (
          <div className="space-y-3 text-xs mb-4 p-3 bg-slate-50 rounded-xl">
            <div>
              <span className="text-slate-500">Đối tượng:</span>{" "}
              <strong>
                [{selectedReport.target_type?.toUpperCase()}] {selectedReport.target_name}
              </strong>
            </div>
            <div>
              <span className="text-slate-500">Người báo cáo:</span>{" "}
              <strong>
                {selectedReport.reporter_name} ({selectedReport.reporter_email})
              </strong>
            </div>
            <div>
              <span className="text-slate-500">Lý do:</span>{" "}
              <strong className="text-rose-600">{selectedReport.reason}</strong>
            </div>
            {selectedReport.details && (
              <div>
                <span className="text-slate-500">Chi tiết:</span> {selectedReport.details}
              </div>
            )}
          </div>
        )}
        <Form form={resolveForm} layout="vertical" onFinish={handleConfirmResolve}>
          <Form.Item
            name="note"
            label="Ghi chú quyết định xử lý (lưu vào Moderation Case & Audit Log)"
            rules={[{ required: true, message: "Vui lòng nhập ghi chú xử lý" }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập kết luận và biện pháp xử lý..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default function AdminReportsPage() {
  return (
    <App>
      <AdminReportsContent />
    </App>
  );
}
