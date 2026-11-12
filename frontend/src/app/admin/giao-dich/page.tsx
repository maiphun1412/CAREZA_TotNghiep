"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Tag,
  Input,
  InputNumber,
  Select,
  Button,
  Tabs,
  Modal,
  Checkbox,
  App,
} from "antd";
import {
  Search,
  Download,
  CreditCard,
  RefreshCw,
  Layers,
  CheckCircle2,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { adminService } from "@/services/admin.service";

function AdminTransactionsContent() {
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState<"orders" | "subscriptions">("orders");

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("all");
  const [summary, setSummary] = useState({
    total_orders: 0,
    paid_revenue_vnd: 0,
    pending_revenue_vnd: 0,
    paid_count: 0,
    pending_count: 0,
    failed_count: 0,
  });

  // Manual Reconciliation Modal state
  const [confirmingOrder, setConfirmingOrder] = useState<any | null>(null);
  const [providerReference, setProviderReference] = useState("");
  const [amountVnd, setAmountVnd] = useState<number | null>(null);
  const [paidAt, setPaidAt] = useState("");
  const [reconciliationNote, setReconciliationNote] = useState("");
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [submittingConfirm, setSubmittingConfirm] = useState(false);

  // View Reconciliation Detail Modal state
  const [viewingOrder, setViewingOrder] = useState<any | null>(null);

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [subStatus, setSubStatus] = useState("all");

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await adminService.getBillingOrders({
        status: orderStatus !== "all" ? orderStatus : undefined,
        search: orderSearch.trim() || undefined,
        page_size: 50,
      });
      if (res?.data) {
        setOrders(res.data.items || []);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch {
      message.error("Không thể tải danh sách giao dịch.");
    } finally {
      setLoadingOrders(false);
    }
  }, [orderStatus, orderSearch, message]);

  const fetchSubscriptions = useCallback(async () => {
    setLoadingSubs(true);
    try {
      const res = await adminService.getBillingSubscriptions({
        status: subStatus !== "all" ? subStatus : undefined,
        page_size: 50,
      });
      if (res?.data) {
        setSubscriptions(res.data.items || []);
      }
    } catch {
      message.error("Không thể tải danh sách thuê bao.");
    } finally {
      setLoadingSubs(false);
    }
  }, [subStatus, message]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (activeTab === "subscriptions") {
      fetchSubscriptions();
    }
  }, [activeTab, fetchSubscriptions]);

  const handleExportCsv = () => {
    if (orders.length === 0) {
      message.warning("Chưa có dữ liệu giao dịch để xuất.");
      return;
    }
    const headers = [
      "Mã Giao Dịch",
      "Doanh Nghiệp / Khách Hàng",
      "Email",
      "Gói Dịch Vụ",
      "Số Tiền (VNĐ)",
      "Trạng Thái",
      "Thời Gian",
    ];
    const rows = orders.map((o) => [
      `"${o.order_code}"`,
      `"${(o.company_name || "").replace(/"/g, '""')}"`,
      `"${o.user_email || ""}"`,
      `"${(o.plan_name || "").replace(/"/g, '""')}"`,
      `"${o.total_vnd || 0}"`,
      `"${o.status || ""}"`,
      `"${o.created_at ? new Date(o.created_at).toLocaleString("vi-VN") : ""}"`,
    ]);
    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `careza_giao_dich_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success(`Đã xuất báo cáo ${orders.length} giao dịch!`);
  };

  const openConfirmModal = (order: any) => {
    setConfirmingOrder(order);
    setProviderReference("");
    setAmountVnd(Number(order.total_vnd || 0));
    const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setPaidAt(nowLocal);
    setReconciliationNote("");
    setConfirmChecked(false);
  };

  const handleConfirmOrderPayment = async () => {
    if (!confirmingOrder) return;
    if (!providerReference.trim()) {
      message.warning("Vui lòng nhập mã giao dịch ngân hàng thực tế.");
      return;
    }
    if (!amountVnd || amountVnd <= 0) {
      message.warning("Vui lòng nhập số tiền thực nhận hợp lệ.");
      return;
    }
    if (Number(amountVnd) !== Number(confirmingOrder.total_vnd)) {
      message.error(
        `Số tiền thực nhận (${Number(amountVnd).toLocaleString("vi-VN")} đ) không khớp với số tiền đơn hàng (${Number(confirmingOrder.total_vnd).toLocaleString("vi-VN")} đ).`
      );
      return;
    }
    if (!paidAt) {
      message.warning("Vui lòng chọn thời điểm giao dịch thực tế.");
      return;
    }
    if (!reconciliationNote.trim()) {
      message.warning("Vui lòng nhập ghi chú / bằng chứng đối soát thanh toán.");
      return;
    }
    if (!confirmChecked) {
      message.warning("Vui lòng tích xác nhận đã đối soát sao kê / bằng chứng thanh toán.");
      return;
    }

    setSubmittingConfirm(true);
    try {
      const isoPaidAt = new Date(paidAt).toISOString();
      const res = await adminService.confirmBillingOrder(confirmingOrder.id, {
        provider_reference: providerReference.trim(),
        amount_vnd: Number(amountVnd),
        currency: "VND",
        paid_at: isoPaidAt,
        note: reconciliationNote.trim(),
      });
      message.success(
        res?.message || "Đã xác nhận đối soát thanh toán và kích hoạt gói dịch vụ thành công!"
      );
      setConfirmingOrder(null);
      fetchOrders();
      if (activeTab === "subscriptions") {
        fetchSubscriptions();
      }
    } catch (err: any) {
      const errData = err?.response?.data;
      const errMsg =
        errData?.errors?.provider_reference?.[0] ||
        errData?.errors?.amount_vnd?.[0] ||
        errData?.errors?.paid_at?.[0] ||
        errData?.errors?.note?.[0] ||
        errData?.errors?.detail ||
        errData?.detail ||
        errData?.message ||
        "Không thể xác nhận đối soát đơn hàng.";
      message.error(typeof errMsg === "string" ? errMsg : "Xác nhận đối soát thất bại.");
    } finally {
      setSubmittingConfirm(false);
    }
  };

  const orderColumns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "order_code",
      key: "order_code",
      render: (c: string) => <span className="font-mono font-bold text-slate-700">{c}</span>,
    },
    {
      title: "Doanh nghiệp / Tài khoản",
      key: "customer",
      render: (_: any, r: any) => (
        <div>
          <span className="font-semibold text-slate-900 block">{r.company_name}</span>
          <span className="text-xs text-slate-400">{r.user_email}</span>
        </div>
      ),
    },
    {
      title: "Gói dịch vụ",
      dataIndex: "plan_name",
      key: "plan_name",
      render: (p: string, r: any) => (
        <div>
          <Tag color="blue">{p || "Gói dịch vụ"}</Tag>
          {(r.job_quota || r.ai_interview_quota) ? (
            <div className="text-[11px] text-slate-400 mt-0.5">
              +{r.job_quota || 0} tin • +{r.ai_interview_quota || 0} AI
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "total_vnd",
      key: "total_vnd",
      render: (a: number) => (
        <span className="font-extrabold text-emerald-600">
          {(a || 0).toLocaleString("vi-VN")} đ
        </span>
      ),
    },
    {
      title: "Thông tin đối soát",
      key: "reconciliation",
      render: (_: any, r: any) => {
        if (r.status === "paid" && r.payment?.provider_reference) {
          return (
            <div className="text-xs space-y-0.5">
              <div className="font-mono font-bold text-blue-700">
                Mã GD: {r.payment.provider_reference}
              </div>
              {r.payment.paid_at && (
                <div className="text-slate-400">
                  TT: {new Date(r.payment.paid_at).toLocaleString("vi-VN")}
                </div>
              )}
              {r.payment.reconciliation_note && (
                <div className="text-slate-500 truncate max-w-[200px]" title={r.payment.reconciliation_note}>
                  Ghi chú: {r.payment.reconciliation_note}
                </div>
              )}
            </div>
          );
        }
        if (r.status === "pending") {
          return (
            <span className="text-xs text-amber-700 font-medium">
              Chờ đối soát chuyển khoản
            </span>
          );
        }
        return <span className="text-xs text-slate-400">—</span>;
      },
    },
    {
      title: "Thời gian tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (d: string) => (
        <span className="text-xs text-slate-500">
          {d ? new Date(d).toLocaleString("vi-VN") : "—"}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s: string) => {
        if (s === "paid") return <Tag color="green">Thành công (Paid)</Tag>;
        if (s === "pending") return <Tag color="gold">Chờ đối soát (Pending)</Tag>;
        if (s === "cancelled") return <Tag color="default">Đã hủy (Cancelled)</Tag>;
        return <Tag color="red">Thất bại ({s})</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "right" as const,
      render: (_: any, r: any) => {
        if (r.status === "pending") {
          return (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircle2 size={14} />}
              onClick={() => openConfirmModal(r)}
            >
              Đối soát &amp; Xác nhận
            </Button>
          );
        }
        if (r.status === "paid") {
          return (
            <Button
              size="small"
              icon={<Eye size={14} />}
              onClick={() => setViewingOrder(r)}
            >
              Xem đối soát
            </Button>
          );
        }
        return <span className="text-xs text-slate-400">—</span>;
      },
    },
  ];

  const subColumns = [
    {
      title: "Mã TB",
      dataIndex: "id",
      key: "id",
      render: (id: number) => <span className="font-mono font-bold text-slate-600">#SUB-{id}</span>,
    },
    {
      title: "Doanh nghiệp / Người dùng",
      key: "owner",
      render: (_: any, r: any) => (
        <div>
          <div className="font-semibold text-slate-900">
            {r.company_name || `Doanh nghiệp #${r.company_id || "—"}`}
          </div>
          <div className="text-xs text-slate-400">{r.user_email}</div>
        </div>
      ),
    },
    {
      title: "Gói thuê bao",
      dataIndex: "plan_name",
      key: "plan_name",
      render: (n: string) => <Tag color="purple">{n}</Tag>,
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "starts_at",
      key: "starts_at",
      render: (d: string) => (
        <span className="text-xs">{d ? new Date(d).toLocaleDateString("vi-VN") : "—"}</span>
      ),
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "ends_at",
      key: "ends_at",
      render: (d: string) => (
        <span className="text-xs">{d ? new Date(d).toLocaleDateString("vi-VN") : "—"}</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s: string) => (
        <Tag color={s === "active" ? "green" : "default"}>{(s || "active").toUpperCase()}</Tag>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 m-0">
            Lịch sử Giao dịch &amp; Thanh toán
          </h1>
          <p className="text-sm text-slate-500 m-0 mt-1">
            Đối soát dòng tiền, hóa đơn thanh toán và quản lý thuê bao dịch vụ của doanh nghiệp
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            icon={<RefreshCw size={15} />}
            onClick={() => (activeTab === "orders" ? fetchOrders() : fetchSubscriptions())}
          >
            Làm mới
          </Button>
          <Button icon={<Download size={16} />} onClick={handleExportCsv}>
            Xuất báo cáo CSV
          </Button>
        </div>
      </div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">
            Tổng doanh thu đã thanh toán
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {summary.paid_revenue_vnd.toLocaleString("vi-VN")} đ
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {summary.paid_count} đơn hàng thành công
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">
            Doanh thu chờ thanh toán
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {summary.pending_revenue_vnd.toLocaleString("vi-VN")} đ
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {summary.pending_count} đơn hàng đang chờ
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">
            Tổng số đơn hàng
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {summary.total_orders.toLocaleString("vi-VN")}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {summary.failed_count} đơn hủy / thất bại
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs">
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as "orders" | "subscriptions")}
          items={[
            {
              key: "orders",
              label: (
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <CreditCard size={15} /> Đơn hàng &amp; Giao dịch ({summary.total_orders})
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">
                  <div className="flex flex-wrap gap-3">
                    <Input
                      placeholder="Tìm mã GD, tên công ty, email, tên gói..."
                      prefix={<Search size={16} className="text-slate-400" />}
                      className="w-80"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      allowClear
                    />
                    <Select
                      value={orderStatus}
                      onChange={setOrderStatus}
                      className="w-52"
                      options={[
                        { value: "all", label: "Tất cả trạng thái" },
                        { value: "pending", label: "Chờ đối soát (Pending)" },
                        { value: "paid", label: "Thành công (Paid)" },
                        { value: "cancelled", label: "Đã hủy (Cancelled)" },
                        { value: "failed", label: "Thất bại (Failed)" },
                      ]}
                    />
                  </div>
                  <Table
                    dataSource={orders}
                    columns={orderColumns}
                    rowKey="id"
                    loading={loadingOrders}
                  />
                </div>
              ),
            },
            {
              key: "subscriptions",
              label: (
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <Layers size={15} /> Thuê bao Dịch vụ (Subscriptions)
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">
                  <Select
                    value={subStatus}
                    onChange={setSubStatus}
                    className="w-48"
                    options={[
                      { value: "all", label: "Tất cả trạng thái" },
                      { value: "active", label: "Đang hoạt động" },
                      { value: "expired", label: "Đã hết hạn" },
                    ]}
                  />
                  <Table
                    dataSource={subscriptions}
                    columns={subColumns}
                    rowKey="id"
                    loading={loadingSubs}
                  />
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Modal Đối soát & Xác nhận chuyển khoản thủ công */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <ShieldCheck size={18} className="text-blue-600" />
            <span>Đối soát &amp; Xác nhận chuyển khoản thủ công</span>
          </div>
        }
        open={!!confirmingOrder}
        onCancel={() => !submittingConfirm && setConfirmingOrder(null)}
        footer={[
          <Button
            key="cancel"
            disabled={submittingConfirm}
            onClick={() => setConfirmingOrder(null)}
          >
            Hủy
          </Button>,
          <Button
            key="confirm"
            type="primary"
            loading={submittingConfirm}
            disabled={
              !providerReference.trim() ||
              !amountVnd ||
              !paidAt ||
              !reconciliationNote.trim() ||
              !confirmChecked
            }
            onClick={handleConfirmOrderPayment}
          >
            Xác nhận thanh toán &amp; Kích hoạt gói
          </Button>,
        ]}
        width={540}
        centered
      >
        {confirmingOrder && (
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã đơn hàng cần đối soát:</span>
                <span className="font-mono font-bold text-blue-600">
                  {confirmingOrder.order_code}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Doanh nghiệp:</span>
                <span className="font-bold text-slate-900">
                  {confirmingOrder.company_name} ({confirmingOrder.user_email})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gói dịch vụ &amp; Quyền lợi:</span>
                <span className="font-bold text-slate-800">
                  {confirmingOrder.plan_name} (+{confirmingOrder.job_quota || 0} tin, +{confirmingOrder.ai_interview_quota || 0} AI)
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-600 font-semibold">Số tiền phải thu (VNĐ):</span>
                <span className="font-extrabold text-emerald-600 text-sm">
                  {Number(confirmingOrder.total_vnd || 0).toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mã giao dịch ngân hàng thực tế <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="Nhập mã giao dịch trên sao kê ngân hàng (VD: FT26305981234)"
                  value={providerReference}
                  onChange={(e) => setProviderReference(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số tiền thực nhận (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <InputNumber
                    className="w-full"
                    min={1}
                    value={amountVnd}
                    formatter={(val) =>
                      `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(val) => Number((val || "").replace(/,/g, ""))}
                    onChange={(val) => setAmountVnd(typeof val === "number" ? val : null)}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Thời điểm giao dịch <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={paidAt}
                    onChange={(e) => setPaidAt(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ghi chú / Bằng chứng đối soát <span className="text-rose-500">*</span>
                </label>
                <Input.TextArea
                  rows={3}
                  placeholder="Nhập thông tin sao kê, ngân hàng chuyển, nội dung chuyển khoản hoặc mã chứng từ đối soát..."
                  value={reconciliationNote}
                  onChange={(e) => setReconciliationNote(e.target.value)}
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <Checkbox
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                >
                  <span className="text-xs text-amber-950 font-semibold">
                    Tôi xác nhận đã kiểm tra sao kê/bằng chứng chuyển khoản thực tế khớp đúng số tiền{" "}
                    {Number(confirmingOrder.total_vnd || 0).toLocaleString("vi-VN")} đ và mã đơn hàng{" "}
                    {confirmingOrder.order_code}.
                  </span>
                </Checkbox>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Xem chi tiết thông tin đối soát */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span>Chi tiết đối soát thanh toán</span>
          </div>
        }
        open={!!viewingOrder}
        onCancel={() => setViewingOrder(null)}
        footer={[
          <Button key="close" onClick={() => setViewingOrder(null)}>
            Đóng
          </Button>,
        ]}
        width={480}
        centered
      >
        {viewingOrder && (
          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã đơn hàng:</span>
                <span className="font-mono font-bold text-slate-900">
                  {viewingOrder.order_code}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Doanh nghiệp:</span>
                <span className="font-bold text-slate-900">
                  {viewingOrder.company_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gói dịch vụ:</span>
                <span className="font-bold text-blue-600">
                  {viewingOrder.plan_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số tiền đã đối soát:</span>
                <span className="font-extrabold text-emerald-600">
                  {Number(viewingOrder.total_vnd || 0).toLocaleString("vi-VN")} đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mã giao dịch ngân hàng:</span>
                <span className="font-mono font-bold text-blue-700">
                  {viewingOrder.payment?.provider_reference || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời điểm giao dịch:</span>
                <span className="font-semibold text-slate-800">
                  {viewingOrder.payment?.paid_at
                    ? new Date(viewingOrder.payment.paid_at).toLocaleString("vi-VN")
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Admin xác nhận:</span>
                <span className="font-semibold text-slate-800">
                  {viewingOrder.payment?.verified_by_admin_id
                    ? `Admin #${viewingOrder.payment.verified_by_admin_id}`
                    : "Hệ thống"}
                </span>
              </div>
              {viewingOrder.payment?.reconciliation_note && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-1">Ghi chú / Bằng chứng đối soát:</span>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800">
                    {viewingOrder.payment.reconciliation_note}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function AdminTransactionsPage() {
  return (
    <App>
      <AdminTransactionsContent />
    </App>
  );
}
