"use client";

import { useState } from "react";
import { Card, Table, Tag, Button, Space, message, Input, Popconfirm } from "antd";
import { SearchOutlined, CloseCircleOutlined } from "@ant-design/icons";

const MOCK_JOBS = [
  { key: "j-1", title: "Senior Fullstack Engineer (React / NestJS)", companyName: "VNG Corporation", status: "PUBLISHED", expiredAt: "15/09/2026" },
  { key: "j-2", title: "Product Manager - AI Platform", companyName: "FPT Software", status: "PUBLISHED", expiredAt: "10/09/2026" },
  { key: "j-3", title: "UI/UX Designer (Mobile & Web App)", companyName: "MOMO FinTech", status: "CLOSED", expiredAt: "30/08/2026" },
];

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [keyword, setKeyword] = useState("");

  const handleCloseJob = (key: string) => {
    setJobs(
      jobs.map((j) => (j.key === key ? { ...j, status: "CLOSED" } : j))
    );
    message.success("Đã khóa tin tuyển dụng thành công!");
  };

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(keyword.toLowerCase()) ||
      j.companyName.toLowerCase().includes(keyword.toLowerCase())
  );

  const getStatusTag = (status: string) => {
    if (status === "PUBLISHED") return <Tag color="green" className="rounded-md">Đang hiển thị</Tag>;
    return <Tag color="red" className="rounded-md">Đã đóng/Khóa</Tag>;
  };

  const columns = [
    { title: "Tin tuyển dụng", dataIndex: "title", key: "title", render: (text: string) => <span className="font-bold text-slate-800 text-xs sm:text-sm block">{text}</span> },
    { title: "Doanh nghiệp đăng", dataIndex: "companyName", key: "companyName", render: (text: string) => <span className="text-xs text-blue-600 font-semibold">{text}</span> },
    { title: "Hạn nộp", dataIndex: "expiredAt", key: "expiredAt", render: (text: string) => <span className="text-xs text-slate-500">{text}</span> },
    { title: "Trạng thái", dataIndex: "status", key: "status", render: (status: string) => getStatusTag(status) },
    {
      title: "Hành động",
      key: "action",
      width: 140,
      render: (_: any, record: any) => {
        if (record.status === "PUBLISHED") {
          return (
            <Popconfirm
              title="Khóa tin tuyển dụng"
              description="Bạn có chắc muốn đóng/khóa hiển thị tin tuyển dụng này?"
              onConfirm={() => handleCloseJob(record.key)}
              okText="Đồng ý"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger icon={<CloseCircleOutlined />} className="text-xs font-semibold">
                Khóa tin đăng
              </Button>
            </Popconfirm>
          );
        }
        return <span className="text-xs text-slate-400">Đã khóa</span>;
      },
    },
  ];

  return (
    <div className="space-y-8 flex-1">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="m-0 text-slate-800 font-extrabold text-xl sm:text-2xl">Quản lý Tin tuyển dụng</h3>
          <span className="text-xs text-slate-500 block mt-1">Giám sát các tin tuyển dụng được đăng tải trên hệ thống CAREZA</span>
        </div>
        <Input
          placeholder="Tìm theo tiêu đề, tên doanh nghiệp..."
          prefix={<SearchOutlined className="text-slate-400" />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="max-w-xs h-10 rounded-lg"
        />
      </div>

      <Card className="border-slate-100 shadow-sm" style={{ borderRadius: 12 }}>
        <Table dataSource={filtered} columns={columns} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
}
