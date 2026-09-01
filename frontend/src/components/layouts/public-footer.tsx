import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/30 pt-8 pb-6">
      <div className="max-w-container-max mx-auto px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Link className="text-3xl font-black text-primary tracking-tighter" href="/">Careza</Link>
            <p className="text-on-surface-variant leading-relaxed text-sm">
              Nền tảng tuyển dụng thông minh thế hệ mới, ứng dụng AI để kiến tạo những giá trị bền vững cho nhân tài và doanh nghiệp.
            </p>
            <div className="flex gap-3">
              <a className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-xs" href="#">
                <img alt="FB" className="w-5 h-5 opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBM_VVKEDrBCRY0Ytkm3ybIrjEaUxTYBKxtymFOsG5D4JPkiN1bg51Q1Xyv-gFBNeE11IqFm_mZH2wZ5GU4diDKW6PHVXQG9CMJCqDcx78xkBiWgV5M0jTjkpQoIteQ0djS9HZKCNmHupV_Z0XtAH0OgVtHLHcG7GsA_4MaS9q-Wu0GFFEqTInrzaSE6wXMw3B8sNj76mT3Dt96X7xUqFS1bIXryVModNADJ4AZ4aNu_ExI8wTdx_1e" />
              </a>
              <a className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-xs" href="#">
                <img alt="LI" className="w-5 h-5 opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdzsFa5PL0I8nypwuIGBw8EshaWbQ9wr7veJ0km6TgLvlt6Vie4qfe3jUtOlO5bN8rR_W4MoezoProiQ9872M4W6Z2Zucwm_uDFZQJ5vHqNJL4t60XBOzl1U69bCuJRrRj5sYF-8YFkRo-4nPlxVMqAbXNygyz9JijkM_RPgEKBaDC3uToVa69sPM3NiFjJUKncSHgbogu7gzO5vb7AJyl8JpdxTnyQCzTIKFWw7XkFN6X_-EEZOCd" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-on-surface mb-4">Khám phá</h4>
            <ul className="space-y-3 font-medium text-on-surface-variant list-none pl-0 m-0 text-sm">
              <li><Link className="hover:text-primary transition-colors" href="/viec-lam">Tìm kiếm việc làm</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/cam-nang-nghe-nghiep">Cẩm nang sự nghiệp</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/ung-vien/cv">Mẫu CV Chuyên nghiệp</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/cong-cu">Công cụ tính lương Gross - Net</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/ai-career">Trợ lý Hướng nghiệp AI</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-on-surface mb-4">Về Careza</h4>
            <ul className="space-y-3 font-medium text-on-surface-variant list-none pl-0 m-0 text-sm">
              <li><Link className="hover:text-primary transition-colors" href="/tin-tuc">Về chúng tôi</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/tin-tuc">Tuyển dụng</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/tin-tuc">Liên hệ</Link></li>
              <li><Link className="hover:text-primary transition-colors" href="/tin-tuc">Báo chí</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-on-surface mb-4">Hỗ trợ</h4>
            <ul className="space-y-3 list-none pl-0 m-0">
              <li className="flex items-center gap-3 text-on-surface-variant text-sm">
                <span className="material-symbols-outlined text-[20px]">mail</span> contact@careza.vn
              </li>
              <li className="flex items-center gap-3 text-on-surface-variant text-sm">
                <span className="material-symbols-outlined text-[20px]">call</span> (028) 7300 1234
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
