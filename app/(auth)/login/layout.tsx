import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập Admin | NA PHÙNG STORE",
  description: "Đăng nhập để truy cập trang quản trị NA PHÙNG STORE.",
  robots: { index: false, follow: false },
};

export default function AdminLoginLayout({
  children,
}: LayoutProps<"/login">) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      {children}
    </div>
  );
}
