import type { Metadata } from "next";
import { sfProDisplay, sfProText } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "NA PHÙNG STORE",
  description:
    "NA PHÙNG STORE — Thời trang nam nữ mang phong cách luxury, cắt may tinh giản và chất liệu chọn lọc.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${sfProText.variable} ${sfProDisplay.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
