"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { candidateService } from "@/services/candidate.service";
import { useAuthStore } from "@/store/auth-store";
import { Card, Steps, Tag, Button, Modal, Input, Typography, Row, Col, Space, Divider, Alert, Spin, message, List } from "antd";
import {
  LeftOutlined,
  CompassOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  FilePdfOutlined,
  ExclamationCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function CandidateApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const applicationId = resolvedParams.id;
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchApplicationDetails = async () => {
    setLoading(true);
    try {
      const appResponse = await candidateService.getApplicationById(applicationId);
      const histResponse = await candidateService.getApplicationHistory(applicationId);

      setApplication(appResponse?.data?.application || null);
      setHistory(histResponse?.data?.histories || []);
    } catch (error) {
      setApplication(null);
      setHistory([]);
      message.error("Không thể tải chi tiết hồ sơ ứng tuyển.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetails();
  }, [applicationId]);

  const handleWithdraw = async () => {
    if (!withdrawReason.trim()) {
      message.error("Vui lòng nhập lý do rút hồ sơ!");
      return;
    }

    setWithdrawing(true);
    try {
      await candidateService.withdrawApplication(applicationId, withdrawReason);
      message.success("Đã rút hồ sơ ứng tuyển thành công.");
      setIsWithdrawModalOpen(false);
      fetchApplicationDetails();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Rút hồ sơ thất bại.");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40 flex-1">
        <Spin size="large" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-20">
        <ExclamationCircleOutlined className="text-red-500 text-5xl mb-4" />
        <Title level={3}>Không tìm thấy hồ sơ ứng tuyển</Title>
        <Link href="/ung-vien/ung-tuyen">
          <Button type="primary">Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  // Chuẩn hóa dữ liệu tương thích API
  const jobTitle = application.job?.title || application.jobTitle || "Vị trí tuyển dụng";
  const companyName = application.job?.company_name || application.companyName || "Doanh nghiệp tuyển dụng";
  const companyLogo = application.job?.logo_url || application.companyLogo || null;
  const appliedDate = application.applied_at || application.appliedAt;
  const cvTitle = application.cv?.title || application.cvName || "CV_Ung_Vien.pdf";
  const cvFileUrl = application.cv?.file_url || application.cvFileUrl;
  const coverLetter = application.cover_letter || application.coverLetter;
  const appStatus = String(application.status || application.applicationStatus || "submitted").toLowerCase();

  const candidateName = user?.fullName || application.candidateName || "Ứng viên";
  const candidateEmail = user?.email || application.candidateEmail || "";
  const candidatePhone = user?.phoneNumber || (user as any)?.phone || application.candidatePhone || "";

  const getStatusAlert = () => {
    if (appStatus === "withdrawn" || appStatus === "2") {
      return (
        <Alert
          title="Hồ sơ ứng tuyển đã được rút"
          description={
            <div className="space-y-1 mt-1 text-xs">
              <div><Text strong>Trạng thái:</Text> Ứng viên đã chủ động rút đơn ứng tuyển.</div>
              {application.withdrawn_at && (
                <div>
                  <Text strong>Thời gian rút đơn:</Text> {new Date(application.withdrawn_at).toLocaleString("vi-VN")}
                </div>
              )}
            </div>
          }
          type="info"
          showIcon
          className="rounded-xl"
        />
      );
    }
    if (appStatus === "rejected" || appStatus === "3") {
      return (
        <Alert
          title="Hồ sơ ứng tuyển chưa phù hợp"
          description="Nhà tuyển dụng đã xem xét hồ sơ và quyết định chưa tiếp tục ở đợt này. Chúc bạn thành công ở các cơ hội phù hợp tiếp theo!"
          type="error"
          showIcon
          className="rounded-xl"
        />
      );
    }
    if (appStatus === "hired" || appStatus === "accepted" || appStatus === "4") {
      return (
        <Alert
          title="Chúc mừng! Bạn đã trúng tuyển nhận việc"
          description="Nhà tuyển dụng đã xác nhận bạn vượt qua các vòng tuyển dụng và chính thức tiếp nhận. Doanh nghiệp sẽ sớm liên hệ hướng dẫn các bước tiếp theo."
          type="success"
          showIcon
          className="rounded-xl"
        />
      );
    }
    if (appStatus === "offered" || appStatus === "offer") {
      return (
        <Alert
          title="Bạn đã nhận được Đề nghị nhận việc (Offer)"
          description="Doanh nghiệp đã gửi thư mời nhận việc. Vui lòng kiểm tra email hoặc mục Offer để xác nhận phản hồi."
          type="warning"
          showIcon
          className="rounded-xl"
        />
      );
    }
    if (appStatus === "interview") {
      return (
        <Alert
          title="Hồ sơ được mời vào vòng Phỏng vấn"
          description="Nhà tuyển dụng đã đánh giá cao hồ sơ và chuyển sang vòng phỏng vấn. Vui lòng theo dõi lịch phỏng vấn và giữ liên lạc qua email/điện thoại."
          type="info"
          showIcon
          className="rounded-xl"
        />
      );
    }
    return null;
  };

  // Các bước trong quy trình tuyển dụng chuẩn Careza
  const stepsItems = [
    { title: "Nộp hồ sơ", description: "Đã nộp thành công" },
    { title: "Sàng lọc", description: "Đánh giá hồ sơ" },
    { title: "Bài test / Khảo sát", description: "Đánh giá chuyên môn" },
    { title: "Phỏng vấn", description: "Trao đổi với doanh nghiệp" },
    { title: "Đề nghị (Offer)", description: "Thư mời nhận việc" },
    { title: "Trúng tuyển", description: "Tiếp nhận nhân sự" },
  ];

  // Tính index bước hiện tại của Steps (0-indexed)
  let currentStepIndex = 0;
  if (appStatus === "submitted" || appStatus === "new") currentStepIndex = 0;
  else if (appStatus === "screening" || appStatus === "reviewing") currentStepIndex = 1;
  else if (appStatus === "shortlisted" || appStatus === "test" || appStatus === "matched") currentStepIndex = 2;
  else if (appStatus === "interview") currentStepIndex = 3;
  else if (appStatus === "offered" || appStatus === "offer") currentStepIndex = 4;
  else if (appStatus === "hired" || appStatus === "accepted") currentStepIndex = 5;

  const canWithdraw = !["hired", "rejected", "withdrawn"].includes(appStatus);

  return (
    <div className="space-y-6 flex-1">
      {/* Quay lại */}
      <Link href="/ung-vien/ung-tuyen" className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors text-sm">
        <LeftOutlined className="text-xs" /> Quay lại danh sách hồ sơ đã nộp
      </Link>

      {/* Thông tin đầu tin & Trạng thái */}
      <Card className="border-slate-100 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <img src={companyLogoFallback(companyLogo)} alt={companyName} className="w-16 h-16 rounded-xl border border-slate-100 object-cover" />
            <div className="min-w-0">
              <Title level={4} className="m-0 text-slate-800 font-extrabold truncate text-lg sm:text-xl">{jobTitle}</Title>
              <span className="text-sm text-blue-600 font-semibold block mt-1">{companyName}</span>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
                {application.job?.id && (
                  <Link href={`/viec-lam/${application.job.id}`} className="text-blue-600 hover:underline">
                    Xem chi tiết JD tuyển dụng
                  </Link>
                )}
                <span><CalendarOutlined /> Ngày nộp: {appliedDate ? new Date(appliedDate).toLocaleDateString("vi-VN") : "Gần đây"}</span>
              </div>
            </div>
          </div>

          {canWithdraw && (
            <Button danger type="dashed" onClick={() => setIsWithdrawModalOpen(true)} className="h-9 font-semibold text-xs rounded-lg w-full sm:w-auto">
              Rút đơn ứng tuyển
            </Button>
          )}
        </div>
      </Card>

      {/* Cảnh báo trạng thái đặc biệt */}
      {getStatusAlert()}

      <Row gutter={[24, 24]}>
        {/* Cột trái: Timeline tiến trình tuyển dụng */}
        <Col xs={24} lg={16} className="space-y-6">
          <Card title="Tiến trình tuyển dụng" className="border-slate-100 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="py-4 overflow-x-auto">
              <Steps
                current={currentStepIndex}
                items={stepsItems}
                status={appStatus === "rejected" ? "error" : "process"}
                className="custom-steps"
              />
            </div>

            {/* Lịch sử hoạt động chi tiết */}
            <Divider />
            <Title level={5} className="text-slate-800 font-bold mb-4">Lịch sử xử lý từ Nhà tuyển dụng</Title>
            {history.length > 0 ? (
              <List
                dataSource={history}
                renderItem={(item: any) => (
                  <div className="py-3 flex justify-between items-start border-b border-slate-50 last:border-b-0 text-xs sm:text-sm">
                    <div className="space-y-1 flex-1">
                      <span className="font-semibold text-slate-700 block">
                        {item.note || (item.to_status ? `Chuyển trạng thái sang: ${item.to_status}` : "Cập nhật đơn")}
                      </span>
                      <Text type="secondary" className="text-[11px] block">
                        {item.created_at || item.changedAt ? new Date(item.created_at || item.changedAt).toLocaleString("vi-VN") : ""}
                      </Text>
                    </div>
                  </div>
                )}
              />
            ) : (
              <p className="text-xs text-slate-400">Chưa có bản ghi lịch sử xử lý.</p>
            )}
          </Card>
        </Col>

        {/* Cột phải: Hồ sơ đính kèm khi ứng tuyển */}
        <Col xs={24} lg={8} className="space-y-6">
          <Card title="Thông tin nộp hồ sơ" className="border-slate-100 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="space-y-4">
              <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                <UserOutlined className="text-slate-400 mt-1" />
                <div>
                  <Text type="secondary" className="text-[10px] block">Họ tên ứng viên</Text>
                  <Text strong className="text-slate-700">{candidateName}</Text>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                <MailOutlined className="text-slate-400 mt-1" />
                <div>
                  <Text type="secondary" className="text-[10px] block">Email liên hệ</Text>
                  <Text strong className="text-slate-700">{candidateEmail || "Chưa cập nhật"}</Text>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                <PhoneOutlined className="text-slate-400 mt-1" />
                <div>
                  <Text type="secondary" className="text-[10px] block">Số điện thoại</Text>
                  <Text strong className="text-slate-700">{candidatePhone || "Chưa cập nhật"}</Text>
                </div>
              </div>

              <Divider className="my-2" />

              <div className="space-y-2">
                <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">CV snapshot đã nộp</span>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FilePdfOutlined className="text-red-500 text-lg" />
                    <span className="text-xs text-slate-700 truncate font-medium">{cvTitle}</span>
                  </div>
                  {cvFileUrl ? (
                    <a href={cvFileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline shrink-0">
                      Xem file
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">Đã lưu hồ sơ</span>
                  )}
                </div>
              </div>

              {coverLetter && (
                <>
                  <Divider className="my-2" />
                  <div className="space-y-1">
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Thư giới thiệu đã gửi</span>
                    <p className="text-slate-600 text-xs leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-50 whitespace-pre-line m-0">
                      {coverLetter}
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Modal Rút đơn */}
      <Modal
        title="Rút hồ sơ ứng tuyển"
        open={isWithdrawModalOpen}
        onCancel={() => setIsWithdrawModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsWithdrawModalOpen(false)}>Hủy</Button>,
          <Button key="submit" type="primary" danger onClick={handleWithdraw} loading={withdrawing}>
            Xác nhận rút hồ sơ
          </Button>,
        ]}
        width={450}
      >
        <div className="space-y-4 pt-4">
          <Alert
            title="Cảnh báo hành động"
            description="Khi rút đơn ứng tuyển, nhà tuyển dụng sẽ không tiếp tục xem xét hồ sơ của bạn. Bạn không thể khôi phục lại đơn ứng tuyển này."
            type="warning"
            showIcon
          />
          <div>
            <span className="block font-semibold mb-2 text-slate-700 text-xs uppercase tracking-wider">Lý do rút hồ sơ (Bắt buộc)</span>
            <TextArea
              rows={3}
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
              placeholder="Vui lòng cung cấp lý do rút đơn (Ví dụ: Tôi đã tìm được công việc khác, Thay đổi định hướng...)"
              maxLength={500}
              showCount
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Fallback logo công ty
function companyLogoFallback(url: string | null): string {
  return url || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=80&h=80&q=80";
}

