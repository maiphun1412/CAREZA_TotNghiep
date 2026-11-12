"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Tag,
  Button,
  Input,
  Select,
  Modal,
  Drawer,
  Form,
  Popconfirm,
  Tooltip,
  Badge,
  Space,
  Alert,
  Empty,
  Spin,
  message,
} from "antd";
import {
  BookOpen,
  Plus,
  Search,
  FileText,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  Globe,
  Layers,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { adminService } from "@/services/admin.service";
import { useAuthStore } from "@/store/auth-store";

interface KnowledgeDocItem {
  id: number;
  title: string;
  source_url: string;
  doc_type: string;
  status: string;
  content_length: number;
  chunks_count: number;
  created_at: string;
}

interface ChunkItem {
  chunk_id: number;
  chunk_index: number;
  content: string;
  content_length: number;
}

interface DocDetail {
  id: number;
  title: string;
  source_url: string;
  doc_type: string;
  status: string;
  content: string;
  created_at: string;
  chunks_count: number;
  chunks: ChunkItem[];
}

export default function AdminKnowledgeBasePage() {
  const { user } = useAuthStore();
  const isAdmin =
    (user?.roles as string[] | undefined)?.includes("admin") ||
    (user as any)?.accountType === "admin" ||
    (user as any)?.role === "admin";

  // State danh sách
  const [documents, setDocuments] = useState<KnowledgeDocItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [docTypeFilter, setDocTypeFilter] = useState<string | undefined>(undefined);

  // State Modal Chi tiết (Drawer)
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocDetail | null>(null);

  // State Modal Tạo mới & Sửa
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingDocId, setEditingDocId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Load danh sách tài liệu từ API thật
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getKnowledgeDocuments({
        page,
        page_size: pageSize,
        search: searchQuery.trim() || undefined,
        status: statusFilter || undefined,
        doc_type: docTypeFilter || undefined,
      });

      if (res?.success && res?.data) {
        setDocuments(res.data.items || []);
        setTotal(res.data.total || 0);
      } else {
        setDocuments([]);
        setTotal(0);
      }
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Không thể tải danh sách tài liệu tri thức. Vui lòng kiểm tra quyền quản trị.";
      message.error(errMsg);
      setDocuments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery, statusFilter, docTypeFilter]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Xem chi tiết tài liệu kèm chunks thực tế
  const handleViewDetail = async (id: number) => {
    setDetailLoading(true);
    setDetailVisible(true);
    setSelectedDoc(null);
    try {
      const res = await adminService.getKnowledgeDocumentDetail(id);
      if (res?.success && res?.data) {
        setSelectedDoc(res.data);
      } else {
        message.error("Không tìm thấy thông tin chi tiết tài liệu.");
      }
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.detail || err?.response?.data?.message || "Lỗi khi tải chi tiết tài liệu.";
      message.error(errMsg);
    } finally {
      setDetailLoading(false);
    }
  };

  // Mở modal tạo mới
  const handleOpenCreateModal = () => {
    form.resetFields();
    form.setFieldsValue({
      doc_type: "general",
      chunk_size: 600,
      chunk_overlap: 100,
    });
    setEditingDocId(null);
    setFormModalVisible(true);
  };

  // Mở modal chỉnh sửa
  const handleOpenEditModal = async (record: KnowledgeDocItem) => {
    form.resetFields();
    setEditingDocId(record.id);
    setFormModalVisible(true);

    try {
      const res = await adminService.getKnowledgeDocumentDetail(record.id);
      if (res?.success && res?.data) {
        form.setFieldsValue({
          title: res.data.title,
          doc_type: res.data.doc_type,
          source_url: res.data.source_url,
          content: res.data.content,
          chunk_size: 600,
          chunk_overlap: 100,
        });
      }
    } catch {
      form.setFieldsValue({
        title: record.title,
        doc_type: record.doc_type,
        source_url: record.source_url,
      });
    }
  };

  // Lưu tài liệu (Tạo mới hoặc Cập nhật)
  const handleSaveDocument = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (editingDocId) {
        // Cập nhật
        await adminService.updateKnowledgeDocument(editingDocId, {
          title: values.title,
          content: values.content,
          doc_type: values.doc_type,
          source_url: values.source_url,
          chunk_size: values.chunk_size,
          chunk_overlap: values.chunk_overlap,
        });
        message.success("Cập nhật tài liệu và đồng bộ hóa chunks thành công!");
      } else {
        // Tạo mới (mặc định status là draft theo quy tắc an toàn)
        await adminService.createKnowledgeDocument({
          title: values.title,
          content: values.content,
          doc_type: values.doc_type,
          source_url: values.source_url,
          status: "draft",
          chunk_size: values.chunk_size,
          chunk_overlap: values.chunk_overlap,
        });
        message.success("Tạo mới tài liệu tri thức ở trạng thái Bản nháp (Draft) thành công!");
      }

      setFormModalVisible(false);
      form.resetFields();
      fetchDocuments();
    } catch (err: any) {
      if (err?.errorFields) return;
      const errMsg =
        err?.response?.data?.title?.[0] ||
        err?.response?.data?.content?.[0] ||
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Thao tác thất bại. Vui lòng thử lại.";
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Xuất bản tài liệu (Publish)
  const handlePublish = async (id: number) => {
    try {
      await adminService.publishKnowledgeDocument(id);
      message.success("Đã xuất bản tài liệu! Tài liệu hiện đã được đưa vào phạm vi tìm kiếm công khai của RAG Chatbot.");
      fetchDocuments();
      if (selectedDoc && selectedDoc.id === id) {
        setSelectedDoc((prev) => (prev ? { ...prev, status: "published" } : null));
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.detail || "Không thể xuất bản tài liệu.";
      message.error(errMsg);
    }
  };

  // Ngừng xuất bản (Unpublish)
  const handleUnpublish = async (id: number) => {
    try {
      await adminService.unpublishKnowledgeDocument(id);
      message.warning("Đã ngừng xuất bản. Tài liệu chuyển về Bản nháp (Draft) và bị loại khỏi phạm vi tìm kiếm công khai.");
      fetchDocuments();
      if (selectedDoc && selectedDoc.id === id) {
        setSelectedDoc((prev) => (prev ? { ...prev, status: "draft" } : null));
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.detail || "Không thể ngừng xuất bản tài liệu.";
      message.error(errMsg);
    }
  };

  // Xóa tài liệu
  const handleDelete = async (id: number) => {
    try {
      await adminService.deleteKnowledgeDocument(id);
      message.success("Đã xóa tài liệu và toàn bộ chunks liên quan thành công!");
      fetchDocuments();
    } catch (err: any) {
      const errMsg = err?.response?.data?.detail || "Không thể xóa tài liệu.";
      message.error(errMsg);
    }
  };

  // Tag hiển thị trạng thái
  const renderStatusTag = (status: string) => {
    switch (status) {
      case "published":
      case "active":
        return (
          <Tag color="green" className="font-semibold text-[11px] inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Đã xuất bản (Published)</span>
          </Tag>
        );
      case "draft":
        return (
          <Tag color="orange" className="font-semibold text-[11px] inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Bản nháp (Draft)</span>
          </Tag>
        );
      case "archived":
        return (
          <Tag color="default" className="font-semibold text-[11px]">
            Đã lưu trữ
          </Tag>
        );
      default:
        return <Tag>{status}</Tag>;
    }
  };

  // Bảng dữ liệu cột
  const columns = [
    {
      title: "Mã",
      dataIndex: "id",
      key: "id",
      width: 70,
      render: (id: number) => <span className="font-mono text-xs font-bold text-slate-500">#{id}</span>,
    },
    {
      title: "Tiêu đề tài liệu tri thức",
      dataIndex: "title",
      key: "title",
      render: (title: string, record: KnowledgeDocItem) => (
        <div className="space-y-0.5 max-w-md">
          <span
            onClick={() => handleViewDetail(record.id)}
            className="text-xs sm:text-[13px] font-bold text-slate-900 hover:text-[#0062ff] cursor-pointer block line-clamp-2"
          >
            {title}
          </span>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="capitalize bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
              {record.doc_type || "general"}
            </span>
            <span>•</span>
            <span>{record.content_length?.toLocaleString()} ký tự</span>
          </div>
        </div>
      ),
    },
    {
      title: "Số Chunks",
      dataIndex: "chunks_count",
      key: "chunks_count",
      width: 110,
      render: (count: number) => (
        <Badge
          count={count || 0}
          showZero
          style={{ backgroundColor: count > 0 ? "#0062ff" : "#94a3b8" }}
        />
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 170,
      render: (st: string) => renderStatusTag(st),
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (timeStr: string) => (
        <span className="text-xs text-slate-500 font-medium">
          {timeStr ? new Date(timeStr).toLocaleDateString("vi-VN") : "—"}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      render: (_: any, record: KnowledgeDocItem) => {
        const isPublished = record.status === "published" || record.status === "active";
        return (
          <Space size="small">
            <Tooltip title="Xem chi tiết & Chunks">
              <Button
                type="text"
                size="small"
                icon={<Eye className="w-4 h-4 text-blue-600" />}
                onClick={() => handleViewDetail(record.id)}
              />
            </Tooltip>

            {isPublished ? (
              <Popconfirm
                title="Ngừng xuất bản tài liệu?"
                description="Tài liệu sẽ chuyển về bản nháp và không còn được truy xuất bởi RAG Chatbot."
                onConfirm={() => handleUnpublish(record.id)}
                okText="Ngừng xuất bản"
                cancelText="Hủy"
              >
                <Button size="small" className="text-[11px] font-semibold text-amber-600 border-amber-300">
                  Ẩn draft
                </Button>
              </Popconfirm>
            ) : (
              <Button
                size="small"
                type="primary"
                onClick={() => handlePublish(record.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-[11px] font-semibold"
              >
                Xuất bản
              </Button>
            )}

            <Tooltip title="Chỉnh sửa nội dung">
              <Button
                type="text"
                size="small"
                icon={<Edit className="w-4 h-4 text-slate-600" />}
                onClick={() => handleOpenEditModal(record)}
              />
            </Tooltip>

            <Popconfirm
              title="Xóa tài liệu vĩnh viễn?"
              description="Thao tác này sẽ xóa tài liệu và toàn bộ chunks liên quan. Hành động không thể hoàn tác!"
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Xóa tài liệu">
                <Button type="text" danger size="small" icon={<Trash2 className="w-4 h-4" />} />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#0062ff]" />
            <span>Quản trị Cơ sở Tri thức (Knowledge Base)</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
            Quản lý tài liệu và các đoạn tri thức (chunks) phục vụ RAG Chatbot hướng nghiệp CAREZA
          </p>
        </div>

        <Space>
          <Button
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => fetchDocuments()}
            loading={loading}
            className="text-xs font-semibold rounded-lg"
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreateModal}
            className="bg-[#0062ff] hover:bg-blue-700 text-xs font-bold rounded-lg shadow-xs"
          >
            Tạo tài liệu mới
          </Button>
        </Space>
      </div>

      {/* Bộ lọc & Tìm kiếm */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Input
            placeholder="Tìm kiếm theo tiêu đề tài liệu..."
            prefix={<Search className="w-4 h-4 text-slate-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onPressEnter={() => {
              setPage(1);
              fetchDocuments();
            }}
            allowClear
            className="rounded-lg text-xs"
          />

          <Select
            placeholder="Lọc theo trạng thái"
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            allowClear
            className="w-full text-xs"
            options={[
              { label: "Tất cả trạng thái", value: "" },
              { label: "Đã xuất bản (Published)", value: "published" },
              { label: "Bản nháp (Draft)", value: "draft" },
              { label: "Đã lưu trữ (Archived)", value: "archived" },
            ]}
          />

          <Select
            placeholder="Lọc theo phân loại"
            value={docTypeFilter}
            onChange={(val) => {
              setDocTypeFilter(val);
              setPage(1);
            }}
            allowClear
            className="w-full text-xs"
            options={[
              { label: "Tất cả phân loại", value: "" },
              { label: "Chung (General)", value: "general" },
              { label: "Chính sách (Policy)", value: "policy" },
              { label: "Hướng dẫn (Guide)", value: "guide" },
              { label: "Hỏi đáp (FAQ)", value: "faq" },
            ]}
          />

          <Button
            type="default"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter(undefined);
              setDocTypeFilter(undefined);
              setPage(1);
            }}
            className="text-xs font-semibold text-slate-600 rounded-lg"
          >
            Đặt lại bộ lọc
          </Button>
        </div>

        {/* Bảng danh sách */}
        <Table
          dataSource={documents}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "15", "20", "50"],
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
            showTotal: (t) => `Tổng số: ${t} tài liệu`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có tài liệu tri thức nào trong cơ sở dữ liệu."
              />
            ),
          }}
          className="overflow-x-auto"
        />
      </div>

      {/* Drawer Chi tiết Tài liệu & Danh sách Chunks */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0062ff]" />
            <span className="font-bold text-sm sm:text-base">Chi tiết Tài liệu & Phân đoạn Chunks</span>
          </div>
        }
        width={720}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        extra={
          selectedDoc && (
            <Space>
              {selectedDoc.status === "published" ? (
                <Button size="small" onClick={() => handleUnpublish(selectedDoc.id)}>
                  Ngừng xuất bản
                </Button>
              ) : (
                <Button
                  size="small"
                  type="primary"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handlePublish(selectedDoc.id)}
                >
                  Xuất bản ngay
                </Button>
              )}
            </Space>
          )
        }
      >
        {detailLoading ? (
          <div className="py-20 text-center">
            <Spin size="large" />
            <span className="block text-xs text-slate-500 mt-2">Đang tải chi tiết và các đoạn chunks...</span>
          </div>
        ) : selectedDoc ? (
          <div className="space-y-5">
            {/* Thẻ thông tin chung */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400 font-bold">Mã tài liệu: #{selectedDoc.id}</span>
                {renderStatusTag(selectedDoc.status)}
              </div>
              <h3 className="text-base font-extrabold text-slate-900 m-0">{selectedDoc.title}</h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                <span>Phân loại: <strong className="text-slate-700">{selectedDoc.doc_type || "general"}</strong></span>
                <span>•</span>
                <span>Tổng chunks: <strong className="text-[#0062ff]">{selectedDoc.chunks_count} chunks</strong></span>
                <span>•</span>
                <span>Tổng ký tự: <strong className="text-slate-700">{selectedDoc.content?.length || 0}</strong></span>
              </div>
              {selectedDoc.source_url && (
                <div className="pt-1 text-xs">
                  <a
                    href={selectedDoc.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0062ff] hover:underline inline-flex items-center gap-1"
                  >
                    <span>{selectedDoc.source_url}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Nội dung gốc */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Nội dung toàn văn tài liệu:
              </span>
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line max-h-56 overflow-y-auto">
                {selectedDoc.content}
              </div>
            </div>

            {/* Danh sách các chunks thực tế được cắt */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#0062ff]" />
                  <span>Các phân đoạn thực tế (Chunks) ({selectedDoc.chunks?.length || 0}):</span>
                </span>
                <span className="text-[11px] text-slate-400">Tự động chia bởi TextChunker</span>
              </div>

              <div className="space-y-2.5">
                {selectedDoc.chunks && selectedDoc.chunks.length > 0 ? (
                  selectedDoc.chunks.map((chk, idx) => (
                    <div
                      key={chk.chunk_id || idx}
                      className="p-3 bg-white border border-blue-100 rounded-xl space-y-1.5 shadow-2xs hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#0062ff]">
                          Chunk #{chk.chunk_index + 1} (ID: {chk.chunk_id})
                        </span>
                        <span className="text-slate-400">{chk.content_length} ký tự</span>
                      </div>
                      <p className="text-xs text-slate-700 m-0 leading-relaxed whitespace-pre-line bg-slate-50/70 p-2 rounded-lg font-mono">
                        {chk.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <Empty description="Tài liệu này hiện chưa có đoạn chunk nào." />
                )}
              </div>
            </div>
          </div>
        ) : (
          <Empty description="Không thể hiển thị thông tin tài liệu." />
        )}
      </Drawer>

      {/* Modal Form Tạo mới / Chỉnh sửa */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#0062ff]" />
            <span className="font-bold text-base">
              {editingDocId ? "Chỉnh sửa Tài liệu Tri thức" : "Tạo mới Tài liệu Tri thức"}
            </span>
          </div>
        }
        open={formModalVisible}
        onCancel={() => {
          setFormModalVisible(false);
          form.resetFields();
        }}
        onOk={handleSaveDocument}
        confirmLoading={submitting}
        okText={editingDocId ? "Lưu thay đổi" : "Tạo tài liệu (Bản nháp)"}
        cancelText="Hủy bỏ"
        width={680}
      >
        <div className="py-2">
          {!editingDocId && (
            <Alert
              type="info"
              showIcon
              className="mb-4 text-xs"
              message="Nguyên tắc an toàn tri thức"
              description="Tài liệu mới sẽ được lưu dưới dạng Bản nháp (Draft). Bạn có thể kiểm tra nội dung và các đoạn chunks trước khi quyết định Xuất bản (Publish) cho AI truy xuất."
            />
          )}

          <Form form={form} layout="vertical" className="space-y-1">
            <Form.Item
              name="title"
              label={<span className="text-xs font-bold text-slate-700">Tiêu đề tài liệu</span>}
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề tài liệu tri thức!" }]}
            >
              <Input placeholder="Ví dụ: Quy chế ứng xử và tiêu chuẩn phỏng vấn tại CAREZA" maxLength={250} />
            </Form.Item>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Form.Item
                name="doc_type"
                label={<span className="text-xs font-bold text-slate-700">Phân loại tài liệu</span>}
                rules={[{ required: true, message: "Vui lòng chọn loại tài liệu!" }]}
              >
                <Select
                  options={[
                    { label: "Chung (General)", value: "general" },
                    { label: "Chính sách (Policy)", value: "policy" },
                    { label: "Hướng dẫn ứng tuyển/tuyển dụng (Guide)", value: "guide" },
                    { label: "Hỏi đáp thường gặp (FAQ)", value: "faq" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="source_url"
                label={<span className="text-xs font-bold text-slate-700">Đường dẫn nguồn tham chiếu (nếu có)</span>}
              >
                <Input placeholder="https://careza.vn/policies/interview" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Form.Item
                name="chunk_size"
                label={<span className="text-xs font-bold text-slate-700">Kích thước chunk tối đa (ký tự)</span>}
                tooltip="Mặc định 600 ký tự. Hệ thống tự động cắt theo đoạn và câu hoàn chỉnh."
              >
                <Select
                  options={[
                    { label: "400 ký tự (Ngắn)", value: 400 },
                    { label: "600 ký tự (Tiêu chuẩn RAG)", value: 600 },
                    { label: "800 ký tự (Dài)", value: 800 },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="chunk_overlap"
                label={<span className="text-xs font-bold text-slate-700">Độ gối overlap giữa các chunk</span>}
                tooltip="Mặc định 100 ký tự để giữ mạch ngữ cảnh giữa các đoạn."
              >
                <Select
                  options={[
                    { label: "50 ký tự", value: 50 },
                    { label: "100 ký tự (Tiêu chuẩn)", value: 100 },
                    { label: "150 ký tự", value: 150 },
                  ]}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="content"
              label={<span className="text-xs font-bold text-slate-700">Nội dung chi tiết tài liệu tri thức</span>}
              rules={[{ required: true, message: "Vui lòng nhập nội dung tài liệu!" }]}
            >
              <Input.TextArea
                rows={8}
                placeholder="Nhập toàn bộ nội dung hướng dẫn, chính sách hoặc quy định cần bổ sung vào cơ sở tri thức..."
                showCount
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
}
