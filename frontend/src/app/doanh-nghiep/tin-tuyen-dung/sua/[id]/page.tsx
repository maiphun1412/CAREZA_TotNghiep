"use client";

import { useState, use, useEffect, useCallback } from "react";
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
  Space,
  Spin,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { employerService } from "@/services/employer.service";

const { TextArea } = Input;

const SUGGESTED_SKILLS = [
  { value: "React", label: "React" },
  { value: "TypeScript", label: "TypeScript" },
  { value: "Next.js", label: "Next.js" },
  { value: "Node.js", label: "Node.js" },
  { value: "Python", label: "Python" },
  { value: "Java", label: "Java" },
  { value: "SQL", label: "SQL" },
  { value: "UI/UX", label: "UI/UX" },
  { value: "Git", label: "Git" },
];

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobCode, setJobCode] = useState<string>(`JD-${id}`);
  const [jobTitle, setJobTitle] = useState<string>("Đang tải...");
  const [branches, setBranches] = useState<{ value: string; label: string }[]>([]);
  const [form] = Form.useForm();

  const fetchJobData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [jobRes, branchRes] = await Promise.allSettled([
        employerService.getJobDetail(id),
        employerService.getBranches(),
      ]);

      if (branchRes.status === "fulfilled" && branchRes.value.data?.branches) {
        setBranches(
          branchRes.value.data.branches.map((b: any) => ({
            value: b.name,
            label: b.name + (b.address ? ` (${b.address})` : ""),
          }))
        );
      }

      if (jobRes.status === "fulfilled" && jobRes.value.data?.job) {
        const j = jobRes.value.data.job;
        setJobCode(j.slug || `JD-${j.id}`);
        setJobTitle(j.title);
        form.setFieldsValue({
          title: j.title,
          workType:
            j.employment_type === "full_time"
              ? "Toàn thời gian"
              : j.employment_type === "part_time"
              ? "Bán thời gian"
              : j.work_mode || "Toàn thời gian",
          location: j.location || "Hà Nội",
          salaryText:
            j.salary_min && j.salary_max
              ? `${(j.salary_min / 1000000).toFixed(0)} - ${(j.salary_max / 1000000).toFixed(0)} triệu VND`
              : "Thỏa thuận",
          experience: j.experience_min ? `${j.experience_min} năm` : "Không yêu cầu",
          skills: Array.isArray(j.skills) ? j.skills.map((s: any) => s.skill_name || s) : [],
          description: j.description || "",
          requirement: j.requirements || "",
          benefit: j.benefits || "",
        });
      } else {
        setError("Không thể tải thông tin tin tuyển dụng này.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Không tìm thấy tin tuyển dụng.");
    } finally {
      setLoading(false);
    }
  }, [id, form]);

  useEffect(() => {
    fetchJobData();
  }, [fetchJobData]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      await employerService.updateJob(id, {
        title: values.title,
        description: values.description,
        requirements: values.requirement,
        benefits: values.benefit || "",
        work_mode: values.workType === "Từ xa" ? "remote" : values.workType === "Hybrid" ? "hybrid" : "onsite",
        employment_type: values.workType === "Bán thời gian" ? "part_time" : "full_time",
      });
      message.success("Cập nhật tin tuyển dụng thành công!");
      router.push("/doanh-nghiep/tin-tuyen-dung");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Cập nhật tin tuyển dụng thất bại.";
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 flex-1">
        <Spin tip="Đang tải thông tin tin tuyển dụng..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-12 space-y-4">
        <Alert
          type="error"
          message="Lỗi tải tin tuyển dụng"
          description={error}
          action={
            <Button size="small" danger icon={<ReloadOutlined />} onClick={fetchJobData}>
              Tải lại
            </Button>
          }
          showIcon
        />
        <Link href="/doanh-nghiep/tin-tuyen-dung">
          <Button icon={<ArrowLeftOutlined />}>Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

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
          Mã tin: <strong className="text-slate-800 font-black">{jobCode}</strong>
        </span>
      </div>

      <div>
        <h1 className="m-0 text-slate-900 font-black text-xl sm:text-2xl">
          Chỉnh sửa tin tuyển dụng
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Cập nhật thông tin chi tiết cho vị trí: <strong className="text-[#0062ff]">{jobTitle}</strong>
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
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
                  <Select
                    size="large"
                    className="rounded-xl text-xs"
                    options={
                      branches.length > 0
                        ? branches
                        : [
                            { value: "Hà Nội", label: "Hà Nội" },
                            { value: "TP. Hồ Chí Minh", label: "TP. Hồ Chí Minh" },
                            { value: "Đà Nẵng", label: "Đà Nẵng" },
                          ]
                    }
                  />
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
                    options={SUGGESTED_SKILLS}
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
