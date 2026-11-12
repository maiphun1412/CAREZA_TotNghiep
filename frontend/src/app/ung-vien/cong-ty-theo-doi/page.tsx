"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, Button, Avatar, Spin, Empty, App, Popconfirm, Tag } from "antd";
import {
  BankOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  TeamOutlined,
  UserDeleteOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { interactionService } from "@/services/interaction.service";

interface FollowedCompanyItem {
  id: number;
  company_id: number;
  company: {
    id: number;
    name: string;
    logo_url?: string;
    industry?: string;
    company_size?: string;
    address?: string;
    website?: string;
  };
  followed_at: string;
}

export default function FollowedCompaniesPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<FollowedCompanyItem[]>([]);
  const [unfollowingId, setUnfollowingId] = useState<number | null>(null);

  const fetchFollowedCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await interactionService.getFollowedCompanies();
      const list = res?.items || res?.companies || res?.results || [];
      const normalized: FollowedCompanyItem[] = list.map((item: any) => ({
        id: item.id || item.company_id,
        company_id: item.company_id || item.company?.id,
        company: {
          id: item.company?.id || item.company_id,
          name: item.company?.name || item.name || "Doanh nghiệp",
          logo_url: item.company?.logo_url || item.logo_url,
          industry: item.company?.industry || item.industry_name || "Tuyển dụng",
          company_size: item.company?.company_size || item.company_size || "Chưa cập nhật",
          address: item.company?.address || item.address || "Việt Nam",
          website: item.company?.website || item.website,
        },
        followed_at: item.followed_at || new Date().toISOString(),
      }));
      setCompanies(normalized);
    } catch {
      setError("Không thể tải danh sách doanh nghiệp đang theo dõi từ máy chủ.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFollowedCompanies();
  }, [fetchFollowedCompanies]);

  const handleUnfollow = async (companyId: number, companyName: string) => {
    setUnfollowingId(companyId);
    try {
      await interactionService.unfollowCompany(companyId);
      message.success(`Đã bỏ theo dõi doanh nghiệp ${companyName}`);
      setCompanies((prev) => prev.filter((item) => item.company_id !== companyId && item.company?.id !== companyId));
    } catch {
      message.error("Bỏ theo dõi thất bại. Vui lòng thử lại.");
    } finally {
      setUnfollowingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <BankOutlined className="text-blue-600" /> Doanh nghiệp đang theo dõi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Nhận thông báo cập nhật về các vị trí tuyển dụng mới nhất từ các nhà tuyển dụng hàng đầu bạn quan tâm.
          </p>
        </div>
        <div className="text-right">
          <Tag color="blue" className="text-xs font-semibold px-3 py-1 rounded-full">
            {companies.length} Doanh nghiệp
          </Tag>
        </div>
      </div>

      {error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-3">
          <p className="text-rose-700 font-semibold text-sm sm:text-base m-0">{error}</p>
          <Button
            type="primary"
            danger
            onClick={fetchFollowedCompanies}
            className="rounded-xl font-medium"
          >
            Tải lại trang
          </Button>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center py-20 bg-white rounded-2xl border border-slate-100">
          <Spin size="large" />
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Empty
            description={
              <div className="space-y-2">
                <p className="text-slate-600 font-semibold text-base">Bạn chưa theo dõi doanh nghiệp nào</p>
                <p className="text-slate-400 text-xs">
                  Hãy khám phá trang Doanh nghiệp tuyển dụng để theo dõi các công ty bạn yêu thích.
                </p>
              </div>
            }
          >
            <Link href="/cong-ty">
              <Button type="primary" className="bg-blue-600 hover:bg-blue-700 rounded-xl mt-2 font-medium">
                Khám phá doanh nghiệp ngay
              </Button>
            </Link>
          </Empty>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((item) => {
            const comp = item.company || { id: item.company_id, name: "Doanh nghiệp" };
            return (
              <Card
                key={item.id || comp.id}
                className="rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <Avatar
                      src={comp.logo_url}
                      icon={<BankOutlined />}
                      shape="square"
                      size={54}
                      className="bg-slate-50 border border-slate-100 rounded-xl shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/cong-ty/${comp.id}`}
                        className="font-bold text-slate-800 hover:text-blue-600 text-base leading-snug line-clamp-1 block transition-colors"
                      >
                        {comp.name}
                      </Link>
                      {comp.industry && (
                        <p className="text-xs text-blue-600 font-medium mt-0.5 truncate">
                          {comp.industry}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                    {comp.address && (
                      <div className="flex items-center gap-2 truncate">
                        <EnvironmentOutlined className="text-slate-400" />
                        <span className="truncate">{comp.address}</span>
                      </div>
                    )}
                    {comp.company_size && (
                      <div className="flex items-center gap-2 truncate">
                        <TeamOutlined className="text-slate-400" />
                        <span>{comp.company_size} nhân viên</span>
                      </div>
                    )}
                    {comp.website && (
                      <div className="flex items-center gap-2 truncate">
                        <GlobalOutlined className="text-slate-400" />
                        <a
                          href={comp.website}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline text-slate-600 truncate"
                        >
                          {comp.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Popconfirm
                    title="Bỏ theo dõi doanh nghiệp"
                    description={`Bạn có chắc chắn muốn bỏ theo dõi ${comp.name}?`}
                    onConfirm={() => handleUnfollow(comp.id, comp.name)}
                    okText="Bỏ theo dõi"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      size="small"
                      danger
                      type="text"
                      icon={<UserDeleteOutlined />}
                      loading={unfollowingId === comp.id}
                      className="rounded-lg text-xs"
                    >
                      Bỏ theo dõi
                    </Button>
                  </Popconfirm>

                  <Link href={`/cong-ty/${comp.id}`}>
                    <Button
                      size="small"
                      type="link"
                      className="text-blue-600 font-semibold flex items-center gap-1 text-xs"
                    >
                      Xem trang công ty <ArrowRightOutlined />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
