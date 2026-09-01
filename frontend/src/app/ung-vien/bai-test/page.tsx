"use client";

import { useState } from "react";
import { Card, Table, Tag, Button, Empty } from "antd";
import { RightOutlined, SolutionOutlined } from "@ant-design/icons";

const MOCK_TESTS = [
  {
    key: "test-1",
    testName: "Bài test ReactJS & Frontend Core",
    companyName: "VNG Corporation",
    duration: 40, // 40 phút
    deadline: "12/08/2026",
    status: "PENDING", // PENDING, COMPLETED, EXPIRED
    score: null,
  },
  {
    key: "test-2",
    testName: "Kiểm tra tư duy Logic & Thuật toán",
    companyName: "FPT Software",
    duration: 30,
    deadline: "05/08/2026",
    status: "COMPLETED",
    score: 8.5,
  },
];

export default function CandidateTestsPage() {
  const [tests] = useState(MOCK_TESTS);

  const columns = [
    {
      title: "Bài test tuyển dụng",
      dataIndex: "testName",
      key: "testName",
      render: (text: string, record: any) => (
        <div>
          <span className="font-bold text-slate-800 text-sm block">{text}</span>
          <span className="text-xs text-slate-500 block mt-1">{record.companyName}</span>
        </div>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "duration",
      key: "duration",
      width: 120,
      render: (val: number) => <span className="text-xs text-slate-500">{val} phút</span>,
    },
    {
      title: "Hạn làm bài",
      dataIndex: "deadline",
      key: "deadline",
      width: 130,
      render: (text: string) => <span className="text-xs text-slate-500">{text}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: string, record: any) => {
        if (status === "COMPLETED") {
          return <Tag color="green" className="rounded-md">Hoàn thành ({record.score}/10)</Tag>;
        }
        if (status === "EXPIRED") {
          return <Tag color="default" className="rounded-md">Đã hết hạn</Tag>;
        }
        return <Tag color="orange" className="rounded-md">Chưa làm</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 110,
      render: (_: any, record: any) => {
        if (record.status === "PENDING") {
          return (
            <Button type="primary" size="small" className="bg-blue-600 hover:bg-blue-700 font-semibold text-xs h-8">
              Làm bài
            </Button>
          );
        }
        return (
          <Button type="link" size="small" disabled className="text-slate-400 p-0 text-xs">
            Xem lại
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-8 flex-1">
      <div>
        <h3 className="m-0 text-slate-800 font-extrabold text-xl sm:text-2xl">Bài test tuyển dụng</h3>
        <span className="text-xs text-slate-500 block mt-1">Đánh giá năng lực của bạn thông qua các bài test chuyên môn</span>
      </div>

      <Card className="border-slate-100 shadow-sm" style={{ borderRadius: 12 }}>
        {tests.length === 0 ? (
          <Empty description="Bạn không có lời mời làm bài test nào." />
        ) : (
          <Table dataSource={tests} columns={columns} pagination={false} />
        )}
      </Card>
    </div>
  );
}
