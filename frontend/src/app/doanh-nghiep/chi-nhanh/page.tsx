"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, Table, Button, Modal, Form, Input, Space, message, Popconfirm, Spin, Alert, Empty } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import { employerService } from "@/services/employer.service";

interface BranchItem {
  id: number;
  key: string;
  branchName: string;
  address: string;
  phone?: string;
}

export default function EmployerBranchesPage() {
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null);
  const [form] = Form.useForm();

  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await employerService.getBranches();
      const list = res.data?.branches || [];
      const mapped = list.map((b: any) => ({
        id: b.id,
        key: String(b.id),
        branchName: b.name || "",
        address: b.address || "",
        phone: b.phone || "",
      }));
      setBranches(mapped);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Không thể tải danh sách chi nhánh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleOpenModal = (branch: BranchItem | null = null) => {
    setEditingBranch(branch);
    if (branch) {
      form.setFieldsValue({
        branchName: branch.branchName,
        address: branch.address,
        phone: branch.phone,
      });
    } else {
      form.resetFields();
    }
    setIsOpen(true);
  };

  const handleSave = async (values: any) => {
    try {
      setSubmitting(true);
      if (editingBranch) {
        await employerService.updateBranch(editingBranch.id, {
          name: values.branchName,
          address: values.address,
        });
        message.success("Cập nhật chi nhánh thành công!");
      } else {
        await employerService.createBranch({
          name: values.branchName,
          address: values.address,
        });
        message.success("Thêm chi nhánh thành công!");
      }
      setIsOpen(false);
      fetchBranches();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.name?.[0] || "Thao tác thất bại.";
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await employerService.deleteBranch(id);
      message.success("Xóa chi nhánh thành công!");
      fetchBranches();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Không thể xóa chi nhánh.";
      message.error(msg);
    }
  };

  const columns = [
    {
      title: "Tên chi nhánh",
      dataIndex: "branchName",
      key: "branchName",
      render: (text: string) => <span className="font-bold text-slate-800 text-xs sm:text-sm">{text}</span>,
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      render: (text: string) => <span className="text-xs text-slate-600">{text || "Chưa cập nhật"}</span>,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 140,
      render: (_: any, record: BranchItem) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
            className="text-slate-400 hover:text-blue-600 p-1 text-xs"
          />
          <Popconfirm
            title="Xóa chi nhánh"
            description="Bạn có chắc chắn muốn xóa chi nhánh này?"
            onConfirm={() => handleDelete(record.id)}
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
          <span className="text-xs text-slate-500 block mt-1">
            Quản lý mạng lưới chi nhánh và văn phòng làm việc của doanh nghiệp
          </span>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal(null)}
          className="bg-blue-600 hover:bg-blue-700 h-10 font-semibold text-xs rounded-lg"
        >
          Thêm chi nhánh
        </Button>
      </div>

      {error && (
        <Alert
          type="error"
          message="Lỗi tải dữ liệu"
          description={error}
          action={
            <Button size="small" danger icon={<ReloadOutlined />} onClick={fetchBranches}>
              Tải lại
            </Button>
          }
          showIcon
        />
      )}

      <Card className="border-slate-100 shadow-sm" style={{ borderRadius: 12 }}>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spin tip="Đang tải danh sách chi nhánh..." />
          </div>
        ) : branches.length === 0 ? (
          <Empty
            description="Chưa có chi nhánh nào được tạo"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
              Thêm chi nhánh đầu tiên
            </Button>
          </Empty>
        ) : (
          <Table dataSource={branches} columns={columns} pagination={false} rowKey="id" />
        )}
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
          <Form.Item
            label="Tên chi nhánh"
            name="branchName"
            rules={[{ required: true, message: "Nhập tên chi nhánh!" }]}
          >
            <Input placeholder="Ví dụ: Chi nhánh Hồ Chí Minh" size="large" />
          </Form.Item>
          <Form.Item
            label="Địa chỉ chi tiết"
            name="address"
            rules={[{ required: true, message: "Nhập địa chỉ!" }]}
          >
            <Input placeholder="Số nhà, Tên đường, Quận/Huyện..." size="large" />
          </Form.Item>
          <Form.Item className="text-right mb-0">
            <Space>
              <Button onClick={() => setIsOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitting} className="bg-blue-600">
                Lưu lại
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
