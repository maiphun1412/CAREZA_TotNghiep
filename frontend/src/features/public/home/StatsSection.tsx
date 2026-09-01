"use client";

const STATS_ITEMS = [
  {
    value: "12.5k+",
    label: "Cơ hội mới hàng tuần",
    icon: "work",
  },
  {
    value: "2.3k+",
    label: "Doanh nghiệp tuyển dụng",
    icon: "apartment",
  },
  {
    value: "58k+",
    label: "Ứng viên chất lượng",
    icon: "group",
  },
  {
    value: "98%",
    label: "Tỷ lệ hài lòng",
    icon: "verified",
  },
];

export default function StatsSection() {
  return (
    <section className="relative z-20 -mt-16 pb-12">
      <div className="max-w-container-max mx-auto px-margin-desktop">
        <div className="bg-gradient-to-r from-white via-[#f0f4ff]/90 to-white backdrop-blur-xl rounded-[28px] border border-blue-100/70 shadow-[0_24px_70px_rgba(15,82,186,0.1)] p-3 relative overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {STATS_ITEMS.map((stat, index) => (
              <div
                key={stat.label}
                className={`
                  group relative flex justify-center items-center px-7 py-6 min-h-[96px]
                  ${index !== STATS_ITEMS.length - 1 ? "lg:border-r border-slate-200" : ""}
                  ${index < 2 ? "max-lg:border-b border-slate-200" : ""}
                `}
              >
                <div className="absolute left-7 w-12 h-12 rounded-2xl bg-blue-100/60 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                  <span className="material-symbols-outlined">
                    {stat.icon}
                  </span>
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-black text-primary leading-none mb-2">
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
