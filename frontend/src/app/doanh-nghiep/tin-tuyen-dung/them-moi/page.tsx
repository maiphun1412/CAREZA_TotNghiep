"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, Form, Input, Button, Select, DatePicker, Row, Col, Space, Divider, message } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const MOCK_BRANCHES = [
  { value: "br-1", label: "Chi nhánh Hồ Chí Minh" },
  { value: "br-2", label: "Chi nhánh Hà Nội" },
];

const MOCK_SKILLS = [
  { value: "react", label: "ReactJS" },
  { value: "nodejs", label: "Node.js" },
  { value: "python", label: "Python" },
  { value: "typescript", label: "TypeScript" },
  { value: "sql", label: "SQL Server" },
];

export default function AddJobPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      // Mock API call để tạo job tuyển dụng
      message.success("Tạo tin tuyển dụng thành công!");
      router.push("/doanh-nghiep/tin-tuyen-dung");
    } catch (error) {
      message.error("Tạo tin tuyển dụng thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 flex-1 max-w-4xl mx-auto w-full">
      {/* Quay lại */}
      <Link href="/doanh-nghiep/tin-tuyen-dung" className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors text-sm">
        <ArrowLeftOutlined className="text-xs" /> Quay lại danh sách
      </Link>

      <div>
        <h3 className="m-0 text-slate-800 font-extrabold text-xl sm:text-2xl">Tạo tin tuyển dụng mới</h3>
        <span className="text-xs text-slate-500 block mt-1">Cung cấp đầy đủ thông tin để tìm kiếm ứng viên phù hợp nhanh nhất</span>
      </div>

      <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
        <div className="space-y-6">
          {/* Card 1: Thông tin chung */}
          <Card title="Thông tin vị trí tuyển dụng" className="border-slate-100 shadow-sm" style={{ borderRadius: 12 }}>
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item label="Tiêu đề tin tuyển dụng" name="title" rules={[{ required: true, message: "Nhập tiêu đề!" }]}>
                  <Input placeholder="Ví dụ: Senior Fullstack Engineer (React / NestJS)" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="Chi nhánh làm việc" name="branchId" rules={[{ required: true, message: "Chọn chi nhánh!" }]}>
                  <Select placeholder="Chọn chi nhánh làm việc" options={MOCK_BRANCHES} size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Số lượng tuyển dụng" name="vacancyCount" rules={[{ required: true, message: "Nhập số lượng tuyển!" }]}>
                  <Input type="number" placeholder="Ví dụ: 3" min={1} size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={12} sm={8}>
                <Form.Item label="Hình thức làm việc" name="employmentType" rules={[{ required: true, message: "Chọn hình thức!" }]}>
                  <Select
                    placeholder="Chọn hình thức"
                    options={[
                      { value: "Full-time", label: "Toàn thời gian (Full-time)" },
                      { value: "Part-time", label: "Bán thời gian (Part-time)" },
                      { value: "Contract", label: "Hợp đồng dự án" },
                    ]}
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={12} sm={8}>
                <Form.Item label="Chế độ làm việc" name="workMode" rules={[{ required: true, message: "Chọn chế độ!" }]}>
                  <Select
                    placeholder="Chọn chế độ"
                    options={[
                      { value: "Onsite", label: "Làm tại văn phòng (Onsite)" },
                      { value: "Hybrid", label: "Làm việc linh hoạt (Hybrid)" },
                      { value: "Remote", label: "Làm việc từ xa (Remote)" },
                    ]}
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item label="Kinh nghiệm tối thiểu (năm)" name="experienceMin" rules={[{ required: true, message: "Nhập kinh nghiệm tối thiểu!" }]}>
                  <Input type="number" placeholder="Ví dụ: 2" min={0} size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={12} sm={12}>
                <Form.Item label="Lương tối thiểu (VNĐ)" name="salaryMin">
                  <Input type="number" placeholder="Không nhập nếu thỏa thuận" size="large" />
                </Form.Item>
              </Col>
              <Col xs={12} sm={12}>
                <Form.Item label="Lương tối đa (VNĐ)" name="salaryMax">
                  <Input type="number" placeholder="Không nhập nếu thỏa thuận" size="large" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Card 2: Nội dung mô tả */}
          <Card title="Chi tiết công việc & Đãi ngộ" className="border-slate-100 shadow-sm" style={{ borderRadius: 12 }}>
            <Form.Item label="Mô tả công việc" name="description" rules={[{ required: true, message: "Nhập mô tả!" }]}>
              <TextArea rows={6} placeholder="Mô tả các nhiệm vụ chính, trách nhiệm của vị trí công việc..." />
            </Form.Item>

            <Form.Item label="Yêu cầu ứng viên" name="requirements" rules={[{ required: true, message: "Nhập yêu cầu!" }]}>
              <TextArea rows={5} placeholder="Các kỹ năng, kinh nghiệm chuyên môn, chứng chỉ cần thiết..." />
            </Form.Item>

            <Form.Item label="Quyền lợi ứng viên" name="benefits" rules={[{ required: true, message: "Nhập quyền lợi!" }]}>
              <TextArea rows={5} placeholder="Chế độ lương thưởng, bảo hiểm, văn hóa làm việc, phúc lợi doanh nghiệp..." />
            </Form.Item>
          </Card>

          {/* Card 3: Skills & Deadline */}
          <Card title="Kỹ năng & Hạn nộp" className="border-slate-100 shadow-sm" style={{ borderRadius: 12 }}>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="Kỹ năng yêu cầu" name="skills">
                  <Select mode="multiple" placeholder="Chọn các kỹ năng yêu cầu" options={MOCK_SKILLS} size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Hạn nộp hồ sơ" name="expiredAt" rules={[{ required: true, message: "Chọn hạn nộp!" }]}>
                  <DatePicker className="w-full" format="DD/MM/YYYY" size="large" placeholder="Chọn ngày" />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </div>

        <div className="mt-8 text-right">
          <Space>
            <Link href="/doanh-nghiep/tin-tuyen-dung">
              <Button size="large">Hủy bỏ</Button>
            </Link>
            <Button type="primary" htmlType="submit" size="large" icon={<SaveOutlined />} loading={submitting} className="bg-blue-600 hover:bg-blue-700 font-semibold px-6">
              Đăng tin tuyển dụng
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
}
