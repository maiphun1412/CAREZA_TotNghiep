"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Table, Tag, Input, Select, Button, Space, Modal, Form, App, Spin } from "antd";
import {
  Search,
  Eye,
  Ban,
  CheckCircle,
  AlertTriangle,
  Briefcase,
  Building2,
  RefreshCw,
} from "lucide-react";
import { adminService, type AdminJobItem } from "@/services/admin.service";

function AdminJobsContent() {
  const { message } = App.useApp();
  const [jobs, setJobs] = useState<AdminJobItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({
    total_jobs: 0,
    published_count: 0,
    draft_count: 0,
    closed_count: 0,
  });

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [jobDetail, setJobDetail] = useState<any>(null);

  // Moderate modal
  const [moderateModalOpen, setModerateModalOpen] = useState(false);
  const [moderatingJob, setModeratingJob] = useState<AdminJobItem | null>(null);
  const [moderateAction, setModerateAction] = useState<"approve" | "reject" | "hide">("hide");
  const [submittingModerate, setSubmittingModerate] = useState(false);
  const [moderateForm] = Form.useForm();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getJobs({
        page,
        page_size: pageSize,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchText.trim() || undefined,
      });
      if (res?.data) {
        setJobs(res.data.items || []);
        setTotal(res.data.pagination?.total || 0);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách việc làm Admin:", err);
      message.error("Không thể tải danh sách tin tuyển dụng.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, searchText, message]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleOpenDetail = async (id: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await adminService.getJobDetail(id);
      setJobDetail(res?.data?.job || null);
    } catch {
      message.error("Không thể tải chi tiết tin tuyển dụng.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleQuickApprove = async (record: AdminJobItem) => {
    try {
      await adminService.moderateJob(record.id, "approve", "Admin phê duyệt hiển thị công khai");
      message.success(`Đã duyệt hiển thị tin tuyển dụng "${record.title}"`);
      fetchJobs();
    } catch {
      message.error("Phê duyệt tin tuyển dụng thất bại.");
    }
  };

  const handleOpenModerateModal = (
    record: AdminJobItem,
    action: "approve" | "reject" | "hide"
  ) => {
    setModeratingJob(record);
    setModerateAction(action);
    moderateForm.resetFields();
    moderateForm.setFieldsValue({
      reason:
        action === "approve"
          ? "Đạt tiêu chuẩn hiển thị"
          : "Vi phạm quy định đăng tin tuyển dụng trên hệ thống CAREZA",
    });
    setModerateModalOpen(true);
  };

  const handleConfirmModerate = async (values: { reason: string }) => {
    if (!moderatingJob) return;
    setSubmittingModerate(true);
    try {
      await adminService.moderateJob(moderatingJob.id, moderateAction, values.reason);
      message.success(
        moderateAction === "approve"
          ? `Đã phê duyệt tin "${moderatingJob.title}"`
          : `Đã đóng / gỡ tin "${moderatingJob.title}"`
      );
      setModerateModalOpen(false);
      fetchJobs();
    } catch {
      message.error("Thao tác kiểm duyệt thất bại.");
    } finally {
      setSubmittingModerate(false);
    }
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "Thỏa thuận";
    const fmt = (v: number) =>
      v >= 1_000_000 ? `${Math.round(v / 1_000_000)} triệu` : `${v.toLocaleString("vi-VN")} đ`;
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `Từ ${fmt(min)}`;
    return `Đến ${fmt(max!)}`;
  };

  const columns = [
    {
      title: "Tin tuyển dụng",
      dataIndex: "title",
      key: "title",
      render: (t: string, r: AdminJobItem) => (
        <div>
          <p className="font-bold text-slate-900 m-0">{t}</p>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            {formatSalary(r.salary_min, r.salary_max)} • {r.location_name || "Toàn quốc"} •{" "}
            {r.industry_name || "Đa ngành"}
          </p>
        </div>
      ),
    },
    {
      title: "Doanh nghiệp",
      key: "company",
      render: (_: any, r: AdminJobItem) =>
        r.company?.id ? (
          <Link
            href={`/admin/companies/${r.company.id}`}
            className="font-semibold text-slate-800 hover:text-[#0062ff] inline-flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>{r.company.name || `Công ty #${r.company.id}`}</span>
          </Link>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      title: "Ứng tuyển / Báo cáo",
      key: "metrics",
      render: (_: any, r: AdminJobItem) => (
        <div className="space-y-1">
          <div className="text-xs text-slate-700 font-semibold">
            {r.applications_count ?? 0} hồ sơ ứng tuyển
          </div>
          {(r.reports_count ?? 0) > 0 ? (
            <Tag color="red" className="flex items-center gap-1 w-fit m-0">
              <AlertTriangle size={12} /> {r.reports_count} báo cáo
            </Tag>
          ) : (
            <span className="text-slate-400 text-xs">0 báo cáo</span>
          )}
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (d: string) => (
        <span className="text-xs text-slate-600">
          {d ? new Date(d).toLocaleDateString("vi-VN") : "—"}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s: string) => {
        if (s === "published") return <Tag color="green">Đang hiển thị (Published)</Tag>;
        if (s === "draft") return <Tag color="gold">Bản nháp / Chờ duyệt (Draft)</Tag>;
        return <Tag color="default">Đã đóng / Đã gỡ ({s})</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      align: "right" as const,
      render: (_: any, record: AdminJobItem) => (
        <Space>
          <Button
            size="small"
            icon={<Eye size={14} />}
            onClick={() => handleOpenDetail(record.id)}
          >
            Xem
          </Button>
          {record.status !== "published" && (
            <Button
              size="small"
              type="primary"
              className="bg-emerald-600"
              icon={<CheckCircle size={14} />}
              onClick={() => handleQuickApprove(record)}
            >
              Duyệt đăng
            </Button>
          )}
          {record.status !== "closed" && (
            <Button
              size="small"
              danger
              icon={<Ban size={14} />}
              onClick={() => handleOpenModerateModal(record, "hide")}
            >
              Gỡ tin
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
            Quản lý Tin tuyển dụng
          </h1>
          <p className="text-sm text-slate-500 m-0 mt-1">
            Kiểm duyệt nội dung, phê duyệt hiển thị hoặc gỡ các tin tuyển dụng vi phạm trên toàn hệ thống
          </p>
        </div>
        <Button icon={<RefreshCw size={15} />} onClick={fetchJobs} loading={loading}>
          Làm mới
        </Button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center">
            <Briefcase size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Tổng tin tuyển dụng</div>
            <div className="text-xl font-black text-slate-900">
              {summary.total_jobs.toLocaleString("vi-VN")}
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Đang hiển thị công khai</div>
            <div className="text-xl font-black text-emerald-600">
              {summary.published_count.toLocaleString("vi-VN")}
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Bản nháp / Chờ duyệt</div>
            <div className="text-xl font-black text-amber-600">
              {summary.draft_count.toLocaleString("vi-VN")}
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Ban size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Đã đóng / Đã gỡ</div>
            <div className="text-xl font-black text-slate-700">
              {summary.closed_count.toLocaleString("vi-VN")}
            </div>
          </div>
        </div>
      </div>

      {/* Bộ lọc & Bảng */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs">
        <div className="flex flex-wrap gap-3 mb-6">
          <Input
            placeholder="Tìm theo tiêu đề việc làm hoặc tên công ty..."
            prefix={<Search size={16} className="text-slate-400" />}
            className="w-80 rounded-xl"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPage(1);
            }}
            allowClear
          />
          <Select
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            className="w-52"
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "published", label: "Đang hiển thị (Published)" },
              { value: "draft", label: "Bản nháp / Chờ duyệt (Draft)" },
              { value: "closed", label: "Đã đóng / Đã gỡ (Closed)" },
            ]}
          />
        </div>
        <Table
          dataSource={jobs}
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

      {/* Modal Chi tiết tin tuyển dụng */}
      <Modal
        title="Chi tiết tin tuyển dụng & Lịch sử kiểm duyệt"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={720}
      >
        {detailLoading ? (
          <div className="py-12 text-center">
            <Spin />
          </div>
        ) : jobDetail ? (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5">
              <div className="text-base font-bold text-slate-900">{jobDetail.title}</div>
              <div className="text-slate-600">
                Doanh nghiệp: <strong>{jobDetail.company?.name || "—"}</strong> • Trạng thái:{" "}
                <Tag color={jobDetail.status === "published" ? "green" : "default"}>
                  {jobDetail.status}
                </Tag>
              </div>
              <div className="text-slate-500">
                Mức lương: {formatSalary(jobDetail.salary_min, jobDetail.salary_max)} • Hình thức:{" "}
                {jobDetail.employment_type || "Toàn thời gian"} ({jobDetail.work_mode || "onsite"}) •{" "}
                {jobDetail.applications_count ?? 0} lượt ứng tuyển
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-1">Mô tả công việc:</h4>
              <div className="p-3 bg-white border border-slate-200 rounded-xl whitespace-pre-wrap text-slate-700 max-h-40 overflow-y-auto">
                {jobDetail.description || "Chưa có mô tả"}
              </div>
            </div>

            {jobDetail.requirements && (
              <div>
                <h4 className="font-bold text-slate-800 mb-1">Yêu cầu ứng viên:</h4>
                <div className="p-3 bg-white border border-slate-200 rounded-xl whitespace-pre-wrap text-slate-700 max-h-36 overflow-y-auto">
                  {jobDetail.requirements}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-bold text-slate-800 mb-1">
                Lịch sử kiểm duyệt ({jobDetail.moderation_history?.length || 0}):
              </h4>
              {jobDetail.moderation_history && jobDetail.moderation_history.length > 0 ? (
                <div className="space-y-1.5">
                  {jobDetail.moderation_history.map((mh: any) => (
                    <div
                      key={mh.id}
                      className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex justify-between"
                    >
                      <span>
                        Hành động: <strong>{mh.status}</strong> — Lý do: {mh.reason || "—"}
                      </span>
                      <span className="text-slate-400">
                        {mh.reviewed_at ? new Date(mh.reviewed_at).toLocaleString("vi-VN") : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 italic">Chưa có lịch sử kiểm duyệt.</div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400">Không tìm thấy dữ liệu.</div>
        )}
      </Modal>

      {/* Modal Gỡ / Kiểm duyệt tin */}
      <Modal
        title={
          moderateAction === "approve"
            ? "Phê duyệt tin tuyển dụng"
            : "Gỡ / Đóng tin tuyển dụng vi phạm"
        }
        open={moderateModalOpen}
        onCancel={() => setModerateModalOpen(false)}
        onOk={() => moderateForm.submit()}
        confirmLoading={submittingModerate}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ danger: moderateAction !== "approve" }}
      >
        <Form form={moderateForm} layout="vertical" onFinish={handleConfirmModerate}>
          <p className="text-xs text-slate-600 mb-3">
            Tin tuyển dụng: <strong>{moderatingJob?.title}</strong> ({moderatingJob?.company?.name})
          </p>
          <Form.Item
            name="reason"
            label="Ghi chú / Lý do kiểm duyệt"
            rules={[{ required: true, message: "Vui lòng nhập lý do kiểm duyệt" }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập lý do gỡ hoặc phê duyệt tin..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default function AdminJobsPage() {
  return (
    <App>
      <AdminJobsContent />
    </App>
  );
}
