"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, Button, Tag, Space, Modal, Input, message, Spin, Empty, Alert } from "antd";
import {
  SafetyCertificateOutlined,
  DollarOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { candidateService } from "@/services/candidate.service";

const { TextArea } = Input;

export default function CandidateOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [activeOffer, setActiveOffer] = useState<any>(null);
  const [responseAction, setResponseAction] = useState<"ACCEPTED" | "DECLINED">("ACCEPTED");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await candidateService.getOffers();
      const list = res?.data?.offers || [];
      setOffers(list);
    } catch {
      setError("Không thể tải danh sách thư mời nhận việc. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleOpenModal = (offer: any, action: "ACCEPTED" | "DECLINED") => {
    setActiveOffer(offer);
    setResponseAction(action);
    setNote("");
    setIsRespondModalOpen(true);
  };

  const handleConfirmResponse = async () => {
    if (!activeOffer) return;
    if (responseAction === "DECLINED" && !note.trim()) {
      message.warning("Vui lòng cung cấp lý do từ chối để nhà tuyển dụng được biết.");
      return;
    }

    setSubmitting(true);
    try {
      if (responseAction === "ACCEPTED") {
        await candidateService.acceptOffer(activeOffer.id, note.trim() || undefined);
        message.success("Chúc mừng bạn đã đồng ý nhận việc thành công! Nhà tuyển dụng đã được thông báo.");
      } else {
        await candidateService.declineOffer(activeOffer.id, note.trim());
        message.info("Bạn đã từ chối lời mời nhận việc.");
      }
      setIsRespondModalOpen(false);
      await fetchOffers();
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Thao tác thất bại. Vui lòng kiểm tra lại.";
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatSalary = (salary: number | string | null | undefined) => {
    if (!salary) return "Thỏa thuận";
    const num = Number(salary);
    if (isNaN(num)) return String(salary);
    return `${num.toLocaleString("vi-VN")} VNĐ`;
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "Chưa xác định";
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN");
    } catch {
      return dateStr;
    }
  };

  const renderStatusTag = (status: string) => {
    const s = String(status || "").toLowerCase();
    switch (s) {
      case "accepted":
        return <Tag color="green" icon={<CheckCircleOutlined />} className="rounded-md font-bold px-2.5 py-0.5">Đã chấp nhận</Tag>;
      case "rejected":
        return <Tag color="red" icon={<CloseCircleOutlined />} className="rounded-md font-bold px-2.5 py-0.5">Đã từ chối</Tag>;
      case "expired":
        return <Tag color="default" icon={<ClockCircleOutlined />} className="rounded-md font-bold px-2.5 py-0.5">Đã hết hạn</Tag>;
      case "cancelled":
        return <Tag color="default" className="rounded-md font-bold px-2.5 py-0.5">Đã thu hồi</Tag>;
      case "sent":
      default:
        return <Tag color="orange" icon={<ClockCircleOutlined />} className="rounded-md font-bold px-2.5 py-0.5">Đang chờ phản hồi</Tag>;
    }
  };

  return (
    <div className="space-y-6 flex-1 max-w-5xl mx-auto">
      <div>
        <h3 className="m-0 text-slate-800 font-extrabold text-xl sm:text-2xl">Thư mời nhận việc (Offer)</h3>
        <span className="text-xs text-slate-500 block mt-1">
          Xem xét điều khoản, mức đãi ngộ và đưa ra phản hồi chính thức cho nhà tuyển dụng
        </span>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          showIcon
          action={<Button size="small" type="primary" onClick={fetchOffers}>Thử lại</Button>}
        />
      )}

      {loading ? (
        <div className="py-20 text-center">
          <Spin size="large" tip="Đang tải danh sách thư mời nhận việc..." />
        </div>
      ) : offers.length === 0 ? (
        <Card className="border-slate-100 shadow-sm rounded-2xl py-12 text-center">
          <Empty
            description={
              <div className="space-y-1">
                <p className="font-bold text-slate-700 text-sm m-0">Hiện tại bạn chưa có thư mời nhận việc nào</p>
                <p className="text-xs text-slate-400 m-0">Khi vượt qua vòng phỏng vấn, lời mời nhận việc từ doanh nghiệp sẽ xuất hiện tại đây.</p>
              </div>
            }
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {offers.map((item) => {
            const isPending = String(item.status || "").toLowerCase() === "sent";
            const deadlinePassed = item.deadline && new Date(item.deadline).getTime() < Date.now();

            return (
              <Card
                key={item.id}
                title={
                  <Space className="py-1">
                    <SafetyCertificateOutlined className="text-blue-600 text-xl" />
                    <div>
                      <span className="font-bold text-slate-900 text-base block">
                        {item.position || item.job_title || "Vị trí tuyển dụng"}
                      </span>
                      <span className="text-xs text-blue-600 font-semibold block">
                        {item.company_name || "Nhà tuyển dụng CAREZA"}
                      </span>
                    </div>
                  </Space>
                }
                extra={renderStatusTag(item.status)}
                className="border-slate-200/80 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  {/* Grid thông tin chính */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-start gap-2.5 text-xs">
                      <DollarOutlined className="text-emerald-500 mt-1 text-base" />
                      <div>
                        <span className="text-slate-400 block font-medium">Mức lương đề xuất</span>
                        <span className="font-bold text-emerald-700 text-sm">{formatSalary(item.salary)}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs">
                      <CalendarOutlined className="text-blue-500 mt-1 text-base" />
                      <div>
                        <span className="text-slate-400 block font-medium">Ngày bắt đầu dự kiến</span>
                        <span className="font-bold text-slate-800 text-sm">{formatDate(item.start_date)}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs">
                      <ClockCircleOutlined className="text-amber-500 mt-1 text-base" />
                      <div>
                        <span className="text-slate-400 block font-medium">Hạn chót phản hồi</span>
                        <span className="font-bold text-amber-700 text-sm">{formatDate(item.deadline)}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 text-xs">
                      <FileTextOutlined className="text-purple-500 mt-1 text-base" />
                      <div>
                        <span className="text-slate-400 block font-medium">Loại hợp đồng</span>
                        <span className="font-bold text-slate-800 text-sm">{item.contract_type || "Chính thức"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Địa điểm làm việc */}
                  {item.work_location && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
                      <HomeOutlined className="text-slate-400 text-sm" />
                      <span className="font-semibold text-slate-700">Địa điểm làm việc:</span>
                      <span>{item.work_location}</span>
                    </div>
                  )}

                  {/* Điều khoản & Phúc lợi */}
                  {item.terms && (
                    <div className="space-y-1">
                      <span className="block font-bold text-slate-700 text-xs">Chế độ đãi ngộ & Điều khoản:</span>
                      <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-100 m-0">
                        {item.terms}
                      </p>
                    </div>
                  )}

                  {/* Lời nhắn từ nhà tuyển dụng */}
                  {item.notes && (
                    <div className="space-y-1">
                      <span className="block font-bold text-slate-700 text-xs">Lời nhắn từ nhà tuyển dụng:</span>
                      <p className="text-slate-700 text-xs leading-relaxed italic bg-blue-50/60 p-3 rounded-xl border border-blue-100 m-0">
                        &quot;{item.notes}&quot;
                      </p>
                    </div>
                  )}

                  {/* Cảnh báo hạn phản hồi */}
                  {isPending && deadlinePassed && (
                    <Alert
                      type="warning"
                      showIcon
                      icon={<ExclamationCircleOutlined />}
                      message="Thư mời này đã quá thời hạn phản hồi đề xuất ban đầu."
                    />
                  )}

                  {/* Actions */}
                  {isPending && (
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                      <Button
                        danger
                        onClick={() => handleOpenModal(item, "DECLINED")}
                        className="h-10 font-bold text-xs rounded-xl px-4 cursor-pointer"
                      >
                        Từ chối lời mời
                      </Button>
                      <Button
                        type="primary"
                        onClick={() => handleOpenModal(item, "ACCEPTED")}
                        className="bg-emerald-600 hover:bg-emerald-700 h-10 font-bold text-xs rounded-xl px-5 border-none cursor-pointer"
                      >
                        Đồng ý nhận việc
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Phản hồi Offer */}
      <Modal
        title={responseAction === "ACCEPTED" ? "Xác nhận chấp nhận thư mời nhận việc" : "Xác nhận từ chối thư mời nhận việc"}
        open={isRespondModalOpen}
        onCancel={() => setIsRespondModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsRespondModalOpen(false)}>Hủy</Button>,
          <Button
            key="submit"
            type="primary"
            danger={responseAction === "DECLINED"}
            className={responseAction === "ACCEPTED" ? "bg-emerald-600 hover:bg-emerald-700 border-none" : "bg-red-600 hover:bg-red-700"}
            onClick={handleConfirmResponse}
            loading={submitting}
          >
            {responseAction === "ACCEPTED" ? "Xác nhận đồng ý" : "Xác nhận từ chối"}
          </Button>,
        ]}
        width={480}
        centered
      >
        <div className="space-y-4 pt-3 text-xs">
          <p className="text-slate-600 leading-relaxed m-0">
            {responseAction === "ACCEPTED"
              ? "Bạn đang chính thức chấp nhận lời mời làm việc từ nhà tuyển dụng. CAREZA sẽ cập nhật trạng thái tuyển dụng và gửi thông báo trực tiếp đến nhà tuyển dụng."
              : "Vui lòng cho biết lý do bạn từ chối lời mời để nhà tuyển dụng nắm bắt thông tin và có thể điều chỉnh cơ hội phù hợp hơn trong tương lai."}
          </p>

          <div>
            <label className="block font-bold mb-1.5 text-slate-700">
              {responseAction === "DECLINED" ? "Lý do từ chối (Bắt buộc) *" : "Ghi chú gửi nhà tuyển dụng (Không bắt buộc)"}
            </label>
            <TextArea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={responseAction === "DECLINED" ? "Ví dụ: Đã nhận được offer khác phù hợp hơn, mức đãi ngộ chưa như kỳ vọng..." : "Ví dụ: Rất vinh hạnh được làm việc cùng quý công ty..."}
              maxLength={500}
              showCount
              className="rounded-xl text-xs"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

