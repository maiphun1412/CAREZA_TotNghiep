"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiClient } from "@/services/api-client";
import { Card, Table, Tag, Button, Empty, Spin, message, Typography } from "antd";
import { RightOutlined, SendOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function CandidateApplicationsPage() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get("/candidate/applications");
        const list = response.data?.data?.applications || [];
        setApplications(
          list.map((app: any) => ({
            key: app.applicationId,
            jobTitle: app.jobPostTitle || app.title,
            companyName: app.companyName,
            appliedAt: new Date(app.appliedAt).toLocaleDateString("vi-VN"),
            stage: app.currentStage,
            status: app.applicationStatus, // 1 = ACTIVE, 2 = WITHDRAWN, 3 = REJECTED, 4 = HIRED
          }))
        );
      } catch (error) {
        // Fallback
        setApplications([
          {
            key: "app-1",
            jobTitle: "Senior Fullstack Engineer (React / NestJS)",
            companyName: "VNG Corporation",
            appliedAt: "09/08/2026",
            stage: 1,
            status: 1,
          },
          {
            key: "app-2",
            jobTitle: "UI/UX Designer (Mobile & Web App)",
            companyName: "MOMO FinTech",
            appliedAt: "05/08/2026",
            stage: 3,
            status: 1,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusTag = (status: number) => {
    if (status === 2) return <Tag color="default" className="rounded-md">Đã rút đơn</Tag>;
    if (status === 3) return <Tag color="red" className="rounded-md">Bị từ chối</Tag>;
    if (status === 4) return <Tag color="green" className="rounded-md">Đã nhận việc</Tag>;
    return <Tag color="blue" className="rounded-md">Đang xử lý</Tag>;
  };

  const getStageTag = (stage: number) => {
    let stageLabel = "Nộp hồ sơ";
    let color = "blue";
    if (stage === 2) { stageLabel = "Làm bài test"; color = "purple"; }
    else if (stage === 3) { stageLabel = "Phỏng vấn"; color = "orange"; }
    else if (stage === 4) { stageLabel = "Thư nhận việc"; color = "cyan"; }
    else if (stage === 5) { stageLabel = "Hội nhập"; color = "green"; }

    return <Tag color={color} className="rounded-md font-medium text-xs py-0.5 px-2">{stageLabel}</Tag>;
  };

  const columns = [
    {
      title: "Công việc đã ứng tuyển",
      dataIndex: "jobTitle",
      key: "jobTitle",
      render: (text: string, record: any) => (
        <div>
          <span className="font-bold text-slate-800 text-sm sm:text-base block">{text}</span>
          <span className="text-xs text-slate-500 block mt-1">{record.companyName}</span>
        </div>
      ),
    },
    {
      title: "Ngày nộp",
      dataIndex: "appliedAt",
      key: "appliedAt",
      width: 130,
      render: (text: string) => <span className="text-xs text-slate-500">{text}</span>,
    },
    {
      title: "Vòng hiện tại",
      dataIndex: "stage",
      key: "stage",
      width: 150,
      render: (stage: number, record: any) => {
        if (record.status !== 1) return "-";
        return getStageTag(stage);
      },
    },
    {
      title: "Trạng thái đơn",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: number) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 110,
      render: (_: any, record: any) => (
        <Link href={`/ung-vien/ung-tuyen/${record.key}`}>
          <Button type="link" size="small" className="text-blue-600 hover:text-blue-700 font-semibold p-0 flex items-center gap-1">
            Chi tiết đơn <RightOutlined className="text-[10px]" />
          </Button>
        </Link>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40 flex-1">
        <Spin size="large" description="Đang tải lịch sử ứng tuyển..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 flex-1 flex flex-col">
      {/* Header */}
      <div>
        <Title level={3} className="m-0 text-slate-800 font-extrabold">Lịch sử ứng tuyển</Title>
        <Text type="secondary" className="text-xs">Xem lại các đơn ứng tuyển và cập nhật tiến trình tuyển dụng từ nhà tuyển dụng</Text>
      </div>

      <Card className="border-slate-100 shadow-sm flex-1" style={{ borderRadius: 12 }}>
        {applications.length === 0 ? (
          <Empty
            description="Bạn chưa nộp hồ sơ ứng tuyển nào."
            image={<SendOutlined className="text-slate-200 text-5xl mb-3" />}
          >
            <Link href="/viec-lam">
              <Button type="primary" className="bg-blue-600 hover:bg-blue-700">Tìm việc làm ngay</Button>
            </Link>
          </Empty>
        ) : (
          <Table
            dataSource={applications}
            columns={columns}
            pagination={{ pageSize: 8 }}
            className="custom-table"
          />
        )}
      </Card>
    </div>
  );
}
