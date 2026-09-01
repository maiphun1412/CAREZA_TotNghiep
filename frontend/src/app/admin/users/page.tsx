"use client";

import { useState } from "react";
import { Card, Table, Tag, Button, Space, message, Input } from "antd";
import { SearchOutlined, LockOutlined, UnlockOutlined } from "@ant-design/icons";

const MOCK_USERS = [
  { key: "u-1", fullName: "Nguyễn Văn A", email: "nguyenvana@gmail.com", role: "CANDIDATE", status: "ACTIVE" },
  { key: "u-2", fullName: "Lê Minh B", email: "leminhb@test.com", role: "EMPLOYER", status: "ACTIVE" },
  { key: "u-3", fullName: "Phạm Thị C", email: "phamthic@test.com", role: "EMPLOYER", status: "BLOCKED" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [keyword, setKeyword] = useState("");

  const handleToggleStatus = (key: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    setUsers(
      users.map((u) => (u.key === key ? { ...u, status: nextStatus } : u))
    );
    message.success(nextStatus === "ACTIVE" ? "Đã mở khóa tài khoản!" : "Đã khóa tài khoản thành công!");
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(keyword.toLowerCase()) ||
      u.email.toLowerCase().includes(keyword.toLowerCase())
  );

  const getRoleTag = (role: string) => {
    if (role === "CANDIDATE") return <Tag color="blue" className="rounded-md">Ứng viên</Tag>;
    if (role === "EMPLOYER") return <Tag color="purple" className="rounded-md">Nhà tuyển dụng</Tag>;
    return <Tag color="red" className="rounded-md">Quản trị viên</Tag>;
  };

  const getStatusTag = (status: string) => {
    if (status === "ACTIVE") return <Tag color="green" className="rounded-md">Hoạt động</Tag>;
    return <Tag color="red" className="rounded-md">Đã khóa</Tag>;
  };

  const columns = [
    { title: "Họ và tên", dataIndex: "fullName", key: "fullName", render: (text: string) => <span className="font-bold text-slate-800 text-xs sm:text-sm">{text}</span> },
    { title: "Email", dataIndex: "email", key: "email", render: (text: string) => <span className="text-xs text-slate-500">{text}</span> },
    { title: "Vai trò", dataIndex: "role", key: "role", render: (role: string) => getRoleTag(role) },
    { title: "Trạng thái", dataIndex: "status", key: "status", render: (status: string) => getStatusTag(status) },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      render: (_: any, record: any) => (
        <Button
          type="text"
          danger={record.status === "ACTIVE"}
          icon={record.status === "ACTIVE" ? <LockOutlined /> : <UnlockOutlined />}
          onClick={() => handleToggleStatus(record.key, record.status)}
          className="text-xs font-semibold"
        >
          {record.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8 flex-1">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="m-0 text-slate-800 font-extrabold text-xl sm:text-2xl">Quản lý người dùng</h3>
          <span className="text-xs text-slate-500 block mt-1">Giám sát tài khoản ứng viên và nhà tuyển dụng trên hệ thống</span>
        </div>
        <Input
          placeholder="Tìm theo họ tên, email..."
          prefix={<SearchOutlined className="text-slate-400" />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="max-w-xs h-10 rounded-lg"
        />
      </div>

      <Card className="border-slate-100 shadow-sm" style={{ borderRadius: 12 }}>
        <Table dataSource={filteredUsers} columns={columns} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
}
