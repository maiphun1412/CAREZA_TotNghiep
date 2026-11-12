"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { adminService } from "@/services/admin.service";
import {
  Dropdown,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  App,
  Radio,
  Tooltip,
  Progress,
} from "antd";
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  SlidersHorizontal,
  Download,
  Plus,
  MoreHorizontal,
  X,
  Edit2,
  Mail,
  Lock,
  Unlock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Activity,
  StickyNote,
  Send,
  RefreshCw,
  Eye,
  Globe,
  User,
  ShieldCheck,
  Check,
  Layers,
  Users,
  Briefcase,
  Award,
  Sparkles,
  Info,
  Star,
  Coins,
  Filter,
  ShieldAlert,
  AlertTriangle,
  History,
  CreditCard,
  UserCheck,
  CheckCircle,
  FileCheck,
} from "lucide-react";

// Dữ liệu mẫu công ty
const COMPANIES_DB: Record<string, any> = {
  CPN_000001: {
    id: "CPN_000001",
    name: "Công ty TNHH FPT Software",
    shortName: "FPT Software",
    taxCode: "0101243150",
    industry: "Công nghệ thông tin",
    size: "1.000 - 5.000 nhân sự",
    foundedYear: 1999,
    status: "VERIFIED",
    verifiedDate: "12/03/2024",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo_2010.svg/1200px-FPT_logo_2010.svg.png",
    banner:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&h=500&q=90",
    slogan: "Kiến tạo hạnh phúc thông qua công nghệ",
    vision: "Công nghệ kiến tạo những cơ hội không giới hạn",
    tags: ["Công nghệ", "Chuyển đổi số", "Phát triển con người", "Môi trường quốc tế"],
    website: "https://fptsoftware.com",
    email: "hr@fptsoftware.com",
    phone: "024 7300 7300",
    address: "Tòa nhà FPT, Duy Tân, Cầu Giấy, Hà Nội",
    description:
      "FPT Software là công ty thành viên của Tập đoàn FPT, chuyên cung cấp các giải pháp công nghệ toàn cầu, đồng hành cùng doanh nghiệp trong hành trình chuyển đổi số.",
    kpis: {
      activeJobs: 48,
      activeJobsGrowth: "↑ 12%",
      totalApplications: 1245,
      totalApplicationsGrowth: "↑ 18%",
      pipelineCandidates: 320,
      pipelineCandidatesGrowth: "↑ 25%",
      members: 12,
      membersGrowth: "↑ 20%",
      revenue: "524.800.000 đ",
      revenueGrowth: "↑ 32%",
      rating: 4.8,
      ratingCount: 256,
    },
    jobStatusChart: {
      active: 48,
      pending: 8,
      expired: 6,
      rejected: 3,
    },
    representative: {
      name: "Nguyễn Văn A",
      position: "Tổng Giám đốc",
      email: "nguyenvana@fptsoftware.com",
      phone: "0901 234 567",
    },
    membersList: [
      {
        id: "m-1",
        name: "Trần Minh Quân",
        role: "HR Manager",
        badge: "Quản trị viên",
        status: "ACTIVE",
        avatarLetter: "TM",
      },
      {
        id: "m-2",
        name: "Lê Thu Hương",
        role: "Recruiter",
        badge: "Thành viên",
        status: "ACTIVE",
        avatarLetter: "LH",
      },
      {
        id: "m-3",
        name: "Phạm Hoài Nam",
        role: "Talent Acquisition",
        badge: "Thành viên",
        status: "ACTIVE",
        avatarLetter: "PN",
      },
      {
        id: "m-4",
        name: "Ngô Thị Mai",
        role: "HR Specialist",
        badge: "Thành viên",
        status: "LOCKED",
        avatarLetter: "NM",
      },
    ],
    branchesList: [
      {
        id: "b-1",
        name: "Trụ sở chính",
        address: "Tòa nhà FPT, Duy Tân, Cầu Giấy, Hà Nội",
        isMain: true,
        status: "ACTIVE",
      },
      {
        id: "b-2",
        name: "Chi nhánh Đà Nẵng",
        address: "Tầng 8, Tòa nhà FPT, Hải Châu, Đà Nẵng",
        isMain: false,
        status: "ACTIVE",
      },
      {
        id: "b-3",
        name: "Chi nhánh TP. HCM",
        address: "Lô T2, Đường D1, Quận 9, TP. HCM",
        isMain: false,
        status: "ACTIVE",
      },
    ],
    legalDocs: [
      {
        id: "d-1",
        name: "Giấy phép kinh doanh.pdf",
        date: "12/03/2024",
        size: "2.4 MB",
      },
      {
        id: "d-2",
        name: "Giấy chứng nhận mã số thuế.pdf",
        date: "10/03/2024",
        size: "1.1 MB",
      },
      {
        id: "d-3",
        name: "Điều lệ công ty.pdf",
        date: "10/03/2024",
        size: "2.8 MB",
      },
      {
        id: "d-4",
        name: "Giấy chứng nhận đăng ký thay đổi.pdf",
        date: "01/02/2024",
        size: "1.5 MB",
      },
    ],
    verifications: [
      { title: "Xác minh doanh nghiệp", date: "12/03/2024" },
      { title: "Xác minh mã số thuế", date: "12/03/2024" },
      { title: "Xác minh email", date: "12/03/2024" },
      { title: "Xác minh số điện thoại", date: "12/03/2024" },
      { title: "Xác minh giấy phép kinh doanh", date: "12/03/2024" },
      { title: "Xác minh tên miền website", date: "12/03/2024" },
    ],
    servicePackage: {
      name: "Gói Doanh nghiệp Pro",
      status: "Đang sử dụng",
      expiry: "01/01/2024 – 31/12/2024 (còn 106 ngày)",
      jobPostsUsed: 152,
      jobPostsTotal: 200,
      cvViewsUsed: 8500,
      cvViewsTotal: 10000,
    },
    internalNote: {
      author: "Trần Minh Quân",
      avatarLetter: "TQ",
      date: "12/03/2024 10:24",
      content:
        "Đã xác minh đầy đủ hồ sơ pháp lý. Doanh nghiệp uy tín, hoạt động ổn định. Đề xuất chăm sóc khách hàng VIP.",
    },
    complaints: [
      {
        id: "KN-2024-001",
        title: "Nội dung tin tuyển dụng không phù hợp",
        date: "05/03/2024",
        status: "PENDING",
      },
    ],
    auditLogs: [
      {
        admin: "Nguyễn Văn Hùng",
        action: "đã xác minh doanh nghiệp",
        time: "12/03/2024 10:24",
      },
      {
        admin: "Trần Minh Quân",
        action: "đã cập nhật thông tin công ty",
        time: "10/03/2024 14:20",
      },
      {
        admin: "Hệ thống",
        action: "đã duyệt tin tuyển dụng",
        time: "08/03/2024 09:15",
      },
    ],
  },
};

function CompanyDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { message, modal } = App.useApp();

  const rawId = typeof params?.id === "string" ? params.id : "1";

  // Lấy dữ liệu công ty
  const [company, setCompany] = useState<any>(() => ({
    ...COMPANIES_DB["CPN_000001"],
    id: rawId,
    name: "Đang tải...",
    shortName: "Đang tải...",
  }));

  const fetchCompanyDetail = useCallback(async () => {
    try {
      const res = await adminService.getCompanyDetail(rawId);
      const c = res?.data?.company || (res?.data as any);
      if (!c || !c.id) return;

      const isVer = c.verification_status === "verified";
      const isPending = c.verification_status === "pending";
      const statusStr = isVer ? "VERIFIED" : isPending ? "PENDING" : "REJECTED";
      const firstMember = (c.members && c.members[0]) || null;
      const latestVr = (c.verification_requests && c.verification_requests[0]) || null;
      const activeSub = (c.subscriptions && c.subscriptions[0]) || null;

      setCompany({
        id: String(c.id),
        name: c.name,
        shortName: c.name,
        taxCode: c.tax_code || "—",
        industry: c.industry_name || "Đa ngành",
        size: c.company_size || "50 - 100 nhân sự",
        foundedYear: 2020,
        status: statusStr,
        verifiedDate: latestVr?.reviewed_at
          ? new Date(latestVr.reviewed_at).toLocaleDateString("vi-VN")
          : c.created_at
            ? new Date(c.created_at).toLocaleDateString("vi-VN")
            : "—",
        logo:
          c.logo_url ||
          "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=400&q=80",
        banner:
          c.banner_url ||
          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&h=500&q=90",
        slogan: c.slogan || "Đồng hành kiến tạo sự nghiệp bền vững",
        vision: c.slogan || "Phát triển nguồn nhân lực chất lượng cao",
        tags: Array.isArray(c.benefits) && c.benefits.length > 0 ? c.benefits.slice(0, 4) : [c.industry_name || "Doanh nghiệp"],
        website: c.website || "—",
        email: firstMember?.email || "—",
        phone: firstMember?.phone || "—",
        address: c.address || c.city || "Việt Nam",
        description: c.description || "Chưa có mô tả chi tiết.",
        kpis: {
          activeJobs: c.kpis?.active_jobs ?? 0,
          activeJobsGrowth: `${c.kpis?.total_jobs ?? 0} tổng tin`,
          totalApplications: c.kpis?.total_applications ?? 0,
          totalApplicationsGrowth: "Lượt nộp",
          pipelineCandidates: c.kpis?.pipeline_candidates ?? 0,
          pipelineCandidatesGrowth: "Đang xử lý",
          members: c.kpis?.members_count ?? (c.members?.length || 0),
          membersGrowth: "Thành viên",
          revenue: `${(c.kpis?.total_revenue_vnd ?? 0).toLocaleString("vi-VN")} đ`,
          revenueGrowth: "Đã thanh toán",
          rating: c.kpis?.avg_rating ?? 0,
          ratingCount: c.kpis?.reviews_count ?? 0,
        },
        jobStatusChart: {
          active: c.kpis?.active_jobs ?? 0,
          pending: c.kpis?.draft_jobs ?? 0,
          expired: c.kpis?.closed_jobs ?? 0,
          rejected: 0,
        },
        representative: {
          name: firstMember?.full_name || "Đại diện doanh nghiệp",
          position: firstMember?.member_role || "Quản trị viên",
          email: firstMember?.email || "—",
          phone: firstMember?.phone || "—",
        },
        membersList: (c.members || []).map((m: any) => ({
          id: String(m.id),
          userId: m.user_id,
          name: m.full_name || m.email,
          email: m.email,
          role: m.member_role || "Member",
          badge: m.member_role === "owner" || m.member_role === "admin" ? "Quản trị viên" : "Thành viên",
          status: m.status === "active" ? "ACTIVE" : "LOCKED",
          avatarLetter: ((m.full_name || m.email || "U")[0] || "U").toUpperCase(),
        })),
        branchesList: (c.branches || []).map((b: any, idx: number) => ({
          id: String(b.id),
          name: b.name || `Chi nhánh #${idx + 1}`,
          address: b.address || "",
          isMain: idx === 0,
          status: "ACTIVE",
        })),
        legalDocs: (c.verification_requests || []).map((vr: any) => ({
          id: String(vr.id),
          name: vr.document_url ? String(vr.document_url).split("/").pop() : `Ho_so_phap_ly_${vr.tax_code || vr.id}.pdf`,
          url: vr.document_url,
          date: vr.created_at ? new Date(vr.created_at).toLocaleDateString("vi-VN") : "—",
          size: vr.status || "pending",
        })),
        verifications: [
          {
            title: isVer ? "Đã xác minh doanh nghiệp" : "Chờ xác minh doanh nghiệp",
            date: latestVr?.reviewed_at
              ? new Date(latestVr.reviewed_at).toLocaleDateString("vi-VN")
              : "—",
          },
          {
            title: `Mã số thuế: ${c.tax_code || "—"}`,
            date: latestVr?.created_at
              ? new Date(latestVr.created_at).toLocaleDateString("vi-VN")
              : "—",
          },
        ],
        servicePackage: {
          name: activeSub?.plan_name || "Gói Cơ bản (Mặc định)",
          status: activeSub?.status === "active" ? "Đang sử dụng" : "Chưa kích hoạt",
          expiry: activeSub?.ends_at
            ? `Hết hạn: ${new Date(activeSub.ends_at).toLocaleDateString("vi-VN")}`
            : "Không giới hạn thời gian",
          jobPostsUsed: c.kpis?.total_jobs ?? 0,
          jobPostsTotal: activeSub?.job_quota || 10,
          cvViewsUsed: c.kpis?.total_applications ?? 0,
          cvViewsTotal: (activeSub?.ai_interview_quota || 20) * 10,
        },
        internalNote: {
          author: "Ban Quản Trị",
          avatarLetter: "AD",
          date: latestVr?.reviewed_at
            ? new Date(latestVr.reviewed_at).toLocaleString("vi-VN")
            : "Hệ thống",
          content:
            latestVr?.notes ||
            (isVer
              ? "Đã xác minh đầy đủ hồ sơ pháp lý."
              : "Hồ sơ đang được quản trị viên theo dõi."),
        },
        complaints: (c.reports || []).map((rp: any) => ({
          id: `RP-${rp.id}`,
          title: rp.reason || "Báo cáo vi phạm",
          date: rp.created_at ? new Date(rp.created_at).toLocaleDateString("vi-VN") : "—",
          status: (rp.status || "pending").toUpperCase(),
        })),
        auditLogs: (c.audit_logs || []).map((l: any) => ({
          admin: l.actor_name || "Hệ thống",
          action: l.action,
          time: l.created_at ? new Date(l.created_at).toLocaleString("vi-VN") : "—",
        })),
        recentJobs: c.recent_jobs || [],
        recentApplications: c.recent_applications || [],
        subscriptions: c.subscriptions || [],
        orders: c.orders || [],
        reviews: c.reviews || [],
        verificationRequests: c.verification_requests || [],
      });
    } catch (err) {
      console.error("Lỗi khi tải chi tiết doanh nghiệp:", err);
    }
  }, [rawId]);

  useEffect(() => {
    fetchCompanyDetail();
  }, [fetchCompanyDetail]);

  // Tab đang chọn
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "legal"
    | "branches"
    | "members"
    | "jobs"
    | "candidates"
    | "services"
    | "transactions"
    | "complaints"
    | "verifications"
    | "audit"
  >("overview");

  // State các modal
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyForm] = Form.useForm();

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectForm] = Form.useForm();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm] = Form.useForm();

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");

  const [hoveredChartPoint, setHoveredChartPoint] = useState<number | null>(null);

  // Thao tác Tạm khóa / Mở khóa
  const handleToggleLock = () => {
    const isLocked = company.status === "LOCKED" || company.status === "REJECTED";
    modal.confirm({
      title: isLocked ? "Mở khóa doanh nghiệp?" : "Tạm khóa doanh nghiệp?",
      content: isLocked
        ? `Bạn có chắc chắn muốn mở khóa cho doanh nghiệp "${company.shortName}"? Doanh nghiệp sẽ có thể tiếp tục đăng tin và quản lý tuyển dụng.`
        : `Bạn có chắc chắn muốn tạm khóa doanh nghiệp "${company.shortName}"?`,
      okText: isLocked ? "Mở khóa ngay" : "Tạm khóa",
      okType: isLocked ? "primary" : "danger",
      cancelText: "Hủy bỏ",
      onOk: async () => {
        try {
          await adminService.updateCompanyStatus(rawId, isLocked);
          const nextStatus = isLocked ? "VERIFIED" : "LOCKED";
          setCompany((prev: any) => ({ ...prev, status: nextStatus }));
          message.success(
            isLocked
              ? `Đã mở khóa doanh nghiệp "${company.shortName}" thành công!`
              : `Đã tạm khóa doanh nghiệp "${company.shortName}"!`
          );
          fetchCompanyDetail();
        } catch {
          message.error("Không thể cập nhật trạng thái doanh nghiệp.");
        }
      },
    });
  };

  // Thao tác Duyệt lại
  const handleReApprove = () => {
    modal.confirm({
      title: "Duyệt xác minh hồ sơ doanh nghiệp?",
      content: `Xác nhận kiểm tra toàn bộ giấy tờ pháp nhân và cấp trạng thái "Đã xác minh" cho "${company.name}"?`,
      okText: "Xác nhận duyệt",
      cancelText: "Hủy bỏ",
      okType: "primary",
      onOk: async () => {
        try {
          await adminService.verifyCompany(rawId, "approve", "Admin phê duyệt xác minh pháp nhân");
          setCompany((prev: any) => ({ ...prev, status: "VERIFIED" }));
          message.success(`Đã duyệt hồ sơ cho "${company.shortName}" thành công!`);
          fetchCompanyDetail();
        } catch {
          message.error("Phê duyệt xác minh thất bại.");
        }
      },
    });
  };

  // Thao tác Từ chối
  const handleRejectSubmit = async (values: any) => {
    try {
      await adminService.verifyCompany(rawId, "reject", values.reason || "Hồ sơ chưa hợp lệ");
      setCompany((prev: any) => ({
        ...prev,
        status: "REJECTED",
        rejectReason: values.reason,
      }));
      setIsRejectModalOpen(false);
      message.warning(`Đã chuyển trạng thái hồ sơ của "${company.shortName}" sang Bị từ chối.`);
      fetchCompanyDetail();
    } catch {
      message.error("Từ chối xác minh thất bại.");
    }
  };

  // Thao tác Gửi thông báo
  const handleSendNotification = async (values: any) => {
    try {
      await adminService.broadcastNotification({
        title: values.title,
        content: values.content || "",
        target_role: "employer",
      });
      message.success(`Đã gửi thông báo "${values.title}" tới "${company.shortName}" thành công!`);
      setIsNotifyModalOpen(false);
    } catch {
      message.error("Không thể gửi thông báo.");
    }
  };

  // Thao tác Lưu chỉnh sửa
  const handleEditSubmit = (values: any) => {
    setCompany((prev: any) => ({ ...prev, ...values }));
    setIsEditModalOpen(false);
    message.success("Đã cập nhật thông tin doanh nghiệp thành công!");
  };

  // Dữ liệu biểu đồ tháng
  const monthlyApplications = [
    { month: "Tháng 1", count: 420 },
    { month: "Tháng 2", count: 460 },
    { month: "Tháng 3", count: 480 },
    { month: "Tháng 4", count: 530 },
    { month: "Tháng 5", count: 570 },
    { month: "Tháng 6", count: 620 },
  ];

  return (
    <div className="space-y-4 select-none pb-14">
      {/* ========================================================= */}
      {/* 1. TOP BAR: BREADCRUMB, NÚT QUAY LẠI VÀ NÚT THAO TÁC */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-transparent">
        {/* Breadcrumb + Nút Quay lại */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/companies"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-700 hover:text-[#0062ff] hover:border-blue-300 shadow-2xs transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link
              href="/admin/companies"
              className="text-slate-500 hover:text-[#0062ff] transition-colors"
            >
              Quản lý doanh nghiệp
            </Link>
            <span>&gt;</span>
            <Link
              href="/admin/companies"
              className="text-slate-500 hover:text-[#0062ff] transition-colors"
            >
              Danh sách doanh nghiệp
            </Link>
            <span>&gt;</span>
            <span className="font-extrabold text-slate-900">Chi tiết doanh nghiệp</span>
          </div>
        </div>

        {/* Hàng nút thao tác: Tạm khóa / Duyệt lại / Từ chối / Chỉnh sửa */}
        <div className="flex items-center gap-2">
          {/* Tạm khóa */}
          <button
            type="button"
            onClick={handleToggleLock}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold shadow-2xs transition-all cursor-pointer bg-white ${
              company.status === "LOCKED"
                ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                : "border-rose-200 text-rose-600 hover:bg-rose-50"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{company.status === "LOCKED" ? "Mở khóa" : "Tạm khóa"}</span>
          </button>

          {/* Duyệt lại */}
          <button
            type="button"
            onClick={handleReApprove}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-blue-200 text-[#0062ff] hover:bg-blue-50 text-xs font-bold shadow-2xs transition-all cursor-pointer bg-white"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Duyệt lại</span>
          </button>

          {/* Từ chối */}
          <button
            type="button"
            onClick={() => {
              rejectForm.resetFields();
              setIsRejectModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold shadow-2xs transition-all cursor-pointer bg-white"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Từ chối</span>
          </button>

          {/* Chỉnh sửa */}
          <button
            type="button"
            onClick={() => {
              editForm.setFieldsValue({
                name: company.name,
                shortName: company.shortName,
                taxCode: company.taxCode,
                industry: company.industry,
                website: company.website,
                email: company.email,
                phone: company.phone,
                address: company.address,
                description: company.description,
              });
              setIsEditModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer border-none"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Chỉnh sửa</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. HERO PROFILE HEADER CARD CỦA DOANH NGHIỆP */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Cột trái: Logo, Tên, MST, Tags (7 cols) */}
          <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div className="flex items-start gap-4">
              {/* Logo khung vuông bo tròn */}
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl border border-slate-200/90 bg-white p-2.5 flex items-center justify-center shadow-md shrink-0">
                <img
                  src={company.logo}
                  alt={company.shortName}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Thông tin tên và pháp lý */}
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
                    {company.name}
                  </h1>
                  <Tooltip title="Doanh nghiệp đã hoàn tất xác thực pháp nhân">
                    <CheckCircle className="w-5 h-5 fill-[#0062ff] text-white shrink-0" />
                  </Tooltip>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Đã xác minh</span>
                  </span>
                </div>

                {/* Subtitle bar */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                  <span className="font-bold text-slate-700">{company.shortName}</span>
                  <span className="text-slate-300">•</span>
                  <span>MST: <strong className="font-mono text-slate-700">{company.taxCode}</strong></span>
                  <span className="text-slate-300">•</span>
                  <span>{company.industry}</span>
                  <span className="text-slate-300">•</span>
                  <span>{company.size}</span>
                  <span className="text-slate-300">•</span>
                  <span>Thành lập {company.foundedYear}</span>
                </div>

                {/* Slogan */}
                <p className="text-xs italic text-slate-600 m-0 pt-0.5 font-normal">
                  "{company.slogan}"
                </p>
              </div>
            </div>

            {/* Tags văn hóa / thế mạnh */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {company.tags?.map((tag: string) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-200/70"
                >
                  {tag}
                </span>
              ))}
              <button
                type="button"
                onClick={() => message.info("Chức năng thêm tag định danh cho doanh nghiệp")}
                className="px-2 py-1 rounded-lg border border-dashed border-slate-300 text-slate-500 hover:text-[#0062ff] hover:border-blue-400 font-bold text-[11px] cursor-pointer bg-transparent"
              >
                + Thêm
              </button>
            </div>
          </div>

          {/* Cột phải: Banner công ty & Nút gửi thông báo (5 cols) */}
          <div
            className="lg:col-span-5 relative min-h-[170px] bg-cover bg-center flex flex-col justify-between p-5 text-white"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(10, 25, 47, 0.45), rgba(10, 25, 47, 0.85)), url(${company.banner})`,
            }}
          >
            {/* Quote góc trên */}
            <div className="space-y-1">
              <span className="text-2xl font-serif leading-none block opacity-70">“</span>
              <p className="text-xs italic font-medium m-0 max-w-[280px] leading-relaxed text-slate-100 drop-shadow-sm">
                {company.vision}
              </p>
            </div>

            {/* Hàng nút góc dưới phải */}
            <div className="flex items-center justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  notifyForm.resetFields();
                  notifyForm.setFieldsValue({
                    type: "ALL",
                    title: "Thông báo từ Ban quản trị CAREZA",
                    content: "",
                  });
                  setIsNotifyModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/95 hover:bg-white text-slate-900 font-bold text-xs shadow-md border-none cursor-pointer transition-all"
              >
                <Mail className="w-3.5 h-3.5 text-[#0062ff]" />
                <span>Gửi thông báo</span>
              </button>

              <Dropdown
                menu={{
                  items: [
                    {
                      key: "visit",
                      icon: <ExternalLink className="w-3.5 h-3.5 text-blue-500" />,
                      label: "Xem trang tuyển dụng công khai",
                      onClick: () => window.open(company.website, "_blank"),
                    },
                    {
                      key: "add-note",
                      icon: <StickyNote className="w-3.5 h-3.5 text-amber-500" />,
                      label: "Thêm ghi chú nội bộ",
                      onClick: () => {
                        setNewNoteText("");
                        setIsNoteModalOpen(true);
                      },
                    },
                    {
                      type: "divider",
                    },
                    {
                      key: "export",
                      icon: <Download className="w-3.5 h-3.5 text-slate-600" />,
                      label: "Xuất hồ sơ doanh nghiệp (PDF)",
                      onClick: () => message.success("Đang chuẩn bị tệp hồ sơ doanh nghiệp..."),
                    },
                  ],
                }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <button
                  type="button"
                  className="w-8 h-8 rounded-xl bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center border-none cursor-pointer transition-colors shadow-md"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. TABS NAVIGATION (11 TABS CHUẨN MOCKUP) */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs px-3 sm:px-4 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {[
          { key: "overview", label: "Tổng quan" },
          { key: "legal", label: "Hồ sơ & pháp lý" },
          { key: "branches", label: "Chi nhánh" },
          { key: "members", label: "Thành viên (12)" },
          { key: "jobs", label: "Tin tuyển dụng (48)" },
          { key: "candidates", label: "Ứng viên & tuyển dụng" },
          { key: "services", label: "Gói dịch vụ" },
          { key: "transactions", label: "Giao dịch & thanh toán" },
          { key: "complaints", label: "Khiếu nại & vi phạm" },
          { key: "verifications", label: "Lịch sử xác minh" },
          { key: "audit", label: "Nhật ký quản trị" },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-3 px-3 text-xs font-bold border-none bg-transparent cursor-pointer whitespace-nowrap transition-all relative ${
                isActive ? "text-[#0062ff]" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#0062ff] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 4. NỘI DUNG TAB TỔNG QUAN (CHÍNH THEO MOCKUP) */}
      {/* ========================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* 4.1 HÀNG 6 CARD KPI */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* KPI 1: Tin đang hoạt động */}
            <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-2xs flex items-center gap-3 hover:border-blue-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-none">
                  {company.kpis.activeJobs}
                </span>
                <span className="text-[11px] font-bold text-slate-500 block mt-1 truncate">
                  Tin đang hoạt động
                </span>
                <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
                  {company.kpis.activeJobsGrowth} <span className="font-normal text-slate-400">so với tháng trước</span>
                </span>
              </div>
            </div>

            {/* KPI 2: Tổng lượt ứng tuyển */}
            <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-2xs flex items-center gap-3 hover:border-blue-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-none">
                  {company.kpis.totalApplications.toLocaleString()}
                </span>
                <span className="text-[11px] font-bold text-slate-500 block mt-1 truncate">
                  Tổng lượt ứng tuyển
                </span>
                <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
                  {company.kpis.totalApplicationsGrowth} <span className="font-normal text-slate-400">so với tháng trước</span>
                </span>
              </div>
            </div>

            {/* KPI 3: Ứng viên trong pipeline */}
            <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-2xs flex items-center gap-3 hover:border-blue-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                <Filter className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-none">
                  {company.kpis.pipelineCandidates}
                </span>
                <span className="text-[11px] font-bold text-slate-500 block mt-1 truncate">
                  Ứng viên trong pipeline
                </span>
                <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
                  {company.kpis.pipelineCandidatesGrowth} <span className="font-normal text-slate-400">so với tháng trước</span>
                </span>
              </div>
            </div>

            {/* KPI 4: Thành viên */}
            <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-2xs flex items-center gap-3 hover:border-blue-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-none">
                  {company.kpis.members}
                </span>
                <span className="text-[11px] font-bold text-slate-500 block mt-1 truncate">
                  Thành viên
                </span>
                <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
                  {company.kpis.membersGrowth} <span className="font-normal text-slate-400">so với tháng trước</span>
                </span>
              </div>
            </div>

            {/* KPI 5: Doanh thu từ doanh nghiệp */}
            <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-2xs flex items-center gap-3 hover:border-amber-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-base sm:text-lg font-black text-slate-900 block leading-none">
                  {company.kpis.revenue}
                </span>
                <span className="text-[11px] font-bold text-slate-500 block mt-1 truncate">
                  Doanh thu từ doanh nghiệp
                </span>
                <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
                  {company.kpis.revenueGrowth} <span className="font-normal text-slate-400">so với tháng trước</span>
                </span>
              </div>
            </div>

            {/* KPI 6: Đánh giá từ ứng viên */}
            <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-2xs flex items-center gap-3 hover:border-amber-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 fill-amber-400 stroke-[1.5]" />
              </div>
              <div className="min-w-0">
                <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-none">
                  {company.kpis.rating}
                </span>
                <span className="text-[11px] font-bold text-slate-500 block mt-1 truncate">
                  Đánh giá từ ứng viên
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab("candidates")}
                  className="text-[10px] font-bold text-[#0062ff] hover:underline block mt-0.5 border-none bg-transparent p-0 cursor-pointer text-left"
                >
                  Từ {company.kpis.ratingCount} đánh giá →
                </button>
              </div>
            </div>
          </div>

          {/* 4.2 HÀNG 3 BIỂU ĐỒ THỐNG KÊ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Biểu đồ 1: Tình trạng tin tuyển dụng (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                  Tình trạng tin tuyển dụng
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab("jobs")}
                  className="text-xs font-bold text-[#0062ff] hover:underline bg-transparent border-none cursor-pointer p-0"
                >
                  Xem tất cả
                </button>
              </div>

              {/* 4 cột trạng thái có tooltip */}
              <div className="grid grid-cols-4 gap-2 pt-4 pb-2 items-end">
                {/* Đang tuyển */}
                <Tooltip title="48 tin tuyển dụng đang hiển thị công khai trên Careza">
                  <div className="text-center group cursor-pointer">
                    <span className="text-lg font-black text-emerald-600 block mb-1 group-hover:scale-110 transition-transform">
                      {company.jobStatusChart.active}
                    </span>
                    <div className="w-full h-18 bg-slate-100 rounded-xl flex items-end p-1">
                      <div className="w-full h-[85%] bg-emerald-500 rounded-lg group-hover:bg-emerald-600 transition-colors" />
                    </div>
                    <span className="text-[10.5px] font-bold text-slate-600 block mt-2">
                      Đang tuyển
                    </span>
                  </div>
                </Tooltip>

                {/* Chờ duyệt */}
                <Tooltip title="8 tin tuyển dụng đang đợi ban quản trị xét duyệt">
                  <div className="text-center group cursor-pointer">
                    <span className="text-lg font-black text-amber-500 block mb-1 group-hover:scale-110 transition-transform">
                      {company.jobStatusChart.pending}
                    </span>
                    <div className="w-full h-18 bg-slate-100 rounded-xl flex items-end p-1">
                      <div className="w-full h-[30%] bg-amber-400 rounded-lg group-hover:bg-amber-500 transition-colors" />
                    </div>
                    <span className="text-[10.5px] font-bold text-slate-600 block mt-2">
                      Chờ duyệt
                    </span>
                  </div>
                </Tooltip>

                {/* Hết hạn */}
                <Tooltip title="6 tin tuyển dụng đã kết thúc thời hạn nhận hồ sơ">
                  <div className="text-center group cursor-pointer">
                    <span className="text-lg font-black text-slate-600 block mb-1 group-hover:scale-110 transition-transform">
                      {company.jobStatusChart.expired}
                    </span>
                    <div className="w-full h-18 bg-slate-100 rounded-xl flex items-end p-1">
                      <div className="w-full h-[22%] bg-slate-400 rounded-lg group-hover:bg-slate-500 transition-colors" />
                    </div>
                    <span className="text-[10.5px] font-bold text-slate-600 block mt-2">
                      Hết hạn
                    </span>
                  </div>
                </Tooltip>

                {/* Bị từ chối */}
                <Tooltip title="3 tin tuyển dụng bị từ chối do vi phạm quy định">
                  <div className="text-center group cursor-pointer">
                    <span className="text-lg font-black text-rose-500 block mb-1 group-hover:scale-110 transition-transform">
                      {company.jobStatusChart.rejected}
                    </span>
                    <div className="w-full h-18 bg-slate-100 rounded-xl flex items-end p-1">
                      <div className="w-full h-[15%] bg-rose-500 rounded-lg group-hover:bg-rose-600 transition-colors" />
                    </div>
                    <span className="text-[10.5px] font-bold text-slate-600 block mt-2">
                      Bị từ chối
                    </span>
                  </div>
                </Tooltip>
              </div>
            </div>

            {/* Biểu đồ 2: Lượt ứng tuyển theo thời gian (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                  Lượt ứng tuyển theo thời gian
                </h3>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block font-normal leading-none">
                      Tổng 6 tháng
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      1.245 <strong className="text-emerald-600 font-normal">↑ 18%</strong>
                    </span>
                  </div>
                  <Select
                    defaultValue="6m"
                    size="small"
                    className="w-[105px] text-xs"
                    options={[
                      { value: "6m", label: "6 tháng qua" },
                      { value: "3m", label: "3 tháng qua" },
                      { value: "1y", label: "1 năm qua" },
                    ]}
                  />
                </div>
              </div>

              {/* Line Chart SVG */}
              <div className="pt-2 relative">
                <div className="h-32 w-full flex items-end justify-between relative px-2">
                  {/* Grid Lines */}
                  <div className="absolute inset-x-0 top-0 border-b border-slate-100/80" />
                  <div className="absolute inset-x-0 top-1/2 border-b border-slate-100/80" />

                  {/* SVG Đường biểu đồ mượt mà */}
                  <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                    <polyline
                      fill="none"
                      stroke="#0062ff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points="20,105 85,90 150,75 215,55 280,40 340,20"
                    />
                  </svg>

                  {/* Các điểm tròn tương tác */}
                  {monthlyApplications.map((item, idx) => {
                    const pos = [
                      { left: "5%", top: "75%" },
                      { left: "23%", top: "65%" },
                      { left: "41%", top: "54%" },
                      { left: "59%", top: "40%" },
                      { left: "77%", top: "28%" },
                      { left: "95%", top: "14%" },
                    ][idx];

                    return (
                      <Tooltip
                        key={idx}
                        title={`${item.month}: ${item.count} lượt ứng tuyển`}
                      >
                        <div
                          style={{ left: pos.left, top: pos.top }}
                          onMouseEnter={() => setHoveredChartPoint(idx)}
                          onMouseLeave={() => setHoveredChartPoint(null)}
                          className="absolute -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#0062ff] shadow-md cursor-pointer hover:scale-130 transition-transform"
                        />
                      </Tooltip>
                    );
                  })}
                </div>

                {/* Nhãn trục X tháng */}
                <div className="flex justify-between text-[10.5px] text-slate-400 pt-2 font-medium">
                  <span>Tháng 1</span>
                  <span>Tháng 2</span>
                  <span>Tháng 3</span>
                  <span>Tháng 4</span>
                  <span>Tháng 5</span>
                  <span>Tháng 6</span>
                </div>
              </div>
            </div>

            {/* Biểu đồ 3: Nguồn ứng viên Donut Chart (3 cols) */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                  Nguồn ứng viên
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab("candidates")}
                  className="text-xs font-bold text-[#0062ff] hover:underline bg-transparent border-none cursor-pointer p-0"
                >
                  Xem chi tiết
                </button>
              </div>

              <div className="flex items-center gap-3 pt-2">
                {/* Donut Chart SVG */}
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    {/* Circle background */}
                    <path
                      className="text-slate-100"
                      strokeWidth="4.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Segment 1: Website 58% */}
                    <path
                      className="text-[#0062ff]"
                      strokeDasharray="58, 100"
                      strokeWidth="4.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Segment 2: Đối tác 20% */}
                    <path
                      className="text-emerald-500"
                      strokeDasharray="20, 100"
                      strokeDashoffset="-58"
                      strokeWidth="4.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Segment 3: Mạng xã hội 15% */}
                    <path
                      className="text-purple-500"
                      strokeDasharray="15, 100"
                      strokeDashoffset="-78"
                      strokeWidth="4.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  {/* Tâm Donut */}
                  <div className="absolute text-center leading-none">
                    <span className="text-xs font-black text-slate-900 block">1.245</span>
                    <span className="text-[8.5px] text-slate-400 font-bold block mt-0.5">ứng tuyển</span>
                  </div>
                </div>

                {/* Legend bên phải */}
                <div className="space-y-1 text-xs min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#0062ff] shrink-0" />
                    <span className="font-bold text-slate-800 text-[11px]">58%</span>
                    <span className="text-slate-500 text-[10.5px] truncate">Từ Website</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-bold text-slate-800 text-[11px]">20%</span>
                    <span className="text-slate-500 text-[10.5px] truncate">Từ đối tác</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                    <span className="font-bold text-slate-800 text-[11px]">15%</span>
                    <span className="text-slate-500 text-[10.5px] truncate">Mạng xã hội</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                    <span className="font-bold text-slate-800 text-[11px]">7%</span>
                    <span className="text-slate-500 text-[10.5px] truncate">Khác</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4.3 BỐ CỤC 4 CỘT THÔNG TIN QUẢN TRỊ CHI TIẾT */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
            {/* ========================================================= */}
            {/* CỘT 1: THÔNG TIN DOANH NGHIỆP & NGƯỜI ĐẠI DIỆN */}
            {/* ========================================================= */}
            <div className="space-y-4">
              {/* Card Thông tin doanh nghiệp */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                    Thông tin doanh nghiệp
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      editForm.setFieldsValue(company);
                      setIsEditModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0062ff] hover:underline bg-transparent border-none cursor-pointer p-0"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Chỉnh sửa</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-1.5 flex justify-between gap-2">
                    <span className="text-slate-400">Tên công ty</span>
                    <span className="font-bold text-slate-900 text-right">
                      {company.name}
                    </span>
                  </div>

                  <div className="py-1.5 flex justify-between gap-2">
                    <span className="text-slate-400">Tên viết tắt</span>
                    <span className="font-semibold text-slate-800 text-right">
                      {company.shortName}
                    </span>
                  </div>

                  <div className="py-1.5 flex justify-between gap-2">
                    <span className="text-slate-400">Mã số thuế</span>
                    <span className="font-mono font-bold text-slate-800 text-right">
                      {company.taxCode}
                    </span>
                  </div>

                  <div className="py-1.5 flex justify-between gap-2">
                    <span className="text-slate-400">Ngành nghề</span>
                    <span className="font-medium text-slate-800 text-right">
                      {company.industry}
                    </span>
                  </div>

                  <div className="py-1.5 flex justify-between gap-2">
                    <span className="text-slate-400">Quy mô nhân sự</span>
                    <span className="font-medium text-slate-800 text-right">
                      {company.size}
                    </span>
                  </div>

                  <div className="py-1.5 flex justify-between gap-2">
                    <span className="text-slate-400">Năm thành lập</span>
                    <span className="font-medium text-slate-800 text-right">
                      {company.foundedYear}
                    </span>
                  </div>

                  <div className="py-1.5 flex justify-between items-center gap-2">
                    <span className="text-slate-400">Website</span>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0062ff] hover:underline font-semibold text-right inline-flex items-center gap-1"
                    >
                      <span className="truncate max-w-[130px]">{company.website}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="py-1.5 flex justify-between gap-2">
                    <span className="text-slate-400">Email liên hệ</span>
                    <span className="font-medium text-slate-800 text-right">
                      {company.email}
                    </span>
                  </div>

                  <div className="py-1.5 flex justify-between gap-2">
                    <span className="text-slate-400">Số điện thoại</span>
                    <span className="font-medium text-slate-800 text-right">
                      {company.phone}
                    </span>
                  </div>

                  <div className="py-1.5 flex justify-between gap-2">
                    <span className="text-slate-400">Địa chỉ trụ sở</span>
                    <span className="font-medium text-slate-800 text-right">
                      {company.address}
                    </span>
                  </div>

                  <div className="py-1.5 pt-2 text-slate-600 leading-relaxed font-normal">
                    <span className="text-slate-400 block mb-0.5">Mô tả:</span>
                    {company.description}
                  </div>
                </div>
              </div>

              {/* Card Người đại diện */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                    Người đại diện
                  </h3>
                  <button
                    type="button"
                    onClick={() => message.info("Chỉnh sửa thông tin người đại diện pháp luật")}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0062ff] hover:underline bg-transparent border-none cursor-pointer p-0"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Chỉnh sửa</span>
                  </button>
                </div>

                <div className="flex items-start gap-3 pt-1 text-xs">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <span className="font-bold text-slate-900 block text-xs">
                      {company.representative.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block font-medium">
                      {company.representative.position}
                    </span>
                    <div className="text-[10.5px] text-slate-500 space-y-0.5 pt-1">
                      <span className="block truncate">✉ {company.representative.email}</span>
                      <span className="block">☎ {company.representative.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* CỘT 2: THÀNH VIÊN DOANH NGHIỆP & CHI NHÁNH */}
            {/* ========================================================= */}
            <div className="space-y-4">
              {/* Card Thành viên doanh nghiệp (12) */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                    Thành viên doanh nghiệp ({company.kpis.members})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("members")}
                    className="text-xs font-bold text-[#0062ff] hover:underline bg-transparent border-none cursor-pointer p-0"
                  >
                    Xem tất cả
                  </button>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {company.membersList.map((m: any) => (
                    <div key={m.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                          {m.avatarLetter}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate">
                            {m.name}
                          </span>
                          <span className="text-[10.5px] text-slate-400 block truncate">
                            {m.role}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0062ff] font-semibold text-[10.5px]">
                          {m.badge}
                        </span>
                        {m.status === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Đang hoạt động</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-500 font-bold text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span>Tạm khóa</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Chi nhánh (3) */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                    Chi nhánh ({company.branchesList.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("branches")}
                    className="text-xs font-bold text-[#0062ff] hover:underline bg-transparent border-none cursor-pointer p-0"
                  >
                    Xem tất cả
                  </button>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {company.branchesList.map((b: any) => (
                    <div key={b.id} className="py-2.5 flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0062ff] flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-slate-900 text-xs truncate">
                            {b.name}
                          </span>
                          {b.isMain ? (
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0062ff] font-bold text-[9.5px]">
                              Trụ sở chính
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[9.5px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Đang hoạt động</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {b.address}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* CỘT 3: HỒ SƠ PHÁP LÝ, KHIẾU NẠI & NHẬT KÝ QUẢN TRỊ */}
            {/* ========================================================= */}
            <div className="space-y-4">
              {/* Card Giấy phép & hồ sơ pháp lý */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                    Giấy phép &amp; hồ sơ pháp lý
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("legal")}
                    className="text-xs font-bold text-[#0062ff] hover:underline bg-transparent border-none cursor-pointer p-0"
                  >
                    Xem tất cả
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  {company.legalDocs.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 flex items-center justify-between gap-2 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-800 block truncate text-xs">
                            {doc.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Cập nhật: {doc.date} | {doc.size}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => message.success(`Tải xuống tệp: ${doc.name}`)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:border-blue-300 text-slate-500 hover:text-[#0062ff] flex items-center justify-center cursor-pointer shrink-0 shadow-2xs"
                        title="Tải xuống"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Khiếu nại & vi phạm */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                    Khiếu nại &amp; vi phạm
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("complaints")}
                    className="text-xs font-bold text-[#0062ff] hover:underline bg-transparent border-none cursor-pointer p-0"
                  >
                    Xem tất cả
                  </button>
                </div>

                {/* 3 Badge thống kê vi phạm */}
                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                  <div className="p-1.5 rounded-lg bg-rose-50 border border-rose-200/70">
                    <span className="font-bold text-rose-600 block text-xs">1</span>
                    <span className="text-slate-600 truncate block">Khiếu nại đang xử lý</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200/70">
                    <span className="font-bold text-amber-600 block text-xs">0</span>
                    <span className="text-slate-600 truncate block">Vi phạm nội dung</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200/70">
                    <span className="font-bold text-blue-600 block text-xs">0</span>
                    <span className="text-slate-600 truncate block">Vi phạm thanh toán</span>
                  </div>
                </div>

                {/* Khiếu nại gần đây */}
                <div className="p-2.5 rounded-xl border border-rose-100 bg-rose-50/30 space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-slate-900 text-[11.5px] truncate">
                      Nội dung tin tuyển dụng không phù hợp
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 font-bold text-[9.5px] shrink-0 border border-amber-200">
                      Đang xử lý
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    ID: KN-2024-001 | 05/03/2024
                  </span>
                </div>
              </div>

              {/* Card Nhật ký quản trị */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                    Nhật ký quản trị
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("audit")}
                    className="text-xs font-bold text-[#0062ff] hover:underline bg-transparent border-none cursor-pointer p-0"
                  >
                    Xem tất cả
                  </button>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {company.auditLogs.map((log: any, idx: number) => (
                    <div key={idx} className="py-2 space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-800">{log.admin}</span>
                        <span className="font-mono">{log.time}</span>
                      </div>
                      <p className="text-slate-600 m-0 text-[11px] leading-tight">
                        {log.action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* CỘT 4: TRẠNG THÁI XÁC MINH, GÓI DỊCH VỤ & GHI CHÚ NỘI BỘ */}
            {/* ========================================================= */}
            <div className="space-y-4">
              {/* Card Trạng thái xác minh (6 checklist) */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                    Trạng thái xác minh
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("verifications")}
                    className="text-xs font-bold text-[#0062ff] hover:underline bg-transparent border-none cursor-pointer p-0"
                  >
                    Xem lịch sử
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  {company.verifications.map((v: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between gap-1">
                      <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
                        <span>{v.title}</span>
                      </span>
                      <div className="flex items-center gap-1.5 text-right">
                        <span className="text-emerald-600 font-bold text-[10.5px]">Đã xác minh</span>
                        <span className="text-[10px] text-slate-400">{v.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Gói dịch vụ hiện tại */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                    Gói dịch vụ hiện tại
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("services")}
                    className="text-xs font-bold text-[#0062ff] hover:underline bg-transparent border-none cursor-pointer p-0"
                  >
                    Xem chi tiết
                  </button>
                </div>

                <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#0062ff]" />
                      <span className="font-bold text-slate-900 text-xs">
                        {company.servicePackage.name}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 font-bold text-[9.5px]">
                      {company.servicePackage.status}
                    </span>
                  </div>

                  <span className="text-[10.5px] text-slate-500 block">
                    Thời hạn: {company.servicePackage.expiry}
                  </span>

                  {/* Progress 1: Tin đăng còn lại */}
                  <div className="space-y-0.5 pt-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500">Số tin đăng còn lại</span>
                      <span className="font-bold text-slate-800">
                        {company.servicePackage.jobPostsUsed} / {company.servicePackage.jobPostsTotal} (76%)
                      </span>
                    </div>
                    <Progress
                      percent={76}
                      showInfo={false}
                      strokeColor="#0062ff"
                      size="small"
                    />
                  </div>

                  {/* Progress 2: Lượt xem hồ sơ */}
                  <div className="space-y-0.5 pt-0.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500">Lượt xem hồ sơ còn lại</span>
                      <span className="font-bold text-slate-800">
                        {company.servicePackage.cvViewsUsed.toLocaleString()} /{" "}
                        {company.servicePackage.cvViewsTotal.toLocaleString()} (85%)
                      </span>
                    </div>
                    <Progress
                      percent={85}
                      showInfo={false}
                      strokeColor="#10b981"
                      size="small"
                    />
                  </div>
                </div>
              </div>

              {/* Card Ghi chú nội bộ */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider m-0">
                    Ghi chú nội bộ
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setNewNoteText("");
                      setIsNoteModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0062ff] hover:underline bg-transparent border-none cursor-pointer p-0"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Thêm ghi chú</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-[#0062ff] font-bold text-[10px] flex items-center justify-center shrink-0">
                      {company.internalNote.avatarLetter}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-slate-900 block leading-tight text-[11px]">
                        {company.internalNote.author}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {company.internalNote.date}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-700 m-0 leading-relaxed text-[11px]">
                    {company.internalNote.content}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. CÁC TABS PHỤ KHÁC (CHUYỂN NỘI DUNG THẬT) */}
      {/* ========================================================= */}
      {activeTab !== "overview" && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-900 m-0 capitalize">
              {activeTab === "legal" && "Hồ sơ & tài liệu pháp lý chi tiết"}
              {activeTab === "branches" && "Hệ thống chi nhánh & địa điểm"}
              {activeTab === "members" && "Danh sách thành viên quản trị & tuyển dụng"}
              {activeTab === "jobs" && "Danh sách tin tuyển dụng đã đăng"}
              {activeTab === "candidates" && "Quản lý pipeline ứng viên & tuyển dụng"}
              {activeTab === "services" && "Lịch sử & chi tiết các gói dịch vụ"}
              {activeTab === "transactions" && "Lịch sử giao dịch & hóa đơn thanh toán"}
              {activeTab === "complaints" && "Danh sách khiếu nại & xử lý vi phạm"}
              {activeTab === "verifications" && "Lịch sử các mốc xác minh pháp lý"}
              {activeTab === "audit" && "Nhật ký quản trị viên tác động"}
            </h2>
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className="text-xs font-bold text-[#0062ff] hover:underline bg-transparent border-none cursor-pointer"
            >
              &lt; Về Tổng quan
            </button>
          </div>

          <div className="py-4 text-xs text-slate-600">
            {activeTab === "legal" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {company.legalDocs.map((doc: any) => (
                  <div key={doc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <FileText className="w-6 h-6 text-rose-500" />
                    <span className="font-bold text-slate-900 block">{doc.name}</span>
                    <span className="text-[11px] text-slate-400 block">{doc.date} · {doc.size}</span>
                    <button
                      type="button"
                      onClick={() => message.success(`Đang tải tệp: ${doc.name}`)}
                      className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-[#0062ff] font-bold text-[11px] cursor-pointer"
                    >
                      Tải xuống
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "jobs" && (
              <div className="space-y-2">
                {[
                  { title: "Senior React / Next.js Engineer", salary: "25 - 40 triệu", date: "10/03/2024", apps: 42 },
                  { title: "AI Research Scientist", salary: "35 - 60 triệu", date: "08/03/2024", apps: 19 },
                  { title: "Cloud / DevOps Solution Architect", salary: "30 - 50 triệu", date: "05/03/2024", apps: 28 },
                  { title: "Product Manager (Fintech Global)", salary: "40 - 70 triệu", date: "01/03/2024", apps: 35 },
                ].map((j, i) => (
                  <div key={i} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">{j.title}</span>
                      <span className="text-[11px] text-slate-500 block">Lương: {j.salary} · Đăng ngày: {j.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600 font-bold text-xs">{j.apps} ứng viên</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 font-bold text-[10.5px]">Đang tuyển</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "members" && (
              <div className="divide-y divide-slate-100">
                {company.membersList.map((m: any) => (
                  <div key={m.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{m.name}</span>
                      <span className="text-[11px] text-slate-500 block">{m.role} · {company.shortName}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-[#0062ff] font-bold text-xs">{m.badge}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "branches" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {company.branchesList.map((b: any) => (
                  <div key={b.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                    <span className="font-bold text-slate-900 block text-xs">{b.name}</span>
                    <span className="text-slate-600 text-xs block">{b.address}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "services" && (
              <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/30 space-y-2">
                <span className="font-bold text-slate-900 text-sm">{company.servicePackage.name}</span>
                <span className="text-slate-600 block">{company.servicePackage.expiry}</span>
              </div>
            )}

            {activeTab === "transactions" && (
              <div className="divide-y divide-slate-100">
                <div className="py-3 flex justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Nâng cấp Gói Doanh nghiệp Pro (12 tháng)</span>
                    <span className="text-[11px] text-slate-400 block">Mã GD: TXN-2024-8891 | 01/01/2024</span>
                  </div>
                  <span className="font-bold text-emerald-600 text-sm">+524.800.000 đ</span>
                </div>
              </div>
            )}

            {activeTab === "complaints" && (
              <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/40 space-y-1">
                <span className="font-bold text-slate-900 block">Nội dung tin tuyển dụng không phù hợp</span>
                <span className="text-slate-500 block">ID: KN-2024-001 | Ngày nhận: 05/03/2024 · Đang xử lý</span>
              </div>
            )}

            {activeTab === "verifications" && (
              <div className="space-y-2">
                {company.verifications.map((v: any, i: number) => (
                  <div key={i} className="py-2 flex justify-between border-b border-slate-100">
                    <span className="font-bold text-slate-800">{v.title}</span>
                    <span className="text-emerald-600 font-bold">✓ Hoàn tất {v.date}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "audit" && (
              <div className="divide-y divide-slate-100">
                {company.auditLogs.map((l: any, i: number) => (
                  <div key={i} className="py-2.5 flex justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{l.admin} {l.action}</span>
                      <span className="text-[10.5px] text-slate-400">{l.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "candidates" && (
              <div className="py-8 text-center text-slate-400">
                Hiển thị danh sách 320 ứng viên trong pipeline tuyển dụng của doanh nghiệp.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: TỪ CHỐI XÁC MINH */}
      {/* ========================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span className="font-black text-slate-900 text-sm">
              Từ chối hồ sơ doanh nghiệp
            </span>
          </div>
        }
        open={isRejectModalOpen}
        onCancel={() => setIsRejectModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={480}
      >
        <Form
          form={rejectForm}
          layout="vertical"
          onFinish={handleRejectSubmit}
          className="pt-2 text-xs space-y-3"
        >
          <p className="text-xs text-slate-600 m-0">
            Vui lòng nhập lý do từ chối cụ thể để gửi thông báo hướng dẫn bổ sung tới đại diện doanh nghiệp.
          </p>

          <Form.Item
            label={<span className="font-bold text-slate-700">Lý do từ chối</span>}
            name="reason"
            rules={[{ required: true, message: "Vui lòng nhập lý do từ chối" }]}
            className="mb-1"
          >
            <Input.TextArea
              rows={3}
              placeholder="Ví dụ: Giấy phép kinh doanh chưa công chứng, thông tin người đại diện chưa khớp..."
              className="rounded-xl text-xs"
            />
          </Form.Item>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer bg-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer border-none shadow-md shadow-rose-500/20"
            >
              Xác nhận từ chối
            </button>
          </div>
        </Form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: GỬI THÔNG BÁO */}
      {/* ========================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <Mail className="w-4 h-4 text-[#0062ff]" />
            <span className="font-black text-slate-900 text-sm">
              Gửi thông báo tới {company.shortName}
            </span>
          </div>
        }
        open={isNotifyModalOpen}
        onCancel={() => setIsNotifyModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={500}
      >
        <Form
          form={notifyForm}
          layout="vertical"
          onFinish={handleSendNotification}
          className="pt-2 text-xs space-y-3"
        >
          <Form.Item
            label={<span className="font-bold text-slate-700">Hình thức gửi</span>}
            name="type"
            className="mb-1"
          >
            <Radio.Group className="text-xs">
              <Radio value="ALL">Cả Email &amp; Hệ thống</Radio>
              <Radio value="EMAIL">Chỉ Email</Radio>
              <Radio value="IN_APP">Chỉ Trong ứng dụng</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-slate-700">Tiêu đề thông báo</span>}
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
            className="mb-1"
          >
            <Input className="rounded-xl text-xs h-9" />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-slate-700">Nội dung</span>}
            name="content"
            rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
            className="mb-2"
          >
            <Input.TextArea rows={4} className="rounded-xl text-xs" />
          </Form.Item>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNotifyModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer bg-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer border-none shadow-md shadow-blue-500/20"
            >
              Gửi thông báo
            </button>
          </div>
        </Form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 3: CHỈNH SỬA THÔNG TIN DOANH NGHIỆP */}
      {/* ========================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <Edit2 className="w-4 h-4 text-[#0062ff]" />
            <span className="font-black text-slate-900 text-sm">
              Chỉnh sửa thông tin doanh nghiệp
            </span>
          </div>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
          className="pt-2 text-xs space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label={<span className="font-bold text-slate-700">Tên doanh nghiệp</span>}
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
              className="mb-1"
            >
              <Input className="rounded-xl text-xs h-9" />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-slate-700">Tên viết tắt</span>}
              name="shortName"
              rules={[{ required: true }]}
              className="mb-1"
            >
              <Input className="rounded-xl text-xs h-9" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label={<span className="font-bold text-slate-700">Mã số thuế</span>}
              name="taxCode"
              rules={[{ required: true }]}
              className="mb-1"
            >
              <Input className="rounded-xl text-xs h-9" />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-slate-700">Ngành nghề</span>}
              name="industry"
              className="mb-1"
            >
              <Input className="rounded-xl text-xs h-9" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label={<span className="font-bold text-slate-700">Email</span>}
              name="email"
              className="mb-1"
            >
              <Input className="rounded-xl text-xs h-9" />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-slate-700">Số điện thoại</span>}
              name="phone"
              className="mb-1"
            >
              <Input className="rounded-xl text-xs h-9" />
            </Form.Item>
          </div>

          <Form.Item
            label={<span className="font-bold text-slate-700">Địa chỉ</span>}
            name="address"
            className="mb-1"
          >
            <Input className="rounded-xl text-xs h-9" />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-slate-700">Mô tả tóm tắt</span>}
            name="description"
            className="mb-2"
          >
            <Input.TextArea rows={3} className="rounded-xl text-xs" />
          </Form.Item>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer bg-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer border-none shadow-md shadow-blue-500/20"
            >
              Lưu thay đổi
            </button>
          </div>
        </Form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 4: THÊM GHI CHÚ NỘI BỘ */}
      {/* ========================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <StickyNote className="w-4 h-4 text-[#0062ff]" />
            <span className="font-black text-slate-900 text-sm">
              Thêm ghi chú nội bộ cho doanh nghiệp
            </span>
          </div>
        }
        open={isNoteModalOpen}
        onCancel={() => setIsNoteModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={440}
      >
        <div className="pt-2 space-y-3 text-xs">
          <Input.TextArea
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            rows={4}
            placeholder="Nhập ghi chú quan sát, lưu ý tài khoản hoặc thông tin trao đổi..."
            className="rounded-xl text-xs"
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNoteModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer bg-white"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                if (!newNoteText.trim()) {
                  message.warning("Vui lòng nhập nội dung ghi chú!");
                  return;
                }
                setCompany((prev: any) => ({
                  ...prev,
                  internalNote: {
                    author: "Admin Quản trị viên",
                    avatarLetter: "AD",
                    date: "Vừa xong",
                    content: newNoteText.trim(),
                  },
                }));
                setIsNoteModalOpen(false);
                message.success("Đã thêm ghi chú nội bộ thành công!");
              }}
              className="px-5 py-2 rounded-xl bg-[#0062ff] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer border-none shadow-md shadow-blue-500/20"
            >
              Lưu ghi chú
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function AdminCompanyDetailPage() {
  return (
    <App>
      <CompanyDetailContent />
    </App>
  );
}
