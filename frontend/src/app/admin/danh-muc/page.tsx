"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Table,
  Tag,
  Button,
  Tabs,
  Input,
  Modal,
  Form,
  Space,
  Popconfirm,
  App,
} from "antd";
import {
  Plus,
  Trash2,
  Bot,
  Database,
  Layers,
  MapPin,
  Wrench,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { adminService } from "@/services/admin.service";

function AdminCategoriesAndAiContent() {
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState<"industries" | "skills" | "locations" | "ai">(
    "industries"
  );

  // Industries
  const [industries, setIndustries] = useState<any[]>([]);
  const [loadingIndustries, setLoadingIndustries] = useState(true);
  const [industrySearch, setIndustrySearch] = useState("");
  const [industryModalOpen, setIndustryModalOpen] = useState(false);
  const [industryForm] = Form.useForm();

  // Skills
  const [skills, setSkills] = useState<any[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [skillForm] = Form.useForm();

  // Locations
  const [locations, setLocations] = useState<any[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");

  // AI Usage
  const [aiStats, setAiStats] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const fetchIndustries = useCallback(async () => {
    setLoadingIndustries(true);
    try {
      const res = await adminService.getIndustries();
      setIndustries(res?.data?.industries || []);
    } catch {
      message.error("Không thể tải danh mục ngành nghề.");
    } finally {
      setLoadingIndustries(false);
    }
  }, [message]);

  const fetchSkills = useCallback(async () => {
    setLoadingSkills(true);
    try {
      const res = await adminService.getSkills();
      setSkills(res?.data?.skills || []);
    } catch {
      message.error("Không thể tải danh mục kỹ năng.");
    } finally {
      setLoadingSkills(false);
    }
  }, [message]);

  const fetchLocations = useCallback(async () => {
    setLoadingLocations(true);
    try {
      const res = await adminService.getLocations();
      setLocations(res?.data?.locations || []);
    } catch {
      message.error("Không thể tải danh mục địa điểm.");
    } finally {
      setLoadingLocations(false);
    }
  }, [message]);

  const fetchAiStats = useCallback(async () => {
    setLoadingAi(true);
    try {
      const res = await adminService.getAiUsageStats();
      setAiStats(res?.data || null);
    } catch {
      message.error("Không thể tải thống kê AI.");
    } finally {
      setLoadingAi(false);
    }
  }, [message]);

  useEffect(() => {
    fetchIndustries();
    fetchAiStats();
  }, [fetchIndustries, fetchAiStats]);

  useEffect(() => {
    if (activeTab === "skills" && skills.length === 0) fetchSkills();
    if (activeTab === "locations" && locations.length === 0) fetchLocations();
    if (activeTab === "ai") fetchAiStats();
  }, [activeTab, skills.length, locations.length, fetchSkills, fetchLocations, fetchAiStats]);

  const handleAddIndustry = async (values: { name: string }) => {
    try {
      await adminService.createIndustry({ name: values.name });
      message.success(`Đã thêm ngành nghề "${values.name}"!`);
      setIndustryModalOpen(false);
      industryForm.resetFields();
      fetchIndustries();
    } catch {
      message.error("Không thể thêm ngành nghề.");
    }
  };

  const handleDeleteIndustry = async (id: number) => {
    try {
      await adminService.deleteIndustry(id);
      message.success("Đã xóa ngành nghề.");
      fetchIndustries();
    } catch {
      message.error("Không thể xóa ngành nghề đang được tham chiếu.");
    }
  };

  const handleAddSkill = async (values: { name: string; category?: string }) => {
    try {
      await adminService.createSkill(values);
      message.success(`Đã thêm kỹ năng "${values.name}"!`);
      setSkillModalOpen(false);
      skillForm.resetFields();
      fetchSkills();
    } catch {
      message.error("Không thể thêm kỹ năng.");
    }
  };

  const handleDeleteSkill = async (id: number) => {
    try {
      await adminService.deleteSkill(id);
      message.success("Đã xóa kỹ năng.");
      fetchSkills();
    } catch {
      message.error("Không thể xóa kỹ năng đang được sử dụng.");
    }
  };

  const filteredIndustries = industries.filter(
    (i) =>
      !industrySearch.trim() ||
      i.name?.toLowerCase().includes(industrySearch.toLowerCase()) ||
      i.slug?.toLowerCase().includes(industrySearch.toLowerCase())
  );

  const filteredSkills = skills.filter(
    (s) =>
      !skillSearch.trim() ||
      s.name?.toLowerCase().includes(skillSearch.toLowerCase()) ||
      s.category?.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const filteredLocations = locations.filter(
    (l) =>
      !locationSearch.trim() ||
      l.province?.toLowerCase().includes(locationSearch.toLowerCase()) ||
      l.district?.toLowerCase().includes(locationSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 m-0">
            Quản lý Danh mục Hệ thống &amp; Dữ liệu AI
          </h1>
          <p className="text-sm text-slate-500 m-0 mt-1">
            Quản trị danh mục chuẩn (Ngành nghề, Kỹ năng, Địa điểm) và giám sát tác vụ AI / RAG trên toàn hệ thống
          </p>
        </div>
        <Space>
          <Link href="/admin/knowledge">
            <Button icon={<Database size={15} />}>Kho tri thức RAG</Button>
          </Link>
          <Button
            icon={<RefreshCw size={15} />}
            onClick={() => {
              fetchIndustries();
              fetchSkills();
              fetchLocations();
              fetchAiStats();
            }}
          >
            Làm mới
          </Button>
        </Space>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0062ff] flex items-center justify-center">
            <Layers size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Ngành nghề</div>
            <div className="text-xl font-black text-slate-900">
              {aiStats?.categories_summary?.industries_count ?? industries.length}
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Wrench size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Kỹ năng chuyên môn</div>
            <div className="text-xl font-black text-slate-900">
              {aiStats?.categories_summary?.skills_count ?? skills.length}
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <MapPin size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Địa điểm / Tỉnh thành</div>
            <div className="text-xl font-black text-slate-900">
              {aiStats?.categories_summary?.locations_count ?? locations.length}
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Bot size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Tổng tác vụ AI đã xử lý</div>
            <div className="text-xl font-black text-purple-600">
              {aiStats?.total_ai_tasks ?? 0}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs">
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as any)}
          items={[
            {
              key: "industries",
              label: (
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <Layers size={15} /> Ngành nghề ({industries.length})
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between gap-3 flex-wrap">
                    <Input
                      placeholder="Tìm kiếm ngành nghề..."
                      value={industrySearch}
                      onChange={(e) => setIndustrySearch(e.target.value)}
                      className="w-72"
                      allowClear
                    />
                    <Button
                      type="primary"
                      icon={<Plus size={15} />}
                      className="bg-[#0062ff]"
                      onClick={() => setIndustryModalOpen(true)}
                    >
                      Thêm ngành nghề
                    </Button>
                  </div>
                  <Table
                    dataSource={filteredIndustries}
                    rowKey="id"
                    loading={loadingIndustries}
                    columns={[
                      {
                        title: "ID",
                        dataIndex: "id",
                        width: 80,
                        render: (id: number) => <span className="font-mono text-slate-500">#{id}</span>,
                      },
                      {
                        title: "Tên ngành nghề",
                        dataIndex: "name",
                        render: (n: string) => <span className="font-bold text-slate-900">{n}</span>,
                      },
                      {
                        title: "Slug",
                        dataIndex: "slug",
                        render: (s: string) => <Tag>{s}</Tag>,
                      },
                      {
                        title: "Số việc làm / Công ty",
                        key: "counts",
                        render: (_: any, r: any) => (
                          <Space>
                            <Tag color="blue">{r.jobs_count ?? 0} việc làm</Tag>
                            <Tag color="cyan">{r.companies_count ?? 0} công ty</Tag>
                          </Space>
                        ),
                      },
                      {
                        title: "Thao tác",
                        key: "action",
                        align: "right" as const,
                        render: (_: any, r: any) => (
                          <Popconfirm
                            title="Xóa ngành nghề này?"
                            onConfirm={() => handleDeleteIndustry(r.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                          >
                            <Button size="small" danger icon={<Trash2 size={14} />}>
                              Xóa
                            </Button>
                          </Popconfirm>
                        ),
                      },
                    ]}
                  />
                </div>
              ),
            },
            {
              key: "skills",
              label: (
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <Wrench size={15} /> Kỹ năng ({skills.length})
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between gap-3 flex-wrap">
                    <Input
                      placeholder="Tìm kiếm kỹ năng hoặc nhóm..."
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      className="w-72"
                      allowClear
                    />
                    <Button
                      type="primary"
                      icon={<Plus size={15} />}
                      className="bg-[#0062ff]"
                      onClick={() => setSkillModalOpen(true)}
                    >
                      Thêm kỹ năng
                    </Button>
                  </div>
                  <Table
                    dataSource={filteredSkills}
                    rowKey="id"
                    loading={loadingSkills}
                    columns={[
                      {
                        title: "ID",
                        dataIndex: "id",
                        width: 80,
                        render: (id: number) => <span className="font-mono text-slate-500">#{id}</span>,
                      },
                      {
                        title: "Tên kỹ năng",
                        dataIndex: "name",
                        render: (n: string) => <span className="font-bold text-slate-900">{n}</span>,
                      },
                      {
                        title: "Nhóm (Category)",
                        dataIndex: "category",
                        render: (c: string) => <Tag color="geekblue">{c || "General"}</Tag>,
                      },
                      {
                        title: "Thao tác",
                        key: "action",
                        align: "right" as const,
                        render: (_: any, r: any) => (
                          <Popconfirm
                            title="Xóa kỹ năng này?"
                            onConfirm={() => handleDeleteSkill(r.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                          >
                            <Button size="small" danger icon={<Trash2 size={14} />}>
                              Xóa
                            </Button>
                          </Popconfirm>
                        ),
                      },
                    ]}
                  />
                </div>
              ),
            },
            {
              key: "locations",
              label: (
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <MapPin size={15} /> Địa điểm ({locations.length})
                </span>
              ),
              children: (
                <div className="space-y-4 pt-2">
                  <Input
                    placeholder="Tìm tỉnh/thành phố, quận/huyện..."
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    className="w-72"
                    allowClear
                  />
                  <Table
                    dataSource={filteredLocations}
                    rowKey="id"
                    loading={loadingLocations}
                    columns={[
                      { title: "ID", dataIndex: "id", width: 80 },
                      {
                        title: "Tỉnh / Thành phố",
                        dataIndex: "province",
                        render: (p: string) => <span className="font-bold text-slate-900">{p}</span>,
                      },
                      {
                        title: "Quận / Huyện",
                        dataIndex: "district",
                        render: (d: string) => d || "—",
                      },
                      {
                        title: "Phường / Xã",
                        dataIndex: "ward",
                        render: (w: string) => w || "—",
                      },
                    ]}
                  />
                </div>
              ),
            },
            {
              key: "ai",
              label: (
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <Bot size={15} /> Giám sát AI &amp; RAG ({aiStats?.total_ai_tasks ?? 0})
                </span>
              ),
              children: (
                <div className="space-y-6 pt-2">
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="font-bold text-slate-900">
                        Quản trị Kho tri thức RAG &amp; Vector Embeddings
                      </div>
                      <div className="text-xs text-slate-600">
                        Để tải lên tài liệu hướng dẫn nghề nghiệp, đồng bộ dữ liệu việc làm/công ty vào VectorDB cho AI Career Coach, truy cập trang Quản lý RAG chuyên biệt.
                      </div>
                    </div>
                    <Link href="/admin/knowledge">
                      <Button type="primary" className="bg-[#0062ff]" icon={<ExternalLink size={14} />}>
                        Mở Quản lý Kho tri thức RAG
                      </Button>
                    </Link>
                  </div>

                  {/* Phân bố theo loại tác vụ AI */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3">
                      Phân bố tác vụ AI theo loại (intelligence.ai_tasks)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {aiStats?.tasks_by_type && Object.keys(aiStats.tasks_by_type).length > 0 ? (
                        Object.entries(aiStats.tasks_by_type).map(([tType, cnt]: [string, any]) => (
                          <div
                            key={tType}
                            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60"
                          >
                            <div className="text-xs font-mono text-slate-500">{tType}</div>
                            <div className="text-xl font-black text-slate-900 mt-1">
                              {Number(cnt).toLocaleString("vi-VN")}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-4 text-xs text-slate-400">
                          Chưa có bản ghi tác vụ AI nào trong bảng intelligence.ai_tasks.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Danh sách tác vụ AI gần đây */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3">
                      Nhật ký tác vụ AI gần đây
                    </h3>
                    <Table
                      dataSource={aiStats?.recent_tasks || []}
                      rowKey="id"
                      loading={loadingAi}
                      pagination={false}
                      columns={[
                        {
                          title: "Task ID",
                          dataIndex: "id",
                          render: (id: number) => <span className="font-mono">#{id}</span>,
                        },
                        {
                          title: "Loại tác vụ (Task Type)",
                          dataIndex: "task_type",
                          render: (t: string) => <Tag color="purple">{t}</Tag>,
                        },
                        {
                          title: "Trạng thái",
                          dataIndex: "status",
                          render: (s: string) => (
                            <Tag color={s === "completed" || s === "success" ? "green" : "gold"}>
                              {(s || "completed").toUpperCase()}
                            </Tag>
                          ),
                        },
                        {
                          title: "Thời gian tạo",
                          dataIndex: "created_at",
                          render: (d: string) =>
                            d ? new Date(d).toLocaleString("vi-VN") : "—",
                        },
                      ]}
                    />
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Modal thêm ngành nghề */}
      <Modal
        title="Thêm ngành nghề mới"
        open={industryModalOpen}
        onCancel={() => setIndustryModalOpen(false)}
        onOk={() => industryForm.submit()}
        okText="Thêm mới"
        cancelText="Hủy"
      >
        <Form form={industryForm} layout="vertical" onFinish={handleAddIndustry}>
          <Form.Item
            name="name"
            label="Tên ngành nghề"
            rules={[{ required: true, message: "Vui lòng nhập tên ngành nghề" }]}
          >
            <Input placeholder="VD: Trí tuệ nhân tạo & Khoa học dữ liệu" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal thêm kỹ năng */}
      <Modal
        title="Thêm kỹ năng chuyên môn mới"
        open={skillModalOpen}
        onCancel={() => setSkillModalOpen(false)}
        onOk={() => skillForm.submit()}
        okText="Thêm mới"
        cancelText="Hủy"
      >
        <Form form={skillForm} layout="vertical" onFinish={handleAddSkill}>
          <Form.Item
            name="name"
            label="Tên kỹ năng"
            rules={[{ required: true, message: "Vui lòng nhập tên kỹ năng" }]}
          >
            <Input placeholder="VD: TypeScript, Django, PyTorch..." />
          </Form.Item>
          <Form.Item name="category" label="Nhóm kỹ năng (Category)" initialValue="Programming">
            <Input placeholder="VD: Programming, Cloud, Database, Soft Skill..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <App>
      <AdminCategoriesAndAiContent />
    </App>
  );
}
