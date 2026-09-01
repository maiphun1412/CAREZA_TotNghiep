"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/auth.service";
import { Layout, Menu, Button, Avatar, Dropdown, Space, message, Tag } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  BankOutlined,
  FileTextOutlined,
  AlertOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
  CompassOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      message.success("Đăng xuất thành công");
      router.push("/dang-nhap");
    } catch (error) {
      logout();
      router.push("/dang-nhap");
    }
  };

  const menuItems = [
    {
      key: "/admin/dashboard",
      icon: <DashboardOutlined />,
      label: <Link href="/admin/dashboard">Dashboard tổng quan</Link>,
    },
    {
      key: "/admin/users",
      icon: <UserOutlined />,
      label: <Link href="/admin/users">Quản lý người dùng</Link>,
    },
    {
      key: "/admin/companies",
      icon: <BankOutlined />,
      label: <Link href="/admin/companies">Xác minh doanh nghiệp</Link>,
    },
    {
      key: "/admin/jobs",
      icon: <FileTextOutlined />,
      label: <Link href="/admin/jobs">Quản lý tin tuyển dụng</Link>,
    },
    {
      key: "/admin/reports",
      icon: <AlertOutlined />,
      label: <Link href="/admin/reports">Báo cáo vi phạm</Link>,
    },
  ];

  const profileMenuItems = [
    {
      key: "home",
      icon: <CompassOutlined />,
      label: <Link href="/">Về Trang chủ</Link>,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: handleLogout,
    },
  ];

  const activeMenuKey = menuItems.find((item) => pathname.startsWith(item.key))?.key || "/admin/dashboard";

  return (
    <Layout className="min-h-screen">
      {/* Desktop Sidebar */}
      <Sider
        width={260}
        theme="light"
        className="hidden md:block fixed left-0 top-0 bottom-0 z-20 border-r border-slate-100 shadow-sm"
        style={{ height: "100vh" }}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="h-16 flex items-center px-6 border-b border-slate-100 bg-white">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl font-black tracking-wider text-blue-600 font-sans">
                  CARE<span className="text-slate-900">ZA</span>
                </span>
                <Tag color="red" className="m-0 text-[9px] uppercase font-bold px-1 py-0 rounded">Admin</Tag>
              </Link>
            </div>
            <Menu
              mode="inline"
              selectedKeys={[activeMenuKey]}
              items={menuItems}
              className="border-none pt-4 px-2"
            />
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800">Quản trị viên</span>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500"
            />
          </div>
        </div>
      </Sider>

      <Layout className="md:pl-[260px] flex flex-col min-h-screen">
        {/* Top Header */}
        <Header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shadow-sm">
          <span className="text-slate-500 text-sm font-medium">Bảng điều khiển hệ thống</span>
          <Dropdown menu={{ items: profileMenuItems }} placement="bottomRight" arrow>
            <div className="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-slate-50 transition-colors">
              <Avatar icon={<UserOutlined />} className="bg-red-100 text-red-600" />
            </div>
          </Dropdown>
        </Header>

        {/* Content */}
        <Content className="p-6 sm:p-8 bg-slate-50 flex-1 flex flex-col">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
