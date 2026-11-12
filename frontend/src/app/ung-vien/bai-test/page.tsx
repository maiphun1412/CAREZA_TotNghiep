"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Table,
  Tag,
  Button,
  Empty,
  Spin,
  Alert,
  Space,
  Typography,
  Input,
  Select,
} from "antd";
import {
  RightOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  FileDoneOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  SearchOutlined,
  AuditOutlined,
} from "@ant-design/icons";
import { candidateService } from "@/services/candidate.service";

const { Title, Text } = Typography;

export default function CandidateTestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchCandidateTests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await candidateService.getCandidateTests();
      setTests(res.data?.tests || []);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "Không thể tải danh sách bài kiểm tra năng lực."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidateTests();
  }, [fetchCandidateTests]);

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const kw = searchKeyword.trim().toLowerCase();
      const matchKw =
        !kw ||
        (t.title || "").toLowerCase().includes(kw) ||
        (t.company_name || "").toLowerCase().includes(kw) ||
        (t.job_title || "").toLowerCase().includes(kw);
      const matchSt = statusFilter === "all" || t.attempt_status === statusFilter;
      return matchKw && matchSt;
    });
  }, [tests, searchKeyword, statusFilter]);

  const summary = useMemo(() => {
    const total = tests.length;
    const inProgress = tests.filter((t) => t.attempt_status === "in_progress").length;
    const completed = tests.filter(
      (t) => t.attempt_status === "completed" || t.attempt_status === "pending_manual_grading"
    ).length;
    const passed = tests.filter((t) => t.attempt_status === "completed" && t.is_passed).length;
    return { total, inProgress, completed, passed };
  }, [tests]);

  const renderStatus = (record: any) => {
    const st = record.attempt_status;
    if (st === "completed") {
      return (
        <Space direction="vertical" size={2}>
          {record.is_passed ? (
            <Tag color="success" icon={<CheckCircleOutlined />} className="rounded-md font-semibold">
              Đạt ({record.score ?? 0}/100)
            </Tag>
          ) : (
            <Tag color="error" icon={<CloseCircleOutlined />} className="rounded-md font-semibold">
              Chưa đạt ({record.score ?? 0}/100)
            </Tag>
          )}
          {record.auto_submitted && (
            <span className="text-[11px] text-amber-600">Tự động nộp khi hết giờ</span>
          )}
        </Space>
      );
    }
    if (st === "pending_manual_grading") {
      return (
        <Tag color="processing" className="rounded-md font-semibold">
          Chờ chấm tự luận ({record.score ?? 0}/100)
        </Tag>
      );
    }
    if (st === "in_progress") {
      return (
        <Tag color="blue" icon={<ClockCircleOutlined />} className="rounded-md font-semibold">
          Đang làm dở
        </Tag>
      );
    }
    if (st === "expired") {
      return (
        <Tag color="default" className="rounded-md">
          Đã hết hạn
        </Tag>
      );
    }
    return (
      <Tag color="orange" className="rounded-md font-semibold">
        Chưa bắt đầu
      </Tag>
    );
  };

  const columns = [
    {
      title: "Bài kiểm tra năng lực",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: any) => (
        <div>
          <span className="font-bold text-slate-800 text-sm block">{text}</span>
          <span className="text-xs text-blue-600 font-medium block mt-0.5">
            {record.company_name || "Doanh nghiệp"} — {record.job_title || "Vị trí ứng tuyển"}
          </span>
          {record.description && (
            <span className="text-xs text-slate-400 line-clamp-1 mt-0.5">{record.description}</span>
          )}
        </div>
      ),
    },
    {
      title: "Thông tin đề",
      key: "info",
      width: 170,
      render: (_: any, record: any) => (
        <div className="text-xs text-slate-600 space-y-1">
          <div>
            Thời lượng: <strong>{record.duration_minutes || 30} phút</strong>
          </div>
          <div>
            Số câu hỏi: <strong>{record.total_questions || 0} câu</strong>
          </div>
        </div>
      ),
    },
    {
      title: "Điểm đạt",
      dataIndex: "passing_score",
      key: "passing_score",
      width: 115,
      render: (val: number) => (
        <Tag color="blue" className="font-semibold text-xs">
          {val ?? 70} / 100
        </Tag>
      ),
    },
    {
      title: "Hạn làm bài",
      dataIndex: "deadline",
      key: "deadline",
      width: 135,
      render: (deadline: string) => (
        <span className="text-xs text-slate-600">
          {deadline ? new Date(deadline).toLocaleDateString("vi-VN") : "Không giới hạn"}
        </span>
      ),
    },
    {
      title: "Trạng thái & Kết quả",
      key: "status",
      width: 180,
      render: (_: any, record: any) => renderStatus(record),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 165,
      render: (_: any, record: any) => {
        if (record.attempt_status === "not_started") {
          return (
            <Button
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => router.push(`/ung-vien/bai-test/${record.id}`)}
              className="bg-blue-600 hover:bg-blue-700 font-semibold text-xs h-8 rounded-lg"
            >
              Xem & Làm bài
            </Button>
          );
        }
        if (record.attempt_status === "in_progress") {
          return (
            <Button
              type="primary"
              size="small"
              icon={<RightOutlined />}
              onClick={() => router.push(`/ung-vien/bai-test/${record.id}`)}
              className="bg-amber-500 hover:bg-amber-600 border-none font-semibold text-xs h-8 rounded-lg"
            >
              Tiếp tục làm bài
            </Button>
          );
        }
        return (
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/ung-vien/bai-test/${record.id}`)}
            className="text-blue-600 border-blue-200 font-semibold text-xs h-8 rounded-lg"
          >
            Xem kết quả
          </Button>
        );
      },
    },
  ];

  return (
    <div className="max-w-6xl mx-auto w-full px-4 space-y-6 flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Title level={3} className="!m-0 text-slate-800 font-extrabold flex items-center gap-2">
            <AuditOutlined className="text-blue-600" /> Bài kiểm tra năng lực của tôi
          </Title>
          <Text className="text-xs sm:text-sm text-slate-500 block mt-1">
            Danh sách các bài kiểm tra chuyên môn do nhà tuyển dụng giao trong quy trình ứng tuyển
          </Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchCandidateTests} className="h-9 rounded-lg">
          Làm mới
        </Button>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card size="small" className="border-slate-100 shadow-2xs rounded-xl">
          <span className="text-xs text-slate-500 block">Tổng số bài được giao</span>
          <span className="text-xl font-extrabold text-slate-800">{summary.total}</span>
        </Card>
        <Card size="small" className="border-slate-100 shadow-2xs rounded-xl">
          <span className="text-xs text-slate-500 block">Đang làm dở</span>
          <span className="text-xl font-extrabold text-blue-600">{summary.inProgress}</span>
        </Card>
        <Card size="small" className="border-slate-100 shadow-2xs rounded-xl">
          <span className="text-xs text-slate-500 block">Đã hoàn thành</span>
          <span className="text-xl font-extrabold text-indigo-600">{summary.completed}</span>
        </Card>
        <Card size="small" className="border-slate-100 shadow-2xs rounded-xl">
          <span className="text-xs text-slate-500 block">Đạt yêu cầu</span>
          <span className="text-xl font-extrabold text-emerald-600">{summary.passed}</span>
        </Card>
      </div>

      {/* Thanh tìm kiếm và lọc */}
      <Card className="border-slate-100 shadow-2xs rounded-xl" styles={{ body: { padding: "12px 16px" } }}>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <Input
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="Tìm theo tên bài kiểm tra, công ty hoặc vị trí ứng tuyển..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            allowClear
            className="sm:max-w-md"
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 190 }}
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "not_started", label: "Chưa bắt đầu" },
              { value: "in_progress", label: "Đang làm dở" },
              { value: "completed", label: "Đã hoàn thành" },
              { value: "expired", label: "Đã hết hạn" },
            ]}
          />
        </div>
      </Card>

      {error && (
        <Alert
          type="error"
          showIcon
          message="Không thể tải danh sách bài kiểm tra"
          description={error}
          action={
            <Button size="small" danger onClick={fetchCandidateTests}>
              Thử lại
            </Button>
          }
        />
      )}

      <Card className="border-slate-100 shadow-sm rounded-xl">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Spin tip="Đang tải danh sách bài kiểm tra năng lực..." />
          </div>
        ) : filteredTests.length === 0 ? (
          <Empty
            description={
              tests.length === 0
                ? "Hiện tại bạn chưa có bài kiểm tra năng lực nào được giao."
                : "Không tìm thấy bài kiểm tra phù hợp với bộ lọc."
            }
          />
        ) : (
          <Table
            dataSource={filteredTests}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            scroll={{ x: 860 }}
          />
        )}
      </Card>
    </div>
  );
}
