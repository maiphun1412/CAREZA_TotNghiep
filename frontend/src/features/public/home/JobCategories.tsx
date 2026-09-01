"use client";

import MouseSpotlight from "@/components/common/mouse-spotlight";

const CATEGORIES = [
  {
    icon: "code",
    title: "Công nghệ",
    count: "1,250 vị trí đang tuyển",
    bgClass: "bg-primary/5",
    hoverBgClass: "group-hover:bg-primary",
  },
  {
    icon: "campaign",
    title: "Marketing",
    count: "840 vị trí đang tuyển",
    bgClass: "bg-secondary/5",
    hoverBgClass: "group-hover:bg-secondary",
  },
  {
    icon: "business_center",
    title: "Kinh doanh",
    count: "2,100 vị trí đang tuyển",
    bgClass: "bg-tertiary-container/10",
    hoverBgClass: "group-hover:bg-tertiary",
  },
  {
    icon: "palette",
    title: "Thiết kế",
    count: "290 vị trí đang tuyển",
    bgClass: "bg-primary/5",
    hoverBgClass: "group-hover:bg-primary",
  },
];

export default function JobCategories() {
  return (
    <section className="py-16 bg-gradient-to-br from-[#f0f4ff]/80 via-[#fcfdff] to-[#e6f7f4]/70 w-full border-b border-outline-variant/15 relative overflow-hidden">
      <MouseSpotlight size={600} color="rgba(15, 82, 186, 0.04)" />
      <div className="max-w-container-max mx-auto px-margin-desktop relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black mb-4 tracking-tight">Thị trường nghề nghiệp</h2>
          <p className="text-base text-on-surface-variant max-w-2xl mx-auto">
            Hệ sinh thái đa dạng từ công nghệ tới sáng tạo, giúp bạn tìm thấy bến đỗ lý tưởng.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {CATEGORIES.map((cat) => (
            <div key={cat.title} className="bg-white p-8 rounded-[32px] border border-blue-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-2xl ${cat.bgClass} flex items-center justify-center mb-6 ${cat.hoverBgClass} group-hover:text-white transition-all`}>
                <span className="material-symbols-outlined text-[36px]">{cat.icon}</span>
              </div>
              <h4 className="text-xl font-extrabold mb-2">{cat.title}</h4>
              <p className="text-xs font-bold text-outline">{cat.count}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
