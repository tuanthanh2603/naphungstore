import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import { sfProDisplay, sfProText } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "NA PHÙNG STORE",
  description: "NA PHÙNG STORE - Cửa hàng thời trang nam nữ, cập nhật những mẫu quần áo phong cách, hiện đại với giá tốt.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sfProText.variable} ${sfProDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Header />
        {children}
      </body>
    </html>
  );
}
