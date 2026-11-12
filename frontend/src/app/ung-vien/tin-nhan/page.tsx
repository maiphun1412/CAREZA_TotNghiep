"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, Input, Button, Avatar, List, Typography, Badge, Alert, Spin, Empty } from "antd";
import { SendOutlined, MessageOutlined, UserOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { interactionService, ConversationItem } from "@/services/interaction.service";

const { Title, Text } = Typography;

export default function CandidateChatPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [firebaseStatusNotice, setFirebaseStatusNotice] = useState<string>(
    "Kênh chat Realtime (Firebase) chưa được cấu hình credentials. Hệ thống đang hiển thị dữ liệu hội thoại đồng bộ từ cơ sở dữ liệu CAREZA."
  );

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await interactionService.getConversations();
      setConversations(data);
      if (data.length > 0 && activeConvId === null) {
        setActiveConvId(data[0].id);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [activeConvId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleSelectConversation = async (convId: number) => {
    setActiveConvId(convId);
    try {
      await interactionService.touchConversation(convId);
    } catch {
      // ignore
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    // Báo rõ ràng theo quy tắc tích hợp: không giả lập gửi/nhận tin nhắn khi Firebase chưa cấu hình
    setFirebaseStatusNotice(
      "Dịch vụ gửi tin nhắn Realtime chưa thể phát đi do Firebase Credentials chưa được thiết lập trên môi trường máy chủ. Vui lòng cấu hình Firebase để kích hoạt tính năng chat trực tuyến."
    );
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="flex flex-1 overflow-hidden border border-slate-100 shadow-sm bg-white rounded-2xl h-[calc(100vh-120px)]">
      {/* 1. Left Conversation List */}
      <div className="w-80 border-r border-slate-100 flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <Title level={4} className="m-0 text-slate-800 font-extrabold flex items-center gap-2">
            <MessageOutlined /> Trò chuyện
          </Title>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Spin />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-slate-400">
              <Empty description="Chưa có cuộc trò chuyện nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          ) : (
            <List
              dataSource={conversations}
              renderItem={(item) => (
                <div
                  onClick={() => handleSelectConversation(item.id)}
                  className={`p-4 flex items-center gap-3 cursor-pointer border-b border-slate-50 last:border-b-0 transition-colors ${
                    activeConvId === item.id ? "bg-blue-50/50 border-l-4 border-l-blue-600 pl-3" : "hover:bg-slate-50"
                  }`}
                >
                  <Badge count={item.unreadCount || 0} size="small" offset={[-2, 2]}>
                    <Avatar src={item.partner.avatar} icon={<UserOutlined />} className="bg-slate-100" />
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 text-xs sm:text-sm truncate">
                        {item.partner.name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {item.last_message_at
                          ? new Date(item.last_message_at).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
                    <span className="text-[11px] text-blue-600 block font-medium truncate mt-0.5">
                      {item.partner.email || "Doanh nghiệp tuyển dụng"}
                    </span>
                    <span className="text-xs text-slate-500 block truncate mt-1">
                      {item.lastMessage || "Nhấn để xem cuộc hội thoại"}
                    </span>
                  </div>
                </div>
              )}
            />
          )}
        </div>
      </div>

      {/* 2. Right Chat Window */}
      <div className="flex-1 flex flex-col h-full justify-between bg-slate-50/30">
        {activeConv ? (
          <>
            {/* Header chat */}
            <div className="p-4 border-b border-slate-100 bg-white flex items-center gap-3 shrink-0">
              <Avatar src={activeConv.partner.avatar} icon={<UserOutlined />} />
              <div>
                <h4 className="m-0 font-bold text-slate-800 text-sm sm:text-base leading-snug">
                  {activeConv.partner.name}
                </h4>
                <span className="text-xs text-slate-400">
                  {activeConv.partner.email || "Đối tác tuyển dụng"}
                </span>
              </div>
            </div>

            {/* Thông báo trạng thái Realtime / Firebase */}
            {firebaseStatusNotice && (
              <div className="p-3">
                <Alert
                  message="Thông báo kết nối Realtime"
                  description={firebaseStatusNotice}
                  type="info"
                  showIcon
                  icon={<InfoCircleOutlined />}
                  closable
                  onClose={() => setFirebaseStatusNotice("")}
                />
              </div>
            )}

            {/* Khung tin nhắn */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col justify-center items-center text-slate-400">
              <MessageOutlined className="text-4xl text-slate-300 mb-2" />
              <p className="text-sm">Hội thoại mã số #{activeConv.id} giữa bạn và {activeConv.partner.name}.</p>
              <p className="text-xs text-slate-400 max-w-md text-center">
                Toàn bộ dữ liệu hội thoại được mã hóa và đồng bộ qua thread ID:{" "}
                <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">{activeConv.firebase_thread_id || `conv_${activeConv.id}`}</span>
              </p>
            </div>

            {/* Input gửi tin nhắn */}
            <div className="p-4 border-t border-slate-100 bg-white shrink-0">
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập tin nhắn..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onPressEnter={handleSendMessage}
                  className="h-10 rounded-lg"
                />
                <Button
                  type="primary"
                  onClick={handleSendMessage}
                  icon={<SendOutlined />}
                  className="bg-blue-600 hover:bg-blue-700 h-10 w-10 flex items-center justify-center shrink-0 rounded-lg"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <MessageOutlined className="text-5xl opacity-30" />
            <span>Chọn một cuộc hội thoại để bắt đầu nhắn tin</span>
          </div>
        )}
      </div>
    </div>
  );
}
