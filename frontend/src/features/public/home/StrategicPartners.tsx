"use client";

import Link from "next/link";
import MouseSpotlight from "@/components/common/mouse-spotlight";

const PARTNERS = [
  {
    name: "FPT Software",
    logo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/FPT_Software_logo.svg",
  },
  {
    name: "Viettel",
    logo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Viettel_logo_2021.svg",
  },
  {
    name: "VNG",
    logo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/VNG_Corp._logo.svg",
  },
  {
    name: "Shopee",
    logo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Shopee.svg",
  },
  {
    name: "Techcombank",
    logo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Techcombank_logo.png",
  },
  {
    name: "MISA",
    logo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Logo_MISA_JSC_Vie.jpg",
  },
  {
    name: "Vietcombank",
    logo: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Vietcombank_logo_fixed.svg",
  },
];

// Nhân 3 mảng logo để tạo hiệu ứng trượt tuần hoàn không khoảng trống
const SLIDES = [...PARTNERS, ...PARTNERS, ...PARTNERS];

export default function StrategicPartners() {
  return (
    <section className="py-16 bg-[#f8faff] w-full border-b border-outline-variant/15 relative overflow-hidden">
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
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-black mb-3 text-slate-800">Đối tác chiến lược</h2>
          <p className="text-base text-on-surface-variant">Gia nhập đội ngũ xuất sắc tại các tập đoàn công nghệ lớn nhất</p>
        </div>

        {/* Khu vực Marquee với bóng mờ 2 đầu */}
        <div className="relative w-full overflow-hidden py-4">
          {/* Lớp phủ mờ bên trái */}
          <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-[#f8faff] to-transparent z-20 pointer-events-none" />
          
          {/* Lớp phủ mờ bên phải */}
          <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-[#f8faff] to-transparent z-20 pointer-events-none" />

          {/* Wrapper chạy chữ ngang */}
          <div className="marquee-container gap-5">
            {SLIDES.map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="w-[180px] md:w-[220px] h-[100px] shrink-0 bg-white border border-blue-100/60 rounded-2xl
                           flex items-center justify-center px-6
                           shadow-[0_4px_12px_rgba(15,82,186,0.02)] hover:shadow-lg hover:-translate-y-1
                           transition-all duration-300 group cursor-pointer"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-w-[120px] md:max-w-[140px] max-h-[48px] w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Nút Xem tất cả dưới cùng */}
        <div className="text-center mt-12">
          <Link className="text-primary text-sm font-bold inline-flex items-center gap-2 group hover:gap-4 transition-all" href="/cong-ty">
            Xem tất cả doanh nghiệp <span className="material-symbols-outlined text-[18px]">east</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
