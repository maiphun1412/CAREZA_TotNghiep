"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MouseSpotlight from "@/components/common/mouse-spotlight";
import { apiClient } from "@/services/api-client";

interface CategoryChip {
  id: number;
  name: string;
  slug: string;
}

export default function HeroSection() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [totalJobs, setTotalJobs] = useState<number>(0);
  const [categories, setCategories] = useState<CategoryChip[]>([]);

  useEffect(() => {
    apiClient.get("/public/landing/")
      .then((res) => {
        if (res.data?.data) {
          if (res.data.data.stats?.total_jobs !== undefined) {
            setTotalJobs(res.data.data.stats.total_jobs);
          }
          if (Array.isArray(res.data.data.categories) && res.data.data.categories.length > 0) {
            setCategories(res.data.data.categories.slice(0, 4));
          }
        }
      })
      .catch((err) => {
        console.warn("Lỗi nạp dữ liệu landing hero:", err);
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) {
      params.set("keyword", keyword.trim());
    }
    if (location && location !== "Toàn quốc") {
      params.set("location", location);
    }
    const queryStr = params.toString();
    router.push(queryStr ? `/viec-lam?${queryStr}` : "/viec-lam");
  };

  return (
    <section className="relative overflow-hidden bg-[#f5f8ff]">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Blur */}
        <div className="absolute -top-32 -left-24 w-[520px] h-[520px] rounded-full bg-blue-300/20 blur-[120px]" />
        <div className="absolute top-10 right-[-100px] w-[520px] h-[520px] rounded-full bg-cyan-300/20 blur-[130px]" />
        <div className="absolute bottom-[-220px] left-[35%] w-[500px] h-[500px] rounded-full bg-indigo-200/30 blur-[130px]" />

        {/* Grid mờ */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(#0f52ba 1px, transparent 1px),
              linear-gradient(90deg, #0f52ba 1px, transparent 1px)
            `,
            backgroundSize: "44px 44px",
          }}
        />

        {/* Spotlight bám theo chuột */}
        <MouseSpotlight />
      </div>

      <div className="relative max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 pb-6 sm:pb-8">
        {/* Hero panel */}
        <div className="relative rounded-[32px] lg:rounded-[36px] border border-white/80 bg-white/45 backdrop-blur-[2px] overflow-hidden">
          {/* accent */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-600 via-cyan-500 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_.95fr] gap-8 lg:gap-10 items-center px-6 sm:px-8 lg:px-11 py-8 sm:py-10 lg:py-11">
            {/* LEFT */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-blue-100 shadow-sm text-xs font-bold text-primary mb-5">
                <span className="material-symbols-outlined text-[16px]">
                  verified
                </span>
                Nền tảng tuyển dụng thông minh Careza
              </div>

              <h1 className="text-[38px] lg:text-[50px] font-black text-on-surface leading-[1.08] tracking-[-0.04em] mb-4">
                Kết nối nhân tài –
                <br />
                <span className="bg-gradient-to-r from-[#0756c9] via-[#168cc3] to-[#18b7a7] bg-clip-text text-transparent">
                  Kiến tạo tương lai
                </span>
              </h1>

              <p className="text-[15.5px] lg:text-[16.5px] text-on-surface-variant max-w-[620px] leading-[1.65] mb-6">
                Ứng dụng công nghệ hiện đại để thấu hiểu kỹ năng và tiềm năng của từng ứng viên.
              </p>

              {/* Search */}
              <form
                onSubmit={handleSearch}
                className="bg-white p-2 rounded-[22px] shadow-[0_20px_50px_rgba(15,82,186,0.12)] flex flex-col md:flex-row gap-2 border border-blue-100 max-w-2xl"
              >
                <div className="flex-1 flex items-center px-4 md:border-r border-slate-200 group">
                  <span className="material-symbols-outlined text-primary/60 mr-3">
                    search
                  </span>

                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full border-none focus:ring-0 bg-transparent placeholder:text-slate-400 font-medium py-3 outline-none"
                    placeholder="Vị trí, kỹ năng, công ty..."
                    type="text"
                  />
                </div>

                <div className="flex-1 flex items-center px-4 md:border-r border-slate-200">
                  <span className="material-symbols-outlined text-primary/60 mr-3">
                    location_on
                  </span>

                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border-none focus:ring-0 appearance-none bg-transparent font-medium py-3 outline-none"
                  >
                    <option value="">Toàn quốc</option>
                    <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="bg-primary text-white px-9 py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 hover:shadow-xl transition-all cursor-pointer"
                >
                  Tìm ngay
                </button>
              </form>

              {/* Trending */}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2.5 items-center mt-5">
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.14em]">
                    Ngành nghề:
                  </span>

                  {categories.map((item) => (
                    <Link
                      key={item.id}
                      href={`/viec-lam?industry_id=${item.id}`}
                      className="text-xs px-4 py-2 bg-white/80 border border-slate-200 rounded-full hover:border-primary hover:text-primary hover:bg-white transition-all shadow-sm"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div className="relative hidden lg:flex min-h-[370px] items-center justify-center">
              {/* back panels */}
              <div className="absolute w-[88%] h-[80%] rounded-[42px] bg-gradient-to-br from-blue-200/45 to-cyan-100/30 rotate-3" />
              <div className="absolute w-[88%] h-[80%] rounded-[42px] border border-white/80 bg-white/35 -rotate-2" />

              <div className="relative z-10 w-[90%] rounded-[36px] bg-white/75 backdrop-blur-xl border border-white p-4 shadow-[0_30px_80px_rgba(15,82,186,0.18)]">
                <img
                  className="w-full rounded-[26px] object-cover"
                  alt="Careza recruitment dashboard"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3GkvC7Zg9l0uBxbR8eiTJm5AYR6cu7jk0Uk-H3pCCwJRWbWX5YFeV2i5-i5v74-V8NvvLGWF-fPkZwEggw4_ja0uK1jbpMgsPDMRc2uVVyQSChO-NMWk9CsQwSkYj3wsvM5mGCCPa3dnOoivpVm1s3Z_lu7IVD5-AjlI32Cttg9phsXbp58YGV1gp7_wxlBcquY39PGbmtDdfKJYBNpp8hEr3kIFpOsyWlm1JPCNd7LwxvdI3W0SV"
                />

                {/* Match card */}
                <div className="absolute -bottom-7 -left-10 bg-white/95 backdrop-blur-xl px-5 py-4 rounded-2xl shadow-2xl border border-blue-100 flex items-center gap-4 animate-float-subtle">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined">
                      bolt
                    </span>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-500 font-bold">
                      Hồ sơ chuẩn hóa
                    </p>
                    <p className="text-xl font-black text-slate-900">
                      Chính xác
                    </p>
                  </div>
                </div>

                {/* floating mini badge */}
                <div className="absolute -top-6 -right-5 bg-white px-4 py-3 rounded-2xl shadow-xl border border-blue-100 animate-float-subtle-delay">
                  <p className="text-[10px] text-slate-400 font-semibold">
                    VIỆC LÀM ĐANG TUYỂN
                  </p>
                  <p className="text-base font-black text-primary">
                    {totalJobs > 0 ? `+${totalJobs}` : "0"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
