"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Tag,
  Button,
  Switch,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Tabs,
  Space,
  App,
} from "antd";
import { Plus, Edit3, Sparkles, RefreshCw, Ticket, Package } from "lucide-react";
import { adminService } from "@/services/admin.service";

function AdminPackagesContent() {
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState<"plans" | "coupons">("plans");

  // Plans state
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [submittingPlan, setSubmittingPlan] = useState(false);
  const [planForm] = Form.useForm();

  // Coupons state
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [submittingCoupon, setSubmittingCoupon] = useState(false);
  const [couponForm] = Form.useForm();

  const fetchPlans = useCallback(async () => {
    setLoadingPlans(true);
    try {
      const res = await adminService.getBillingPlans();
      setPlans(res?.data?.plans || []);
    } catch {
      message.error("Không thể tải danh sách gói dịch vụ.");
    } finally {
      setLoadingPlans(false);
    }
  }, [message]);

  const fetchCoupons = useCallback(async () => {
    setLoadingCoupons(true);
    try {
      const res = await adminService.getBillingCoupons();
      setCoupons(res?.data?.coupons || []);
    } catch {
      message.error("Không thể tải danh sách mã khuyến mãi.");
    } finally {
      setLoadingCoupons(false);
    }
  }, [message]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    if (activeTab === "coupons") {
      fetchCoupons();
    }
  }, [activeTab, fetchCoupons]);

  const handleOpenCreatePlan = () => {
    setEditingPlan(null);
    planForm.resetFields();
    planForm.setFieldsValue({
      audience: "employer",
      price_vnd: 2500000,
      duration_days: 30,
      job_quota: 15,
      ai_interview_quota: 30,
      is_active: true,
    });
    setPlanModalOpen(true);
  };

  const handleOpenEditPlan = (record: any) => {
    setEditingPlan(record);
    planForm.setFieldsValue({
      name: record.name,
      code: record.code,
      audience: record.audience || "employer",
      price_vnd: record.price_vnd,
      duration_days: record.duration_days ?? 30,
      job_quota: record.job_quota ?? 5,
      ai_interview_quota: record.ai_interview_quota ?? 10,
      is_active: Boolean(record.is_active),
    });
    setPlanModalOpen(true);
  };

  const handleSavePlan = async (values: any) => {
    setSubmittingPlan(true);
    try {
      if (editingPlan) {
        await adminService.updateBillingPlan(editingPlan.id, values);
        message.success(`Đã cập nhật gói dịch vụ "${values.name}"!`);
      } else {
        await adminService.createBillingPlan(values);
        message.success(`Đã tạo gói dịch vụ "${values.name}"!`);
      }
      setPlanModalOpen(false);
      fetchPlans();
    } catch {
      message.error("Không thể lưu gói dịch vụ.");
    } finally {
      setSubmittingPlan(false);
    }
  };

  const handleTogglePlanActive = async (plan: any, checked: boolean) => {
    try {
      await adminService.updateBillingPlan(plan.id, { is_active: checked });
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, is_active: checked } : p))
      );
      message.success(
        checked ? `Đã mở bán gói "${plan.name}"` : `Đã tạm ngưng gói "${plan.name}"`
      );
    } catch {
      message.error("Không thể cập nhật trạng thái gói dịch vụ.");
    }
  };

  const handleSaveCoupon = async (values: any) => {
    setSubmittingCoupon(true);
    try {
      await adminService.createBillingCoupon(values);
      message.success(`Đã tạo mã giảm giá "${values.code.toUpperCase()}"!`);
      setCouponModalOpen(false);
      couponForm.resetFields();
      fetchCoupons();
    } catch {
      message.error("Không thể tạo mã khuyến mãi (có thể trùng mã).");
    } finally {
      setSubmittingCoupon(false);
    }
  };

  const planColumns = [
    {
      title: "Mã gói",
      dataIndex: "code",
      key: "code",
      render: (c: string) => <span className="font-mono font-bold text-slate-600">{c}</span>,
    },
    {
      title: "Tên gói dịch vụ",
      dataIndex: "name",
      key: "name",
      render: (n: string, r: any) => (
        <div>
          <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
            {r.price_vnd >= 5000000 && <Sparkles size={15} className="text-amber-500" />}
            {n}
          </span>
          <Tag color={r.audience === "employer" ? "blue" : "cyan"} className="mt-0.5">
            {r.audience === "employer" ? "Doanh nghiệp" : "Ứng viên"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price_vnd",
      key: "price_vnd",
      render: (p: number) => (
        <span className="font-bold text-[#0062ff]">
          {(p || 0).toLocaleString("vi-VN")} đ
        </span>
      ),
    },
    {
      title: "Thời hạn",
      dataIndex: "duration_days",
      key: "duration_days",
      render: (d: number) => <span>{d || 30} ngày</span>,
    },
    {
      title: "Hạn mức (Quota)",
      key: "quota",
      render: (_: any, r: any) => (
        <div className="space-y-1">
          <Tag color="blue">{r.job_quota ?? 0} tin tuyển dụng</Tag>
          <Tag color="purple">{r.ai_interview_quota ?? 0} lượt AI Phỏng vấn</Tag>
        </div>
      ),
    },
    {
      title: "Đang dùng / Đơn mua",
      key: "subscribers",
      render: (_: any, r: any) => (
        <div className="text-xs text-slate-600">
          <div>
            <strong>{r.active_subscribers_count ?? 0}</strong> thuê bao hoạt động
          </div>
          <div className="text-slate-400">{r.paid_orders_count ?? 0} đơn đã thanh toán</div>
        </div>
      ),
    },
    {
      title: "Mở bán",
      dataIndex: "is_active",
      key: "is_active",
      render: (v: boolean, r: any) => (
        <Switch checked={Boolean(v)} onChange={(chk) => handleTogglePlanActive(r, chk)} />
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "right" as const,
      render: (_: any, r: any) => (
        <Button size="small" icon={<Edit3 size={14} />} onClick={() => handleOpenEditPlan(r)}>
          Chỉnh sửa
        </Button>
      ),
    },
  ];

  const couponColumns = [
    {
      title: "Mã Coupon",
      dataIndex: "code",
      key: "code",
      render: (c: string) => <Tag color="geekblue" className="font-mono font-bold">{c}</Tag>,
    },
    {
      title: "Mức giảm giá",
      dataIndex: "discount_percent",
      key: "discount_percent",
      render: (d: number) => <span className="font-bold text-emerald-600">-{d}%</span>,
    },
    {
      title: "Lượt sử dụng",
      key: "uses",
      render: (_: any, r: any) => (
        <span>
          {r.used_count ?? 0} / {r.max_uses ?? 100}
        </span>
      ),
    },
    {
      title: "Hiệu lực đến",
      dataIndex: "valid_until",
      key: "valid_until",
      render: (d: string) => (
        <span className="text-xs text-slate-500">
          {d ? new Date(d).toLocaleDateString("vi-VN") : "Không thời hạn"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 m-0">
            Quản lý Gói dịch vụ &amp; Khuyến mãi
          </h1>
          <p className="text-sm text-slate-500 m-0 mt-1">
            Thiết lập bảng giá, hạn mức đăng tin, quota AI phỏng vấn và mã giảm giá trên hệ thống
          </p>
        </div>
        <Space>
          <Button
            icon={<RefreshCw size={15} />}
            onClick={() => (activeTab === "plans" ? fetchPlans() : fetchCoupons())}
          >
            Làm mới
          </Button>
          {activeTab === "plans" ? (
            <Button
              type="primary"
              icon={<Plus size={16} />}
              className="bg-[#0062ff]"
              onClick={handleOpenCreatePlan}
            >
              Thêm gói mới
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<Plus size={16} />}
              className="bg-[#0062ff]"
              onClick={() => {
                couponForm.resetFields();
                couponForm.setFieldsValue({ discount_percent: 15, max_uses: 100 });
                setCouponModalOpen(true);
              }}
            >
              Tạo mã giảm giá
            </Button>
          )}
        </Space>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs">
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as "plans" | "coupons")}
          items={[
            {
              key: "plans",
              label: (
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <Package size={15} /> Gói dịch vụ ({plans.length})
                </span>
              ),
              children: (
                <Table
                  dataSource={plans}
                  columns={planColumns}
                  rowKey="id"
                  loading={loadingPlans}
                />
              ),
            },
            {
              key: "coupons",
              label: (
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <Ticket size={15} /> Mã giảm giá ({coupons.length})
                </span>
              ),
              children: (
                <Table
                  dataSource={coupons}
                  columns={couponColumns}
                  rowKey="id"
                  loading={loadingCoupons}
                />
              ),
            },
          ]}
        />
      </div>

      {/* Modal Tạo / Chỉnh sửa Gói dịch vụ */}
      <Modal
        title={editingPlan ? `Chỉnh sửa gói: ${editingPlan.name}` : "Tạo gói dịch vụ mới"}
        open={planModalOpen}
        onCancel={() => setPlanModalOpen(false)}
        onOk={() => planForm.submit()}
        confirmLoading={submittingPlan}
        okText="Lưu gói dịch vụ"
        cancelText="Hủy"
      >
        <Form form={planForm} layout="vertical" onFinish={handleSavePlan}>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="name"
              label="Tên gói dịch vụ"
              rules={[{ required: true, message: "Vui lòng nhập tên gói" }]}
            >
              <Input placeholder="VD: Gói Doanh nghiệp Pro" />
            </Form.Item>
            <Form.Item
              name="code"
              label="Mã định danh (Code)"
              rules={[{ required: !editingPlan, message: "Vui lòng nhập mã gói" }]}
            >
              <Input placeholder="VD: PRO_EMPLOYER" disabled={Boolean(editingPlan)} />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="audience" label="Đối tượng áp dụng">
              <Select
                options={[
                  { value: "employer", label: "Nhà tuyển dụng (Employer)" },
                  { value: "candidate", label: "Ứng viên (Candidate)" },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="price_vnd"
              label="Đơn giá (VNĐ)"
              rules={[{ required: true, message: "Nhập giá gói" }]}
            >
              <InputNumber min={0} step={100000} className="w-full" />
            </Form.Item>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Form.Item name="duration_days" label="Thời hạn (ngày)">
              <InputNumber min={1} className="w-full" />
            </Form.Item>
            <Form.Item name="job_quota" label="Quota đăng tin">
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item name="ai_interview_quota" label="Quota AI Phỏng vấn">
              <InputNumber min={0} className="w-full" />
            </Form.Item>
          </div>
          <Form.Item name="is_active" label="Kích hoạt mở bán" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Tạo Coupon */}
      <Modal
        title="Tạo mã khuyến mãi (Coupon)"
        open={couponModalOpen}
        onCancel={() => setCouponModalOpen(false)}
        onOk={() => couponForm.submit()}
        confirmLoading={submittingCoupon}
        okText="Tạo mã"
        cancelText="Hủy"
      >
        <Form form={couponForm} layout="vertical" onFinish={handleSaveCoupon}>
          <Form.Item
            name="code"
            label="Mã giảm giá"
            rules={[{ required: true, message: "Vui lòng nhập mã coupon" }]}
          >
            <Input placeholder="VD: CAREZA2026" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="discount_percent"
              label="Phần trăm giảm (%)"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} max={100} className="w-full" />
            </Form.Item>
            <Form.Item name="max_uses" label="Số lượt dùng tối đa">
              <InputNumber min={1} className="w-full" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default function AdminPackagesPage() {
  return (
    <App>
      <AdminPackagesContent />
    </App>
  );
}
