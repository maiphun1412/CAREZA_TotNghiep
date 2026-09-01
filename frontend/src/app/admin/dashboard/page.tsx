"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Row, Col, Space, Typography, Table, Tag, Button, message } from "antd";
import {
  UserOutlined,
  BankOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const MOCK_STATS = {
  totalCandidates: 1250,
  totalCompanies: 85,
  activeJobs: 242,
};

const MOCK_PENDING_COMPANIES = [
  {
    key: "co-1",
    name: "Công nghệ số TechHub",
    taxCode: "0109876543",
    email: "contact@techhub.vn",
    appliedAt: "09/08/2026",
    status: "PENDING",
  },
  {
    key: "co-2",
    name: "Giải pháp nhân sự HRTech",
    taxCode: "0305678901",
    email: "hr@hrtech.com",
    appliedAt: "08/08/2026",
    status: "PENDING",
  },
];

export default function AdminDashboardPage() {
  const [companies, setCompanies] = useState(MOCK_PENDING_COMPANIES);

  const handleApprove = (key: string, name: string) => {
    setCompanies(companies.filter((c) => c.key !== key));
    message.success(`Đã phê duyệt doanh nghiệp: ${name}`);
  };

  const handleReject = (key: string, name: string) => {
    setCompanies(companies.filter((c) => c.key !== key));
    message.warning(`Đã từ chối doanh nghiệp: ${name}`);
  };

  const columns = [
    { title: "Tên doanh nghiệp", dataIndex: "name", key: "name", render: (text: string) => <span className="font-bold text-slate-800 text-xs sm:text-sm">{text}</span> },
    { title: "Mã số thuế", dataIndex: "taxCode", key: "taxCode", render: (text: string) => <span className="text-xs text-slate-500">{text}</span> },
    { title: "Email liên hệ", dataIndex: "email", key: "email", render: (text: string) => <span className="text-xs text-slate-500">{text}</span> },
    { title: "Ngày đăng ký", dataIndex: "appliedAt", key: "appliedAt", render: (text: string) => <span className="text-xs text-slate-400">{text}</span> },
    {
      title: "Hành động phê duyệt",
      key: "action",
      width: 200,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleApprove(record.key, record.name)}
            className="bg-green-600 hover:bg-green-700 text-xs font-semibold h-8 border-none"
          >
            Duyệt
          </Button>
          <Button
            danger
            size="small"
            icon={<CloseCircleOutlined />}
            onClick={() => handleReject(record.key, record.name)}
            className="text-xs font-semibold h-8"
          >
            Từ chối
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-8 flex-1">
      <div>
        <h3 className="m-0 text-slate-800 font-extrabold text-xl sm:text-2xl">Tổng quan Hệ thống Admin</h3>
        <span className="text-xs text-slate-500 block mt-1">Giám sát các chỉ số hoạt động và kiểm duyệt thông tin doanh nghiệp</span>
      </div>

      {/* Stats Cards */}
      <Row gutter={[20, 20]}>
        <Col xs={24} sm={8}>
          <Card className="border-slate-100 shadow-sm" style={{ borderRadius: 10 }}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl text-lg flex items-center justify-center">
                <UserOutlined />
              </div>
              <div>
                <Text type="secondary" className="text-xs block">Tổng ứng viên</Text>
                <span className="text-xl font-bold text-slate-800 block mt-0.5">{MOCK_STATS.totalCandidates}</span>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="border-slate-100 shadow-sm" style={{ borderRadius: 10 }}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl text-lg flex items-center justify-center">
                <BankOutlined />
              </div>
              <div>
                <Text type="secondary" className="text-xs block">Doanh nghiệp đã xác minh</Text>
                <span className="text-xl font-bold text-slate-800 block mt-0.5">{MOCK_STATS.totalCompanies}</span>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="border-slate-100 shadow-sm" style={{ borderRadius: 10 }}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl text-lg flex items-center justify-center">
                <FileTextOutlined />
              </div>
              <div>
                <Text type="secondary" className="text-xs block">Tin tuyển dụng đang mở</Text>
                <span className="text-xl font-bold text-slate-800 block mt-0.5">{MOCK_STATS.activeJobs}</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Doanh nghiệp chờ duyệt */}
      <Card title="Yêu cầu phê duyệt xác minh doanh nghiệp" className="border-slate-100 shadow-sm" style={{ borderRadius: 12 }}>
        {companies.length === 0 ? (
          <div className="py-8 text-center text-slate-400">Không có yêu cầu phê duyệt mới</div>
        ) : (
          <Table dataSource={companies} columns={columns} pagination={false} />
        )}
      </Card>
    </div>
  );
}
