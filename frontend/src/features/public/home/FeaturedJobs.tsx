import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MouseSpotlight from "@/components/common/mouse-spotlight";
import { apiClient } from "@/services/api-client";
import { candidateService } from "@/services/candidate.service";
import { useAuthStore } from "@/store/auth-store";
import { Spin, App } from "antd";

const JOBS = [
  {
    id: "job-1",
    title: "Senior Product Designer",
    company: "FPT Software",
    location: "TP. Hồ Chí Minh",
    logo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/FPT_Software_logo.svg",
    matchScore: "Nổi bật",
    salary: "45tr - 80tr",
    type: "Toàn thời gian",
    workMode: "Tại văn phòng",
    updatedTime: "Mới đăng",
    badgeType: "premium",
  },
  {
    id: "job-2",
    title: "Data Engineering Manager",
    company: "Shopee Vietnam",
    location: "TP. Hồ Chí Minh",
    logo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Shopee.svg",
    matchScore: "Nổi bật",
    salary: "Thỏa thuận",
    type: "Hợp đồng",
    workMode: "Linh hoạt (Hybrid)",
    updatedTime: "Mới đăng",
    badgeType: "premium",
  },
  {
    id: "job-3",
    title: "Senior Business Analyst",
    company: "Techcombank",
    location: "Hà Nội",
    logo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Techcombank_logo.png",
    matchScore: "Nổi bật",
    salary: "35tr - 55tr",
    type: "Toàn thời gian",
    workMode: "Tại văn phòng",
    updatedTime: "Mới đăng",
    badgeType: "premium",
  },
  {
    id: "job-4",
    title: "Fullstack Developer (React/Node.js)",
    company: "VNG Corporation",
    location: "TP. Hồ Chí Minh",
    logo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/VNG_Corp._logo.svg",
    matchScore: "Nổi bật",
    salary: "25tr - 45tr",
    type: "Toàn thời gian",
    workMode: "Linh hoạt (Hybrid)",
    updatedTime: "Mới đăng",
    badgeType: "premium",
  },
  {
    id: "job-5",
    title: "AI/ML Engineer Fresher (NLP & LLMs)",
    company: "Viettel AI",
    location: "Hà Nội",
    logo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Viettel_logo_2021.svg",
    matchScore: "Nổi bật",
    salary: "18tr - 30tr",
    type: "Toàn thời gian",
    workMode: "Tại văn phòng",
    updatedTime: "Mới đăng",
    badgeType: "premium",
  },
  {
    id: "job-6",
    title: "Product Manager Fresher / Associate",
    company: "MISA JSC",
    location: "Hà Nội",
    logo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Logo_MISA_JSC_Vie.jpg",
    matchScore: "Nổi bật",
    salary: "15tr - 25tr",
    type: "Toàn thời gian",
    workMode: "Toàn thời gian",
    updatedTime: "Mới đăng",
    badgeType: "premium",
  },
];

export default function FeaturedJobs() {
  const { message } = App.useApp();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedJobIds, setBookmarkedJobIds] = useState<string[]>([]);
  const [bookmarkingId, setBookmarkingId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      candidateService.getBookmarkedJobIds()
        .then((res) => {
          if (res?.data?.ids) {
            setBookmarkedJobIds(res.data.ids);
          }
        })
        .catch(() => {});
    } else {
      setBookmarkedJobIds([]);
    }
  }, [isAuthenticated]);

  const handleBookmarkJob = async (e: React.MouseEvent, jobId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/dang-nhap?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setBookmarkingId(jobId);
    const isCurrentlySaved = bookmarkedJobIds.includes(jobId);

    try {
      if (isCurrentlySaved) {
        await candidateService.removeJobBookmark(jobId);
        setBookmarkedJobIds((prev) => prev.filter((id) => id !== jobId));
        message.success("Đã bỏ lưu việc làm");
      } else {
        await candidateService.saveJobBookmark(jobId);
        setBookmarkedJobIds((prev) => [...prev, jobId]);
        message.success("Đã lưu việc làm vào danh sách yêu thích");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Thao tác thất bại. Vui lòng thử lại.";
      message.error(errorMsg);
    } finally {
      setBookmarkingId(null);
    }
  };

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get("/jobs", { params: { limit: 6 } });
        const fetchedJobs = res.data?.data?.jobs || [];
        
        const formatted = fetchedJobs.slice(0, 6).map((j: any, index: number) => {
          const jobId = j.id || j.JobPostId || `featured-job-${index}`;
          const salaryMin = j.salaryMin ?? j.SalaryMin;
          const salaryMax = j.salaryMax ?? j.SalaryMax;
          const workModeVal = j.workMode ?? j.WorkMode;
          const empTypeVal = j.employmentType ?? j.EmploymentType;
          const compName = j.company?.name || j.CompanyName || "Công ty ẩn danh";
          const compLogo = j.company?.logoUrl || j.LogoUrl || "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=80&h=80&q=80";
          const location = j.branch?.address || j.branch?.provinceName || j.LocationText || "Toàn quốc";

          let salary = "Thỏa thuận";
          if (j.negotiableSalary) {
            salary = "Thỏa thuận";
          } else if (salaryMin && salaryMax) {
            salary = `${Math.round(salaryMin / 1000000)}tr - ${Math.round(salaryMax / 1000000)}tr`;
          } else if (salaryMin) {
            salary = `Từ ${Math.round(salaryMin / 1000000)}tr`;
          } else if (salaryMax) {
            salary = `Đến ${Math.round(salaryMax / 1000000)}tr`;
          }

          let workMode = "Tại văn phòng";
          if (workModeVal === 2) workMode = "Linh hoạt (Hybrid)";
          if (workModeVal === 3) workMode = "Làm việc từ xa";

          return {
            id: jobId,
            title: j.title || j.Title || "Vị trí tuyển dụng",
            company: compName,
            location,
            logo: compLogo,
            matchScore: "Nổi bật",
            salary,
            type: empTypeVal === 2 ? "Bán thời gian" : "Toàn thời gian",
            workMode,
            updatedTime: "Mới đăng",
            badgeType: "premium",
          };
        });

        if (formatted.length > 0) {
          setJobs(formatted);
        } else {
          setJobs(JOBS);
        }
      } catch (error) {
        console.error("Lỗi fetch featured jobs:", error);
        setJobs(JOBS);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedJobs();
  }, []);

  return (
    <section className="py-10 md:py-14 bg-[#f8faff] w-full border-b border-outline-variant/15 relative overflow-hidden">
      <MouseSpotlight size={600} color="rgba(15, 82, 186, 0.04)" />
      <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8 xl:px-margin-desktop relative z-10 w-full">
        {/* Khung panel trắng bo góc bao bọc toàn bộ */}
        <div className="bg-white rounded-[40px] p-6 sm:p-8 md:p-12 border border-blue-100/70 shadow-sm relative overflow-hidden">
          {/* Header Section: Cơ hội tuyển chọn (trái) - Việc làm nổi bật hôm nay (giữa) - Xem tất cả cơ hội (phải) */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-10 gap-4">
            {/* Trái: Badge Cơ hội tuyển chọn */}
            <div className="w-full md:w-1/4 flex justify-center md:justify-start">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Cơ hội tuyển chọn</span>
              </div>
            </div>

            {/* Giữa: Tiêu đề Việc làm nổi bật hôm nay */}
            <div className="w-full md:w-2/4 text-center">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                Việc làm nổi bật hôm nay
              </h2>
            </div>

            {/* Phải: Xem tất cả cơ hội */}
            <div className="w-full md:w-1/4 flex justify-center md:justify-end">
              <Link
                href="/viec-lam"
                className="text-primary text-sm font-bold inline-flex items-center gap-1.5 hover:gap-3 transition-all group"
              >
                <span>Xem tất cả cơ hội</span>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>

          {/* Danh sách Job Cards */}
          <div className="relative">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" />
              </div>
            ) : jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/viec-lam/${job.id}`}
                    className="group bg-slate-50/70 hover:bg-white rounded-[28px] p-7 border border-slate-200/80 hover:border-primary/40 shadow-xs hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col relative btn-float overflow-hidden"
                  >
                    <MouseSpotlight size={250} color="rgba(15, 82, 186, 0.04)" />
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 p-2 flex items-center justify-center shadow-xs">
                        <img
                          src={job.logo}
                          alt={job.company}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=80&h=80&q=80";
                          }}
                        />
                      </div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">star</span>
                        {job.matchScore || "NỔI BẬT"}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-1 mb-1.5">
                      {job.title}
                    </h3>
                    <p className="text-slate-500 text-xs font-semibold mb-5 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px]">business</span>
                      {job.company}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="bg-white border border-slate-200/60 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 text-slate-700">
                        <span className="material-symbols-outlined text-primary text-[15px]">payments</span> {job.salary}
                      </span>
                      <span className="bg-white border border-slate-200/60 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 text-slate-700">
                        <span className="material-symbols-outlined text-primary text-[15px]">work</span>
                        {job.type}
                      </span>
                    </div>
                    <div className="mt-auto pt-5 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium italic">{job.updatedTime}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleBookmarkJob(e, job.id)}
                          disabled={bookmarkingId === job.id}
                          title={bookmarkedJobIds.includes(job.id) ? "Bỏ lưu việc làm" : "Lưu việc làm"}
                          className={`p-2.5 rounded-xl transition-all cursor-pointer border-none flex items-center justify-center ${
                            bookmarkedJobIds.includes(job.id)
                              ? "text-[#0062ff] bg-blue-50"
                              : "text-slate-400 hover:bg-primary/5 hover:text-primary bg-transparent"
                          }`}
                        >
                          <span
                            className="material-symbols-outlined text-lg"
                            style={{ fontVariationSettings: bookmarkedJobIds.includes(job.id) ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            bookmark
                          </span>
                        </button>
                        <button className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-primary/20 hover:scale-103 transition-all btn-float cursor-pointer">
                          Ứng tuyển
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-on-surface-variant font-bold">
                Chưa có dữ liệu việc làm
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
