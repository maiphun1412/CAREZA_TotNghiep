"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MouseSpotlight from "@/components/common/mouse-spotlight";
import { apiClient } from "@/services/api-client";

interface PartnerItem {
  id?: number;
  name: string;
  logo: string;
}

export default function StrategicPartners() {
  const [partners, setPartners] = useState<PartnerItem[]>([]);

  useEffect(() => {
    apiClient.get("/public/landing/")
      .then((res) => {
        if (res.data?.data?.partners && res.data.data.partners.length > 0) {
          setPartners(res.data.data.partners);
        }
      })
      .catch((err) => {
        console.warn("Lỗi nạp danh sách đối tác:", err);
      });
  }, []);

  const slides = partners.length > 0 ? [...partners, ...partners, ...partners] : [];
  return (
    <section className="pt-4 pb-4 md:pt-5 md:pb-5 bg-[#f8faff] w-full border-b border-outline-variant/15 relative overflow-hidden">
      <MouseSpotlight size={600} color="rgba(15, 82, 186, 0.04)" />
      
      {/* CSS cho hiệu ứng Marquee mượt mà */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .marquee-container {
          display: flex;
          width: max-content;
          animation: marquee-scroll 50s linear infinite;
        }
        .marquee-container:hover {
          animation-play-state: paused;
        }
      `}} />

      <div className="max-w-container-max mx-auto px-margin-desktop relative z-10">
        {/* Tiêu đề căn giữa */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <h2 className="text-3xl font-black mb-2 text-slate-800">Đối tác chiến lược</h2>
          <p className="text-base text-on-surface-variant">Gia nhập đội ngũ xuất sắc tại các tập đoàn công nghệ lớn nhất</p>
        </div>

        {/* Khu vực Marquee với bóng mờ 2 đầu */}
        <div className="relative w-full overflow-hidden py-2.5">
          {/* Lớp phủ mờ bên trái */}
          <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-[#f8faff] to-transparent z-20 pointer-events-none" />
          
          {/* Lớp phủ mờ bên phải */}
          <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-[#f8faff] to-transparent z-20 pointer-events-none" />

          {/* Wrapper chạy chữ ngang */}
          <div className="marquee-container gap-5 items-center">
            {slides.map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="w-[185px] md:w-[225px] h-[120px] md:h-[124px] shrink-0 bg-white border border-blue-100/60 rounded-2xl
                           flex items-center justify-center px-6 py-4
                           shadow-[0_4px_12px_rgba(15,82,186,0.03)] hover:shadow-lg hover:-translate-y-1
                           transition-all duration-300 group cursor-pointer"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-w-[135px] md:max-w-[155px] max-h-[64px] md:max-h-[68px] w-auto h-auto object-contain mx-auto my-auto block transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Nút Xem tất cả dưới cùng */}
        <div className="text-center mt-5">
          <Link className="text-primary text-sm font-bold inline-flex items-center gap-2 group hover:gap-4 transition-all" href="/cong-ty">
            Xem tất cả doanh nghiệp <span className="material-symbols-outlined text-[18px]">east</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
