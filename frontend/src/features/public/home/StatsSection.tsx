"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/services/api-client";

export default function StatsSection() {
  const [stats, setStats] = useState({
    total_jobs: 0,
    total_companies: 0,
    total_candidates: 0,
    total_applications: 0,
  });

  useEffect(() => {
    apiClient.get("/public/landing/")
      .then((res) => {
        if (res.data?.data?.stats) {
          setStats(res.data.data.stats);
        }
      })
      .catch((err) => {
        console.warn("Lỗi nạp thống kê trang chủ:", err);
      });
  }, []);

  const formatCount = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k+";
    }
    return String(num);
  };

  const statItems = [
    {
      value: formatCount(stats.total_jobs),
      label: "Việc làm đang tuyển",
      icon: "work",
    },
    {
      value: formatCount(stats.total_companies),
      label: "Doanh nghiệp tuyển dụng",
      icon: "apartment",
    },
    {
      value: formatCount(stats.total_candidates),
      label: "Ứng viên tìm việc",
      icon: "group",
    },
    {
      value: formatCount(stats.total_applications),
      label: "Hồ sơ ứng tuyển",
      icon: "send",
    },
  ];

  return (
    <section className="relative z-20 -mt-12 pb-4">
      <div className="max-w-container-max mx-auto px-margin-desktop">
        <div className="bg-gradient-to-r from-white via-[#f0f4ff]/90 to-white backdrop-blur-xl rounded-[24px] border border-blue-100/70 shadow-[0_20px_55px_rgba(15,82,186,0.09)] p-2 relative overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {statItems.map((stat, index) => (
              <div
                key={stat.label}
                className={`
                  group relative flex justify-center items-center px-6 py-4 min-h-[78px]
                  ${index !== statItems.length - 1 ? "lg:border-r border-slate-200" : ""}
                  ${index < 2 ? "max-lg:border-b border-slate-200" : ""}
                `}
              >
                <div className="absolute left-6 w-11 h-11 rounded-2xl bg-blue-100/60 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                  <span className="material-symbols-outlined">
                    {stat.icon}
                  </span>
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-black text-[#0F172A] leading-none mb-1.5">
                    {stat.value}
                  </h3>

                  <p className="text-xs text-slate-500 font-semibold">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
