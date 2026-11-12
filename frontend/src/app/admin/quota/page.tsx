"use client";

import { useState, useEffect, useCallback } from "react";
import { Table, Tag, Button, Tabs, Modal, Form, Select, Input, message } from "antd";
import { KeyRound, Shield, RefreshCw, UserCog, Search } from "lucide-react";
import { adminService } from "@/services/admin.service";

export default function AdminQuotaPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Danh sách người dùng để gán vai trò RBAC
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("");

  // Modal phân quyền tài khoản
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchRolesAndPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getRolesAndPermissions();
      setRoles(res.data?.roles || []);
      setPermissions(res.data?.permissions || []);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Không thể tải danh sách vai trò và quyền hạn.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await adminService.getUsers({
        page: 1,
        page_size: 50,
        search: userSearch || undefined,
        role: userRoleFilter || undefined,
      });
      setUsers(res.data?.items || []);
    } catch {
      // ignore
    } finally {
      setUsersLoading(false);
    }
  }, [userSearch, userRoleFilter]);

  useEffect(() => {
    fetchRolesAndPermissions();
  }, [fetchRolesAndPermissions]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenAssignModal = (user?: any) => {
    if (user) {
      setSelectedUser(user);
      form.setFieldsValue({
        user_id: user.id,
        roles: user.roles || ["candidate"],
      });
    } else {
      setSelectedUser(null);
      form.resetFields();
    }
    setRoleModalOpen(true);
  };

  const handleUpdateUserRoles = async () => {
    try {
      const values = await form.validateFields();
      const targetUserId = selectedUser ? selectedUser.id : values.user_id;
      if (!targetUserId) {
        message.warning("Vui lòng chọn tài khoản cần phân quyền.");
        return;
      }
      setSubmitting(true);
      await adminService.updateUserRoles(String(targetUserId), values.roles);
      message.success("Đã cập nhật vai trò (RBAC) cho tài khoản thành công.");
      setRoleModalOpen(false);
      fetchRolesAndPermissions();
      fetchUsers();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.response?.data?.message || "Không thể cập nhật vai trò người dùng.");
    } finally {
      setSubmitting(false);
    }
  };

  const roleColumns = [
    {
      title: "Mã vai trò",
      dataIndex: "code",
      key: "code",
      render: (t: string, r: any) => (
        <span className="font-mono text-xs font-bold text-slate-700 uppercase">
          {t || `ROLE_${r.id}`}
        </span>
      ),
    },
    {
      title: "Tên vai trò",
      dataIndex: "name",
      key: "name",
      render: (t: string) => <span className="font-bold text-slate-900 text-xs">{t}</span>,
    },
    {
      title: "Số tài khoản đang gán",
      dataIndex: "users_count",
      key: "users_count",
      render: (t: number) => (
        <span className="font-bold text-[#0062ff] text-xs">{t ?? 0} tài khoản</span>
      ),
    },
    {
      title: "Loại vai trò",
      key: "isSystem",
      render: (_: any, r: any) => {
        const isSys = ["admin", "employer", "candidate"].includes(String(r.code || "").toLowerCase());
        return (
          <Tag color={isSys ? "blue" : "default"} className="font-semibold text-[10.5px]">
            {isSys ? "Vai trò chuẩn hệ thống" : "Vai trò mở rộng"}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      align: "right" as const,
      render: (_: any, r: any) => (
        <Button
          size="small"
          className="text-xs font-semibold rounded-lg"
          onClick={() => setUserRoleFilter(r.code)}
        >
          Xem người dùng ({r.users_count ?? 0})
        </Button>
      ),
    },
  ];

  const permissionColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (id: number) => <span className="font-mono text-xs text-slate-500">#{id}</span>,
    },
    {
      title: "Mã quyền hạn (Permission Code)",
      dataIndex: "code",
      key: "code",
      render: (code: string) => (
        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
          {code}
        </span>
      ),
    },
    {
      title: "Mô tả quyền hạn",
      dataIndex: "description",
      key: "description",
      render: (desc: string) => (
        <span className="text-xs text-slate-700">{desc || "Quyền truy cập chức năng hệ thống"}</span>
      ),
    },
  ];

  const userColumns = [
    {
      title: "Tài khoản",
      key: "user",
      render: (_: any, u: any) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{u.full_name || u.name || "Chưa cập nhật"}</div>
          <div className="text-[11px] text-slate-500">{u.email}</div>
        </div>
      ),
    },
    {
      title: "Vai trò hiện tại (Roles)",
      dataIndex: "roles",
      key: "roles",
      render: (userRoles: string[]) => (
        <div className="flex flex-wrap gap-1">
          {(userRoles && userRoles.length > 0 ? userRoles : ["candidate"]).map((rc) => (
            <Tag
              key={rc}
              color={rc === "admin" ? "purple" : rc === "employer" ? "blue" : "default"}
              className="text-[10.5px] font-bold uppercase m-0"
            >
              {rc}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_: any, u: any) => {
        const isActive = u.is_active !== undefined ? u.is_active : u.status === "active";
        return (
          <Tag color={isActive ? "green" : "red"} className="text-[10.5px] font-semibold m-0">
            {isActive ? "Hoạt động" : "Đã khóa"}
          </Tag>
        );
      },
    },
    {
      title: "Cập nhật quyền",
      key: "actions",
      align: "right" as const,
      render: (_: any, u: any) => (
        <Button
          size="small"
          type="primary"
          ghost
          icon={<UserCog className="w-3.5 h-3.5" />}
          onClick={() => handleOpenAssignModal(u)}
          className="text-xs font-semibold rounded-lg"
        >
          Phân quyền
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0">
            Phân quyền & Vai trò quản trị (RBAC)
          </h1>
          <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
            Quản lý vai trò hệ thống, danh sách quyền hạn (Permissions) và gán vai trò cho tài khoản
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => {
              fetchRolesAndPermissions();
              fetchUsers();
            }}
            loading={loading}
            className="text-xs font-semibold rounded-xl h-9"
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<UserCog className="w-3.5 h-3.5" />}
            onClick={() => handleOpenAssignModal()}
            className="bg-[#0062ff] text-xs font-bold rounded-xl h-9"
          >
            Gán vai trò người dùng
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
        <Tabs
          defaultActiveKey="roles"
          items={[
            {
              key: "roles",
              label: (
                <span className="flex items-center gap-1.5 text-xs font-bold">
                  <Shield className="w-3.5 h-3.5" /> Vai trò hệ thống ({roles.length})
                </span>
              ),
              children: (
                <Table
                  dataSource={roles}
                  columns={roleColumns}
                  rowKey="id"
                  loading={loading}
                  pagination={false}
                />
              ),
            },
            {
              key: "users_rbac",
              label: (
                <span className="flex items-center gap-1.5 text-xs font-bold">
                  <UserCog className="w-3.5 h-3.5" /> Phân quyền Tài khoản ({users.length})
                </span>
              ),
              children: (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Input
                      prefix={<Search className="w-3.5 h-3.5 text-slate-400" />}
                      placeholder="Tìm theo tên hoặc email người dùng..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="max-w-xs text-xs rounded-xl h-9"
                      allowClear
                    />
                    <Select
                      value={userRoleFilter}
                      onChange={(val) => setUserRoleFilter(val)}
                      className="w-44 text-xs h-9"
                      options={[
                        { value: "", label: "Tất cả vai trò" },
                        ...roles.map((r) => ({
                          value: r.code,
                          label: `${r.name} (${r.users_count ?? 0})`,
                        })),
                      ]}
                    />
                  </div>
                  <Table
                    dataSource={users}
                    columns={userColumns}
                    rowKey="id"
                    loading={usersLoading}
                    pagination={{ pageSize: 10 }}
                  />
                </div>
              ),
            },
            {
              key: "permissions",
              label: (
                <span className="flex items-center gap-1.5 text-xs font-bold">
                  <KeyRound className="w-3.5 h-3.5" /> Danh mục Quyền hạn ({permissions.length})
                </span>
              ),
              children: (
                <Table
                  dataSource={permissions}
                  columns={permissionColumns}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 15 }}
                />
              ),
            },
          ]}
        />
      </div>

      <Modal
        title={
          <span className="text-sm font-black text-slate-900">
            {selectedUser
              ? `Phân quyền tài khoản: ${selectedUser.email}`
              : "Gán vai trò (RBAC) cho tài khoản"}
          </span>
        }
        open={roleModalOpen}
        onCancel={() => setRoleModalOpen(false)}
        onOk={handleUpdateUserRoles}
        confirmLoading={submitting}
        okText="Lưu phân quyền"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" className="pt-2">
          {!selectedUser && (
            <Form.Item
              name="user_id"
              label={<span className="text-xs font-bold">Chọn tài khoản người dùng</span>}
              rules={[{ required: true, message: "Vui lòng chọn tài khoản" }]}
            >
              <Select
                showSearch
                placeholder="Tìm chọn người dùng theo email/tên..."
                optionFilterProp="label"
                options={users.map((u) => ({
                  value: u.id,
                  label: `${u.name || "User"} (${u.email})`,
                }))}
              />
            </Form.Item>
          )}
          <Form.Item
            name="roles"
            label={<span className="text-xs font-bold">Danh sách vai trò (Roles)</span>}
            rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 vai trò" }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn các vai trò..."
              options={
                roles.length > 0
                  ? roles.map((r) => ({
                      value: r.code,
                      label: `${r.name} (${r.code})`,
                    }))
                  : [
                      { value: "admin", label: "Quản trị viên (admin)" },
                      { value: "employer", label: "Nhà tuyển dụng (employer)" },
                      { value: "candidate", label: "Ứng viên (candidate)" },
                    ]
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
