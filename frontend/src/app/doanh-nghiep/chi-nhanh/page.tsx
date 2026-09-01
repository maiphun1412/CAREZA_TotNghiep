"use client";

import { useState } from "react";
import { Card, Table, Button, Modal, Form, Input, Space, message, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const MOCK_BRANCHES = [
  { key: "br-1", branchName: "Chi nhánh Hồ Chí Minh", address: "VNG Campus, Quận 7, TP. Hồ Chí Minh", phone: "028 1234 5678" },
  { key: "br-2", branchName: "Chi nhánh Hà Nội", address: "FPT Tower, Cầu Giấy, Hà Nội", phone: "024 8765 4321" },
];

export default function EmployerBranchesPage() {
  const [branches, setBranches] = useState(MOCK_BRANCHES);
  const [isOpen, setIsOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [form] = Form.useForm();

  const handleOpenModal = (branch: any = null) => {
    setEditingBranch(branch);
    if (branch) {
      form.setFieldsValue(branch);
    } else {
      form.resetFields();
    }
    setIsOpen(true);
  };

  const handleSave = (values: any) => {
    if (editingBranch) {
      setBranches(
        branches.map((b) => (b.key === editingBranch.key ? { ...b, ...values } : b))
      );
      message.success("Cập nhật chi nhánh thành công!");
    } else {
      const newBranch = {
        key: `br-${Date.now()}`,
        ...values,
      };
      setBranches([...branches, newBranch]);
      message.success("Thêm chi nhánh thành công!");
    }
    setIsOpen(false);
  };

  const handleDelete = (key: string) => {
    setBranches(branches.filter((b) => b.key !== key));
    message.success("Xóa chi nhánh thành công!");
  };

  const columns = [
    { title: "Tên chi nhánh", dataIndex: "branchName", key: "branchName", render: (text: string) => <span className="font-bold text-slate-800 text-xs sm:text-sm">{text}</span> },
    { title: "Địa chỉ", dataIndex: "address", key: "address", render: (text: string) => <span className="text-xs text-slate-500">{text}</span> },
    { title: "Số điện thoại liên hệ", dataIndex: "phone", key: "phone", render: (text: string) => <span className="text-xs text-slate-500">{text}</span> },
    {
      title: "Thao tác",
      key: "action",
      width: 140,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} className="text-slate-400 hover:text-blue-600 p-1 text-xs" />
          <Popconfirm
            title="Xóa chi nhánh"
            description="Bạn có chắc chắn muốn xóa chi nhánh này?"
            onConfirm={() => handleDelete(record.key)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} className="p-1 text-xs" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-8 flex-1">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="m-0 text-slate-800 font-extrabold text-xl sm:text-2xl">Quản lý chi nhánh</h3>
          <span className="text-xs text-slate-500 block mt-1">Quản lý mạng lưới chi nhánh và văn phòng làm việc của doanh nghiệp</span>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)} className="bg-blue-600 hover:bg-blue-700 h-10 font-semibold text-xs rounded-lg">
          Thêm chi nhánh
        </Button>
      </div>

      <Card className="border-slate-100 shadow-sm" style={{ borderRadius: 12 }}>
        <Table dataSource={branches} columns={columns} pagination={false} />
      </Card>

      {/* Modal Thêm/Sửa */}
      <Modal
        title={editingBranch ? "Sửa chi nhánh" : "Thêm chi nhánh mới"}
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={null}
        width={450}
      >
        <Form layout="vertical" form={form} onFinish={handleSave} requiredMark={false} className="pt-4">
          <Form.Item label="Tên chi nhánh" name="branchName" rules={[{ required: true, message: "Nhập tên chi nhánh!" }]}>
            <Input placeholder="Ví dụ: Chi nhánh Hồ Chí Minh" size="large" />
          </Form.Item>
          <Form.Item label="Địa chỉ chi tiết" name="address" rules={[{ required: true, message: "Nhập địa chỉ!" }]}>
            <Input placeholder="Số nhà, Tên đường, Quận/Huyện..." size="large" />
          </Form.Item>
          <Form.Item label="Số điện thoại liên hệ" name="phone">
            <Input placeholder="Ví dụ: 028 1234 5678" size="large" />
          </Form.Item>
          <Form.Item className="text-right mb-0">
            <Space>
              <Button onClick={() => setIsOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" className="bg-blue-600">Lưu lại</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
