"use client";

import Link from "next/link";
import MouseSpotlight from "@/components/common/mouse-spotlight";

export default function AICareerSection() {
  return (
    <section className="py-16 bg-white w-full border-b border-outline-variant/15">
      <div className="max-w-container-max mx-auto px-margin-desktop">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#00174B] via-[#041d56] to-slate-950 text-white rounded-[48px] px-8 sm:px-12 lg:px-16 py-14 lg:py-16 shadow-2xl">
          {/* Background Ambient Elements */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#14b8a6]/15 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          {/* Spotlight bám theo chuột */}
          <MouseSpotlight color="rgba(20, 184, 166, 0.08), rgba(0, 74, 198, 0.06)" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center relative z-10">
            {/* Cột trái: Thông tin và các tính năng */}
            <div className="lg:col-span-7">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6 border border-white/20 text-xs font-black tracking-wider uppercase text-[#71f8e4]">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
                CAREZA SMART CAREER
              </div>

              {/* Tiêu đề */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-[1.15] tracking-tight">
                Hiểu hồ sơ – Tìm đúng cơ hội <br />
                <span className="text-[#71f8e4]">cùng Careza</span>
              </h2>

              {/* Mô tả ngắn */}
              <p className="text-white/80 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
                Careza phân tích hồ sơ và kết nối bạn với những cơ hội việc làm phù hợp hơn.
              </p>

              {/* 3 Cards Tính năng */}
              <div className="space-y-3.5 mb-8">
                {/* 1. Phân tích & tối ưu CV */}
                <div className="group flex gap-4 sm:gap-5 items-start p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/25 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-primary/25 flex items-center justify-center shrink-0 border border-white/15 text-[#b4c5ff]">
                    <span className="material-symbols-outlined text-2xl">description</span>
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-white mb-1">1. Phân tích & tối ưu CV</h4>
                    <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                      Tự động đọc CV, nhận diện kỹ năng, kinh nghiệm và gợi ý những nội dung cần cải thiện.
                    </p>
                  </div>
                </div>

                {/* 2. Matching CV – Việc làm */}
                <div className="group flex gap-4 sm:gap-5 items-start p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/25 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[#14b8a6]/25 flex items-center justify-center shrink-0 border border-white/15 text-[#71f8e4]">
                    <span className="material-symbols-outlined text-2xl">join_inner</span>
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-white mb-1">2. Matching CV – Việc làm</h4>
                    <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                      Phân tích mức độ phù hợp giữa hồ sơ và yêu cầu tuyển dụng để tìm ra những cơ hội phù hợp hơn.
                    </p>
                  </div>
                </div>

                {/* 3. Gợi ý việc làm phù hợp */}
                <div className="group flex gap-4 sm:gap-5 items-start p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/25 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 border border-white/15 text-amber-300">
                    <span className="material-symbols-outlined text-2xl">recommend</span>
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-white mb-1">3. Gợi ý việc làm phù hợp</h4>
                    <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                      Đề xuất công việc dựa trên kỹ năng, kinh nghiệm và thông tin trong hồ sơ ứng viên.
                    </p>
                  </div>
                </div>
              </div>

              {/* Nút CTA */}
              <Link href="/viec-lam">
                <button className="bg-white text-[#00174B] px-8 sm:px-10 py-4 rounded-xl font-black text-sm sm:text-base shadow-xl hover:bg-[#71f8e4] hover:text-[#00174B] hover:scale-102 transition-all flex items-center gap-2.5 btn-float cursor-pointer">
                  <span>Khám phá việc làm phù hợp</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </Link>
            </div>

            {/* Cột phải: Minh họa quy trình Matching trực quan */}
            <div className="lg:col-span-5 relative">
              {/* Card Dashboard minh họa quy trình */}
              <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-slate-900/80 backdrop-blur-xl p-6 sm:p-7 flex flex-col gap-5">
                {/* Header dashboard */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[11px] font-bold text-white/50 tracking-wider uppercase">Quy trình Matching Careza</span>
                </div>

                {/* Sơ đồ luồng 4 bước: CV → Phân tích hồ sơ → Matching JD → Gợi ý việc làm */}
                <div className="space-y-3">
                  {/* Bước 1: CV */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-blue-400">upload_file</span>
                        Hồ sơ ứng viên (CV)
                      </div>
                      <p className="text-[11px] text-white/50 truncate">Tải lên hoặc tạo CV trực tuyến</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">Đã nạp</span>
                  </div>

                  {/* Mũi tên kết nối */}
                  <div className="flex justify-center text-white/30 -my-1.5">
                    <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                  </div>

                  {/* Bước 2: Phân tích hồ sơ */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-teal-400">psychology</span>
                        Phân tích năng lực & kỹ năng
                      </div>
                      <p className="text-[11px] text-white/50 truncate">Trích xuất kỹ năng, kinh nghiệm cốt lõi</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300">Hoàn tất</span>
                  </div>

                  {/* Mũi tên kết nối */}
                  <div className="flex justify-center text-white/30 -my-1.5">
                    <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                  </div>

                  {/* Bước 3: Matching JD */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#004ac6]/30 border border-blue-400/30">
                    <div className="w-8 h-8 rounded-lg bg-blue-400 text-[#00174B] flex items-center justify-center font-bold text-xs shrink-0">
                      3
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-[#71f8e4]">join_inner</span>
                        Đối chiếu yêu cầu tuyển dụng (JD)
                      </div>
                      <p className="text-[11px] text-white/60 truncate">So khớp chuyên môn, địa điểm, mức lương</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">Matching</span>
                  </div>

                  {/* Mũi tên kết nối */}
                  <div className="flex justify-center text-white/30 -my-1.5">
                    <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                  </div>

                  {/* Bước 4: Gợi ý việc làm */}
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border border-teal-400/40">
                    <div className="w-8 h-8 rounded-lg bg-[#71f8e4] text-[#00174B] flex items-center justify-center font-bold text-xs shrink-0">
                      4
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-extrabold text-[#71f8e4] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px]">verified</span>
                        Gợi ý việc làm phù hợp nhất
                      </div>
                      <p className="text-[11px] text-white/70 truncate">Hiển thị tin tuyển dụng điểm match cao</p>
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#71f8e4] text-[#00174B]">Top Match</span>
                  </div>
                </div>
              </div>

              {/* Floating Match Score Badge bên cạnh */}
              <div className="absolute -top-6 -right-4 sm:-right-6 bg-gradient-to-br from-[#004ac6] to-[#00201c] text-white p-4 sm:p-5 rounded-2xl shadow-2xl border border-[#71f8e4]/40 animate-float hidden sm:block">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[#71f8e4] text-[18px]">verified</span>
                  <span className="font-black text-[11px] uppercase tracking-wider text-white/80">Độ phù hợp</span>
                </div>
                <div className="text-2xl font-black text-[#71f8e4] tracking-tight">92% Match</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

