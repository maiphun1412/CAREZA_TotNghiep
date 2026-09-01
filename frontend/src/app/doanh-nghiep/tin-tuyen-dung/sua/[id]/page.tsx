"use client";

import { useState, use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  message,
  Radio,
  Space,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

const MOCK_BRANCHES = [
  { value: "Hà Nội", label: "Chi nhánh Hà Nội (Tòa Keangnam Landmark)" },
  { value: "TP. Hồ Chí Minh", label: "Chi nhánh TP. Hồ Chí Minh (Quận 1)" },
  { value: "Đà Nẵng", label: "Chi nhánh Đà Nẵng (Hải Châu)" },
];

const MOCK_SKILLS = [
  { value: "Product", label: "Product" },
  { value: "Strategy", label: "Strategy" },
  { value: "Leadership", label: "Leadership" },
  { value: "Figma", label: "Figma" },
  { value: "UI/UX", label: "UI/UX" },
  { value: "Design System", label: "Design System" },
  { value: "React", label: "React" },
  { value: "TypeScript", label: "TypeScript" },
  { value: "Next.js", label: "Next.js" },
  { value: "SQL", label: "SQL" },
  { value: "Python", label: "Python" },
  { value: "Analytics", label: "Analytics" },
  { value: "DevOps", label: "DevOps" },
  { value: "AWS", label: "AWS" },
  { value: "Docker", label: "Docker" },
];

const EXISTING_JOBS: Record<string, any> = {
  "job-1": {
    title: "Product Manager",
    code: "PM-2408",
    workType: "Toàn thời gian",
    location: "Hà Nội",
    salaryText: "25 - 40 triệu VND",
    experience: "3 - 5 năm",
    skills: ["Product", "Strategy", "Leadership"],
    status: "ACTIVE",
    description: "Chịu trách nhiệm định hình chiến lược sản phẩm, quản lý roadmap phát triển các tính năng cốt lõi và làm việc chặt chẽ cùng đội ngũ Tech, Design và Business.",
    requirement: "Tối thiểu 3 năm kinh nghiệm trong vai trò Product Manager. Kỹ năng giao tiếp và lãnh đạo xuất sắc.",
    benefit: "Lương thưởng cạnh tranh, bảo hiểm sức khỏe cao cấp, môi trường làm việc Hybrid linh hoạt.",
  },
  "job-2": {
    title: "Senior UX/UI Designer",
    code: "UX-2408",
    workType: "Toàn thời gian",
    location: "TP. Hồ Chí Minh",
    salaryText: "18 - 30 triệu VND",
    experience: "2 - 4 năm",
    skills: ["Figma", "UI/UX", "Design System"],
    status: "ACTIVE",
    description: "Thiết kế trải nghiệm người dùng đẳng cấp cho các nền tảng Web và Mobile App của Careza.",
    requirement: "Thành thạo Figma, Design System, có portfolio sản phẩm thực tế.",
    benefit: "Thưởng dự án, trang bị Macbook Pro, gói khám sức khỏe quốc tế.",
  },
  "job-3": {
    title: "Frontend Developer",
    code: "FE-2407",
    workType: "Toàn thời gian",
    location: "Đà Nẵng",
    salaryText: "18 - 28 triệu VND",
    experience: "2 - 4 năm",
    skills: ["React", "TypeScript", "Next.js"],
    status: "EXPIRING",
    description: "Xây dựng giao diện người dùng hiện đại, tối ưu hóa hiệu năng ứng dụng với React 19 và Next.js.",
    requirement: "Thành thạo React, TypeScript, Next.js, TailwindCSS.",
    benefit: "Review lương 2 lần/năm, phụ cấp ăn trưa và gửi xe.",
  },
  "job-4": {
    title: "Data Analyst",
    code: "DA-2406",
    workType: "Toàn thời gian",
    location: "Hà Nội",
    salaryText: "12 - 20 triệu VND",
    experience: "1 - 3 năm",
    skills: ["SQL", "Python", "Analytics"],
    status: "EXPIRED",
    description: "Thu thập, xử lý và phân tích dữ liệu tuyển dụng nhằm đưa ra các đề xuất tối ưu hóa quy trình.",
    requirement: "Thành thạo SQL, Python, PowerBI / Tableau.",
    benefit: "Môi trường trẻ trung, đào tạo chuyên sâu về AI & Big Data.",
  },
  "job-5": {
    title: "HR Generalist",
    code: "HR-2408",
    workType: "Toàn thời gian",
    location: "TP. Hồ Chí Minh",
    salaryText: "15 - 22 triệu VND",
    experience: "2 - 3 năm",
    skills: ["HR", "Recruitment", "C&B"],
    status: "DRAFT",
    description: "Phụ trách các hoạt động tuyển dụng, quản lý hồ sơ nhân sự và chế độ phúc lợi cho nhân viên.",
    requirement: "Từ 2 năm kinh nghiệm nhân sự tổng hợp, am hiểu luật lao động.",
    benefit: "Chế độ nghỉ phép 14 ngày/năm, teambuilding định kỳ.",
  },
  "job-6": {
    title: "DevOps Engineer",
    code: "DEVOPS-2408",
    workType: "Toàn thời gian",
    location: "Hà Nội",
    salaryText: "25 - 35 triệu VND",
    experience: "3 - 5 năm",
    skills: ["DevOps", "AWS", "Docker"],
    status: "PENDING",
    description: "Vận hành hệ thống hạ tầng Cloud AWS, thiết lập CI/CD pipeline và giám sát độ ổn định dịch vụ.",
    requirement: "Kinh nghiệm với Docker, Kubernetes, AWS, Terraform.",
    benefit: "Thưởng hiệu suất theo quý, hỗ trợ thi chứng chỉ quốc tế.",
  },
};

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const initialData = useMemo(() => {
    return EXISTING_JOBS[id] || {
      title: "Vị trí tuyển dụng",
      code: `JOB-${id.toUpperCase()}`,
      workType: "Toàn thời gian",
      location: "Hà Nội",
      salaryText: "Thỏa thuận",
      experience: "2 - 4 năm",
      skills: ["Product", "Strategy"],
      status: "ACTIVE",
      description: "Mô tả chi tiết công việc cho vị trí tuyển dụng.",
      requirement: "Yêu cầu kỹ năng và kinh nghiệm phù hợp.",
      benefit: "Chế độ đãi ngộ hấp dẫn.",
    };
  }, [id]);

  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      // Mock update job
      message.success("Cập nhật tin tuyển dụng thành công!");
      router.push("/doanh-nghiep/tin-tuyen-dung");
    } catch (error) {
      message.error("Cập nhật tin tuyển dụng thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 flex-1 max-w-4xl mx-auto w-full pb-12">
      {/* Quay lại */}
      <div className="flex items-center justify-between">
        <Link
          href="/doanh-nghiep/tin-tuyen-dung"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 font-bold transition-colors text-xs"
        >
          <ArrowLeftOutlined className="text-xs" />
          <span>Quay lại Quản lý tin tuyển dụng</span>
        </Link>

        <span className="text-xs font-bold text-slate-400">
          Mã tin: <strong className="text-slate-800 font-black">{initialData.code}</strong>
        </span>
      </div>

      <div>
        <h1 className="m-0 text-slate-900 font-black text-xl sm:text-2xl">
          Chỉnh sửa tin tuyển dụng
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Cập nhật thông tin chi tiết cho vị trí: <strong className="text-[#0062ff]">{initialData.title}</strong>
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={initialData}
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <div className="space-y-6">
          {/* Card 1: Thông tin chung */}
          <Card
            title="1. Thông tin vị trí tuyển dụng"
            className="border-slate-200/80 shadow-2xs rounded-2xl"
          >
            <Row gutter={16}>
              <Col xs={24} md={16}>
                <Form.Item
                  label={<span className="text-xs font-bold text-slate-700">Tiêu đề tin tuyển dụng</span>}
                  name="title"
                  rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
                >
                  <Input placeholder="Ví dụ: Product Manager" size="large" className="rounded-xl text-xs font-medium" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label={<span className="text-xs font-bold text-slate-700">Hình thức làm việc</span>}
                  name="workType"
                  rules={[{ required: true }]}
                >
                  <Select
                    size="large"
                    className="rounded-xl text-xs"
                    options={[
                      { value: "Toàn thời gian", label: "Toàn thời gian (Full-time)" },
                      { value: "Bán thời gian", label: "Bán thời gian (Part-time)" },
                      { value: "Từ xa", label: "Làm việc từ xa (Remote)" },
                      { value: "Hybrid", label: "Linh hoạt (Hybrid)" },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label={<span className="text-xs font-bold text-slate-700">Địa điểm làm việc</span>}
                  name="location"
                  rules={[{ required: true }]}
                >
                  <Select size="large" className="rounded-xl text-xs" options={MOCK_BRANCHES} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label={<span className="text-xs font-bold text-slate-700">Mức lương dự kiến</span>}
                  name="salaryText"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Ví dụ: 25 - 40 triệu VND" size="large" className="rounded-xl text-xs" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label={<span className="text-xs font-bold text-slate-700">Kinh nghiệm yêu cầu</span>}
                  name="experience"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Ví dụ: 3 - 5 năm" size="large" className="rounded-xl text-xs" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label={<span className="text-xs font-bold text-slate-700">Kỹ năng chuyên môn</span>}
                  name="skills"
                  rules={[{ required: true, message: "Chọn ít nhất 1 kỹ năng!" }]}
                >
                  <Select
                    mode="tags"
                    size="large"
                    placeholder="Chọn hoặc nhập kỹ năng"
                    className="rounded-xl text-xs"
                    options={MOCK_SKILLS}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Card 2: Mô tả & Yêu cầu */}
          <Card
            title="2. Nội dung chi tiết"
            className="border-slate-200/80 shadow-2xs rounded-2xl"
          >
            <Form.Item
              label={<span className="text-xs font-bold text-slate-700">Mô tả công việc (Job Description)</span>}
              name="description"
              rules={[{ required: true }]}
            >
              <TextArea rows={4} placeholder="Mô tả trách nhiệm công việc..." className="rounded-xl text-xs" />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-bold text-slate-700">Yêu cầu ứng viên (Requirements)</span>}
              name="requirement"
              rules={[{ required: true }]}
            >
              <TextArea rows={4} placeholder="Yêu cầu về kỹ năng, kinh nghiệm..." className="rounded-xl text-xs" />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-bold text-slate-700">Quyền lợi & Đãi ngộ (Benefits)</span>}
              name="benefit"
              rules={[{ required: true }]}
            >
              <TextArea rows={3} placeholder="Chế độ bảo hiểm, thưởng, phúc lợi..." className="rounded-xl text-xs" />
            </Form.Item>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/doanh-nghiep/tin-tuyen-dung">
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#0062ff] hover:bg-[#0052cc] text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <SaveOutlined />
              <span>{submitting ? "Đang lưu..." : "Lưu thay đổi"}</span>
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
}
