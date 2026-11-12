"use client";

import { useState, useEffect, useCallback } from "react";
import { Form, Input, Switch, Button, Spin, message } from "antd";
import { Save, RefreshCw } from "lucide-react";
import { adminService } from "@/services/admin.service";

const DEFAULT_SETTINGS = {
  siteName: "CAREZA - Nền tảng Tuyển dụng & Tìm việc Hướng nghiệp",
  supportEmail: "admin@careza.vn",
  autoApproveJobs: false,
  emailVerifyRequired: true,
  maintenanceMode: false,
};

export default function AdminCaiDatPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getSystemSettings();
      const rawData: any = res.data;
      const items = Array.isArray(rawData) ? rawData : rawData?.settings || [];
      const mapped: Record<string, any> = { ...DEFAULT_SETTINGS };
      let latestTime: string | null = null;

      for (const item of items) {
        if (item.key in mapped || item.key) {
          mapped[item.key] = item.value;
        }
        if (item.updated_at && (!latestTime || item.updated_at > latestTime)) {
          latestTime = item.updated_at;
        }
      }
      form.setFieldsValue(mapped);
      setLastUpdated(latestTime);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Không thể tải thiết lập hệ thống.");
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await adminService.updateSystemSettings({ settings: values });
      message.success("Đã lưu thiết lập cấu hình hệ thống vào cơ sở dữ liệu thành công!");
      fetchSettings();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.response?.data?.message || "Không thể lưu cấu hình hệ thống.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0">Cài đặt hệ thống</h1>
          <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
            Cấu hình tham số chung, chính sách vận hành và quy tắc bảo mật của nền tảng CAREZA
            {lastUpdated ? ` • Cập nhật lần cuối: ${new Date(lastUpdated).toLocaleString("vi-VN")}` : ""}
          </p>
        </div>
        <Button
          icon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={fetchSettings}
          loading={loading}
          className="text-xs font-semibold rounded-xl h-9"
        >
          Tải lại
        </Button>
      </div>

      <Spin spinning={loading}>
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs max-w-3xl space-y-4">
          <Form form={form} layout="vertical" initialValues={DEFAULT_SETTINGS}>
            <Form.Item
              label={<span className="text-xs font-bold">Tên hệ thống</span>}
              name="siteName"
              rules={[{ required: true, message: "Vui lòng nhập tên hệ thống" }]}
            >
              <Input className="rounded-xl text-xs h-9" />
            </Form.Item>

            <Form.Item
              label={<span className="text-xs font-bold">Email hỗ trợ quản trị</span>}
              name="supportEmail"
              rules={[
                { required: true, message: "Vui lòng nhập email hỗ trợ" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input className="rounded-xl text-xs h-9" />
            </Form.Item>

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Tự động duyệt tin tuyển dụng
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Cho phép tin đăng của doanh nghiệp đã xác minh hiển thị ngay không cần chờ duyệt
                  </span>
                </div>
                <Form.Item name="autoApproveJobs" valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Bắt buộc xác thực Email
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Người dùng phải kích hoạt tài khoản qua OTP/Email trước khi ứng tuyển hoặc đăng tin
                  </span>
                </div>
                <Form.Item name="emailVerifyRequired" valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Chế độ bảo trì hệ thống
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Chỉ tài khoản Quản trị viên mới được phép truy cập khi bật chế độ này
                  </span>
                </div>
                <Form.Item name="maintenanceMode" valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="primary"
                icon={<Save className="w-3.5 h-3.5" />}
                onClick={handleSave}
                loading={saving}
                className="bg-[#0062ff] text-xs font-bold rounded-xl h-9"
              >
                Lưu cấu hình
              </Button>
            </div>
          </Form>
        </div>
      </Spin>
    </div>
  );
}
