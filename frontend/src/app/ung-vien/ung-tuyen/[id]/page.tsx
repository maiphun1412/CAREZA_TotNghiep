"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { candidateService } from "@/services/candidate.service";
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

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Mock chi tiết đơn ứng tuyển fallback
const MOCK_APP_DETAIL = {
  applicationId: "app-1",
  jobPostId: "job-1",
  jobTitle: "Senior Fullstack Engineer (React / NestJS)",
  companyName: "VNG Corporation",
  companyLogo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=80&h=80&q=80",
  location: "TP. Hồ Chí Minh",
  salaryText: "35 - 50 triệu VNĐ",
  appliedAt: new Date().toISOString(),
  currentStage: 1, // 1 = Applied, 2 = Test, 3 = Interview, 4 = Offer, 5 = Hired
  applicationStatus: 1, // 1 = Active, 2 = Withdrawn, 3 = Rejected, 4 = Hired
  coverLetter: "Kính gửi quý công ty, tôi là một nhà phát triển phần mềm với hơn 4 năm kinh nghiệm làm việc với React và Node.js. Tôi rất mong muốn được đóng góp năng lực và kinh nghiệm của mình để cùng VNG phát triển các sản phẩm công nghệ xuất sắc.",
  candidateName: "Nguyễn Văn A",
  candidateEmail: "nguyenvana@gmail.com",
  candidatePhone: "0987654321",
  cvName: "Nguyen_Van_A_CV_Senior_Fullstack.pdf",
  cvFileUrl: "https://example.com/cv.pdf",
  withdrawReason: null,
  withdrawnAt: null,
};

const MOCK_HISTORY = [
  {
    stageHistoryId: "hist-1",
    fromStage: null,
    toStage: 1,
    fromStatus: null,
    toStatus: 1,
    note: "Ứng viên nộp hồ sơ thành công.",
    changedAt: new Date().toISOString(),
  },
];

export default function CandidateApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const applicationId = resolvedParams.id;

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
      
      setApplication(appResponse.data.application);
      setHistory(histResponse.data.histories || []);
    } catch (error) {
      // Fallback
      setApplication(MOCK_APP_DETAIL);
      setHistory(MOCK_HISTORY);
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
        <Spin size="large" description="Đang tải chi tiết hồ sơ ứng tuyển..." />
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

  const getStatusAlert = () => {
    if (application.applicationStatus === 2) {
      return (
        <Alert
          title="Hồ sơ ứng tuyển đã được rút"
          description={
            <div className="space-y-1 mt-1 text-xs">
              <div><Text strong>Lý do:</Text> {application.withdrawReason || "Không có lý do"}</div>
              {application.withdrawnAt && (
                <div>
                  <Text strong>Thời gian rút đơn:</Text> {new Date(application.withdrawnAt).toLocaleString("vi-VN")}
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
    if (application.applicationStatus === 3) {
      return (
        <Alert
          title="Hồ sơ ứng tuyển không được chấp nhận"
          description="Nhà tuyển dụng đã xem xét hồ sơ và quyết định không tiếp tục vòng tiếp theo. Chúc bạn may mắn ở các cơ hội khác."
          type="error"
          showIcon
          className="rounded-xl"
        />
      );
    }
    if (application.applicationStatus === 4) {
      return (
        <Alert
          title="Chúc mừng! Bạn đã được nhận việc"
          description="Nhà tuyển dụng đã xác nhận bạn vượt qua tất cả các vòng và nhận việc thành công. Hãy chuẩn bị hành trình hội nhập sắp tới!"
          type="success"
          showIcon
          className="rounded-xl"
        />
      );
    }
    return null;
  };

  // Các bước trong quy trình ứng tuyển
  const stepsItems = [
    { title: "Nộp hồ sơ", description: "Hồ sơ ứng tuyển thành công" },
    { title: "Bài test", description: "Đánh giá năng lực chuyên môn" },
    { title: "Phỏng vấn", description: "Trao đổi cùng nhà tuyển dụng" },
    { title: "Đề nghị nhận việc", description: "Thư mời nhận việc (Offer)" },
    { title: "Hội nhập", description: "Onboarding gia nhập công ty" },
  ];

  // Tính index bước hiện tại của Steps (0-indexed)
  // currentStage: 1 = Applied, 2 = Test, 3 = Interview, 4 = Offer, 5 = Onboarding
  const currentStepIndex = application.applicationStatus === 1 ? application.currentStage - 1 : -1;

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
            <img src={companyLogoFallback(application.companyLogo)} alt={application.companyName} className="w-16 h-16 rounded-xl border border-slate-100 object-cover" />
            <div className="min-w-0">
              <Title level={4} className="m-0 text-slate-800 font-extrabold truncate text-lg sm:text-xl">{application.jobTitle}</Title>
              <span className="text-sm text-blue-600 font-semibold block mt-1">{application.companyName}</span>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
                <span><EnvironmentOutlined /> {application.location}</span>
                <span><DollarOutlined /> {application.salaryText}</span>
                <span><CalendarOutlined /> Ngày nộp: {new Date(application.appliedAt).toLocaleDateString("vi-VN")}</span>
              </div>
            </div>
          </div>
          
          {application.applicationStatus === 1 && (
            <Button danger type="dashed" onClick={() => setIsWithdrawModalOpen(true)} className="h-9 font-semibold text-xs rounded-lg w-full sm:w-auto">
              Rút đơn ứng tuyển
            </Button>
          )}
        </div>
      </Card>

      {/* Cảnh báo trạng thái đặc biệt */}
      {getStatusAlert()}

      <Row gutter={[24, 24]}>
        {/* Cột trái: Timeline */}
        <Col xs={24} lg={16} className="space-y-6">
          <Card title="Tiến trình tuyển dụng" className="border-slate-100 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="py-4 overflow-x-auto">
              <Steps
                current={currentStepIndex}
                items={stepsItems}
                status={application.applicationStatus === 3 ? "error" : "process"}
                className="custom-steps"
              />
            </div>
            
            {/* Lịch sử hoạt động chi tiết */}
            <Divider />
            <Title level={5} className="text-slate-800 font-bold mb-4">Lịch sử tương tác</Title>
            <List
              dataSource={history}
              renderItem={(item: any) => (
                <div className="py-3 flex justify-between items-start border-b border-slate-50 last:border-b-0 text-xs sm:text-sm">
                  <div className="space-y-1 flex-1">
                    <span className="font-semibold text-slate-700 block">{item.note}</span>
                    <Text type="secondary" className="text-[11px] block">{new Date(item.changedAt).toLocaleString("vi-VN")}</Text>
                  </div>
                </div>
              )}
            />
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
                  <Text strong className="text-slate-700">{application.candidateName}</Text>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                <MailOutlined className="text-slate-400 mt-1" />
                <div>
                  <Text type="secondary" className="text-[10px] block">Email liên hệ</Text>
                  <Text strong className="text-slate-700">{application.candidateEmail}</Text>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                <PhoneOutlined className="text-slate-400 mt-1" />
                <div>
                  <Text type="secondary" className="text-[10px] block">Số điện thoại</Text>
                  <Text strong className="text-slate-700">{application.candidatePhone}</Text>
                </div>
              </div>

              <Divider className="my-2" />

              <div className="space-y-2">
                <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">CV đã nộp</span>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FilePdfOutlined className="text-red-500 text-lg" />
                    <span className="text-xs text-slate-700 truncate font-medium">{application.cvName}</span>
                  </div>
                  <Link href={application.cvFileUrl} target="_blank" className="text-xs text-blue-600 hover:underline shrink-0">
                    Xem file
                  </Link>
                </div>
              </div>

              {application.coverLetter && (
                <>
                  <Divider className="my-2" />
                  <div className="space-y-1">
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Thư giới thiệu đã gửi</span>
                    <p className="text-slate-600 text-xs leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-50 whitespace-pre-line m-0">
                      {application.coverLetter}
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
