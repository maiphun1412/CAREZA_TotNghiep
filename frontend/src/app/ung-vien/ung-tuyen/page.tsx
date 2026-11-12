"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/services/api-client";
import { candidateService } from "@/services/candidate.service";

import { Card, Table, Tag, Button, Empty, Spin, message, Typography } from "antd";
import { RightOutlined, SendOutlined } from "@ant-design/icons";
import { Eye, FileText } from "lucide-react";

const { Title, Text } = Typography;

export default function CandidateApplicationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await candidateService.getMyApplications();
      const list = response?.data?.applications || [];
      setApplications(
        list.map((app: any) => ({
          key: String(app.id || app.applicationId),
          jobId: app.job?.id,
          jobTitle: app.job?.title || app.jobPostTitle || app.title || "Vị trí tuyển dụng",
          companyName: app.job?.company_name || app.company?.name || app.companyName || "Doanh nghiệp",
          cvTitle: app.cv?.title || "CV đã nộp",
          cvFileUrl: app.cv?.file_url || null,
          appliedAt: app.applied_at || app.created_at || app.appliedAt
            ? new Date(app.applied_at || app.created_at || app.appliedAt).toLocaleDateString("vi-VN")
            : "Mới đây",
          status: app.status || app.applicationStatus || "pending",
        }))
      );
    } catch {
      setError("Không thể tải lịch sử ứng tuyển từ máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStatusTag = (status: any) => {
    const st = String(status || "").toLowerCase();
    if (st === "withdrawn" || st === "2") return <Tag color="default" className="rounded-md font-medium">Đã rút đơn</Tag>;
    if (st === "rejected" || st === "3") return <Tag color="red" className="rounded-md font-medium">Không phù hợp</Tag>;
    if (st === "hired" || st === "accepted" || st === "4") return <Tag color="green" className="rounded-md font-medium">Trúng tuyển</Tag>;
    if (st === "offered" || st === "offer") return <Tag color="gold" className="rounded-md font-medium">Đã gửi Offer</Tag>;
    if (st === "interview") return <Tag color="orange" className="rounded-md font-medium">Mời phỏng vấn</Tag>;
    if (st === "shortlisted" || st === "test" || st === "matched") return <Tag color="cyan" className="rounded-md font-medium">Phù hợp / Test</Tag>;
    if (st === "screening" || st === "reviewing") return <Tag color="purple" className="rounded-md font-medium">Đang sàng lọc</Tag>;
    return <Tag color="blue" className="rounded-md font-medium">Mới nộp (Chờ xử lý)</Tag>;
  };

  const columns = [
    {
      title: "Công việc đã ứng tuyển",
      dataIndex: "jobTitle",
      key: "jobTitle",
      render: (text: string, record: any) => (
        <div>
          {record.jobId ? (
            <Link
              href={`/viec-lam/${record.jobId}`}
              className="font-bold text-slate-800 hover:text-[#0062ff] text-sm sm:text-base block transition-colors"
            >
              {text}
            </Link>
          ) : (
            <span className="font-bold text-slate-800 text-sm sm:text-base block">{text}</span>
          )}
          <span className="text-xs text-slate-500 block mt-1">{record.companyName}</span>
        </div>
      ),
    },
    {
      title: "CV đã nộp",
      dataIndex: "cvTitle",
      key: "cvTitle",
      width: 170,
      render: (text: string, record: any) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700">
          <span className="font-medium truncate max-w-[130px]">{text}</span>
          {record.cvFileUrl && (
            <a
              href={record.cvFileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[#0062ff] hover:underline"
              title="Xem CV"
            >
              <Eye className="w-3.5 h-3.5 inline" />
            </a>
          )}
        </div>
      ),
    },
    {
      title: "Ngày nộp",
      dataIndex: "appliedAt",
      key: "appliedAt",
      width: 120,
      render: (text: string) => <span className="text-xs text-slate-500">{text}</span>,
    },
    {
      title: "Trạng thái đơn",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: any) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 125,
      render: (_: any, record: any) => (
        <Link href={`/ung-vien/ung-tuyen/${record.key}`}>
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0062ff] font-bold text-xs border border-blue-200/80 transition-colors shadow-2xs">
            Chi tiết đơn <RightOutlined className="text-[9px]" />
          </span>
        </Link>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40 flex-1">
        <Spin size="large" description="Đang tải lịch sử ứng tuyển..." />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 pb-8">
      {/* 1. Breadcrumb nằm phía trên ngoài khung tiêu đề */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-3">
        <Link href="/" className="hover:text-[#0062ff] transition-colors">
          Trang chủ
        </Link>
        <span className="text-slate-300">/</span>
        <Link href="/ung-vien/ho-so" className="hover:text-[#0062ff] transition-colors">
          Ứng viên
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-800 font-semibold">Lịch sử ứng tuyển</span>
      </div>

      {/* 2. Khung tiêu đề trang nền xanh dương nhạt chuẩn CAREZA (cao 90–105px) */}
      <div className="relative w-full rounded-2xl overflow-hidden h-[96px] md:h-[98px] bg-gradient-to-r from-blue-50/90 via-white to-blue-50/60 border border-blue-200/90 shadow-2xs px-5 sm:px-7 flex items-center justify-between gap-3.5 mb-3.5">
        <div className="relative -top-1 space-y-0.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-100/90 text-[#0062ff] border border-blue-200/80 flex items-center justify-center shrink-0 shadow-2xs">
              <FileText className="w-4 h-4" />
            </div>
            <h1 className="text-[23px] sm:text-[24px] font-bold text-slate-900 tracking-tight m-0 leading-tight">
              Lịch sử ứng tuyển
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium m-0 ml-9.5">
            Theo dõi trạng thái và tiến độ xử lý các hồ sơ đã nộp tới nhà tuyển dụng.
          </p>
        </div>

        {/* Badge tổng số đơn bên phải căn giữa theo banner */}
        <div className="bg-white/95 backdrop-blur-xs border border-blue-200/90 rounded-xl px-4 py-2 shadow-2xs flex items-center gap-2 shrink-0 self-center">
          <span className="text-xs font-semibold text-slate-600">Tổng số đơn:</span>
          <span className="text-sm font-black text-[#0062ff]">{applications.length}</span>
        </div>
      </div>

      {error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
          <p className="text-rose-700 font-semibold text-sm sm:text-base m-0">{error}</p>
          <Button
            type="primary"
            danger
            onClick={fetchApplications}
            className="rounded-xl font-medium"
          >
            Tải lại trang
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5ECF6] shadow-2xs p-4 sm:p-5 overflow-hidden">
          {applications.length === 0 ? (
            <div className="py-14 text-center">
              <Empty
                description={<span className="text-slate-500 text-xs sm:text-sm">Bạn chưa nộp hồ sơ ứng tuyển nào.</span>}
                image={<SendOutlined className="text-slate-300 text-5xl mb-3" />}
              >
                <div className="pt-2">
                  <Link href="/viec-lam">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer border-none"
                    >
                      Tìm việc làm ngay →
                    </button>
                  </Link>
                </div>
              </Empty>
            </div>
          ) : (
            <Table
              dataSource={applications}
              columns={columns}
              pagination={{ pageSize: 8, showSizeChanger: false }}
              className="custom-table"
              size="middle"
            />
          )}
        </div>
      )}
    </div>
  );
}
