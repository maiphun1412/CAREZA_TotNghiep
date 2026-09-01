"use client";

import Link from "next/link";
import MouseSpotlight from "@/components/common/mouse-spotlight";

export default function FinalCTA() {
  return (
    <section className="py-16 bg-slate-50 w-full">
      <div className="max-w-container-max mx-auto px-margin-desktop">
        <div className="relative overflow-hidden bg-[#00174B] text-white rounded-[48px] px-10 lg:px-16 py-16 shadow-2xl text-center">
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          
          {/* Spotlight bám theo chuột */}
          <MouseSpotlight />

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Sẵn sàng bứt phá sự nghiệp?</h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Hàng nghìn cơ hội việc làm mơ ước đang chờ đón bạn. Hãy bắt đầu hành trình chinh phục sự nghiệp cùng Careza ngay hôm nay.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link href="/dang-ky">
                <button className="bg-white text-primary px-16 py-6 rounded-2xl font-black text-lg shadow-2xl hover:scale-105 transition-all btn-float cursor-pointer w-full sm:w-auto">
                  Tạo tài khoản ngay
                </button>
              </Link>
              <Link href="/dang-ky?type=COMPANY">
                <button className="bg-[#168cc3] text-white px-16 py-6 rounded-2xl font-black text-lg border border-white/20 hover:bg-white/10 transition-all btn-float cursor-pointer w-full sm:w-auto">
                  Dành cho Nhà tuyển dụng
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
