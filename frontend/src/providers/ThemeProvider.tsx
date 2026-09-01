"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, theme, App } from "antd";
import type { ReactNode } from "react";
import viVN from "antd/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";

// Thiết lập locale tiếng Việt cho dayjs
dayjs.locale("vi");

export default function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider
        locale={viVN}
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: "#2563eb", // Tailwind blue-600
            colorInfo: "#2563eb",
            borderRadius: 8,
            fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            controlHeight: 38, // Cao hơn một chút cho hiện đại
          },
          components: {
            Button: {
              controlHeight: 40,
              borderRadius: 6,
              fontWeight: 500,
            },
            Input: {
              controlHeight: 40,
              borderRadius: 6,
            },
            Select: {
              controlHeight: 40,
              borderRadius: 6,
            },
            Layout: {
              bodyBg: "#f8fafc", // slate-50 cho background app
              headerBg: "#ffffff",
            },
            Menu: {
              itemHeight: 44,
              itemBorderRadius: 6,
            },
            Card: {
              borderRadiusLG: 10,
            },
          },
        }}
      >
        <App>
          {children}
        </App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
