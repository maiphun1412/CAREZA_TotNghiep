"use client";

import { use } from "react";
import Link from "next/link";
import MouseSpotlight from "@/components/common/mouse-spotlight";

// Mock Database bài viết chi tiết
const ARTICLES_DETAIL: Record<string, any> = {
  "bi-quyet-chuan-bi-cv-chuyen-nghiep-2026": {
    slug: "bi-quyet-chuan-bi-cv-chuyen-nghiep-2026",
    title: "Bí quyết chuẩn bị CV và hồ sơ ứng tuyển chuyên nghiệp năm 2026",
    categoryName: "Kinh nghiệm tìm việc",
    categorySlug: "tim-viec",
    date: "28/08/2026",
    readTime: "6 phút đọc",
    author: "Ban Biên Tập Careza",
    authorRole: "Chuyên gia Hướng nghiệp & Tuyển dụng",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80",
    content: `
      <p class="lead">Trong thị trường tuyển dụng hiện đại, CV không đơn thuần là một bản tóm tắt quá trình học tập và làm việc. Đó chính là tài liệu marketing cá nhân định vị thương hiệu của bạn trước nhà tuyển dụng và hệ thống quét hồ sơ tự động (ATS).</p>
      
      <h2>1. Tối ưu hóa từ khóa chuẩn hệ thống ATS</h2>
      <p>Hơn 85% các tập đoàn lớn hiện nay áp dụng phần mềm ATS (Applicant Tracking System) để phân loại và lọc ứng viên trước khi chuyển đến tay nhà tuyển dụng. Để CV vượt qua vòng lọc này:</p>
      <ul>
        <li>Đọc kỹ mô tả công việc (Job Description) và trích xuất các kỹ năng trọng yếu.</li>
        <li>Sử dụng đúng thuật ngữ chuyên ngành chuẩn xác (ví dụ: Next.js thay vì chỉ ghi Frontend, Agile/Scrum, CI/CD).</li>
        <li>Định dạng file PDF chuẩn, tránh sử dụng quá nhiều bảng biểu phức tạp che khuất text parser.</li>
      </ul>

      <h2>2. Đo lường thành tựu bằng con số cụ thể (Mô hình STAR / Google XYZ)</h2>
      <p>Thay vì chỉ liệt kê các đầu việc chung chung, hãy chứng minh giá trị thực tế bạn mang lại cho doanh nghiệp bằng công thức: <em>“Đã hoàn thành [X], được đo bằng [Y], thông qua việc thực hiện [Z]”</em>.</p>
      <blockquote>
        <strong>Ví dụ:</strong> “Tối ưu hóa thời gian tải trang của ứng dụng thương mại điện tử giảm 40% (từ 2.8s xuống 1.6s) nhờ việc áp dụng kỹ thuật Server Components và nén hình ảnh WebP tự động.”
      </blockquote>

      <h2>3. Bố cục tinh gọn và dễ scan trong 6 giây</h2>
      <p>Nhà tuyển dụng trung bình chỉ dành từ 6 đến 10 giây cho lần đọc lướt đầu tiên. Hãy đảm bảo:</p>
      <ul>
        <li>Thông tin liên hệ, tiêu đề nghề nghiệp rõ ràng ở đầu trang.</li>
        <li>Kinh nghiệm làm việc được sắp xếp theo trình tự thời gian đảo ngược (mới nhất lên đầu).</li>
        <li>Độ dài tối ưu: 1 trang cho ứng viên dưới 3 năm kinh nghiệm, 2 trang cho ứng viên cấp Senior trở lên.</li>
      </ul>
    `,
  },
  "nghe-thuat-dam-phan-luong-khi-nhan-offer": {
    slug: "nghe-thuat-dam-phan-luong-khi-nhan-offer",
    title: "Nghệ thuật đàm phán lương và phúc lợi khi nhận Offer",
    categoryName: "Lương & chế độ",
    categorySlug: "luong-phuc-loi",
    date: "26/08/2026",
    readTime: "8 phút đọc",
    author: "Minh Trang",
    authorRole: "HR Manager & Career Coach",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
    content: `
      <p class="lead">Đàm phán lương là một bước quan trọng trong quá trình ứng tuyển. Một chiến lược đàm phán thông minh không chỉ giúp bạn nhận được mức đãi ngộ xứng đáng mà còn thể hiện năng lực tự tin và thấu hiểu giá trị bản thân.</p>
      
      <h2>1. Nghiên cứu kỹ mức lương thị trường (Salary Benchmark)</h2>
      <p>Trước khi đưa ra bất kỳ con số nào, bạn cần nắm rõ dải lương trung bình cho vị trí, số năm kinh nghiệm và khu vực địa lý tương ứng. Tìm hiểu qua các báo cáo lương uy tín và cộng đồng chuyên môn.</p>

      <h2>2. Nhìn vào tổng gói đãi ngộ (Total Compensation)</h2>
      <p>Lương cứng (Base Salary) chỉ là một phần. Hãy cân nhắc kỹ toàn bộ gói quyền lợi:</p>
      <ul>
        <li>Lương tháng 13 và thưởng hiệu suất (Performance Bonus).</li>
        <li>Bảo hiểm sức khỏe cao cấp cho bản thân và người phụ thuộc.</li>
        <li>Số ngày phép năm, chế độ làm việc linh hoạt (Hybrid / Remote).</li>
        <li>Ngân sách đào tạo, học tập nâng cao chuyên môn.</li>
      </ul>
    `,
  },
};

const RELATED_ARTICLES = [
  {
    slug: "top-ky-nang-mem-nha-tuyen-dung-san-don",
    title: "Top 5 kỹ năng mềm được nhà tuyển dụng săn đón hàng đầu",
    categoryName: "Kỹ năng nghề nghiệp",
    date: "24/08/2026",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "bao-cao-thi-truong-viec-lam-nua-cuoi-nam-2026",
    title: "Báo cáo thị trường lao động: Nhu cầu nhân lực các ngành công nghệ",
    categoryName: "Xu hướng thị trường",
    date: "22/08/2026",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
  },
  {
    slug: "lo-trinh-chuyen-nganh-sang-cong-nghe-thong-tin",
    title: "Lộ trình chuyển ngành sang lĩnh vực Công nghệ thông tin từ con số 0",
    categoryName: "Phát triển sự nghiệp",
    date: "20/08/2026",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
  },
];

export default function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const article = ARTICLES_DETAIL[slug] || ARTICLES_DETAIL["bi-quyet-chuan-bi-cv-chuyen-nghiep-2026"];

  return (
    <div className="pt-6 pb-20 px-4 sm:px-6 md:px-8 xl:px-[38px] max-w-[1280px] mx-auto flex-1 w-full bg-[#f5f8ff] relative overflow-hidden">
      {/* 1. BREADCRUMB */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
        <Link href="/" className="hover:text-primary transition-colors">
          Trang chủ
        </Link>
        <span>/</span>
        <Link href="/cam-nang-nghe-nghiep" className="hover:text-primary transition-colors">
          Cẩm nang nghề nghiệp
        </Link>
        <span>/</span>
        <span className="text-slate-800 line-clamp-1 max-w-sm">{article.title}</span>
      </nav>

      {/* 2. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CỘT NỘI DUNG CHÍNH (8 cols) */}
        <article className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-[32px] border border-slate-200/80 shadow-xs">
          {/* Header bài viết */}
          <div className="space-y-4 mb-6">
            <Link
              href={`/cam-nang-nghe-nghiep?category=${article.categorySlug}`}
              className="inline-block bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 py-1 rounded-full text-xs font-bold transition-all"
            >
              {article.categoryName}
            </Link>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight m-0">
              {article.title}
            </h1>

            {/* Meta tác giả & ngày đăng */}
            <div className="flex items-center justify-between py-4 border-y border-slate-100 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {article.author.substring(0, 1)}
                </div>
                <div>
                  <h4 className="text-slate-800 font-bold text-xs m-0">{article.author}</h4>
                  <span className="text-[11px] text-slate-400">{article.authorRole}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span>{article.date}</span>
                <span>•</span>
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden mb-8 bg-slate-100 shadow-sm">
            <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
          </div>

          {/* Table of contents rút gọn */}
          <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl mb-8">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2.5">
              <span className="material-symbols-outlined text-primary text-base">format_list_bulleted</span>
              Mục lục bài viết
            </span>
            <ul className="text-xs text-slate-600 space-y-1.5 font-medium pl-4 list-disc">
              <li>Tối ưu hóa từ khóa chuẩn hệ thống ATS</li>
              <li>Đo lường thành tựu bằng con số cụ thể</li>
              <li>Bố cục tinh gọn và dễ scan trong 6 giây</li>
            </ul>
          </div>

          {/* Nội dung bài viết */}
          <div
            className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Chia sẻ & Tag */}
          <div className="pt-8 mt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>Chủ đề:</span>
              <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px]">#CV_chuan</span>
              <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px]">#TuyenDung2026</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Đã sao chép liên kết bài viết!");
                }}
                className="bg-primary/5 hover:bg-primary hover:text-white px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-primary/20"
              >
                <span className="material-symbols-outlined text-sm">share</span>
                <span>Chia sẻ bài viết</span>
              </button>
            </div>
          </div>
        </article>

        {/* CỘT SIDEBAR (4 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Card CTA tạo CV */}
          <div className="bg-gradient-to-br from-[#00174B] to-primary text-white p-6 rounded-[28px] shadow-lg relative overflow-hidden">
            <MouseSpotlight size={300} color="rgba(255, 255, 255, 0.1)" />
            <span className="material-symbols-outlined text-3xl text-cyan-300 mb-3">auto_awesome</span>
            <h3 className="text-base font-black text-white mb-1">Tạo CV chuyên nghiệp với AI</h3>
            <p className="text-xs text-slate-200 mb-4 leading-relaxed">
              Tự động gợi ý từ khóa chuẩn ngành và nhận diện điểm mạnh giúp tăng 80% cơ hội trúng tuyển.
            </p>
            <Link
              href="/ung-vien/cv"
              className="inline-block bg-white text-primary px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-100 transition-all shadow-md"
            >
              Tạo CV ngay miễn phí →
            </Link>
          </div>

          {/* Danh mục chủ đề */}
          <div className="bg-white p-6 rounded-[28px] border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">category</span>
              Chủ đề nổi bật
            </h3>
            <div className="space-y-2">
              <Link
                href="/cam-nang-nghe-nghiep?category=tim-viec"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <span>Kinh nghiệm tìm việc</span>
                <span className="text-slate-400">18</span>
              </Link>
              <Link
                href="/cam-nang-nghe-nghiep?category=ky-nang"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <span>Kỹ năng nghề nghiệp</span>
                <span className="text-slate-400">14</span>
              </Link>
              <Link
                href="/cam-nang-nghe-nghiep?category=thi-truong"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <span>Xu hướng thị trường</span>
                <span className="text-slate-400">10</span>
              </Link>
              <Link
                href="/cam-nang-nghe-nghiep?category=luong-phuc-loi"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <span>Lương & chế độ</span>
                <span className="text-slate-400">8</span>
              </Link>
              <Link
                href="/cam-nang-nghe-nghiep?category=phat-trien-su-nghiep"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <span>Phát triển sự nghiệp</span>
                <span className="text-slate-400">12</span>
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* 3. SECTION BÀI VIẾT LIÊN QUAN */}
      <section className="mt-14 pt-10 border-t border-slate-200/70">
        <h2 className="text-xl font-black text-slate-800 mb-6">Bài viết cùng chủ đề</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {RELATED_ARTICLES.map((item) => (
            <Link
              key={item.slug}
              href={`/cam-nang-nghe-nghiep/${item.slug}`}
              className="group bg-white rounded-[24px] overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="h-40 w-full overflow-hidden bg-slate-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md inline-block mb-2">
                    {item.categoryName}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-2 leading-snug m-0">
                    {item.title}
                  </h3>
                </div>
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                  <span>{item.date}</span>
                  <span className="text-primary font-bold">Đọc tiếp →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
