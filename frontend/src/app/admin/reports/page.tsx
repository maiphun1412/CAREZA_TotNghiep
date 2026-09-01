"use client";

import { useState } from "react";
import { Card, Table, Tag, Button, Space, message, Popconfirm } from "antd";
import { CheckCircleOutlined, AlertOutlined } from "@ant-design/icons";

const MOCK_REPORTS = [
  { key: "rep-1", reporter: "Nguyễn Văn A", reportedItem: "Senior Fullstack Engineer", companyName: "VNG Corporation", reason: "Tin tuyển dụng yêu cầu nộp phí đặt cọc vô lý", status: "PENDING" },
  { key: "rep-2", reporter: "Lê Minh B", reportedItem: "Product Manager - AI Platform", companyName: "FPT Software", reason: "Nội dung spam quảng cáo khóa học", status: "RESOLVED" },
];

export default function AdminReportsPage() {
  const [reports, setReports] = useState(MOCK_REPORTS);

  const handleResolve = (key: string) => {
    setReports(
      reports.map((rep) => (rep.key === key ? { ...rep, status: "RESOLVED" } : rep))
    );
    message.success("Đã xử lý báo cáo vi phạm thành công!");
  };

  const getStatusTag = (status: string) => {
    if (status === "RESOLVED") return <Tag color="green" className="rounded-md">Đã xử lý</Tag>;
    return <Tag color="orange" className="rounded-md">Đang chờ</Tag>;
  };

  const columns = [
    { title: "Người báo cáo", dataIndex: "reporter", key: "reporter", width: 150, render: (text: string) => <span className="font-semibold text-slate-700 text-xs sm:text-sm">{text}</span> },
    {
      title: "Tin đăng bị báo cáo",
      dataIndex: "reportedItem",
      key: "reportedItem",
      render: (text: string, record: any) => (
        <div>
          <span className="font-bold text-slate-800 text-xs sm:text-sm block">{text}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Doanh nghiệp: {record.companyName}</span>
        </div>
      ),
    },
    { title: "Lý do báo cáo vi phạm", dataIndex: "reason", key: "reason", render: (text: string) => <span className="text-xs text-slate-500">{text}</span> },
    { title: "Trạng thái", dataIndex: "status", key: "status", width: 120, render: (status: string) => getStatusTag(status) },
    {
      title: "Xử lý",
      key: "action",
      width: 140,
      render: (_: any, record: any) => {
        if (record.status === "PENDING") {
          return (
            <Popconfirm
              title="Đánh dấu đã xử lý"
              description="Bạn đã kiểm tra và xác nhận tin đăng không vi phạm hoặc đã xử lý ẩn tin đăng vi phạm?"
              onConfirm={() => handleResolve(record.key)}
              okText="Đã xong"
              cancelText="Hủy"
            >
              <Button type="text" icon={<CheckCircleOutlined />} className="text-green-600 hover:text-green-700 text-xs font-semibold">
                Giải quyết
              </Button>
            </Popconfirm>
          );
        }
        return <span className="text-xs text-slate-400 font-medium">Đã xử lý</span>;
      },
    },
  ];

  return (
    <div className="space-y-8 flex-1">
      <div>
        <h3 className="m-0 text-slate-800 font-extrabold text-xl sm:text-2xl flex items-center gap-2">
          <AlertOutlined className="text-red-500" /> Báo cáo vi phạm
        </h3>
        <span className="text-xs text-slate-500 block mt-1">Xử lý các báo cáo vi phạm tiêu chuẩn cộng đồng và nội dung tuyển dụng từ người dùng</span>
      </div>

      <Card className="border-slate-100 shadow-sm" style={{ borderRadius: 12 }}>
        <Table dataSource={reports} columns={columns} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
}
