"use client";

import { useState } from "react";
import { Card, Input, Button, Avatar, List, Space, Typography, Badge } from "antd";
import { SendOutlined, MessageOutlined, FilePdfOutlined, UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const MOCK_CONVERSATIONS = [
  {
    id: "conv-1",
    companyName: "VNG Corporation",
    jobTitle: "Senior Fullstack Engineer",
    avatar: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=80&h=80&q=80",
    lastMessage: "Chào bạn, lịch phỏng vấn của bạn đã được xác nhận vào lúc 10h ngày 15/08.",
    lastMessageAt: "18:30",
    unreadCount: 1,
  },
  {
    id: "conv-2",
    companyName: "MOMO FinTech",
    jobTitle: "UI/UX Designer",
    avatar: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=80&h=80&q=80",
    lastMessage: "Cảm ơn bạn đã quan tâm. Chúng tôi sẽ phản hồi sớm nhất.",
    lastMessageAt: "Hôm qua",
    unreadCount: 0,
  },
];

const MOCK_MESSAGES: Record<string, any[]> = {
  "conv-1": [
    { id: "m1", sender: "candidate", text: "Chào anh/chị, em đã nhận được lời mời phỏng vấn ạ.", time: "18:00" },
    { id: "m2", sender: "employer", text: "Chào bạn, lịch phỏng vấn của bạn đã được xác nhận vào lúc 10h ngày 15/08.", time: "18:30" },
  ],
  "conv-2": [
    { id: "m3", sender: "candidate", text: "Em đã nộp CV ứng tuyển vị trí UI/UX mong anh chị xem xét.", time: "10:00" },
    { id: "m4", sender: "employer", text: "Cảm ơn bạn đã quan tâm. Chúng tôi sẽ phản hồi sớm nhất.", time: "11:20" },
  ],
};

export default function CandidateChatPage() {
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState("conv-1");
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: `m-${Date.now()}`,
      sender: "candidate",
      text: inputValue,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages({
      ...messages,
      [activeConvId]: [...(messages[activeConvId] || []), newMessage],
    });

    // Cập nhật tin nhắn cuối cùng trong danh sách hội thoại
    setConversations(
      conversations.map((conv) =>
        conv.id === activeConvId
          ? { ...conv, lastMessage: inputValue, lastMessageAt: "Vừa xong", unreadCount: 0 }
          : conv
      )
    );

    setInputValue("");
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const activeMessages = messages[activeConvId] || [];

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
          <List
            dataSource={conversations}
            renderItem={(item) => (
              <div
                onClick={() => {
                  setActiveConvId(item.id);
                  // Đọc tin nhắn -> xóa unread
                  setConversations(
                    conversations.map((c) => (c.id === item.id ? { ...c, unreadCount: 0 } : c))
                  );
                }}
                className={`p-4 flex items-center gap-3 cursor-pointer border-b border-slate-50 last:border-b-0 transition-colors ${
                  activeConvId === item.id ? "bg-blue-50/50 border-l-4 border-l-blue-600 pl-3" : "hover:bg-slate-50"
                }`}
              >
                <Badge count={item.unreadCount} size="small" offset={[-2, 2]}>
                  <Avatar src={item.avatar} icon={<UserOutlined />} className="bg-slate-100" />
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-xs sm:text-sm truncate">{item.companyName}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{item.lastMessageAt}</span>
                  </div>
                  <span className="text-[11px] text-blue-600 block font-medium truncate mt-0.5">{item.jobTitle}</span>
                  <span className="text-xs text-slate-500 block truncate mt-1">{item.lastMessage}</span>
                </div>
              </div>
            )}
          />
        </div>
      </div>

      {/* 2. Right Chat Window */}
      <div className="flex-1 flex flex-col h-full justify-between bg-slate-50/30">
        {activeConv ? (
          <>
            {/* Header chat */}
            <div className="p-4 border-b border-slate-100 bg-white flex items-center gap-3 shrink-0">
              <Avatar src={activeConv.avatar} icon={<UserOutlined />} />
              <div>
                <h4 className="m-0 font-bold text-slate-800 text-sm sm:text-base leading-snug">{activeConv.companyName}</h4>
                <span className="text-xs text-slate-400">{activeConv.jobTitle}</span>
              </div>
            </div>

            {/* Khung chứa tin nhắn */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col">
              {activeMessages.map((msg) => {
                const isMe = msg.sender === "candidate";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[70%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
                  >
                    <div
                      className={`p-3 rounded-2xl text-xs sm:text-sm ${
                        isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-white border border-slate-100 text-slate-800 rounded-bl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
                  </div>
                );
              })}
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
                <Button type="primary" onClick={handleSendMessage} icon={<SendOutlined />} className="bg-blue-600 hover:bg-blue-700 h-10 w-10 flex items-center justify-center shrink-0 rounded-lg" />
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
