"use client";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { ResumeData } from "../types";

// Thiết lập virtual file system cho font chữ Unicode tiếng Việt (Roboto chuẩn của pdfmake)
if (typeof window !== "undefined") {
  const vfs =
    (pdfFonts as any)?.pdfMake?.vfs ||
    (pdfFonts as any)?.vfs ||
    (pdfFonts as any)?.default?.pdfMake?.vfs;
  if (vfs) {
    (pdfMake as any).vfs = vfs;
  }
}

// Chuyển đổi mã màu hex sang định dạng hex sạch
function cleanColor(hex: string, defaultColor = "#0062ff"): string {
  if (!hex || typeof hex !== "string") return defaultColor;
  return hex.startsWith("#") ? hex : `#${hex}`;
}

export async function generateCvPdfDefinition(data: ResumeData): Promise<any> {
  const { personalInfo, experiences, educations, skills, projects, certificates, sections, theme } = data;
  const isVisible = (id: string) => sections.find((s) => s.id === id)?.visible ?? true;

  const primaryColor = cleanColor(theme.primaryColor, "#0062ff");
  const secondaryColor = cleanColor(theme.secondaryColor, "#f1f5f9");

  // Format date range
  const fmtDate = (start: string, end: string, isCurrent: boolean) => {
    if (!start && !end) return "";
    const endStr = isCurrent ? "Hiện tại" : end;
    return `${start} - ${endStr}`.trim();
  };

  // Content blocks theo từng template
  const isTwoColumn = theme.templateId === "modern-two-column";
  const isExecutive = theme.templateId === "classic-executive";
  const isMinimal = theme.templateId === "minimalist-clean";
  const isCompact = theme.templateId === "compact-dense";
  const isInfographic = theme.templateId === "infographic-bold";

  // ==========================================
  // 1. TẠO NỘI DUNG CHO MẪU 2 CỘT (MODERN TWO-COLUMN)
  // ==========================================
  if (isTwoColumn) {
    const leftColumnContent: any[] = [];
    const rightColumnContent: any[] = [];

    // LEFT COLUMN: Liên hệ
    if (isVisible("info")) {
      leftColumnContent.push({
        text: "THÔNG TIN LIÊN HỆ",
        style: "sidebarHeading",
        color: primaryColor,
        margin: [0, 0, 0, 8],
      });

      const contactItems = [];
      if (personalInfo.email) contactItems.push({ text: `Email: ${personalInfo.email}`, margin: [0, 2, 0, 2] });
      if (personalInfo.phone) contactItems.push({ text: `SĐT: ${personalInfo.phone}`, margin: [0, 2, 0, 2] });
      if (personalInfo.address) contactItems.push({ text: `Địa chỉ: ${personalInfo.address}`, margin: [0, 2, 0, 2] });
      if (personalInfo.website) contactItems.push({ text: `Website: ${personalInfo.website}`, margin: [0, 2, 0, 2] });

      leftColumnContent.push({
        stack: contactItems,
        style: "sidebarText",
        margin: [0, 0, 0, 16],
      });
    }

    // LEFT COLUMN: Kỹ năng
    if (isVisible("skills") && skills.length > 0) {
      leftColumnContent.push({
        text: "KỸ NĂNG CHUYÊN MÔN",
        style: "sidebarHeading",
        color: primaryColor,
        margin: [0, 0, 0, 8],
      });

      const skillStacks = skills.map((sk) => ({
        stack: [
          {
            columns: [
              { text: sk.name, style: "sidebarSkillName" },
              { text: `${sk.level}/5`, alignment: "right", style: "sidebarSkillLevel" },
            ],
          },
          {
            canvas: [
              {
                type: "rect",
                x: 0,
                y: 2,
                w: 160,
                h: 4,
                r: 2,
                color: "#e2e8f0",
              },
              {
                type: "rect",
                x: 0,
                y: 2,
                w: (sk.level / 5) * 160,
                h: 4,
                r: 2,
                color: primaryColor,
              },
            ],
            margin: [0, 2, 0, 8],
          },
        ],
      }));

      leftColumnContent.push({
        stack: skillStacks,
        margin: [0, 0, 0, 16],
      });
    }

    // LEFT COLUMN: Chứng chỉ
    if (isVisible("certificates") && certificates.length > 0) {
      leftColumnContent.push({
        text: "CHỨNG CHỈ",
        style: "sidebarHeading",
        color: primaryColor,
        margin: [0, 0, 0, 8],
      });

      const certItems = certificates.map((c) => ({
        stack: [
          { text: c.name, bold: true, fontSize: 9, color: "#1e293b" },
          { text: `${c.issuer} (${c.issueDate})`, fontSize: 8, color: "#64748b", margin: [0, 1, 0, 6] },
        ],
      }));

      leftColumnContent.push({ stack: certItems, margin: [0, 0, 0, 12] });
    }

    // RIGHT COLUMN: Header Họ tên & Vị trí
    rightColumnContent.push({
      text: personalInfo.fullName || "HỌ VÀ TÊN ỨNG VIÊN",
      style: "mainHeaderTitle",
    });
    rightColumnContent.push({
      text: (personalInfo.jobTitle || "CHUYÊN MÔN / VỊ TRÍ ỨNG TUYỂN").toUpperCase(),
      style: "mainHeaderSubtitle",
      color: primaryColor,
      margin: [0, 2, 0, 12],
    });

    // RIGHT COLUMN: Giới thiệu bản thân
    if (isVisible("summary") && personalInfo.summary?.trim()) {
      rightColumnContent.push({
        text: "MỤC TIÊU & GIỚI THIỆU",
        style: "sectionHeading",
        color: primaryColor,
      });
      rightColumnContent.push({
        text: personalInfo.summary,
        style: "bodyText",
        margin: [0, 3, 0, 14],
      });
    }

    // RIGHT COLUMN: Kinh nghiệm làm việc
    if (isVisible("experience") && experiences.length > 0) {
      rightColumnContent.push({
        text: "KINH NGHIỆM LÀM VIỆC",
        style: "sectionHeading",
        color: primaryColor,
      });

      const expBlocks = experiences.map((exp) => ({
        stack: [
          {
            columns: [
              { text: exp.position, bold: true, fontSize: 10, color: "#0f172a" },
              { text: fmtDate(exp.startDate, exp.endDate, exp.isCurrent), alignment: "right", fontSize: 8.5, color: "#64748b" },
            ],
          },
          { text: exp.company + (exp.location ? ` • ${exp.location}` : ""), italics: true, fontSize: 9, color: "#475569", margin: [0, 1, 0, 2] },
          { text: exp.description || "", style: "bodyText", margin: [0, 0, 0, 8] },
        ],
      }));

      rightColumnContent.push({ stack: expBlocks, margin: [0, 4, 0, 12] });
    }

    // RIGHT COLUMN: Học vấn
    if (isVisible("education") && educations.length > 0) {
      rightColumnContent.push({
        text: "HỌC VẤN",
        style: "sectionHeading",
        color: primaryColor,
      });

      const eduBlocks = educations.map((edu) => ({
        stack: [
          {
            columns: [
              { text: edu.school, bold: true, fontSize: 10, color: "#0f172a" },
              { text: `${edu.startDate} - ${edu.endDate}`, alignment: "right", fontSize: 8.5, color: "#64748b" },
            ],
          },
          { text: edu.major + (edu.gpa ? ` • GPA: ${edu.gpa}` : ""), fontSize: 9, color: "#475569", margin: [0, 1, 0, 2] },
          edu.description ? { text: edu.description, style: "bodyText", margin: [0, 0, 0, 6] } : {},
        ],
        margin: [0, 0, 0, 6],
      }));

      rightColumnContent.push({ stack: eduBlocks, margin: [0, 4, 0, 12] });
    }

    // RIGHT COLUMN: Dự án
    if (isVisible("projects") && projects.length > 0) {
      rightColumnContent.push({
        text: "DỰ ÁN TIÊU BIỂU",
        style: "sectionHeading",
        color: primaryColor,
      });

      const projBlocks = projects.map((p) => ({
        stack: [
          {
            columns: [
              { text: p.name, bold: true, fontSize: 10, color: "#0f172a" },
              { text: `${p.startDate} - ${p.endDate}`, alignment: "right", fontSize: 8.5, color: "#64748b" },
            ],
          },
          { text: `Vai trò: ${p.role}`, italics: true, fontSize: 9, color: "#475569", margin: [0, 1, 0, 2] },
          { text: p.description || "", style: "bodyText", margin: [0, 0, 0, 8] },
        ],
      }));

      rightColumnContent.push({ stack: projBlocks, margin: [0, 4, 0, 10] });
    }

    return {
      pageSize: "A4",
      pageMargins: [32, 32, 32, 32],
      defaultStyle: { font: "Roboto", fontSize: 9.5, lineHeight: 1.25, color: "#1e293b" },
      content: [
        {
          columns: [
            {
              width: "35%",
              stack: leftColumnContent,
              margin: [0, 0, 14, 0],
            },
            {
              width: "65%",
              stack: rightColumnContent,
            },
          ],
        },
      ],
      styles: {
        mainHeaderTitle: { fontSize: 20, bold: true, color: "#0f172a" },
        mainHeaderSubtitle: { fontSize: 10, bold: true, tracking: 1 },
        sidebarHeading: { fontSize: 9.5, bold: true, characterSpacing: 0.5 },
        sidebarText: { fontSize: 8.5, color: "#334155" },
        sidebarSkillName: { fontSize: 8.5, bold: true, color: "#1e293b" },
        sidebarSkillLevel: { fontSize: 7.5, color: "#64748b" },
        sectionHeading: { fontSize: 10.5, bold: true, characterSpacing: 0.5, margin: [0, 4, 0, 4] },
        bodyText: { fontSize: 9, color: "#334155", lineHeight: 1.28 },
      },
    };
  }

  // ==========================================
  // 2. TẠO NỘI DUNG CHO CÁC MẪU CÒN LẠI (1 CỘT, COMPACT, BOLD...)
  // ==========================================
  const docContent: any[] = [];

  // Header 1 cột
  docContent.push({
    text: personalInfo.fullName || "HỌ VÀ TÊN ỨNG VIÊN",
    alignment: isExecutive ? "center" : "left",
    fontSize: isExecutive ? 22 : 20,
    bold: true,
    color: isExecutive ? primaryColor : "#0f172a",
    margin: [0, 0, 0, 2],
  });

  docContent.push({
    text: (personalInfo.jobTitle || "CHUYÊN MÔN / VỊ TRÍ ỨNG TUYỂN").toUpperCase(),
    alignment: isExecutive ? "center" : "left",
    fontSize: 10,
    bold: true,
    color: isExecutive ? "#475569" : primaryColor,
    margin: [0, 0, 0, 6],
  });

  // Contact info inline
  if (isVisible("info")) {
    const contacts = [
      personalInfo.email,
      personalInfo.phone,
      personalInfo.address,
      personalInfo.website,
    ].filter(Boolean);

    docContent.push({
      text: contacts.join("  •  "),
      alignment: isExecutive ? "center" : "left",
      fontSize: 8.5,
      color: "#64748b",
      margin: [0, 0, 0, 10],
    });
  }

  // Đường kẻ phân cách
  docContent.push({
    canvas: [{ type: "line", x1: 0, y1: 0, x2: 530, y2: 0, lineWidth: 1.5, lineColor: primaryColor }],
    margin: [0, 0, 0, 12],
  });

  // Tóm tắt
  if (isVisible("summary") && personalInfo.summary?.trim()) {
    docContent.push({
      text: "TÓM TẮT NĂNG LỰC",
      fontSize: 10.5,
      bold: true,
      color: primaryColor,
      margin: [0, 0, 0, 3],
    });
    docContent.push({
      text: personalInfo.summary,
      fontSize: 9,
      color: "#334155",
      lineHeight: 1.28,
      margin: [0, 0, 0, 10],
    });
  }

  // Kinh nghiệm
  if (isVisible("experience") && experiences.length > 0) {
    docContent.push({
      text: "KINH NGHIỆM CHUYÊN MÔN",
      fontSize: 10.5,
      bold: true,
      color: primaryColor,
      margin: [0, 4, 0, 4],
    });

    experiences.forEach((exp) => {
      docContent.push({
        columns: [
          { text: exp.position, bold: true, fontSize: 10, color: "#0f172a" },
          { text: fmtDate(exp.startDate, exp.endDate, exp.isCurrent), alignment: "right", fontSize: 8.5, color: "#64748b" },
        ],
      });
      docContent.push({
        text: exp.company + (exp.location ? ` • ${exp.location}` : ""),
        italics: true,
        fontSize: 9,
        color: "#475569",
        margin: [0, 1, 0, 2],
      });
      docContent.push({
        text: exp.description || "",
        fontSize: 9,
        color: "#334155",
        lineHeight: 1.25,
        margin: [0, 0, 0, 8],
      });
    });
  }

  // Học vấn
  if (isVisible("education") && educations.length > 0) {
    docContent.push({
      text: "HỌC VẤN & BẰNG CẤP",
      fontSize: 10.5,
      bold: true,
      color: primaryColor,
      margin: [0, 4, 0, 4],
    });

    educations.forEach((edu) => {
      docContent.push({
        columns: [
          { text: edu.school, bold: true, fontSize: 10, color: "#0f172a" },
          { text: `${edu.startDate} - ${edu.endDate}`, alignment: "right", fontSize: 8.5, color: "#64748b" },
        ],
      });
      docContent.push({
        text: edu.major + (edu.gpa ? ` • GPA: ${edu.gpa}` : ""),
        fontSize: 9,
        color: "#475569",
        margin: [0, 1, 0, 6],
      });
    });
  }

  // Kỹ năng
  if (isVisible("skills") && skills.length > 0) {
    docContent.push({
      text: "KỸ NĂNG CỐT LÕI",
      fontSize: 10.5,
      bold: true,
      color: primaryColor,
      margin: [0, 4, 0, 4],
    });

    const skillNames = skills.map((s) => s.name).join("  •  ");
    docContent.push({
      text: skillNames,
      fontSize: 9,
      color: "#1e293b",
      margin: [0, 0, 0, 10],
    });
  }

  // Dự án
  if (isVisible("projects") && projects.length > 0) {
    docContent.push({
      text: "DỰ ÁN TIÊU BIỂU",
      fontSize: 10.5,
      bold: true,
      color: primaryColor,
      margin: [0, 4, 0, 4],
    });

    projects.forEach((p) => {
      docContent.push({
        columns: [
          { text: p.name, bold: true, fontSize: 10, color: "#0f172a" },
          { text: `${p.startDate} - ${p.endDate}`, alignment: "right", fontSize: 8.5, color: "#64748b" },
        ],
      });
      docContent.push({
        text: `Vai trò: ${p.role}`,
        italics: true,
        fontSize: 9,
        color: "#475569",
        margin: [0, 1, 0, 2],
      });
      docContent.push({
        text: p.description || "",
        fontSize: 9,
        color: "#334155",
        lineHeight: 1.25,
        margin: [0, 0, 0, 8],
      });
    });
  }

  // Chứng chỉ
  if (isVisible("certificates") && certificates.length > 0) {
    docContent.push({
      text: "CHỨNG CHỈ HÀNH NGHỀ",
      fontSize: 10.5,
      bold: true,
      color: primaryColor,
      margin: [0, 4, 0, 4],
    });

    certificates.forEach((c) => {
      docContent.push({
        text: `${c.name} — ${c.issuer} (${c.issueDate})`,
        fontSize: 9,
        color: "#334155",
        margin: [0, 1, 0, 4],
      });
    });
  }

  return {
    pageSize: "A4",
    pageMargins: [36, 36, 36, 36],
    defaultStyle: { font: "Roboto", fontSize: 9.5, lineHeight: 1.25, color: "#1e293b" },
    content: docContent,
  };
}

// Xuất file PDF dưới dạng Blob (dùng để lưu lên server hoặc tải về)
export async function exportCvPdfBlob(data: ResumeData): Promise<Blob> {
  const docDef = await generateCvPdfDefinition(data);
  return new Promise((resolve, reject) => {
    try {
      const pdfDoc = (pdfMake as any).createPdf(docDef);
      pdfDoc.getBlob((blob: Blob) => {
        resolve(blob);
      });
    } catch (err) {
      reject(err);
    }
  });
}

// Tải file PDF về máy tính của người dùng với text layer thật
export async function downloadCvPdf(data: ResumeData, filename?: string): Promise<void> {
  const docDef = await generateCvPdfDefinition(data);
  const safeTitle = (data.title || "CV_CAREZA").replace(/[^a-zA-Z0-9\u00C0-\u024F\u1EA0-\u1EF9]/g, "_");
  const actualFilename = filename || `${safeTitle}.pdf`;
  (pdfMake as any).createPdf(docDef).download(actualFilename);
}
