"use client";

import { useState } from "react";
import { Card, Table, Tag, Button, Space, message, Input } from "antd";
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const MOCK_COMPANIES = [
  { key: "c-1", name: "VNG Corporation", taxCode: "0303886556", status: "VERIFIED" },
  { key: "c-2", name: "Công nghệ số TechHub", taxCode: "0109876543", status: "PENDING" },
  { key: "c-3", name: "Giải pháp nhân sự HRTech", taxCode: "0305678901", status: "REJECTED" },
];

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState(MOCK_COMPANIES);
  const [keyword, setKeyword] = useState("");

  const handleVerify = (key: string, status: "VERIFIED" | "REJECTED") => {
    setCompanies(
      companies.map((c) => (c.key === key ? { ...c, status } : c))
    );
    message.success(status === "VERIFIED" ? "Đã phê duyệt xác minh doanh nghiệp!" : "Đã từ chối xác minh.");
  };

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(keyword.toLowerCase()) ||
      c.taxCode.includes(keyword)
  );

  const getStatusTag = (status: string) => {
    if (status === "VERIFIED") return <Tag color="green" className="rounded-md">Đã xác minh</Tag>;
    if (status === "REJECTED") return <Tag color="red" className="rounded-md">Từ chối</Tag>;
    return <Tag color="orange" className="rounded-md">Chờ phê duyệt</Tag>;
  };

  const columns = [
    { title: "Doanh nghiệp", dataIndex: "name", key: "name", render: (text: string) => <span className="font-bold text-slate-800 text-xs sm:text-sm">{text}</span> },
    { title: "Mã số thuế", dataIndex: "taxCode", key: "taxCode", render: (text: string) => <span className="text-xs text-slate-500">{text}</span> },
    { title: "Trạng thái xác minh", dataIndex: "status", key: "status", render: (status: string) => getStatusTag(status) },
    {
      title: "Hành động",
      key: "action",
      width: 200,
      render: (_: any, record: any) => {
        if (record.status === "PENDING") {
          return (
            <Space size="small">
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleVerify(record.key, "VERIFIED")}
                className="bg-green-600 hover:bg-green-700 text-xs font-semibold h-8 border-none"
              >
                Duyệt
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleVerify(record.key, "REJECTED")}
                className="text-xs font-semibold h-8"
              >
                Từ chối
              </Button>
            </Space>
          );
        }
        return <span className="text-xs text-slate-400">Đã xử lý</span>;
      },
    },
  ];

  return (
    <div className="space-y-8 flex-1">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="m-0 text-slate-800 font-extrabold text-xl sm:text-2xl">Xác minh Doanh nghiệp</h3>
          <span className="text-xs text-slate-500 block mt-1">Duyệt giấy phép kinh doanh và cấp quyền hoạt động tuyển dụng cho doanh nghiệp</span>
        </div>
        <Input
          placeholder="Tìm theo tên công ty, mã số thuế..."
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
