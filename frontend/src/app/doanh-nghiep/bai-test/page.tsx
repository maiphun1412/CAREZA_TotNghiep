"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Tag,
  Alert,
  Spin,
  Empty,
  Typography,
  message,
  Drawer,
  Popconfirm,
  Divider,
  Radio,
  Badge,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  AuditOutlined,
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  QuestionCircleOutlined,
  TrophyOutlined,
  SearchOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import { employerService } from "@/services/employer.service";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

interface QuestionFormItem {
  id: number | string;
  type: "multiple_choice" | "essay";
  question: string;
  options: string[];
  correct_answer: string;
  points: number;
}

const DEFAULT_QUESTION: QuestionFormItem = {
  id: 1,
  type: "multiple_choice",
  question: "",
  options: ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
  correct_answer: "Lựa chọn A",
  points: 10,
};

function formatDurationSeconds(seconds?: number | null): string {
  if (seconds === null || seconds === undefined) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins === 0) return `${secs} giây`;
  return `${mins} phút ${secs} giây`;
}

export default function EmployerTestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal Tạo / Chỉnh sửa bài kiểm tra
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTest, setEditingTest] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [questionsList, setQuestionsList] = useState<QuestionFormItem[]>([{ ...DEFAULT_QUESTION }]);
  const [form] = Form.useForm();

  // Modal Giao bài kiểm tra cho ứng viên
  const [isAssignOpen, setIsAssignOpen] = useState<boolean>(false);
  const [assigningTest, setAssigningTest] = useState<any | null>(null);
  const [assignSubmitting, setAssignSubmitting] = useState<boolean>(false);
  const [assignMode, setAssignMode] = useState<"candidates" | "job">("candidates");
  const [assignForm] = Form.useForm();

  // Drawer xem danh sách ứng viên được giao & kết quả làm bài
  const [selectedTest, setSelectedTest] = useState<any | null>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Modal xem chi tiết bài làm & chấm điểm thủ công
  const [inspectingAttempt, setInspectingAttempt] = useState<any | null>(null);
  const [gradingSubmitting, setGradingSubmitting] = useState<boolean>(false);
  const [gradeForm] = Form.useForm();

  const fetchTestsAndMeta = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [testsRes, jobsRes, appsRes] = await Promise.all([
        employerService.getTests(),
        employerService.getJobs({ page: 1, page_size: 100 }).catch(() => ({ data: { jobs: [] } })),
        employerService.getApplications({ page_size: 100 }).catch(() => ({ data: { applications: [] } })),
      ]);
      setTests(testsRes.data?.tests || []);
      const rawJobs = (jobsRes as any)?.data?.jobs || (jobsRes as any)?.data?.items || [];
      setJobs(rawJobs);
      const rawApps = (appsRes as any)?.data?.applications || (appsRes as any)?.data?.items || [];
      setApplications(rawApps);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          err?.message ||
          "Không thể tải danh sách bài kiểm tra năng lực."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestsAndMeta();
  }, [fetchTestsAndMeta]);

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const matchKeyword =
        !searchKeyword.trim() ||
        (t.title || "").toLowerCase().includes(searchKeyword.trim().toLowerCase()) ||
        (t.description || "").toLowerCase().includes(searchKeyword.trim().toLowerCase()) ||
        (t.job_title || "").toLowerCase().includes(searchKeyword.trim().toLowerCase());
      const matchStatus = statusFilter === "all" || (t.status || "active") === statusFilter;
      return matchKeyword && matchStatus;
    });
  }, [tests, searchKeyword, statusFilter]);

  const openCreateModal = () => {
    setEditingTest(null);
    form.resetFields();
    form.setFieldsValue({
      title: "",
      description: "",
      duration_minutes: 30,
      passing_score: 70,
      status: "active",
      job_id: null,
    });
    setQuestionsList([
      {
        id: 1,
        type: "multiple_choice",
        question: "",
        options: ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
        correct_answer: "Lựa chọn A",
        points: 10,
      },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = async (testRecord: any) => {
    try {
      const res = await employerService.getTestDetail(testRecord.id);
      const detail = res.data?.test || testRecord;
      setEditingTest(detail);
      form.setFieldsValue({
        title: detail.title,
        description: detail.description || "",
        duration_minutes: detail.duration_minutes || 30,
        passing_score: detail.passing_score ?? 70,
        status: detail.status || "active",
        job_id: detail.job_id || null,
      });

      const rawQs = Array.isArray(detail.questions) ? detail.questions : [];
      if (rawQs.length > 0) {
        setQuestionsList(
          rawQs.map((q: any, idx: number) => ({
            id: q.id ?? idx + 1,
            type: q.type === "essay" ? "essay" : "multiple_choice",
            question: q.question || "",
            options:
              Array.isArray(q.options) && q.options.length > 0
                ? q.options
                : ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
            correct_answer: q.correct_answer || (Array.isArray(q.options) && q.options[0]) || "",
            points: Number(q.points) || 10,
          }))
        );
      } else {
        setQuestionsList([]);
      }
      setIsModalOpen(true);
    } catch (err: any) {
      message.error(err?.response?.data?.detail || "Không thể tải chi tiết bài kiểm tra.");
    }
  };

  const handleAddQuestion = () => {
    setQuestionsList((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        type: "multiple_choice",
        question: "",
        options: ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
        correct_answer: "Phương án A",
        points: 10,
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestionsList((prev) => prev.filter((_, i) => i !== index).map((q, idx) => ({ ...q, id: idx + 1 })));
  };

  const handleQuestionChange = (index: number, patch: Partial<QuestionFormItem>) => {
    setQuestionsList((prev) =>
      prev.map((q, i) => {
        if (i !== index) return q;
        const updated = { ...q, ...patch };
        if (
          updated.type === "multiple_choice" &&
          updated.options.length > 0 &&
          !updated.options.includes(updated.correct_answer)
        ) {
          updated.correct_answer = updated.options[0];
        }
        return updated;
      })
    );
  };

  const handleOptionChange = (qIndex: number, optIndex: number, val: string) => {
    setQuestionsList((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const oldOpt = q.options[optIndex];
        const newOpts = q.options.map((o, oi) => (oi === optIndex ? val : o));
        const newCorrect = q.correct_answer === oldOpt ? val : q.correct_answer;
        return { ...q, options: newOpts, correct_answer: newCorrect };
      })
    );
  };

  const handleAddOption = (qIndex: number) => {
    setQuestionsList((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const nextLabel = `Phương án ${String.fromCharCode(65 + q.options.length)}`;
        return { ...q, options: [...q.options, nextLabel] };
      })
    );
  };

  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    setQuestionsList((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex || q.options.length <= 2) return q;
        const removed = q.options[optIndex];
        const newOpts = q.options.filter((_, oi) => oi !== optIndex);
        const newCorrect = q.correct_answer === removed ? newOpts[0] || "" : q.correct_answer;
        return { ...q, options: newOpts, correct_answer: newCorrect };
      })
    );
  };

  const handleSaveTest = async (values: any) => {
    // Kiểm tra hợp lệ danh sách câu hỏi
    for (let i = 0; i < questionsList.length; i++) {
      const q = questionsList[i];
      if (!q.question.trim()) {
        message.warning(`Vui lòng nhập nội dung cho Câu hỏi #${i + 1}.`);
        return;
      }
      if (q.type === "multiple_choice") {
        const validOpts = q.options.map((o) => o.trim()).filter(Boolean);
        if (validOpts.length < 2) {
          message.warning(`Câu hỏi trắc nghiệm #${i + 1} cần ít nhất 2 phương án trả lời.`);
          return;
        }
        if (!q.correct_answer.trim() || !validOpts.includes(q.correct_answer.trim())) {
          message.warning(`Vui lòng chọn đáp án đúng cho Câu hỏi #${i + 1}.`);
          return;
        }
      }
    }

    const payload = {
      title: values.title.trim(),
      description: values.description || "",
      duration_minutes: Number(values.duration_minutes) || 30,
      passing_score: Number(values.passing_score ?? 70),
      status: values.status || "active",
      job_id: values.job_id || null,
      questions: questionsList.map((q, idx) => ({
        id: idx + 1,
        type: q.type,
        question: q.question.trim(),
        options: q.type === "multiple_choice" ? q.options.map((o) => o.trim()).filter(Boolean) : [],
        correct_answer: q.type === "multiple_choice" ? q.correct_answer.trim() : "",
        points: Number(q.points) || 10,
      })),
    };

    try {
      setSubmitting(true);
      if (editingTest) {
        await employerService.updateTest(editingTest.id, payload);
        message.success("Cập nhật bài kiểm tra năng lực thành công!");
      } else {
        await employerService.createTest(payload);
        message.success("Tạo bài kiểm tra năng lực mới thành công!");
      }
      setIsModalOpen(false);
      fetchTestsAndMeta();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Lưu bài kiểm tra thất bại.";
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTest = async (testId: number) => {
    try {
      await employerService.deleteTest(testId);
      message.success("Đã xóa bài kiểm tra năng lực.");
      fetchTestsAndMeta();
    } catch (err: any) {
      const errData = err?.response?.data;
      const errMsg =
        errData?.test?.[0] ||
        errData?.test ||
        errData?.detail ||
        errData?.message ||
        "Không thể xóa bài kiểm tra.";
      message.error(String(errMsg));
    }
  };

  const openAssignModal = (testRecord: any) => {
    setAssigningTest(testRecord);
    setAssignMode("candidates");
    assignForm.resetFields();
    assignForm.setFieldsValue({
      application_ids: [],
      job_id: testRecord.job_id || undefined,
      deadline: "",
    });
    setIsAssignOpen(true);
  };

  const handleAssignTest = async (values: any) => {
    if (!assigningTest) return;
    try {
      setAssignSubmitting(true);
      const payload: any = {
        deadline: values.deadline ? values.deadline.trim() : null,
      };
      if (assignMode === "candidates") {
        payload.application_ids = values.application_ids || [];
      } else {
        payload.job_id = values.job_id;
      }
      const res = await employerService.assignTest(assigningTest.id, payload);
      message.success(res.message || "Giao bài kiểm tra cho ứng viên thành công!");
      setIsAssignOpen(false);
      fetchTestsAndMeta();
    } catch (err: any) {
      const errData = err?.response?.data;
      const errMsg =
        errData?.application_ids?.[0] ||
        errData?.job_id?.[0] ||
        errData?.detail ||
        errData?.message ||
        "Không thể giao bài kiểm tra.";
      message.error(String(errMsg));
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleViewAttempts = async (test: any) => {
    setSelectedTest(test);
    setIsDrawerOpen(true);
    try {
      setLoadingAttempts(true);
      const res = await employerService.getTestAttempts(test.id);
      setAttempts(res.data?.attempts || []);
    } catch {
      setAttempts([]);
    } finally {
      setLoadingAttempts(false);
    }
  };

  const openInspectAttempt = (attempt: any) => {
    setInspectingAttempt(attempt);
    gradeForm.setFieldsValue({
      score: attempt.score ?? 0,
      feedback: attempt.feedback || "",
    });
  };

  const handleGradeSubmit = async (values: any) => {
    if (!inspectingAttempt) return;
    try {
      setGradingSubmitting(true);
      await employerService.gradeTestAttempt(inspectingAttempt.id, {
        score: Number(values.score),
        feedback: values.feedback || "",
      });
      message.success("Đã cập nhật điểm số và nhận xét cho bài làm!");
      setInspectingAttempt(null);
      if (selectedTest) {
        const res = await employerService.getTestAttempts(selectedTest.id);
        setAttempts(res.data?.attempts || []);
      }
      fetchTestsAndMeta();
    } catch (err: any) {
      message.error(err?.response?.data?.detail || "Chấm điểm bài làm thất bại.");
    } finally {
      setGradingSubmitting(false);
    }
  };

  const renderStatusTag = (status: string) => {
    const s = (status || "active").toLowerCase();
    if (s === "active" || s === "published") {
      return <Tag color="green">Đang mở</Tag>;
    }
    if (s === "draft") {
      return <Tag color="gold">Bản nháp</Tag>;
    }
    if (s === "closed") {
      return <Tag color="default">Đã đóng</Tag>;
    }
    return <Tag>{status}</Tag>;
  };

  const renderAttemptStatus = (att: any) => {
    if (att.status === "completed") {
      return (
        <Space size={4} wrap>
          {att.is_passed ? (
            <Tag color="success" icon={<CheckCircleOutlined />} className="font-semibold">
              Đạt ({att.score ?? 0}/100)
            </Tag>
          ) : (
            <Tag color="error" icon={<CloseCircleOutlined />} className="font-semibold">
              Chưa đạt ({att.score ?? 0}/100)
            </Tag>
          )}
          {att.auto_submitted && <Tag color="warning">Hết giờ tự thu</Tag>}
        </Space>
      );
    }
    if (att.status === "pending_manual_grading") {
      return <Tag color="processing">Chờ chấm tự luận ({att.score ?? 0}/100)</Tag>;
    }
    if (att.status === "in_progress") {
      return (
        <Tag color="blue" icon={<ClockCircleOutlined />}>
          Đang làm bài
        </Tag>
      );
    }
    if (att.status === "expired") {
      return <Tag color="default">Quá hạn</Tag>;
    }
    return <Tag color="orange">Đã giao (Chưa bắt đầu)</Tag>;
  };

  const columns = [
    {
      title: "Bài kiểm tra năng lực",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: any) => (
        <div>
          <span className="font-bold text-slate-800 text-sm block">{text}</span>
          {record.description && (
            <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">{record.description}</span>
          )}
          {record.job_title && (
            <span className="text-xs text-blue-600 font-medium block mt-1">
              Tin tuyển dụng: {record.job_title}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Cấu hình đề",
      key: "config",
      width: 170,
      render: (_: any, record: any) => (
        <div className="space-y-1 text-xs text-slate-600">
          <div>
            Thời gian: <strong>{record.duration_minutes || 30} phút</strong>
          </div>
          <div>
            Số câu hỏi: <strong>{record.questions_count ?? (record.questions?.length || 0)} câu</strong> ({record.total_points || 0} điểm)
          </div>
        </div>
      ),
    },
    {
      title: "Điểm đạt",
      dataIndex: "passing_score",
      key: "passing_score",
      width: 110,
      render: (score: number) => (
        <Tag color="blue" className="font-semibold text-xs">
          {score ?? 70} / 100
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 115,
      render: (status: string) => renderStatusTag(status),
    },
    {
      title: "Ứng viên & Kết quả",
      key: "stats",
      width: 175,
      render: (_: any, record: any) => (
        <div className="text-xs space-y-1">
          <div className="text-slate-600">
            Đã giao: <strong>{record.assigned_count || 0}</strong> | Đã nộp:{" "}
            <strong className="text-blue-600">{record.attempts_count || 0}</strong>
          </div>
          <div className="text-emerald-600 font-semibold">
            Đạt yêu cầu: {record.passed_count || 0} ứng viên
          </div>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 260,
      render: (_: any, record: any) => (
        <Space size="small" wrap>
          <Tooltip title="Giao bài kiểm tra cho ứng viên">
            <Button
              size="small"
              type="primary"
              ghost
              icon={<UserAddOutlined />}
              onClick={() => openAssignModal(record)}
              className="text-xs font-semibold"
            >
              Giao bài
            </Button>
          </Tooltip>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewAttempts(record)}
            className="text-xs font-semibold text-blue-600"
          >
            Kết quả ({record.assigned_count || 0})
          </Button>
          <Tooltip title="Chỉnh sửa đề & câu hỏi">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          </Tooltip>
          <Popconfirm
            title="Xóa bài kiểm tra này?"
            description="Toàn bộ dữ liệu câu hỏi và lượt làm bài của bài kiểm tra này sẽ bị xóa."
            onConfirm={() => handleDeleteTest(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const totalConfiguredPoints = useMemo(
    () => questionsList.reduce((acc, q) => acc + (Number(q.points) || 0), 0),
    [questionsList]
  );

  return (
    <div className="space-y-6 flex-1 max-w-6xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Title level={3} className="!m-0 text-slate-900 font-extrabold flex items-center gap-2">
            <AuditOutlined className="text-blue-600" /> Bài kiểm tra năng lực ứng viên
          </Title>
          <Paragraph className="!mb-0 text-slate-500 text-xs sm:text-sm mt-1">
            Thiết lập đề kiểm tra, quản lý câu hỏi/đáp án, giao bài cho ứng viên và theo dõi kết quả chấm điểm tự động.
          </Paragraph>
        </div>

        <Space wrap>
          <Button icon={<ReloadOutlined />} onClick={fetchTestsAndMeta} className="h-10 rounded-lg">
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 h-10 font-semibold text-xs rounded-lg"
          >
            Tạo bài kiểm tra mới
          </Button>
        </Space>
      </div>

      {/* Bộ lọc tìm kiếm */}
      <Card className="border-slate-100 shadow-2xs rounded-xl" styles={{ body: { padding: "14px 18px" } }}>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <Input
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="Tìm theo tên bài kiểm tra, mô tả hoặc vị trí tuyển dụng..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            allowClear
            className="sm:max-w-md"
          />
          <Space wrap>
            <span className="text-xs text-slate-500 font-medium">Trạng thái:</span>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 160 }}
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "active", label: "Đang mở (Active)" },
                { value: "draft", label: "Bản nháp (Draft)" },
                { value: "closed", label: "Đã đóng (Closed)" },
              ]}
            />
          </Space>
        </div>
      </Card>

      {error && (
        <Alert
          type="error"
          message="Lỗi tải danh sách"
          description={error}
          action={
            <Button size="small" danger icon={<ReloadOutlined />} onClick={fetchTestsAndMeta}>
              Tải lại
            </Button>
          }
          showIcon
        />
      )}

      <Card className="border-slate-100 shadow-sm rounded-xl">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Spin tip="Đang tải danh sách bài kiểm tra..." />
          </div>
        ) : filteredTests.length === 0 ? (
          <Empty
            description={
              tests.length === 0
                ? "Doanh nghiệp chưa có bài kiểm tra năng lực nào"
                : "Không tìm thấy bài kiểm tra phù hợp với bộ lọc"
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            {tests.length === 0 && (
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                Tạo bài kiểm tra đầu tiên
              </Button>
            )}
          </Empty>
        ) : (
          <Table
            dataSource={filteredTests}
            columns={columns}
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            rowKey="id"
            scroll={{ x: 900 }}
          />
        )}
      </Card>

      {/* Modal Tạo / Chỉnh sửa bài kiểm tra & Quản lý câu hỏi */}
      <Modal
        title={editingTest ? `Chỉnh sửa bài kiểm tra: ${editingTest.title}` : "Tạo bài kiểm tra năng lực mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={820}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleSaveTest} requiredMark={false} className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Form.Item
              label="Tên bài kiểm tra"
              name="title"
              className="sm:col-span-2"
              rules={[{ required: true, message: "Vui lòng nhập tên bài kiểm tra!" }]}
            >
              <Input placeholder="Ví dụ: Bài đánh giá kỹ năng Frontend React / TypeScript" />
            </Form.Item>

            <Form.Item label="Trạng thái" name="status" initialValue="active">
              <Select
                options={[
                  { value: "active", label: "Đang mở (Active)" },
                  { value: "draft", label: "Bản nháp (Draft)" },
                  { value: "closed", label: "Đã đóng (Closed)" },
                ]}
              />
            </Form.Item>
          </div>

          <Form.Item label="Mô tả & Hướng dẫn làm bài cho ứng viên" name="description">
            <TextArea
              rows={2}
              placeholder="Hướng dẫn quy chế làm bài, phạm vi kiến thức và lưu ý trước khi ứng viên bắt đầu..."
            />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Form.Item
              label="Thời gian làm bài (phút)"
              name="duration_minutes"
              initialValue={30}
              rules={[{ required: true, message: "Nhập thời lượng!" }]}
            >
              <InputNumber min={1} max={360} className="w-full" />
            </Form.Item>

            <Form.Item
              label="Điểm đạt yêu cầu (thang 100)"
              name="passing_score"
              initialValue={70}
              rules={[{ required: true, message: "Nhập điểm đạt!" }]}
            >
              <InputNumber min={0} max={100} className="w-full" />
            </Form.Item>

            <Form.Item label="Gắn với Tin tuyển dụng (Tùy chọn)" name="job_id">
              <Select
                allowClear
                placeholder="Chọn tin tuyển dụng..."
                options={jobs.map((j: any) => ({
                  value: j.id,
                  label: j.title,
                }))}
              />
            </Form.Item>
          </div>

          <Divider className="!my-3" />

          {/* Quản lý danh sách câu hỏi */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <Text strong className="text-sm text-slate-800">
                Danh sách câu hỏi ({questionsList.length} câu — Tổng điểm: {totalConfiguredPoints} điểm)
              </Text>
              <span className="block text-xs text-slate-500">
                Hệ thống tự động quy đổi điểm đạt được của các câu hỏi về thang điểm 100 khi chấm bài.
              </span>
            </div>
            <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddQuestion}>
              Thêm câu hỏi
            </Button>
          </div>

          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {questionsList.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có câu hỏi nào. Nhấn 'Thêm câu hỏi' để tạo bộ đề."
              />
            ) : (
              questionsList.map((q, qIdx) => (
                <Card
                  key={qIdx}
                  size="small"
                  className="border-slate-200 bg-slate-50/60 rounded-lg"
                  title={
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <Space size="small">
                        <Badge count={qIdx + 1} style={{ backgroundColor: "#2563eb" }} />
                        <Select
                          size="small"
                          value={q.type}
                          onChange={(val) => handleQuestionChange(qIdx, { type: val })}
                          style={{ width: 170 }}
                          options={[
                            { value: "multiple_choice", label: "Trắc nghiệm (1 đáp án)" },
                            { value: "essay", label: "Tự luận (Chấm thủ công)" },
                          ]}
                        />
                      </Space>
                      <Space size="small">
                        <span className="text-xs text-slate-500">Điểm câu này:</span>
                        <InputNumber
                          size="small"
                          min={1}
                          max={100}
                          value={q.points}
                          onChange={(val) => handleQuestionChange(qIdx, { points: Number(val) || 10 })}
                          style={{ width: 70 }}
                        />
                        <Button
                          size="small"
                          danger
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveQuestion(qIdx)}
                        />
                      </Space>
                    </div>
                  }
                >
                  <div className="space-y-3">
                    <Input.TextArea
                      rows={2}
                      placeholder={`Nhập nội dung câu hỏi #${qIdx + 1}...`}
                      value={q.question}
                      onChange={(e) => handleQuestionChange(qIdx, { question: e.target.value })}
                    />

                    {q.type === "multiple_choice" && (
                      <div className="space-y-2 pl-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-600">
                            Các phương án trả lời (Chọn nút tròn ở phương án đúng):
                          </span>
                          <Button size="small" type="link" onClick={() => handleAddOption(qIdx)}>
                            + Thêm phương án
                          </Button>
                        </div>
                        <Radio.Group
                          value={q.correct_answer}
                          onChange={(e) => handleQuestionChange(qIdx, { correct_answer: e.target.value })}
                          className="w-full space-y-2"
                        >
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <Radio value={opt} />
                              <Input
                                size="small"
                                value={opt}
                                onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                                placeholder={`Phương án ${optIdx + 1}`}
                                className="flex-1"
                              />
                              {q.options.length > 2 && (
                                <Button
                                  size="small"
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleRemoveOption(qIdx, optIdx)}
                                />
                              )}
                            </div>
                          ))}
                        </Radio.Group>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={submitting} className="bg-blue-600">
              {editingTest ? "Lưu cập nhật" : "Tạo bài kiểm tra"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Giao bài kiểm tra cho ứng viên */}
      <Modal
        title={assigningTest ? `Giao bài kiểm tra: ${assigningTest.title}` : "Giao bài kiểm tra"}
        open={isAssignOpen}
        onCancel={() => setIsAssignOpen(false)}
        footer={null}
        width={560}
        destroyOnClose
      >
        <Form layout="vertical" form={assignForm} onFinish={handleAssignTest} className="pt-3">
          <Form.Item label="Hình thức giao bài">
            <Radio.Group value={assignMode} onChange={(e) => setAssignMode(e.target.value)}>
              <Radio.Button value="candidates">Chọn từng hồ sơ ứng viên</Radio.Button>
              <Radio.Button value="job">Giao theo Tin tuyển dụng</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {assignMode === "candidates" ? (
            <Form.Item
              label="Chọn ứng viên trong quy trình tuyển dụng"
              name="application_ids"
              rules={[{ required: true, message: "Vui lòng chọn ít nhất một ứng viên!" }]}
            >
              <Select
                mode="multiple"
                placeholder="Tìm và chọn ứng viên..."
                optionFilterProp="label"
                options={applications.map((app: any) => ({
                  value: app.id,
                  label: `${app.candidate_name || app.candidate?.full_name || "Ứng viên"} — ${
                    app.job_title || app.job?.title || "Vị trí ứng tuyển"
                  } (#${app.id})`,
                }))}
              />
            </Form.Item>
          ) : (
            <Form.Item
              label="Chọn Tin tuyển dụng (Giao cho toàn bộ ứng viên hợp lệ của tin này)"
              name="job_id"
              rules={[{ required: true, message: "Vui lòng chọn tin tuyển dụng!" }]}
            >
              <Select
                placeholder="Chọn tin tuyển dụng..."
                options={jobs.map((j: any) => ({
                  value: j.id,
                  label: j.title,
                }))}
              />
            </Form.Item>
          )}

          <Form.Item label="Hạn chót hoàn thành (Tùy chọn, định dạng YYYY-MM-DD)" name="deadline">
            <Input type="date" />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsAssignOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={assignSubmitting} className="bg-blue-600">
              Xác nhận giao bài
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Drawer xem danh sách ứng viên được giao & kết quả làm bài */}
      <Drawer
        title={
          selectedTest
            ? `Ứng viên & Kết quả: ${selectedTest.title} (Điểm đạt: ${selectedTest.passing_score ?? 70}/100)`
            : "Danh sách bài làm của ứng viên"
        }
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        width={760}
      >
        {loadingAttempts ? (
          <div className="flex justify-center items-center py-16">
            <Spin tip="Đang tải danh sách ứng viên và kết quả..." />
          </div>
        ) : attempts.length === 0 ? (
          <Empty description="Chưa có ứng viên nào được giao hoặc làm bài kiểm tra này">
            {selectedTest && (
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => {
                  setIsDrawerOpen(false);
                  openAssignModal(selectedTest);
                }}
              >
                Giao bài kiểm tra cho ứng viên
              </Button>
            )}
          </Empty>
        ) : (
          <div className="space-y-4">
            {attempts.map((att: any) => (
              <Card key={att.id} size="small" className="border-slate-200 shadow-2xs rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800 text-sm">
                        {att.candidate_name || "Ứng viên"}
                      </span>
                      {att.candidate_email && (
                        <span className="text-xs text-slate-400">({att.candidate_email})</span>
                      )}
                    </div>
                    <div className="text-xs text-blue-600 font-medium">
                      Vị trí: {att.job_title || "Ứng tuyển"}
                    </div>
                    <div className="text-xs text-slate-500 space-x-3">
                      <span>
                        Bắt đầu:{" "}
                        {att.started_at ? new Date(att.started_at).toLocaleString("vi-VN") : "Chưa bắt đầu"}
                      </span>
                      <span>
                        Nộp lúc:{" "}
                        {att.completed_at ? new Date(att.completed_at).toLocaleString("vi-VN") : "—"}
                      </span>
                      <span>Thời gian làm: {formatDurationSeconds(att.duration_seconds)}</span>
                    </div>
                    {att.feedback && (
                      <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded mt-1">
                        <strong>Nhận xét:</strong> {att.feedback}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {renderAttemptStatus(att)}
                    <Button
                      size="small"
                      icon={<FileDoneOutlined />}
                      onClick={() => openInspectAttempt(att)}
                    >
                      Chi tiết / Chấm điểm
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Drawer>

      {/* Modal Xem chi tiết câu trả lời của ứng viên & Chấm điểm thủ công */}
      <Modal
        title={
          inspectingAttempt
            ? `Chi tiết bài làm: ${inspectingAttempt.candidate_name || "Ứng viên"}`
            : "Chi tiết bài làm"
        }
        open={!!inspectingAttempt}
        onCancel={() => setInspectingAttempt(null)}
        footer={null}
        width={680}
        destroyOnClose
      >
        {inspectingAttempt && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg text-xs">
              <div>
                <span className="text-slate-400 block">Điểm hiện tại</span>
                <strong className="text-sm text-slate-800">
                  {inspectingAttempt.score !== null && inspectingAttempt.score !== undefined
                    ? `${inspectingAttempt.score} / 100`
                    : "Chưa có điểm"}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Điểm đạt yêu cầu</span>
                <strong className="text-sm text-blue-600">{inspectingAttempt.passing_score ?? 70} / 100</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Kết quả</span>
                <strong
                  className={`text-sm ${
                    inspectingAttempt.status === "pending_manual_grading" ||
                    (inspectingAttempt.completed_at && inspectingAttempt.is_passed === null)
                      ? "text-blue-600"
                      : inspectingAttempt.is_passed
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {inspectingAttempt.completed_at
                    ? inspectingAttempt.status === "pending_manual_grading" ||
                      inspectingAttempt.is_passed === null
                      ? "CHỜ CHẤM TỰ LUẬN"
                      : inspectingAttempt.is_passed
                      ? "ĐẠT (PASSED)"
                      : "CHƯA ĐẠT"
                    : "Chưa hoàn thành"}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Thời gian hoàn thành</span>
                <strong className="text-sm text-slate-800">
                  {formatDurationSeconds(inspectingAttempt.duration_seconds)}
                </strong>
              </div>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              <Text strong className="text-xs text-slate-700 block">
                Chi tiết câu trả lời của ứng viên:
              </Text>
              {Array.isArray(inspectingAttempt.answers) && inspectingAttempt.answers.length > 0 ? (
                inspectingAttempt.answers.map((ans: any, idx: number) => (
                  <Card key={idx} size="small" className="border-slate-100 bg-white">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs">
                        <span className="font-bold text-slate-800">
                          Câu {idx + 1}: {ans.question || `Mã câu hỏi #${ans.question_id}`}
                        </span>
                        <div className="mt-1 text-slate-600">
                          Trả lời:{" "}
                          <strong className="text-slate-900">
                            {ans.user_answer || <i className="text-slate-400">(Bỏ trống)</i>}
                          </strong>
                        </div>
                      </div>
                      <div>
                        {ans.type === "multiple_choice" ? (
                          ans.is_correct ? (
                            <Tag color="success">Đúng (+{ans.earned_points ?? ans.score ?? 1}đ)</Tag>
                          ) : (
                            <Tag color="error">Sai (0đ)</Tag>
                          )
                        ) : (
                          <Tag color="processing">Tự luận</Tag>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có dữ liệu câu trả lời đã nộp"
                />
              )}
            </div>

            <Divider className="!my-3" />

            <Form layout="vertical" form={gradeForm} onFinish={handleGradeSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Form.Item
                  label="Điểm tổng kết (thang 100)"
                  name="score"
                  rules={[{ required: true, message: "Nhập điểm số!" }]}
                >
                  <InputNumber min={0} max={100} className="w-full" />
                </Form.Item>
                <Form.Item label="Nhận xét / Đánh giá của Doanh nghiệp" name="feedback" className="sm:col-span-2">
                  <Input placeholder="Nhập nhận xét cho bài làm của ứng viên..." />
                </Form.Item>
              </div>
              <div className="flex justify-end gap-2">
                <Button onClick={() => setInspectingAttempt(null)}>Đóng</Button>
                <Button type="primary" htmlType="submit" loading={gradingSubmitting} className="bg-blue-600">
                  Lưu điểm & Nhận xét
                </Button>
              </div>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
}
