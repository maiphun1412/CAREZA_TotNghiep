"use client";

import Link from "next/link";
import MouseSpotlight from "@/components/common/mouse-spotlight";
import { useAuthStore } from "@/store/auth-store";
import { RoleCode } from "@/enums/role.enum";

export default function RecruiterCTA() {
  const { user, isAuthenticated } = useAuthStore();
  const userRoles: RoleCode[] = Array.isArray(user?.roles)
    ? user.roles
    : (user as any)?.role
      ? [(user as any).role]
      : [];

  const isRecruiter =
    isAuthenticated &&
    Boolean(user) &&
    (userRoles.includes(RoleCode.COMPANY_OWNER) || userRoles.includes(RoleCode.RECRUITER));

  return (
    <section className="py-5 md:py-7 bg-[#eef3ff]/50 w-full border-b border-outline-variant/15 relative overflow-hidden">
      <MouseSpotlight size={600} color="rgba(15, 82, 186, 0.04)" />
      <div className="max-w-container-max mx-auto px-4 sm:px-6 md:px-8 xl:px-margin-desktop relative z-10">
        <div className="bg-white rounded-[32px] lg:rounded-[36px] p-6 sm:p-8 lg:p-9 border border-blue-100/70 shadow-sm relative overflow-hidden flex flex-col lg:flex-row items-center gap-7 lg:gap-10">
          {/* Cột trái: Nội dung */}
          <div className="relative z-10 w-full lg:w-3/5 flex flex-col items-start">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 leading-tight text-slate-800 tracking-tight">
              Dành riêng cho <span className="text-primary">Nhà Tuyển Dụng</span>
            </h2>



            {/* 3 Benefits */}
            <div className="flex flex-col gap-3 mb-6 w-full">
              {/* Benefit 1 */}
              <div className="flex items-start gap-3.5">
                <span
                  className="material-symbols-outlined text-primary text-2xl shrink-0 mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <div>
                  <p className="font-extrabold text-sm sm:text-base text-slate-800 mb-0.5">
                    Đăng tin tuyển dụng dễ dàng
                  </p>
                  <p className="text-slate-500 text-xs sm:text-sm">
                    Tạo và quản lý tin tuyển dụng nhanh chóng.
                  </p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="flex items-start gap-3.5">
                <span
                  className="material-symbols-outlined text-primary text-2xl shrink-0 mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <div>
                  <p className="font-extrabold text-sm sm:text-base text-slate-800 mb-0.5">
                    Sàng lọc ứng viên phù hợp
                  </p>
                  <p className="text-slate-500 text-xs sm:text-sm">
                    Hỗ trợ đánh giá mức độ phù hợp giữa CV và yêu cầu tuyển dụng.
                  </p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="flex items-start gap-3.5">
                <span
                  className="material-symbols-outlined text-primary text-2xl shrink-0 mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <div>
                  <p className="font-extrabold text-sm sm:text-base text-slate-800 mb-0.5">
                    Quản lý quy trình tuyển dụng
                  </p>
                  <p className="text-slate-500 text-xs sm:text-sm">
                    Theo dõi ứng viên từ lúc ứng tuyển đến phỏng vấn và kết quả cuối cùng.
                  </p>
                </div>
              </div>
            </div>

            {/* Nút CTA */}
            {isRecruiter ? (
              <Link href="/doanh-nghiep/dashboard">
                <button className="bg-primary text-white px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-md shadow-primary/20 hover:bg-blue-700 transition-all flex items-center gap-2 btn-float cursor-pointer">
                  <span>Vào trang quản lý tuyển dụng</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </Link>
            ) : (
              <Link href="/dang-ky?type=COMPANY">
                <button className="bg-primary text-white px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-md shadow-primary/20 hover:bg-blue-700 transition-all flex items-center gap-2 btn-float cursor-pointer">
                  <span>Đăng ký Nhà tuyển dụng</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </Link>
            )}
          </div>

          {/* Cột phải: Card minh họa Quản lý ứng viên */}
          <div className="w-full lg:w-2/5">
            <div className="bg-slate-50/90 p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              {/* Header card */}
              <div className="flex items-center justify-between mb-5 border-b border-slate-200/60 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  QUẢN LÝ ỨNG VIÊN
                </span>
              </div>

              {/* Danh sách các trạng thái ứng viên thực tế */}
              <div className="space-y-3 mb-6">
                {/* 1. Ứng viên mới */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                      <span className="material-symbols-outlined text-base">person_add</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 m-0">Ứng viên mới nộp hồ sơ</p>
                      <p className="text-[10px] text-slate-400 m-0">Vị trí: Frontend Developer</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                    Ứng viên mới
                  </span>
                </div>

                {/* 2. Đang sàng lọc */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                      <span className="material-symbols-outlined text-base">filter_alt</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 m-0">Đánh giá hồ sơ năng lực</p>
                      <p className="text-[10px] text-slate-400 m-0">Vị trí: UI/UX Designer</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-100">
                    Đang sàng lọc
                  </span>
                </div>

                {/* 3. Phỏng vấn */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                      <span className="material-symbols-outlined text-base">calendar_month</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 m-0">Lên lịch phỏng vấn vòng 1</p>
                      <p className="text-[10px] text-slate-400 m-0">Vị trí: Fullstack Engineer</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 border border-purple-100">
                    Phỏng vấn
                  </span>
                </div>

                {/* 4. Đề xuất tuyển dụng */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                      <span className="material-symbols-outlined text-base">verified_user</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 m-0">Gửi thư mời nhận việc (Offer)</p>
                      <p className="text-[10px] text-slate-400 m-0">Vị trí: Product Manager</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                    Đề xuất tuyển dụng
                  </span>
                </div>
              </div>

              {/* Footer card */}
              <div className="pt-3 border-t border-slate-200/60 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium text-[11px]">Quy trình tuyển dụng Careza</span>
                <Link
                  href="/nha-tuyen-dung"
                  className="text-primary font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Xem tất cả</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

