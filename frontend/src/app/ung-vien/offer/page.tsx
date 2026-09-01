"use client";

import { useState } from "react";
import { Card, Button, List, Tag, Space, Modal, Input, message } from "antd";
import { SafetyCertificateOutlined, DollarOutlined, CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const MOCK_OFFERS = [
  {
    key: "off-1",
    jobTitle: "Senior Fullstack Engineer (React / NestJS)",
    companyName: "VNG Corporation",
    salary: "45,000,000 VND",
    startDate: "01/09/2026",
    status: "PENDING", // PENDING, ACCEPTED, DECLINED
    benefits: "- Thử việc 100% lương.\n- Thưởng hiệu quả quý & năm.\n- Bảo hiểm sức khỏe PVI cao cấp.",
    note: "VNG rất ấn tượng với năng lực của bạn trong các vòng kiểm tra vừa qua. Rất mong được chào đón bạn gia nhập đại gia đình VNG!",
  },
];

export default function CandidateOffersPage() {
  const [offers, setOffers] = useState(MOCK_OFFERS);
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [activeOffer, setActiveOffer] = useState<any>(null);
  const [responseAction, setResponseAction] = useState<"ACCEPTED" | "DECLINED">("ACCEPTED");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleOpenModal = (offer: any, action: "ACCEPTED" | "DECLINED") => {
    setActiveOffer(offer);
    setResponseAction(action);
    setNote("");
    setIsRespondModalOpen(true);
  };

  const handleConfirmResponse = async () => {
    setSubmitting(true);
    try {
      setOffers(
        offers.map((item) =>
          item.key === activeOffer.key ? { ...item, status: responseAction } : item
        )
      );
      if (responseAction === "ACCEPTED") {
        message.success("Chúc mừng bạn đã đồng ý nhận việc thành công!");
      } else {
        message.warning("Đã từ chối lời mời nhận việc.");
      }
      setIsRespondModalOpen(false);
    } catch (error) {
      message.error("Thao tác thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 flex-1">
      <div>
        <h3 className="m-0 text-slate-800 font-extrabold text-xl sm:text-2xl">Thư mời nhận việc</h3>
        <span className="text-xs text-slate-500 block mt-1">Xem, cân nhắc và phản hồi lời mời nhận việc từ các doanh nghiệp</span>
      </div>

      <div className="space-y-6">
        {offers.length === 0 ? (
          <Card className="border-slate-100 shadow-sm rounded-xl py-10 text-center">
            Bạn chưa có thư mời nhận việc nào.
          </Card>
        ) : (
          offers.map((item) => (
            <Card
              key={item.key}
              title={
                <Space>
                  <SafetyCertificateOutlined className="text-blue-500 text-lg" />
                  <span className="font-extrabold text-slate-800 text-sm sm:text-base">Thư mời nhận việc: {item.jobTitle}</span>
                </Space>
              }
              extra={
                item.status === "ACCEPTED" ? (
                  <Tag color="green" icon={<CheckCircleOutlined />} className="rounded-md">Đã chấp nhận</Tag>
                ) : item.status === "DECLINED" ? (
                  <Tag color="red" icon={<CloseCircleOutlined />} className="rounded-md">Đã từ chối</Tag>
                ) : (
                  <Tag color="orange" className="rounded-md">Đang chờ phản hồi</Tag>
                )
              }
              className="border-slate-100 shadow-sm"
              style={{ borderRadius: 12 }}
            >
              <div className="space-y-4">
                <div className="flex gap-2">
                  <span className="font-semibold text-slate-700 text-xs">Doanh nghiệp mời:</span>
                  <span className="text-blue-600 font-semibold text-xs">{item.companyName}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-start gap-2 text-xs">
                    <DollarOutlined className="text-slate-400 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block">Mức lương đề xuất</span>
                      <span className="font-bold text-slate-800 text-sm">{item.salary}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs">
                    <CalendarOutlined className="text-slate-400 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block">Ngày bắt đầu dự kiến</span>
                      <span className="font-bold text-slate-800 text-sm">{item.startDate}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block font-semibold text-slate-700 text-xs">Chế độ đãi ngộ & Phúc lợi:</span>
                  <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-50 m-0">
                    {item.benefits}
                  </p>
                </div>

                {item.note && (
                  <div className="space-y-1">
                    <span className="block font-semibold text-slate-700 text-xs">Lời nhắn từ nhà tuyển dụng:</span>
                    <p className="text-slate-600 text-xs leading-relaxed italic bg-blue-50/50 p-3 rounded-lg border border-blue-50 m-0">
                      {item.note}
                    </p>
                  </div>
                )}

                {item.status === "PENDING" && (
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <Button danger onClick={() => handleOpenModal(item, "DECLINED")} className="h-9 font-semibold text-xs rounded-lg">
                      Từ chối lời mời
                    </Button>
                    <Button type="primary" onClick={() => handleOpenModal(item, "ACCEPTED")} className="bg-green-600 hover:bg-green-700 h-9 font-semibold text-xs rounded-lg border-none">
                      Đồng ý nhận việc
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal Phản hồi Offer */}
      <Modal
        title={responseAction === "ACCEPTED" ? "Đồng ý nhận lời mời" : "Từ chối lời mời"}
        open={isRespondModalOpen}
        onCancel={() => setIsRespondModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsRespondModalOpen(false)}>Hủy</Button>,
          <Button
            key="submit"
            type="primary"
            danger={responseAction === "DECLINED"}
            className={responseAction === "ACCEPTED" ? "bg-green-600 hover:bg-green-700 border-none" : "bg-red-600 hover:bg-red-700"}
            onClick={handleConfirmResponse}
            loading={submitting}
          >
            Xác nhận
          </Button>,
        ]}
        width={450}
      >
        <div className="space-y-4 pt-4">
          <p className="text-slate-600 text-xs leading-relaxed">
            {responseAction === "ACCEPTED"
              ? "Bạn đang xác nhận chấp nhận lời mời làm việc này. Hệ thống sẽ tự động khởi động quy trình hội nhập (Onboarding) và thông báo cho nhà tuyển dụng."
              : "Vui lòng nhập lý do từ chối để nhà tuyển dụng cải thiện hoặc đưa ra đề xuất đãi ngộ khác tốt hơn."}
          </p>

          <div>
            <span className="block font-semibold mb-2 text-slate-700 text-xs uppercase tracking-wider">Lời nhắn gửi nhà tuyển dụng (Bắt buộc nếu từ chối)</span>
            <TextArea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập phản hồi của bạn tại đây..."
              maxLength={500}
              showCount
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
