"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Button,
  Tag,
  Spin,
  Empty,
  App,
  Modal,
  Form,
  Input,
  Select,
  Typography,
} from "antd";
import {
  AlertOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { interactionService, ReportItem } from "@/services/interaction.service";

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function CandidateKhieuNaiPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await interactionService.getMyReports();
      const list = res?.reports || res?.results || [];
      setReports(list);
    } catch {
      message.error("Không thể tải danh sách khiếu nại & báo cáo.");
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleCreateReport = async (values: any) => {
    setSubmitting(true);
    try {
      await interactionService.submitReport({
        report_type: values.report_type,
        target_id: Number(values.target_id),
        reason: values.reason,
        description: values.description,
      });
      message.success("Báo cáo vi phạm đã được gửi tới Ban quản trị thành công.");
      setIsModalOpen(false);
      form.resetFields();
      fetchReports();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Gửi báo cáo thất bại. Vui lòng kiểm tra lại ID mục tiêu.";
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusTag = (status: string) => {
    switch (status) {
      case "resolved":
        return <Tag icon={<CheckCircleOutlined />} color="success">Đã giải quyết</Tag>;
      case "investigating":
      case "processing":
        return <Tag icon={<SyncOutlined spin />} color="processing">Đang điều tra</Tag>;
      case "rejected":
        return <Tag icon={<CloseCircleOutlined />} color="error">Đã từ chối</Tag>;
      case "pending":
      default:
        return <Tag icon={<ClockCircleOutlined />} color="warning">Chờ xử lý</Tag>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <AlertOutlined className="text-amber-500" /> Báo cáo vi phạm & Khiếu nại
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gửi phản ánh về tin tuyển dụng lừa đảo, doanh nghiệp có dấu hiệu vi phạm để bảo vệ cộng đồng ứng viên.
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 rounded-xl font-medium shrink-0"
        >
          Gửi báo cáo mới
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 bg-white rounded-2xl border border-slate-100">
          <Spin size="large" />
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Empty
            description={
              <div className="space-y-1">
                <p className="text-slate-700 font-semibold text-base">Chưa có báo cáo vi phạm nào</p>
                <p className="text-slate-400 text-xs">
                  Nếu bạn phát hiện tin tuyển dụng hoặc doanh nghiệp có dấu hiệu sai phạm, hãy tạo báo cáo.
                </p>
              </div>
            }
          >
            <Button
              type="primary"
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 rounded-xl mt-2 font-medium"
            >
              Gửi báo cáo ngay
            </Button>
          </Empty>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className="rounded-2xl border border-slate-100 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-50 pb-3">
                <div className="flex items-center gap-2">
                  <Tag color="cyan" className="font-semibold uppercase text-xs">
                    {report.report_type === "job" ? "Tin tuyển dụng" : report.report_type === "company" ? "Doanh nghiệp" : "Người dùng"}
                  </Tag>
                  <span className="text-xs text-slate-400 font-mono">
                    ID Đối tượng: #{report.target_id}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    {new Date(report.created_at).toLocaleDateString("vi-VN")}
                  </span>
                  {renderStatusTag(report.status)}
                </div>
              </div>

              <div className="mt-3">
                <h4 className="font-bold text-slate-800 text-sm">{report.reason}</h4>
                {report.description && (
                  <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap leading-relaxed">
                    {report.description}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal gửi báo cáo vi phạm */}
      <Modal
        title="Gửi báo cáo vi phạm mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
        className="rounded-2xl"
      >
        <Form form={form} layout="vertical" onFinish={handleCreateReport} className="mt-4">
          <Form.Item
            name="report_type"
            label="Loại đối tượng vi phạm"
            rules={[{ required: true, message: "Vui lòng chọn loại đối tượng" }]}
            initialValue="job"
          >
            <Select
              options={[
                { value: "job", label: "Tin tuyển dụng (Job)" },
                { value: "company", label: "Doanh nghiệp (Company)" },
                { value: "user", label: "Người dùng khác (User)" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="target_id"
            label="Mã ID đối tượng (Job ID / Company ID)"
            rules={[{ required: true, message: "Vui lòng nhập ID đối tượng" }]}
          >
            <Input type="number" placeholder="Ví dụ: 12" />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Lý do báo cáo"
            rules={[{ required: true, message: "Vui lòng nhập lý do ngắn gọn" }]}
          >
            <Input placeholder="Ví dụ: Thông tin tuyển dụng lừa đảo, thu phí bất hợp pháp..." />
          </Form.Item>

          <Form.Item
            name="description"
            label="Chi tiết phản ánh & Bằng chứng"
            rules={[{ required: true, message: "Vui lòng mô tả chi tiết" }]}
          >
            <TextArea rows={4} placeholder="Mô tả cụ thể hành vi vi phạm..." />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-slate-100">
            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={submitting} className="bg-blue-600 hover:bg-blue-700">
              Gửi báo cáo
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
