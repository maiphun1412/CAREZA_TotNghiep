"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Button, 
  Tag, 
  Spin, 
  Pagination, 
  App, 
  Tooltip, 
  Popconfirm 
} from "antd";
import { 
  HeartFilled, 
  EnvironmentOutlined, 
  DollarOutlined, 
  ClockCircleOutlined,
  BankOutlined,
  SearchOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { candidateService } from "@/services/candidate.service";

type AvailabilityFilter = "ALL" | "AVAILABLE" | "UNAVAILABLE";

interface BookmarkedJobItem {
  id: string;
  savedAt: string;
  job: {
    id: string;
    title: string | null;
    status: number | null;
    salaryMin: number | null;
    salaryMax: number | null;
    negotiableSalary: boolean;
    employmentType: number | null;
    workMode: number | null;
    locationText: string | null;
    expiredAt: string | null;
    isAvailable: boolean;
    isExpired: boolean;
    isClosed: boolean;
    isDeleted: boolean;
  };
  company: {
    id: string | null;
    name: string | null;
    logoUrl: string | null;
    slug: string | null;
  };
}

function SavedJobsContent() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<BookmarkedJobItem[]>([]);
  const [filter, setFilter] = useState<AvailabilityFilter>("ALL");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchSavedJobs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await candidateService.getBookmarkedJobs({
        page,
        pageSize,
        availability: filter,
      });

      if (response && response.data) {
        setJobs(response.data.items || []);
        setTotal(response.data.pagination?.total || 0);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Không thể tải danh sách việc làm đã lưu.";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filter, message]);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  const handleUnsave = async (jobId: string, jobTitle: string | null) => {
    setActionLoadingId(jobId);
    try {
      await candidateService.removeJobBookmark(jobId);
      message.success(`Đã bỏ lưu việc làm "${jobTitle || 'này'}"`);
      // Cập nhật lại danh sách trực tiếp trên UI
      setJobs((prev) => prev.filter((item) => item.job.id !== jobId));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Bỏ lưu việc làm thất bại. Vui lòng thử lại.";
      message.error(errorMsg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatSalary = (job: BookmarkedJobItem["job"]) => {
    if (job.negotiableSalary) return "Thương lượng";
    if (job.salaryMin && job.salaryMax) {
      const minMil = job.salaryMin / 1000000;
      const maxMil = job.salaryMax / 1000000;
      return `${minMil} - ${maxMil} triệu`;
    }
    if (job.salaryMin) {
      return `Từ ${job.salaryMin / 1000000} triệu`;
    }
    if (job.salaryMax) {
      return `Đến ${job.salaryMax / 1000000} triệu`;
    }
    return "Thương lượng";
  };

  const formatWorkMode = (mode: number | null) => {
    switch (mode) {
      case 1:
        return "Tại văn phòng";
      case 2:
        return "Hybrid";
      case 3:
        return "Từ xa (Remote)";
      default:
        return null;
    }
  };

  const formatDaysLeft = (expiredAtStr: string | null) => {
    if (!expiredAtStr) return null;
    const expiredAt = new Date(expiredAtStr);
    const now = new Date();
    const diffTime = expiredAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Đã hết hạn";
    if (diffDays === 0) return "Hết hạn hôm nay";
    return `Còn ${diffDays} ngày`;
  };

  return (
    <div className="space-y-6 flex-1 max-w-6xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0062ff] flex items-center justify-center text-xl shadow-xs">
              <HeartFilled className="text-[#0062ff]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                Việc làm đã lưu
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5 m-0">
                Lưu trữ và theo dõi các cơ hội nghề nghiệp phù hợp với bạn ({total} công việc)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            icon={<ReloadOutlined spin={loading} />} 
            onClick={fetchSavedJobs}
            className="rounded-xl font-bold text-xs h-9"
          >
            Làm mới
          </Button>
          <Link href="/viec-lam">
            <Button 
              type="primary" 
              icon={<SearchOutlined />} 
              className="bg-[#0062ff] hover:bg-[#0052d9] rounded-xl font-bold text-xs h-9 shadow-md shadow-blue-500/20"
            >
              Tìm thêm việc làm
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => { setFilter("ALL"); setPage(1); }}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === "ALL"
              ? "bg-white text-[#0062ff] shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Tất cả ({total})
        </button>
        <button
          type="button"
          onClick={() => { setFilter("AVAILABLE"); setPage(1); }}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === "AVAILABLE"
              ? "bg-white text-emerald-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Đang nhận hồ sơ
        </button>
        <button
          type="button"
          onClick={() => { setFilter("UNAVAILABLE"); setPage(1); }}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === "UNAVAILABLE"
              ? "bg-white text-amber-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Hết hạn / Đã đóng
        </button>
      </div>

      {/* Main Content List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-slate-100 shadow-xs">
          <Spin size="large" />
          <p className="text-xs text-slate-400 font-semibold mt-4">Đang tải danh sách công việc đã lưu...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 sm:p-16 bg-white rounded-3xl border border-slate-100 text-center shadow-xs">
          <div className="w-20 h-20 bg-blue-50 text-[#0062ff] rounded-3xl flex items-center justify-center text-3xl mb-4 shadow-inner">
            <HeartFilled className="text-blue-300" />
          </div>
          <h3 className="text-lg font-black text-slate-800 m-0">
            Bạn chưa lưu công việc nào
          </h3>
          <p className="text-xs text-slate-500 font-medium max-w-sm mt-1.5 mb-6 leading-relaxed">
            Khám phá hàng ngàn cơ hội việc làm hấp dẫn trên Careza và lưu lại để ứng tuyển bất cứ lúc nào.
          </p>
          <Link href="/viec-lam">
            <Button 
              type="primary" 
              size="large"
              icon={<SearchOutlined />} 
              className="bg-[#0062ff] hover:bg-[#0052d9] rounded-xl font-bold text-xs h-10 px-6 shadow-md shadow-blue-500/25"
            >
              Khám phá việc làm ngay
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {jobs.map((item) => {
            const { job, company, savedAt } = item;
            const daysLeftText = formatDaysLeft(job.expiredAt);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 hover:shadow-md ${
                  job.isAvailable 
                    ? "border-slate-200/80 hover:border-blue-200" 
                    : "border-slate-200/60 bg-slate-50/40 opacity-85"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Left Column: Logo + Title + Company + Tags */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Logo Công ty */}
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 p-1 flex-shrink-0 flex items-center justify-center shadow-xs overflow-hidden">
                      {company.logoUrl ? (
                        <img
                          src={company.logoUrl}
                          alt={company.name || "Company Logo"}
                          className="w-full h-full object-contain rounded-xl"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=80&h=80&q=80";
                          }}
                        />
                      ) : (
                        <BankOutlined className="text-2xl text-slate-300" />
                      )}
                    </div>

                    {/* Job Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Link
                          href={`/viec-lam/${job.id}`}
                          className={`font-black text-sm sm:text-base transition-colors truncate max-w-md ${
                            job.isAvailable
                              ? "text-slate-900 hover:text-[#0062ff]"
                              : "text-slate-600 line-through hover:text-slate-900"
                          }`}
                        >
                          {job.title || "Tin tuyển dụng không còn tồn tại"}
                        </Link>

                        {/* Status Badges */}
                        {job.isDeleted ? (
                          <Tag color="error" className="rounded-md text-[10px] font-extrabold m-0 uppercase">
                            Đã xóa
                          </Tag>
                        ) : job.isClosed ? (
                          <Tag color="default" className="rounded-md text-[10px] font-extrabold m-0 uppercase">
                            Tạm đóng
                          </Tag>
                        ) : job.isExpired ? (
                          <Tag color="warning" className="rounded-md text-[10px] font-extrabold m-0 uppercase">
                            Hết hạn ứng tuyển
                          </Tag>
                        ) : (
                          <Tag color="success" className="rounded-md text-[10px] font-extrabold m-0 uppercase">
                            Đang tuyển
                          </Tag>
                        )}
                      </div>

                      {/* Company Name */}
                      <div className="text-xs text-slate-500 font-semibold mb-2.5 truncate">
                        {company.name || "Doanh nghiệp ẩn danh"}
                      </div>

                      {/* Meta Tags: Lương, Địa điểm, WorkMode, Hạn */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                        {/* Lương */}
                        <div className="flex items-center gap-1 text-[#0062ff] font-bold">
                          <DollarOutlined />
                          <span>{formatSalary(job)}</span>
                        </div>

                        {/* Địa điểm */}
                        {job.locationText && (
                          <div className="flex items-center gap-1 text-slate-600 truncate max-w-[200px]">
                            <EnvironmentOutlined />
                            <span className="truncate">{job.locationText}</span>
                          </div>
                        )}

                        {/* Hình thức */}
                        {formatWorkMode(job.workMode) && (
                          <div className="hidden md:flex items-center gap-1 text-slate-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            <span>{formatWorkMode(job.workMode)}</span>
                          </div>
                        )}

                        {/* Hạn nộp */}
                        {daysLeftText && (
                          <div className={`flex items-center gap-1 text-[11px] ${
                            job.isExpired ? "text-red-500 font-bold" : "text-slate-400"
                          }`}>
                            <ClockCircleOutlined />
                            <span>{daysLeftText}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                    {/* Bỏ lưu */}
                    <Popconfirm
                      title="Bỏ lưu công việc này?"
                      description="Bạn có chắc chắn muốn bỏ lưu công việc này khỏi danh sách?"
                      onConfirm={() => handleUnsave(job.id, job.title)}
                      okText="Bỏ lưu"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true, size: "small" }}
                      cancelButtonProps={{ size: "small" }}
                    >
                      <Tooltip title="Bỏ lưu">
                        <Button
                          type="text"
                          loading={actionLoadingId === job.id}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-rose-500 hover:text-rose-600 hover:bg-rose-50 border border-rose-100"
                          icon={<HeartFilled className="text-base" />}
                        />
                      </Tooltip>
                    </Popconfirm>

                    {/* Xem chi tiết */}
                    <Link href={`/viec-lam/${job.id}`}>
                      <Button
                        type="default"
                        icon={<EyeOutlined />}
                        className="rounded-xl font-bold text-xs h-9 border-slate-200 text-slate-700 hover:border-blue-300 hover:text-[#0062ff]"
                      >
                        Chi tiết
                      </Button>
                    </Link>

                    {/* Ứng tuyển */}
                    <Link href={`/viec-lam/${job.id}`}>
                      <Button
                        type="primary"
                        disabled={!job.isAvailable}
                        icon={<ThunderboltOutlined />}
                        className={`rounded-xl font-bold text-xs h-9 shadow-sm ${
                          job.isAvailable
                            ? "bg-[#0062ff] hover:bg-[#0052d9] text-white shadow-blue-500/20"
                            : "bg-slate-200 text-slate-400 border-none"
                        }`}
                      >
                        Ứng tuyển
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Footer Ngày lưu */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Đã lưu vào: {new Date(savedAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  {!job.isAvailable && (
                    <span className="text-amber-600 font-medium">Tin tuyển dụng này hiện không còn nhận hồ sơ mới.</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Phân trang */}
          {total > pageSize && (
            <div className="flex justify-center pt-6">
              <Pagination
                current={page}
                pageSize={pageSize}
                total={total}
                onChange={(p) => setPage(p)}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SavedJobsPage() {
  return (
    <App>
      <SavedJobsContent />
    </App>
  );
}

