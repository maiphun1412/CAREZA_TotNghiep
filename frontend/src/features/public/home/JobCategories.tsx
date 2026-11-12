"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MouseSpotlight from "@/components/common/mouse-spotlight";
import { apiClient } from "@/services/api-client";

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  jobs_count: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  "cong-nghe-thong-tin": "code",
  "kinh-doanh": "business_center",
  "marketing": "campaign",
  "thiet-ke": "palette",
  "tai-chinh": "account_balance",
  "nhan-su": "group",
};

export default function JobCategories() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/public/landing/")
      .then((res) => {
        if (res.data?.data?.categories && res.data.data.categories.length > 0) {
          setCategories(res.data.data.categories);
        }
      })
      .catch((err) => {
        console.warn("Lỗi nạp danh mục nghề nghiệp:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section className="py-5 md:py-7 bg-gradient-to-br from-[#f0f4ff]/80 via-[#fcfdff] to-[#e6f7f4]/70 w-full border-b border-outline-variant/15 relative overflow-hidden">
      <MouseSpotlight size={600} color="rgba(15, 82, 186, 0.04)" />
      <div className="max-w-container-max mx-auto px-margin-desktop relative z-10">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black mb-2 tracking-tight">Thị trường nghề nghiệp</h2>
          <p className="text-base text-on-surface-variant max-w-2xl mx-auto">
            Hệ sinh thái đa dạng từ công nghệ tới sáng tạo, giúp bạn tìm thấy bến đỗ lý tưởng.
          </p>
        </div>
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {categories.map((cat) => {
              const icon = CATEGORY_ICONS[cat.slug] || "work";
              return (
                <Link
                  key={cat.id}
                  href={`/viec-lam?industry_id=${cat.id}`}
                  className="bg-white p-6 rounded-[28px] border border-blue-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col items-center text-center no-underline"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all text-primary">
                    <span className="material-symbols-outlined text-[32px]">{icon}</span>
                  </div>
                  <h4 className="text-lg font-extrabold mb-1.5 text-slate-900 group-hover:text-primary transition-colors">
                    {cat.name}
                  </h4>
                  <p className="text-xs font-bold text-slate-500">
                    {cat.jobs_count > 0 ? `${cat.jobs_count} vị trí đang tuyển` : "Đang cập nhật"}
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-sm">
            {loading ? "Đang tải dữ liệu ngành nghề..." : "Chưa có danh mục ngành nghề nào được kích hoạt."}
          </div>
        )}
      </div>
    </section>
  );
}
