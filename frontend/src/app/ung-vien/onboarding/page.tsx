"use client";

import { useState } from "react";
import { Card, Table, Tag, Checkbox, message, Empty } from "antd";
import { CalendarOutlined, SmileOutlined } from "@ant-design/icons";

const MOCK_ONBOARDING_TASKS = [
  {
    key: "task-1",
    taskName: "Đọc quy chế công ty & Thỏa thuận bảo mật (NDA)",
    description: "Tải và đọc kỹ file quy chế công ty đính kèm trước ngày đi làm.",
    dueDate: "25/08/2026",
    status: "TODO", // TODO, COMPLETED
    isRequired: true,
  },
  {
    key: "task-2",
    taskName: "Nộp hồ sơ nhân sự bản mềm",
    description: "Gồm bằng tốt nghiệp, chứng minh nhân dân/CCCD scan dạng PDF.",
    dueDate: "28/08/2026",
    status: "TODO",
    isRequired: true,
  },
];

export default function CandidateOnboardingPage() {
  const [tasks, setTasks] = useState(MOCK_ONBOARDING_TASKS);

  const handleToggleTask = (id: string, checked: boolean) => {
    setTasks(
      tasks.map((task) =>
        task.key === id ? { ...task, status: checked ? "COMPLETED" : "TODO" } : task
      )
    );
    message.success(checked ? "Đã đánh dấu hoàn thành nhiệm vụ!" : "Đã hủy đánh dấu hoàn thành.");
  };

  const columns = [
    {
      title: "Nhiệm vụ hội nhập",
      dataIndex: "taskName",
      key: "taskName",
      render: (text: string, record: any) => (
        <div>
          <span className="font-bold text-slate-800 text-sm block">{text}</span>
          <span className="text-xs text-slate-500 block mt-1">{record.description}</span>
        </div>
      ),
    },
    {
      title: "Hạn hoàn thành",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 150,
      render: (text: string) => (
        <span className="text-xs text-slate-500">
          <CalendarOutlined className="mr-1" /> {text}
        </span>
      ),
    },
    {
      title: "Bắt buộc",
      dataIndex: "isRequired",
      key: "isRequired",
      width: 110,
      render: (req: boolean) => (
        <Tag color={req ? "red" : "default"} className="rounded-md">
          {req ? "Bắt buộc" : "Tùy chọn"}
        </Tag>
      ),
    },
    {
      title: "Hoàn thành",
      key: "action",
      width: 120,
      render: (_: any, record: any) => (
        <Checkbox
          checked={record.status === "COMPLETED"}
          onChange={(e) => handleToggleTask(record.key, e.target.checked)}
        >
          <span className="text-xs">Đã xong</span>
        </Checkbox>
      ),
    },
  ];

  return (
    <div className="space-y-8 flex-1">
      <div>
        <h3 className="m-0 text-slate-800 font-extrabold text-xl sm:text-2xl">Đào tạo hội nhập (Onboarding)</h3>
        <span className="text-xs text-slate-500 block mt-1">Chuẩn bị các thủ tục, hồ sơ và tìm hiểu văn hóa công ty trước khi chính thức nhận việc</span>
      </div>

      <Card className="border-slate-100 shadow-sm" style={{ borderRadius: 12 }}>
        {tasks.length === 0 ? (
          <Empty description="Bạn chưa có quy trình Onboarding nào được khởi động." />
        ) : (
          <Table dataSource={tasks} columns={columns} pagination={false} />
        )}
      </Card>
    </div>
  );
}
