"use client";

import Link from "next/link";
import MouseSpotlight from "@/components/common/mouse-spotlight";

const BLOGS = [
  {
    id: "blog-1",
    tag: "Mẹo phỏng vấn",
    title: "7 câu hỏi phỏng vấn thường gặp và cách trả lời ấn tượng",
    summary: "Để chuẩn bị tốt nhất cho buổi phỏng vấn, hãy cùng Careza điểm qua những câu hỏi cốt lõi...",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDh0AHynNbVzs1zHdVs02ZVjUuf128ShLrzjAnRWcvcT8zsYC35n3u1HUFkprR1WJLxy13KLdKNa_PFDxgaeWZwOcTRfgKj5pIbjnejnikOwNZMe3J7Xw2wFxaDI9mWqYO_pCdxyHoTYFDPOozYNvJDz0NMwZ4gFAQ0xLqg4ZpT18F8mzjujmX0t2-2wRku-vpuors0gflY-2w-CLkvTgcR_JKtUwtAxIiXVzxJfx_ZABPS5z3eDYqh",
  },
  {
    id: "blog-2",
    tag: "Thị trường IT",
    title: "Báo cáo lương ngành IT tại Việt Nam năm 2026",
    summary: "Xu hướng AI đang thay đổi cơ cấu thu nhập của các kỹ sư phần mềm như thế nào trong năm nay?",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBggNU2XiORjUuuNQnuVC_UZJC6rWipZp_UWYqwqXKg2KG5ob2SKQd6_fSQx5W8BEzy_ezHK2C6J6m4XySUxtRDW6uKerdlrmeGlVb5Lq7Qn8hxkFJpo2a12Ct6ZaiZUZqoSFt-hPX9Dz9IQ-7Kvd4DG7NAykMhwxDTHz2t-hseMdfVVesDW7nWNaAcXCH6DTlq0DMNHP9EyX5YBPjGWpPjMpjIHXhnspVNrUx3oY3q2ehywgB8Ouz3",
  },
  {
    id: "blog-3",
    tag: "Xu hướng AI",
    title: "Cách tận dụng AI để tối ưu hóa hồ sơ năng lực",
    summary: "Sử dụng các công cụ trí tuệ nhân tạo để làm nổi bật thế mạnh của bạn trước nhà tuyển dụng.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlXDMD6W79SuKFOYStOdF6GZedL1830QZWVjn7PxGKu7yaAmNL8KFYMDrySsNdLqII6Eej3N_HHCql-XAdNysWHFd5XJQEw-TZdII8CAAb43idKxjpI8bAm6w3xQ4KpR59mzIJBk_Gg4LamT6wP0mTe-gTVTkYCiD13pjZJ-anekZxKa4odISs4GZMvFfyuTK3fE98WSQ_9R3WWpNmf_s28LfvV1AFpMbVvRPWfHJ5lsGXheXZbPLp",
  },
];

export default function CareerBlog() {
  return (
    <section className="py-16 bg-[#f3f6fc] w-full border-b border-outline-variant/15 relative overflow-hidden">
      <MouseSpotlight size={600} color="rgba(15, 82, 186, 0.04)" />
      <div className="max-w-container-max mx-auto px-margin-desktop relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-8">
          <div>
            <h2 className="text-3xl font-black mb-3">Cẩm nang sự nghiệp</h2>
            <p className="text-base text-on-surface-variant">Kiến thức và kinh nghiệm từ các chuyên gia hàng đầu.</p>
          </div>
          <Link className="text-primary text-sm font-bold flex items-center gap-2 group hover:gap-4 transition-all" href="/tin-tuc">
            Khám phá Blog <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BLOGS.map((blog) => (
            <div key={blog.id} className="bg-white p-6 rounded-[40px] border border-blue-100/30 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col h-full">
              <div className="h-48 rounded-[28px] overflow-hidden mb-5 border border-outline-variant/20 shadow-sm">
                <img 
                  alt={blog.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  src={blog.image} 
                />
              </div>
              <div className="space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2">{blog.tag}</span>
                  <h3 className="text-lg font-extrabold group-hover:text-primary transition-colors leading-snug mb-2 line-clamp-2">
                    {blog.title}
                  </h3>
                </div>
                <p className="text-on-surface-variant line-clamp-2 leading-relaxed text-xs">
                  {blog.summary}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
