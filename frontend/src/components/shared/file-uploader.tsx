"use client";

import { useState } from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { candidateService, type CandidateDocument } from "@/services/candidate.service";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";

interface FileUploaderProps {
  documentType: "CV" | "COVER_LETTER" | "CERTIFICATE" | "DEGREE" | "PORTFOLIO" | "OTHER";
  title?: string;
  onSuccess?: (document: CandidateDocument) => void;
  accept?: string;
  maxSizeMB?: number;
}

export default function FileUploader({
  documentType,
  title = "Tải file lên",
  onSuccess,
  accept = ".pdf,.doc,.docx",
  maxSizeMB = 10,
}: FileUploaderProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    const isLtSize = file.size / 1024 / 1024 < maxSizeMB;
    if (!isLtSize) {
      message.error(`Dung lượng file không được vượt quá ${maxSizeMB}MB!`);
      return false;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType);
    formData.append("title", file.name.split(".").slice(0, -1).join(".")); // Lấy tên file bỏ đuôi làm tiêu đề

    try {
      const response = await candidateService.uploadDocument(formData);
      message.success("Tải tài liệu lên thành công!");
      setFileList([]);
      if (onSuccess) {
        onSuccess(response.data.document);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Tải tài liệu lên thất bại.";
      message.error(errorMsg);
    } finally {
      setUploading(false);
    }
    return false; // Ngăn không cho Antd tự động upload lên action URL mặc định
  };

  const props: UploadProps = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      setFileList([file]);
      handleUpload(file);
      return false;
    },
    fileList,
    accept,
    maxCount: 1,
  };

  return (
    <Upload {...props}>
      <Button icon={<UploadOutlined />} loading={uploading} className="w-full h-10 border-dashed hover:border-blue-600 hover:text-blue-600">
        {uploading ? "Đang tải lên..." : title}
      </Button>
    </Upload>
  );
}
