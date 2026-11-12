"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Tag,
  Alert,
  Spin,
  Space,
  Typography,
  Descriptions,
  message,
  Divider,
} from "antd";
import {
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { employerService } from "@/services/employer.service";

const { Title, Paragraph, Text } = Typography;

export default function EmployerVerificationPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchVerification = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await employerService.getVerification();
      setVerificationData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Không thể tải thông tin xác minh doanh nghiệp.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVerification();
  }, [fetchVerification]);

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      await employerService.requestVerification({
        legal_name: values.legal_name,
        tax_code: values.tax_code,
        document_url: values.document_url || "",
      });
      message.success("Yêu cầu xác minh đã được gửi thành công. Vui lòng chờ quản trị viên phê duyệt.");
      form.resetFields();
      fetchVerification();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.tax_code?.[0] || "Gửi yêu cầu thất bại.";
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Tag icon={<CheckCircleOutlined />} color="success" className="px-3 py-1 text-sm font-semibold">Đã xác minh</Tag>;
      case "pending":
        return <Tag icon={<ClockCircleOutlined />} color="warning" className="px-3 py-1 text-sm font-semibold">Đang chờ xét duyệt</Tag>;
      case "rejected":
        return <Tag icon={<CloseCircleOutlined />} color="error" className="px-3 py-1 text-sm font-semibold">Bị từ chối</Tag>;
      default:
        return <Tag color="default" className="px-3 py-1 text-sm font-semibold">Chưa xác minh</Tag>;
    }
  };

  const vStatus = verificationData?.verification_status || "unverified";
  const latestReq = verificationData?.latest_request;

  return (
    <div className="space-y-6 max-w-4xl mx-auto flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Title level={3} className="!m-0 text-slate-800 font-extrabold flex items-center gap-2">
            <SafetyCertificateOutlined className="text-blue-600" /> Xác minh doanh nghiệp
          </Title>
          <Paragraph className="!mb-0 text-slate-500 text-xs sm:text-sm mt-1">
            Xác minh tư cách pháp nhân giúp tăng độ tin cậy của doanh nghiệp và mở khóa đầy đủ tính năng tuyển dụng.
          </Paragraph>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(vStatus)}
        </div>
      </div>

      {error && (
        <Alert
          type="error"
          message="Lỗi tải dữ liệu"
          description={error}
          action={
            <Button size="small" danger icon={<ReloadOutlined />} onClick={fetchVerification}>
              Tải lại
            </Button>
          }
          showIcon
        />
      )}

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Spin tip="Đang tải thông tin xác minh..." />
        </div>
      ) : (
        <>
          {vStatus === "verified" ? (
            <Card className="border-emerald-200 bg-emerald-50/50 shadow-sm rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircleOutlined className="text-emerald-600 text-2xl" />
                </div>
                <div>
                  <h4 className="text-emerald-900 font-bold text-base m-0">Doanh nghiệp đã được xác minh chính thức</h4>
                  <p className="text-emerald-700 text-xs sm:text-sm mt-1 mb-3">
                    Hồ sơ pháp lý của công ty đã được kiểm duyệt bởi quản trị viên CAREZA. Biểu tượng tích xanh xác minh sẽ hiển thị cạnh tên công ty trên tất cả các tin tuyển dụng.
                  </p>
                  {latestReq && (
                    <Descriptions size="small" column={{ xs: 1, sm: 2 }} className="bg-white p-4 rounded-lg border border-emerald-100">
                      <Descriptions.Item label="Tên pháp lý">{latestReq.legal_name || "—"}</Descriptions.Item>
                      <Descriptions.Item label="Mã số thuế">{latestReq.tax_code || "—"}</Descriptions.Item>
                      <Descriptions.Item label="Ngày gửi">{latestReq.created_at ? new Date(latestReq.created_at).toLocaleString("vi-VN") : "—"}</Descriptions.Item>
                      <Descriptions.Item label="Ngày duyệt">{latestReq.reviewed_at ? new Date(latestReq.reviewed_at).toLocaleString("vi-VN") : "—"}</Descriptions.Item>
                    </Descriptions>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card title="Gửi yêu cầu xác minh" className="border-slate-100 shadow-sm rounded-xl">
                  {vStatus === "pending" && (
                    <Alert
                      type="info"
                      showIcon
                      className="mb-6"
                      message="Yêu cầu đang chờ xét duyệt"
                      description="Hồ sơ xác minh của bạn đang được ban quản trị xét duyệt. Quá trình này thường diễn ra trong vòng 24 giờ làm việc."
                    />
                  )}

                  {vStatus === "rejected" && latestReq?.notes && (
                    <Alert
                      type="error"
                      showIcon
                      className="mb-6"
                      message="Yêu cầu trước đó đã bị từ chối"
                      description={`Lý do: ${latestReq.notes}. Vui lòng kiểm tra lại thông tin và gửi lại.`}
                    />
                  )}

                  <Form
                    layout="vertical"
                    form={form}
                    onFinish={handleSubmit}
                    requiredMark={false}
                    disabled={vStatus === "pending"}
                  >
                    <Form.Item
                      label="Tên pháp lý doanh nghiệp (theo GPKD)"
                      name="legal_name"
                      rules={[{ required: true, message: "Vui lòng nhập tên pháp lý theo giấy phép ĐKKD" }]}
                    >
                      <Input placeholder="Ví dụ: CÔNG TY TNHH GOOGLE VIỆT NAM" size="large" />
                    </Form.Item>

                    <Form.Item
                      label="Mã số thuế doanh nghiệp (Tax Code)"
                      name="tax_code"
                      rules={[{ required: true, message: "Vui lòng nhập mã số thuế doanh nghiệp" }]}
                    >
                      <Input placeholder="Ví dụ: 0101234567" size="large" />
                    </Form.Item>

                    <Form.Item
                      label="Đường dẫn tài liệu chứng minh (GPKD / Giấy phép thành lập)"
                      name="document_url"
                      extra="Dán liên kết tài liệu PDF hoặc hình ảnh GPKD (Google Drive, Dropbox, Cloudinary...)"
                    >
                      <Input placeholder="https://..." size="large" />
                    </Form.Item>

                    <Form.Item className="mb-0 text-right">
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SendOutlined />}
                        loading={submitting}
                        disabled={vStatus === "pending"}
                        className="bg-blue-600 hover:bg-blue-700 h-10 font-semibold text-xs rounded-lg px-6"
                      >
                        {vStatus === "pending" ? "Đang chờ duyệt" : "Gửi yêu cầu xác minh"}
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </div>

              <div>
                <Card title="Quyền lợi xác minh" className="border-slate-100 shadow-sm rounded-xl">
                  <ul className="space-y-3 text-xs sm:text-sm text-slate-600 pl-4 list-disc">
                    <li>Huy hiệu tích xanh chính thức trên hồ sơ công ty và tin tuyển dụng.</li>
                    <li>Ưu tiên hiển thị trên kết quả tìm kiếm việc làm hàng đầu.</li>
                    <li>Gia tăng 3.5x lượng hồ sơ ứng tuyển từ các ứng viên chất lượng cao.</li>
                    <li>Được bảo vệ quyền sở hữu thương hiệu và tên gọi trên hệ thống CAREZA.</li>
                  </ul>
                  <Divider className="my-4" />
                  <div className="text-xs text-slate-400">
                    Mọi thắc mắc vui lòng liên hệ bộ phận hỗ trợ doanh nghiệp qua hotline hoặc email CSKH.
                  </div>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
