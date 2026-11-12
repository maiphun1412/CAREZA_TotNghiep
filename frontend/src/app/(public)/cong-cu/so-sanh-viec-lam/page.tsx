"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  Button,
  Tag,
  Spin,
  Empty,
  App,
  Popconfirm,
  Avatar,
  Table,
} from "antd";
import {
  ApartmentOutlined,
  DeleteOutlined,
  ClearOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  SendOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { interactionService } from "@/services/interaction.service";

export default function JobComparisonPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [comparisons, setComparisons] = useState<any[]>([]);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const fetchComparisons = useCallback(async () => {
    setLoading(true);
    try {
      const data = await interactionService.getJobComparisons();
      setComparisons(data || []);
    } catch {
      message.error("Không thể tải dữ liệu bảng so sánh việc làm.");
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    fetchComparisons();
  }, [fetchComparisons]);

  const handleRemove = async (jobId: number) => {
    setRemovingId(jobId);
    try {
      await interactionService.removeJobComparison(jobId);
      message.success("Đã gỡ công việc khỏi bảng so sánh.");
      setComparisons((prev) => prev.filter((item) => item.job?.id !== jobId && item.id !== jobId));
    } catch {
      message.error("Gỡ công việc thất bại.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleClearAll = async () => {
    try {
      await interactionService.clearJobComparisons();
      message.success("Đã xóa toàn bộ bảng so sánh.");
      setComparisons([]);
    } catch {
      message.error("Xóa bảng so sánh thất bại.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
            <ApartmentOutlined /> Công cụ nghề nghiệp Careza
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Bảng so sánh việc làm
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Đặt các vị trí tuyển dụng bạn đang cân nhắc lên bàn cân để đối chiếu mức đãi ngộ, địa điểm làm việc và yêu cầu kinh nghiệm trước khi nộp hồ sơ.
          </p>
        </div>

        {comparisons.length > 0 && (
          <Popconfirm
            title="Xóa tất cả việc làm khỏi bảng so sánh?"
            onConfirm={handleClearAll}
            okText="Xóa tất cả"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<ClearOutlined />} className="rounded-xl shrink-0">
              Xóa bảng so sánh ({comparisons.length})
            </Button>
          </Popconfirm>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-28 bg-white rounded-2xl border border-slate-100">
          <Spin size="large" />
        </div>
      ) : comparisons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Empty
            description={
              <div className="space-y-2">
                <p className="text-slate-700 font-bold text-lg">Chưa có công việc nào trong bảng so sánh</p>
                <p className="text-slate-400 text-xs max-w-md mx-auto">
                  Khi tìm kiếm việc làm, bạn có thể nhấn biểu tượng so sánh trên mỗi tin tuyển dụng để đưa vào bảng đối chiếu.
                </p>
              </div>
            }
          >
            <Link href="/viec-lam">
              <Button type="primary" className="bg-blue-600 hover:bg-blue-700 rounded-xl mt-3 font-medium">
                Khám phá việc làm ngay <ArrowRightOutlined />
              </Button>
            </Link>
          </Empty>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl border border-slate-100 shadow-xs">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-44">
                  Tiêu chí đối chiếu
                </th>
                {comparisons.map((item) => {
                  const job = item.job || item;
                  return (
                    <th key={job.id} className="p-4 min-w-[240px] max-w-[320px] align-top">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={job.company?.logo_url}
                            shape="square"
                            size={44}
                            className="bg-white border border-slate-100 rounded-xl shrink-0"
                          />
                          <div>
                            <Link
                              href={`/viec-lam/${job.id}`}
                              className="font-bold text-slate-800 hover:text-blue-600 text-sm line-clamp-2 block transition-colors leading-snug"
                            >
                              {job.title}
                            </Link>
                            <span className="text-xs text-slate-500 font-normal block truncate mt-0.5">
                              {job.company?.name || "Doanh nghiệp"}
                            </span>
                          </div>
                        </div>

                        <Button
                          size="small"
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          loading={removingId === job.id}
                          onClick={() => handleRemove(job.id)}
                          title="Gỡ khỏi so sánh"
                        />
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {/* 1. Mức lương */}
              <tr>
                <td className="p-4 text-xs font-bold text-slate-500 bg-slate-50/30">
                  <DollarOutlined className="text-emerald-500 mr-1.5" /> Mức lương
                </td>
                {comparisons.map((item) => {
                  const job = item.job || item;
                  const min = job.salary_min ? job.salary_min / 1000000 : null;
                  const max = job.salary_max ? job.salary_max / 1000000 : null;
                  const salaryText =
                    min && max
                      ? `${min} - ${max} triệu VNĐ`
                      : min
                      ? `Từ ${min} triệu VNĐ`
                      : max
                      ? `Đến ${max} triệu VNĐ`
                      : "Thương lượng";
                  return (
                    <td key={job.id} className="p-4 font-bold text-emerald-600">
                      {salaryText}
                    </td>
                  );
                })}
              </tr>

              {/* 2. Địa điểm */}
              <tr>
                <td className="p-4 text-xs font-bold text-slate-500 bg-slate-50/30">
                  <EnvironmentOutlined className="text-blue-500 mr-1.5" /> Địa điểm làm việc
                </td>
                {comparisons.map((item) => {
                  const job = item.job || item;
                  return (
                    <td key={job.id} className="p-4 text-slate-700">
                      {job.location || job.company?.location || "Toàn quốc"}
                    </td>
                  );
                })}
              </tr>

              {/* 3. Hình thức làm việc */}
              <tr>
                <td className="p-4 text-xs font-bold text-slate-500 bg-slate-50/30">
                  Hình thức làm việc
                </td>
                {comparisons.map((item) => {
                  const job = item.job || item;
                  const workType = job.work_type || (job.work_mode === 2 ? "Hybrid" : job.work_mode === 3 ? "Remote" : "Toàn thời gian");
                  return (
                    <td key={job.id} className="p-4">
                      <Tag color="geekblue" className="rounded-lg font-medium">
                        {workType}
                      </Tag>
                    </td>
                  );
                })}
              </tr>

              {/* 4. Hạn nộp hồ sơ */}
              <tr>
                <td className="p-4 text-xs font-bold text-slate-500 bg-slate-50/30">
                  <CalendarOutlined className="text-amber-500 mr-1.5" /> Hạn nộp hồ sơ
                </td>
                {comparisons.map((item) => {
                  const job = item.job || item;
                  const deadline = job.deadline
                    ? new Date(job.deadline).toLocaleDateString("vi-VN")
                    : "Đang mở tuyển";
                  return (
                    <td key={job.id} className="p-4 text-slate-600 text-xs">
                      {deadline}
                    </td>
                  );
                })}
              </tr>

              {/* 5. Thao tác */}
              <tr>
                <td className="p-4 text-xs font-bold text-slate-500 bg-slate-50/30">
                  Hành động
                </td>
                {comparisons.map((item) => {
                  const job = item.job || item;
                  return (
                    <td key={job.id} className="p-4">
                      <Link href={`/viec-lam/${job.id}`}>
                        <Button
                          type="primary"
                          icon={<SendOutlined />}
                          className="bg-blue-600 hover:bg-blue-700 rounded-xl font-medium w-full text-xs"
                        >
                          Ứng tuyển ngay
                        </Button>
                      </Link>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
